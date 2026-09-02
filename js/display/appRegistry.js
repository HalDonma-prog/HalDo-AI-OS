/**
 * HALDO AI OS 24.6.0 – APP REGISTRY
 */
const AppRegistry = {
    apps: {},
    categories: {},
    installedApps: new Set(),
    isReady: false,

    STATUS: { REGISTERED: 'registered', INSTALLED: 'installed', ACTIVE: 'active', CLOSED: 'closed', ERROR: 'error' },

    init() {
        console.log('📋 App Registry wird initialisiert...');
        const saved = Storage.get('installed_apps', []);
        for (const id of saved) this.installedApps.add(id);
        this.isReady = true;
        EventBus.emit('app:registry-ready', { appCount: Object.keys(this.apps).length, installedCount: this.installedApps
                .size });
        console.log('✅ App Registry ready');
        return this;
    },

    register(app) {
        if (!app.id) { console.warn('⚠️ App ohne ID kann nicht registriert werden'); return false; }
        if (this.apps[app.id]) { console.warn(`⚠️ App ${app.id} bereits registriert`); return false; }

        const appData = {
            id: app.id,
            name: app.name || app.id,
            icon: app.icon || '📱',
            category: app.category || 'other',
            description: app.description || '',
            version: app.version || '1.0.0',
            author: app.author || 'HalDo Team',
            dependencies: app.dependencies || [],
            permissions: app.permissions || [],
            status: this.STATUS.REGISTERED,
            registeredAt: Date.now(),
            open: app.open || null,
            close: app.close || null,
            install: app.install || null,
            uninstall: app.uninstall || null
        };

        this.apps[app.id] = appData;
        if (appData.category) {
            if (!this.categories[appData.category]) this.categories[appData.category] = [];
            if (!this.categories[appData.category].includes(appData.id)) {
                this.categories[appData.category].push(appData.id);
            }
        }
        EventBus.emit('app:registered', { appId: app.id });
        console.log(`📱 App registriert: ${appData.name} (${appData.id})`);
        return true;
    },

    get(appId) { return this.apps[appId] || null; },
    getAll() { return Object.values(this.apps); },
    getInstalled() { return Object.values(this.apps).filter(app => this.installedApps.has(app.id)); },
    getByCategory(category) {
        const ids = this.categories[category] || [];
        return ids.map(id => this.apps[id]).filter(Boolean);
    },
    getCategories() { return Object.keys(this.categories); },

    search(query) {
        const q = query.toLowerCase();
        return Object.values(this.apps).filter(app =>
            app.name.toLowerCase().includes(q) ||
            app.id.toLowerCase().includes(q) ||
            (app.description && app.description.toLowerCase().includes(q))
        );
    },

    install(appId) {
        const app = this.get(appId);
        if (!app) { console.warn(`⚠️ App ${appId} nicht gefunden`); return false; }
        if (this.installedApps.has(appId)) { console.warn(`⚠️ App ${appId} bereits installiert`); return false; }

        if (app.dependencies && app.dependencies.length > 0) {
            const missing = app.dependencies.filter(dep => !this.installedApps.has(dep));
            if (missing.length > 0) {
                console.warn(`⚠️ Fehlende Abhängigkeiten: ${missing.join(', ')}`);
                return false;
            }
        }

        if (typeof app.install === 'function') {
            try { app.install(); } catch (error) {
                console.error(`❌ Installationsfehler bei ${appId}:`, error);
                return false;
            }
        }

        this.installedApps.add(appId);
        app.status = this.STATUS.INSTALLED;
        this.saveInstalledApps();
        EventBus.emit('app:installed', { appId });
        console.log(`✅ App installiert: ${app.name}`);
        return true;
    },

    uninstall(appId) {
        const app = this.get(appId);
        if (!app) { console.warn(`⚠️ App ${appId} nicht gefunden`); return false; }
        if (!this.installedApps.has(appId)) { console.warn(`⚠️ App ${appId} nicht installiert`); return false; }
        if (app.system === true) { console.warn(`⚠️ System-App ${appId} kann nicht deinstalliert werden`); return false; }

        if (typeof app.uninstall === 'function') {
            try { app.uninstall(); } catch (error) {
                console.error(`❌ Deinstallationsfehler bei ${appId}:`, error);
                return false;
            }
        }

        this.installedApps.delete(appId);
        app.status = this.STATUS.REGISTERED;
        this.saveInstalledApps();
        EventBus.emit('app:uninstalled', { appId });
        console.log(`🗑️ App deinstalliert: ${app.name}`);
        return true;
    },

    saveInstalledApps() {
        Storage.set('installed_apps', Array.from(this.installedApps));
    }
};
window.AppRegistry = AppRegistry;
