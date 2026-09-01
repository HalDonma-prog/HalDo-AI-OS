/**
 * HALDO AI OS 24.6 – STORAGE SYSTEM
 * Lokaler Speicher mit Erweiterungen
 */

const Storage = {
    prefix: 'haldo_',

    init() {
        console.log('💾 Storage System initialisiert');
        return this;
    },

    get(key, fallback = null) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : fallback;
        } catch {
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            EventBus.emit('storage:changed', { key, value });
            return true;
        } catch {
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(this.prefix + key);
        EventBus.emit('storage:removed', { key });
        return true;
    },

    clear() {
        Object.keys(localStorage)
            .filter(k => k.startsWith(this.prefix))
            .forEach(k => localStorage.removeItem(k));
        EventBus.emit('storage:cleared');
        return true;
    },

    getAll() {
        const result = {};
        Object.keys(localStorage)
            .filter(k => k.startsWith(this.prefix))
            .forEach(k => {
                const key = k.replace(this.prefix, '');
                try {
                    result[key] = JSON.parse(localStorage.getItem(k));
                } catch {
                    result[key] = localStorage.getItem(k);
                }
            });
        return result;
    }
};

window.Storage = Storage;
