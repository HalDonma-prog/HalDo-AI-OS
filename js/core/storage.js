/**
 * HALDO AI OS 24.6.0 – STORAGE SYSTEM
 * Zentrale Speicherverwaltung mit localStorage
 * Version: 1.0.0
 */

const Storage = {
    // ---- KONFIGURATION ----
    prefix: 'haldo_',
    isReady: false,
    
    // ---- INITIALISIERUNG ----
    init() {
        console.log('💾 Storage System wird initialisiert...');
        this.isReady = true;
        
        // Prüfen ob localStorage verfügbar ist
        try {
            localStorage.setItem('haldo_test', 'test');
            localStorage.removeItem('haldo_test');
        } catch (error) {
            console.warn('⚠️ localStorage nicht verfügbar:', error);
            this.isReady = false;
        }
        
        EventBus.emit('storage:ready', { isReady: this.isReady });
        console.log('✅ Storage System ready');
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    set(key, value) {
        if (!this.isReady) {
            console.warn('⚠️ Storage nicht bereit');
            return false;
        }
        
        try {
            const data = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, data);
            EventBus.emit('storage:changed', { key, value });
            return true;
        } catch (error) {
            console.error('❌ Storage set fehlgeschlagen:', error);
            return false;
        }
    },
    
    // ---- DATEN LADEN ----
    get(key, fallback = null) {
        if (!this.isReady) {
            console.warn('⚠️ Storage nicht bereit');
            return fallback;
        }
        
        try {
            const data = localStorage.getItem(this.prefix + key);
            if (data === null) return fallback;
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ Storage get fehlgeschlagen:', error);
            return fallback;
        }
    },
    
    // ---- DATEN LÖSCHEN ----
    remove(key) {
        if (!this.isReady) return false;
        
        try {
            localStorage.removeItem(this.prefix + key);
            EventBus.emit('storage:removed', { key });
            return true;
        } catch (error) {
            console.error('❌ Storage remove fehlgeschlagen:', error);
            return false;
        }
    },
    
    // ---- ALLE DATEN LÖSCHEN ----
    clear() {
        if (!this.isReady) return false;
        
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            }
            EventBus.emit('storage:cleared', { timestamp: Date.now() });
            return true;
        } catch (error) {
            console.error('❌ Storage clear fehlgeschlagen:', error);
            return false;
        }
    },
    
    // ---- ALLE DATEN ABRUFEN ----
    getAll() {
        const result = {};
        if (!this.isReady) return result;
        
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith(this.prefix)) {
                    const realKey = key.replace(this.prefix, '');
                    try {
                        result[realKey] = JSON.parse(localStorage.getItem(key));
                    } catch {
                        result[realKey] = localStorage.getItem(key);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Storage getAll fehlgeschlagen:', error);
        }
        return result;
    },
    
    // ---- SCHLÜSSEL PRÜFEN ----
    has(key) {
        if (!this.isReady) return false;
        return localStorage.getItem(this.prefix + key) !== null;
    },
    
    // ---- SPEICHERGRÖSSE ----
    getSize() {
        let total = 0;
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith(this.prefix)) {
                    total += localStorage.getItem(key).length * 2; // UTF-16
                }
            }
        } catch (error) {
            console.error('❌ Storage getSize fehlgeschlagen:', error);
        }
        return total;
    },
    
    getFormattedSize() {
        const bytes = this.getSize();
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    },
    
    // ---- SPEICHERSTATISTIK ----
    getStats() {
        const data = this.getAll();
        const keys = Object.keys(data);
        let totalSize = 0;
        let largestKey = '';
        let largestSize = 0;
        
        for (const key of keys) {
            const value = data[key];
            const size = JSON.stringify(value).length;
            totalSize += size;
            if (size > largestSize) {
                largestSize = size;
                largestKey = key;
            }
        }
        
        return {
            keyCount: keys.length,
            totalSize: totalSize,
            formattedSize: this.getFormattedSize(),
            largestKey: largestKey,
            largestSize: largestSize,
            keys: keys
        };
    },
    
    // ---- BACKUP ERSTELLEN ----
    export() {
        const data = this.getAll();
        return {
            version: '1.0',
            timestamp: Date.now(),
            data: data,
            meta: {
                keyCount: Object.keys(data).length,
                app: 'HalDo AI OS',
                version: Kernel?.version || '24.6.0'
            }
        };
    },
    
    exportToFile() {
        const backup = this.export();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `haldo_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        EventBus.emit('storage:exported', { timestamp: Date.now() });
        return true;
    },
    
    // ---- BACKUP WIEDERHERSTELLEN ----
    import(data) {
        if (!data || typeof data !== 'object') {
            console.error('❌ Ungültige Backup-Daten');
            return false;
        }
        
        try {
            const backup = data.data || data;
            for (const [key, value] of Object.entries(backup)) {
                this.set(key, value);
            }
            EventBus.emit('storage:imported', { 
                keyCount: Object.keys(backup).length,
                timestamp: Date.now() 
            });
            return true;
        } catch (error) {
            console.error('❌ Storage import fehlgeschlagen:', error);
            return false;
        }
    },
    
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const result = this.import(data);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
            reader.readAsText(file);
        });
    },
    
    // ---- DATENBEREINIGUNG ----
    clean() {
        // Entfernt alte temporäre Daten
        const tempKeys = ['temp_', 'cache_', 'session_'];
        let removed = 0;
        
        for (const prefix of tempKeys) {
            const keys = Object.keys(this.getAll());
            for (const key of keys) {
                if (key.startsWith(prefix)) {
                    this.remove(key);
                    removed++;
                }
            }
        }
        
        EventBus.emit('storage:cleaned', { removed });
        return removed;
    },
    
    // ---- PRÄFIX ÄNDERN ----
    setPrefix(prefix) {
        this.prefix = prefix;
        EventBus.emit('storage:prefix-changed', { prefix });
        return this;
    },
    
    // ---- MIGRATION ----
    migrate(oldPrefix, newPrefix) {
        const data = this.getAll();
        let migrated = 0;
        
        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith(oldPrefix)) {
                const newKey = key.replace(oldPrefix, newPrefix);
                this.set(newKey, value);
                this.remove(key);
                migrated++;
            }
        }
        
        EventBus.emit('storage:migrated', { 
            oldPrefix, 
            newPrefix, 
            migrated 
        });
        return migrated;
    }
};

// ---- STORAGE GLOBAL VERFÜGBAR MACHEN ----
window.Storage = Storage;

console.log('💾 Storage System geladen – HalDo AI OS 24.6.0');
