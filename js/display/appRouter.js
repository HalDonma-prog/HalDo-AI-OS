/**
 * HALDO AI OS 24.6 – APP ROUTER
 * Navigation zwischen Apps
 */

const AppRouter = {
    routes: {},
    currentRoute: null,
    history: [],

    registerRoute(path, appId, params = {}) {
        this.routes[path] = { appId, params };
        return this;
    },

    navigate(path, data = {}) {
        const route = this.routes[path];
        if (!route) {
            console.warn(`⚠️ Route ${path} nicht gefunden`);
            return false;
        }

        this.currentRoute = path;
        this.history.push({ path, data, timestamp: Date.now() });

        EventBus.emit('route:changed', {
            path,
            appId: route.appId,
            data
        });

        // App öffnen
        const app = AppRegistry.get(route.appId);
        if (app && typeof app.open === 'function') {
            app.open(data);
        }

        console.log(`🧭 Navigiert zu: ${path} (${route.appId})`);
        return true;
    },

    back() {
        if (this.history.length < 2) return false;
        this.history.pop();
        const prev = this.history[this.history.length - 1];
        return this.navigate(prev.path, prev.data);
    },

    getCurrent() {
        return this.currentRoute;
    },

    getHistory() {
        return this.history;
    },

    clearHistory() {
        this.history = [];
        return this;
    }
};

window.AppRouter = AppRouter;
