/**
 * HALDO AI OS 24.6 – APP RUNTIME
 * Laufzeitumgebung für Apps
 */

const AppRuntime = {
    runningApps: {},
    appStates: {},

    start(appId, params = {}) {
        const app = AppRegistry.get(appId);
        if (!app) {
            console.warn(`⚠️ App ${appId} nicht gefunden`);
            return false;
        }

        if (this.runningApps[appId]) {
            console.log(`📱 App ${appId} läuft bereits`);
            // In den Vordergrund holen
            EventBus.emit('app:focus', { appId });
            return true;
        }

        this.runningApps[appId] = {
            id: appId,
            startedAt: Date.now(),
            status: 'running',
            params
        };

        // State initialisieren
        if (!this.appStates[appId]) {
            this.appStates[appId] = {
                data: {},
                settings: {}
            };
        }

        // App starten
        if (typeof app.start === 'function') {
            app.start(params);
        }

        EventBus.emit('app:started', { appId, params });
        console.log(`🚀 App gestartet: ${app.name} (${appId})`);
        return true;
    },

    stop(appId) {
        const app = AppRegistry.get(appId);
        if (!app) return false;

        if (!this.runningApps[appId]) {
            console.warn(`⚠️ App ${appId} läuft nicht`);
            return false;
        }

        // App stoppen
        if (typeof app.stop === 'function') {
            app.stop();
        }

        delete this.runningApps[appId];
        EventBus.emit('app:stopped', { appId });
        console.log(`⏹️ App gestoppt: ${app.name} (${appId})`);
        return true;
    },

    getRunningApps() {
        return Object.values(this.runningApps);
    },

    isRunning(appId) {
        return !!this.runningApps[appId];
    },

    getState(appId) {
        return this.appStates[appId] || null;
    },

    setState(appId, key, value) {
        if (!this.appStates[appId]) {
            this.appStates[appId] = { data: {}, settings: {} };
        }
        this.appStates[appId].data[key] = value;
        EventBus.emit('app:state-changed', { appId, key, value });
        return this;
    },

    getStateValue(appId, key, fallback = null) {
        const state = this.getState(appId);
        return state ? (state.data[key] || fallback) : fallback;
    },

    restart(appId) {
        this.stop(appId);
        setTimeout(() => this.start(appId), 200);
        return this;
    },

    stopAll() {
        Object.keys(this.runningApps).forEach(id => this.stop(id));
        return this;
    }
};

window.AppRuntime = AppRuntime;
