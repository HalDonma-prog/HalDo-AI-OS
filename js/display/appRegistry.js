/**
 * HALDO AI OS 24.6 – APP REGISTRY
 * Zentrale Registrierung aller Apps
 */

const AppRegistry = {
    apps: {},
    categories: {},

    register(app) {
        if (!app.id) {
            console.warn('⚠️ App ohne ID kann nicht registriert werden');
            return false;
        }
        if (this.apps[app.id]) {
            console.warn(`⚠️ App ${app.id} bereits registriert`);
            return false;
        }

        this.apps[app.id] = {
            ...app,
            registeredAt: Date.now()
        };

        // Kategorie
        if (app.category) {
            if (!this.categories[app.category]) {
                this.categories[app.category] = [];
            }
            this.categories[app.category].push(app.id);
        }

        EventBus.emit('app:registered', { appId: app.id });
        console.log(`📱 App registriert: ${app.name} (${app.id})`);
        return true;
    },

    get(appId) {
        return this.apps[appId] || null;
    },

    getAll() {
        return Object.values(this.apps);
    },

    getByCategory(category) {
        const ids = this.categories[category] || [];
        return ids.map(id => this.apps[id]).filter(Boolean);
    },

    getCategories() {
        return Object.keys(this.categories);
    },

    exists(appId) {
        return !!this.apps[appId];
    },

    count() {
        return Object.keys(this.apps).length;
    },

    unregister(appId) {
        const app = this.apps[appId];
        if (!app) return false;

        // Aus Kategorie entfernen
        if (app.category && this.categories[app.category]) {
            this.categories[app.category] = this.categories[app.category].filter(id => id !== appId);
        }

        delete this.apps[appId];
        EventBus.emit('app:unregistered', { appId });
        return true;
    },

    search(query) {
        const q = query.toLowerCase();
        return this.getAll().filter(app =>
            app.name.toLowerCase().includes(q) ||
            app.id.toLowerCase().includes(q) ||
            (app.description && app.description.toLowerCase().includes(q))
        );
    }
};

window.AppRegistry = AppRegistry;
