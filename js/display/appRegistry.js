/**
 * HALDO AI OS 24.6.0 – APP REGISTRY
 * Zentrale Verwaltung aller Apps mit Manifest, Lebenszyklus und Integration
 * Version: 1.0.0
 */

const AppRegistry = {
    // ---- APP-STORE ----
    apps: {},
    categories: {},
    installedApps: new Set(),
    isReady: false,
    
    // ---- APP-STATUS ----
    STATUS: {
        REGISTERED: 'registered',
        INSTALLED: 'installed',
        LOADING: 'loading',
        ACTIVE: 'active',
        SUSPENDED: 'suspended',
        CLOSED: 'closed',
        ERROR: 'error'
    },
    
    // ---- INITIALISIERUNG ----
    init() {
        console.log('📋 App Registry wird initialisiert...');
        
        // Gespeicherte installierte Apps laden
        const saved = Storage.get('installed_apps', []);
        for (const id of saved) {
            this.installedApps.add(id);
        }
        
        this.isReady = true;
        EventBus.emit('app:registry-ready', { 
            appCount: Object.keys(this.apps).length,
            installedCount: this.installedApps.size 
        });
        
        console.log('✅ App Registry ready');
        return this;
    },
    
    // ---- APP REGISTRIEREN ----
    register(app) {
        // Validierung
        if (!app.id) {
            console.warn('⚠️ App ohne ID kann nicht registriert werden');
            return false;
        }
        
        if (this.apps[app.id]) {
            console.warn(`⚠️ App ${app.id} bereits registriert`);
            return false;
        }
        
        // App mit Standardwerten ergänzen
        const appData = {
            id: app.id,
            name: app.name || app.id,
            icon: app.icon || '📱',
            category: app.category || 'other',
            description: app.description || '',
            version: app.version || '1.0.0',
            author: app.author || 'HalDo Team',
            license: app.license || 'MIT',
            dependencies: app.dependencies || [],
            permissions: app.permissions || [],
            
            // Lebenszyklus
            status: this.STATUS.REGISTERED,
            registeredAt: Date.now(),
            
            // Funktionen
            open: app.open || null,
            close: app.close || null,
            install: app.install || null,
            uninstall: app.uninstall || null,
            update: app.update || null,
            
            // Metadaten
            metadata: app.metadata || {},
            screenshots: app.screenshots || [],
            tags: app.tags || [],
            
            // Manuelle Entry-Points
            entry: app.entry || null,
            manifest: app.manifest || null
        };
        
        // App speichern
        this.apps[app.id] = appData;
        
        // Kategorie
        if (appData.category) {
            if (!this.categories[appData.category]) {
                this.categories[appData.category] = [];
            }
            if (!this.categories[appData.category].includes(appData.id)) {
                this.categories[appData.category].push(appData.id);
            }
        }
        
        EventBus.emit('app:registered', { appId: app.id, app: appData });
        console.log(`📱 App registriert: ${appData.name} (${appData.id})`);
        return true;
    },
    
    // ---- APP REGISTRIEREN (MIT MANIFEST) ----
    registerFromManifest(manifest) {
        if (!manifest || typeof manifest !== 'object') {
            console.warn('⚠️ Ungültiges Manifest');
            return false;
        }
        
        return this.register({
            id: manifest.id,
            name: manifest.name,
            icon: manifest.icon,
            category: manifest.category,
            description: manifest.description,
            version: manifest.version,
            author: manifest.author,
            permissions: manifest.permissions || [],
            entry: manifest.entry || null,
            manifest: manifest
        });
    },
    
    // ---- APP INSTALLIEREN ----
    install(appId) {
        const app = this.get(appId);
        if (!app) {
            console.warn(`⚠️ App ${appId} nicht gefunden`);
            return false;
        }
        
        if (this.installedApps.has(appId)) {
            console.warn(`⚠️ App ${appId} bereits installiert`);
            return false;
        }
        
        // Berechtigungen prüfen
        if (app.permissions && app.permissions.length > 0) {
            // Hier könnte eine Berechtigungsprüfung eingebaut werden
            // In einer echten Umgebung würde man den Nutzer fragen
            console.log(`🔐 App benötigt Berechtigungen: ${app.permissions.join(', ')}`);
        }
        
        // Abhängigkeiten prüfen
        if (app.dependencies && app.dependencies.length > 0) {
            const missing = app.dependencies.filter(dep => !this.installedApps.has(dep));
            if (missing.length > 0) {
                console.warn(`⚠️ Fehlende Abhängigkeiten: ${missing.join(', ')}`);
                EventBus.emit('app:install-error', { 
                    appId, 
                    error: 'missing_dependencies',
                    missing: missing 
                });
                return false;
            }
        }
        
        // Installations-Funktion aufrufen
        if (typeof app.install === 'function') {
            try {
                app.install();
            } catch (error) {
                console.error(`❌ Installationsfehler bei ${appId}:`, error);
                EventBus.emit('app:install-error', { appId, error: error.message });
                return false;
            }
        }
        
        this.installedApps.add(appId);
        app.status = this.STATUS.INSTALLED;
        app.installedAt = Date.now();
        
        // Speichern
        this.saveInstalledApps();
        
        EventBus.emit('app:installed', { appId });
        console.log(`✅ App installiert: ${app.name}`);
        return true;
    },
    
    // ---- APP DEINSTALLIEREN ----
    uninstall(appId) {
        const app = this.get(appId);
        if (!app) {
            console.warn(`⚠️ App ${appId} nicht gefunden`);
            return false;
        }
        
        if (!this.installedApps.has(appId)) {
            console.warn(`⚠️ App ${appId} nicht installiert`);
            return false;
        }
        
        // System-Apps schützen
        if (app.system === true) {
            console.warn(`⚠️ System-App ${appId} kann nicht deinstalliert werden`);
            return false;
        }
        
        // Deinstallations-Funktion aufrufen
        if (typeof app.uninstall === 'function') {
            try {
                app.uninstall();
            } catch (error) {
                console.error(`❌ Deinstallationsfehler bei ${appId}:`, error);
                EventBus.emit('app:uninstall-error', { appId, error: error.message });
                return false;
            }
        }
        
        this.installedApps.delete(appId);
        app.status = this.STATUS.REGISTERED;
        delete app.installedAt;
        
        // Speichern
        this.saveInstalledApps();
        
        EventBus.emit('app:uninstalled', { appId });
        console.log(`🗑️ App deinstalliert: ${app.name}`);
        return true;
    },
    
    // ---- APP ÖFFNEN ----
    open(appId, params = {}) {
        const app = this.get(appId);
        if (!app) {
            console.warn(`⚠️ App ${appId} nicht gefunden`);
            return false;
        }
        
        if (!this.installedApps.has(appId)) {
            console.warn(`⚠️ App ${appId} nicht installiert – installiere...`);
            this.install(appId);
        }
        
        app.status = this.STATUS.ACTIVE;
        
        if (typeof app.open === 'function') {
            try {
                app.open(params);
            } catch (error) {
                console.error(`❌ Fehler beim Öffnen von ${appId}:`, error);
                app.status = this.STATUS.ERROR;
                EventBus.emit('app:error', { appId, error: error.message });
                return false;
            }
        } else {
            // Fallback: Window Manager
            if (typeof WindowManager !== 'undefined') {
                const title = app.name || appId;
                const icon = app.icon || '📱';
                const content = `
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:6px;text-align:center;padding:20px;">
                        <div style="font-size:40px;">${icon}</div>
                        <h2 style="color:var(--text-primary);font-size:14px;">${title}</h2>
                        <p style="color:var(--text-secondary);font-size:11px;">${app.description || 'App ist bereit'}</p>
                        <p style="color:var(--text-muted);font-size:10px;">Version ${app.version}</p>
                    </div>
                `;
                WindowManager.openWindow(appId, title, content, icon);
            }
        }
        
        EventBus.emit('app:opened', { appId, params });
        return true;
    },
    
    // ---- APP SCHLIEßEN ----
    close(appId) {
        const app = this.get(appId);
        if (!app) return false;
        
        if (typeof app.close === 'function') {
            try {
                app.close();
            } catch (error) {
                console.error(`❌ Fehler beim Schließen von ${appId}:`, error);
                return false;
            }
        }
        
        app.status = this.STATUS.CLOSED;
        EventBus.emit('app:closed', { appId });
        return true;
    },
    
    // ---- APP UPDATEN ----
    update(appId) {
        const app = this.get(appId);
        if (!app) return false;
        
        if (!this.installedApps.has(appId)) {
            console.warn(`⚠️ App ${appId} nicht installiert`);
            return false;
        }
        
        // Hier könnte ein echter Update-Check eingebaut werden
        // In einer echten Umgebung würde man eine API abfragen
        
        EventBus.emit('app:updating', { appId });
        
        if (typeof app.update === 'function') {
            try {
                app.update();
            } catch (error) {
                console.error(`❌ Update-Fehler bei ${appId}:`, error);
                EventBus.emit('app:update-error', { appId, error: error.message });
                return false;
            }
        }
        
        EventBus.emit('app:updated', { appId });
        console.log(`🔄 App aktualisiert: ${app.name}`);
        return true;
    },
    
    // ---- APP ABRUFEN ----
    get(appId) {
        return this.apps[appId] || null;
    },
    
    getAll() {
        return Object.values(this.apps);
    },
    
    getInstalled() {
        return Object.values(this.apps).filter(app => this.installedApps.has(app.id));
    },
    
    getByCategory(category) {
        const ids = this.categories[category] || [];
        return ids.map(id => this.apps[id]).filter(Boolean);
    },
    
    getCategories() {
        return Object.keys(this.categories);
    },
    
    // ---- APP SUCHE ----
    search(query) {
        const q = query.toLowerCase();
        return Object.values(this.apps).filter(app => {
            return app.name.toLowerCase().includes(q) ||
                   app.id.toLowerCase().includes(q) ||
                   (app.description && app.description.toLowerCase().includes(q)) ||
                   (app.tags && app.tags.some(tag => tag.toLowerCase().includes(q)));
        });
    },
    
    // ---- APP STATISTIK ----
    getStats() {
        const apps = Object.values(this.apps);
        const installed = this.getInstalled();
        const categories = this.getCategories();
        
        const categoryStats = {};
        for (const app of apps) {
            const cat = app.category || 'other';
            if (!categoryStats[cat]) {
                categoryStats[cat] = { total: 0, installed: 0 };
            }
            categoryStats[cat].total++;
            if (this.installedApps.has(app.id)) {
                categoryStats[cat].installed++;
            }
        }
        
        return {
            total: apps.length,
            installed: installed.length,
            categories: categories,
            categoryStats: categoryStats,
            statusCounts: {
                [this.STATUS.REGISTERED]: apps.filter(a => a.status === this.STATUS.REGISTERED).length,
                [this.STATUS.INSTALLED]: apps.filter(a => a.status === this.STATUS.INSTALLED).length,
                [this.STATUS.ACTIVE]: apps.filter(a => a.status === this.STATUS.ACTIVE).length,
                [this.STATUS.ERROR]: apps.filter(a => a.status === this.STATUS.ERROR).length
            }
        };
    },
    
    // ---- APP STATUS ÄNDERN ----
    setStatus(appId, status) {
        const app = this.get(appId);
        if (!app) return false;
        app.status = status;
        EventBus.emit('app:status-changed', { appId, status });
        return true;
    },
    
    // ---- INSTALLIERTE APPS SPEICHERN ----
    saveInstalledApps() {
        const apps = Array.from(this.installedApps);
        Storage.set('installed_apps', apps);
    },
    
    // ---- APP MANIFEST VALIDIEREN ----
    validateManifest(manifest) {
        if (!manifest || typeof manifest !== 'object') {
            return { valid: false, error: 'Kein gültiges Manifest' };
        }
        
        const required = ['id', 'name'];
        const missing = required.filter(field => !manifest[field]);
        if (missing.length > 0) {
            return { 
                valid: false, 
                error: `Fehlende Felder: ${missing.join(', ')}` 
            };
        }
        
        return { valid: true };
    },
    
    // ---- APP MANIFEST GENERIEREN ----
    generateManifest(app) {
        return {
            id: app.id,
            name: app.name,
            icon: app.icon || '📱',
            category: app.category || 'other',
            description: app.description || '',
            version: app.version || '1.0.0',
            author: app.author || 'HalDo Team',
            permissions: app.permissions || [],
            dependencies: app.dependencies || [],
            tags: app.tags || [],
            screenshots: app.screenshots || []
        };
    },
    
    // ---- ALLE APPS DEINSTALLIEREN ----
    uninstallAll() {
        const apps = Array.from(this.installedApps);
        for (const id of apps) {
            this.uninstall(id);
        }
        EventBus.emit('app:all-uninstalled', { count: apps.length });
        return true;
    },
    
    // ---- ALLE APPS INSTALLIEREN ----
    installAll() {
        const apps = Object.values(this.apps);
        let installed = 0;
        for (const app of apps) {
            if (!this.installedApps.has(app.id)) {
                if (this.install(app.id)) {
                    installed++;
                }
            }
        }
        EventBus.emit('app:all-installed', { count: installed });
        return installed;
    },
    
    // ---- DEPENDENCY CHECK ----
    checkDependencies(appId) {
        const app = this.get(appId);
        if (!app) return { valid: false, error: 'App nicht gefunden' };
        
        if (!app.dependencies || app.dependencies.length === 0) {
            return { valid: true };
        }
        
        const missing = app.dependencies.filter(dep => !this.installedApps.has(dep));
        return {
            valid: missing.length === 0,
            missing: missing
        };
    },
    
    // ---- VERSION ----
    getVersion() {
        return '1.0.0';
    }
};

// ---- APP REGISTRY GLOBAL VERFÜGBAR MACHEN ----
window.AppRegistry = AppRegistry;

console.log('📋 App Registry geladen – HalDo AI OS 24.6.0');
