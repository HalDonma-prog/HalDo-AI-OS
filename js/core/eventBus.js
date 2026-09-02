/**
 * HALDO AI OS 24.6.0 – EVENT BUS
 */
class EventBus {
    constructor() { this.events = {}; this.onceEvents = {}; this.debug = false; }
    on(event, callback, context = null) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push({ callback, context });
        return this;
    }
    once(event, callback, context = null) {
        if (!this.onceEvents[event]) this.onceEvents[event] = [];
        this.onceEvents[event].push({ callback, context });
        return this;
    }
    emit(event, data = null) {
        if (this.debug) console.log(`📤 Event: ${event}`, data);
        if (this.events[event]) {
            this.events[event].forEach(sub => {
                try { sub.callback.call(sub.context || null, data); } catch (e) { console.error(e); }
            });
        }
        if (this.onceEvents[event]) {
            const subs = this.onceEvents[event];
            this.onceEvents[event] = [];
            subs.forEach(sub => {
                try { sub.callback.call(sub.context || null, data); } catch (e) { console.error(e); }
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
}
const eventBus = new EventBus();
window.EventBus = eventBus;
