/**
 * HALDO AI OS 24.6 – EVENT BUS
 * Zentrale Event-Kommunikation
 */

class EventBus {
    constructor() {
        this.events = {};
        this.onceEvents = {};
        this.debug = true;
    }

    on(event, callback, context = null) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push({ callback, context });
        if (this.debug) console.log(`📡 Event abonniert: ${event}`);
        return this;
    }

    once(event, callback, context = null) {
        if (!this.onceEvents[event]) this.onceEvents[event] = [];
        this.onceEvents[event].push({ callback, context });
        return this;
    }

    emit(event, data = null) {
        if (this.debug) console.log(`📤 Event ausgelöst: ${event}`, data);

        if (this.events[event]) {
            this.events[event].forEach(sub => {
                try { sub.callback.call(sub.context || null, data); } catch (e) {
                    console.error(`❌ Event-Fehler (${event}):`, e);
                }
            });
        }

        if (this.onceEvents[event]) {
            const subs = this.onceEvents[event];
            this.onceEvents[event] = [];
            subs.forEach(sub => {
                try { sub.callback.call(sub.context || null, data); } catch (e) {
                    console.error(`❌ Once-Event-Fehler (${event}):`, e);
                }
            });
        }
        return this;
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(s => s.callback !== callback);
        }
        return this;
    }

    clear(event) {
        if (event) {
            delete this.events[event];
            delete this.onceEvents[event];
        } else {
            this.events = {};
            this.onceEvents = {};
        }
        return this;
    }

    setDebug(enabled) {
        this.debug = enabled;
        return this;
    }
}

window.EventBus = new EventBus();
