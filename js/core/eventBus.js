/**
 * HALDO AI OS 24.6.0 – EVENT BUS
 * Zentrale Event-Kommunikation zwischen allen Komponenten
 * Version: 1.0.0
 */

class EventBus {
    constructor() {
        // ---- EVENTS ----
        this.events = {};
        this.onceEvents = {};
        this.eventHistory = [];
        
        // ---- KONFIGURATION ----
        this.debug = false;
        this.maxHistory = 100;
        this.isReady = false;
        
        console.log('📡 Event Bus wird initialisiert...');
    }
    
    // ---- INITIALISIERUNG ----
    init() {
        this.isReady = true;
        console.log('✅ Event Bus ready');
        this.emit('eventbus:ready', { timestamp: Date.now() });
        return this;
    }
    
    // ---- EVENT ABONNIEREN ----
    on(event, callback, context = null) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push({ 
            callback, 
            context,
            id: this.generateId()
        });
        
        if (this.debug) {
            console.log(`📡 Event abonniert: ${event}`);
        }
        
        return this;
    }
    
    // ---- EVENT EINMALIG ABONNIEREN ----
    once(event, callback, context = null) {
        if (!this.onceEvents[event]) {
            this.onceEvents[event] = [];
        }
        this.onceEvents[event].push({ 
            callback, 
            context,
            id: this.generateId()
        });
        
        if (this.debug) {
            console.log(`📡 Once-Event abonniert: ${event}`);
        }
        
        return this;
    }
    
    // ---- EVENT AUSLÖSEN ----
    emit(event, data = null) {
        if (this.debug) {
            console.log(`📤 Event ausgelöst: ${event}`, data);
        }
        
        // History speichern
        this.eventHistory.push({
            event,
            data,
            timestamp: Date.now()
        });
        if (this.eventHistory.length > this.maxHistory) {
            this.eventHistory.shift();
        }
        
        // Normale Events
        if (this.events[event]) {
            const subscribers = [...this.events[event]];
            for (const sub of subscribers) {
                try {
                    sub.callback.call(sub.context || null, data);
                } catch (error) {
                    console.error(`❌ Event-Fehler (${event}):`, error);
                    this.emit('eventbus:error', { 
                        event, 
                        error: error.message,
                        subscriber: sub.id 
                    });
                }
            }
        }
        
        // Once-Events
        if (this.onceEvents[event]) {
            const onceSubs = [...this.onceEvents[event]];
            this.onceEvents[event] = [];
            for (const sub of onceSubs) {
                try {
                    sub.callback.call(sub.context || null, data);
                } catch (error) {
                    console.error(`❌ Once-Event-Fehler (${event}):`, error);
                }
            }
        }
        
        return this;
    }
    
    // ---- EVENT ABMELDEN ----
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(
                sub => sub.callback !== callback
            );
        }
        if (this.onceEvents[event]) {
            this.onceEvents[event] = this.onceEvents[event].filter(
                sub => sub.callback !== callback
            );
        }
        return this;
    }
    
    // ---- EVENT ENTFERNEN ----
    removeAllListeners(event) {
        if (event) {
            delete this.events[event];
            delete this.onceEvents[event];
        } else {
            this.events = {};
            this.onceEvents = {};
        }
        return this;
    }
    
    // ---- EVENT LISTENERS ZÄHLEN ----
    listenerCount(event) {
        const count = (this.events[event]?.length || 0) + 
                     (this.onceEvents[event]?.length || 0);
        return count;
    }
    
    // ---- ALLE EVENTS ANZEIGEN ----
    getEvents() {
        const allEvents = new Set();
        Object.keys(this.events).forEach(e => allEvents.add(e));
        Object.keys(this.onceEvents).forEach(e => allEvents.add(e));
        return Array.from(allEvents);
    }
    
    // ---- EVENT-HISTORY ANZEIGEN ----
    getHistory(limit = 20) {
        return this.eventHistory.slice(-limit);
    }
    
    // ---- EVENT-HISTORY LÖSCHEN ----
    clearHistory() {
        this.eventHistory = [];
        return this;
    }
    
    // ---- ID GENERIEREN ----
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    }
    
    // ---- DEBUG-MODUS ----
    setDebug(enabled) {
        this.debug = enabled;
        console.log(`🐛 Debug-Modus: ${enabled ? 'aktiviert' : 'deaktiviert'}`);
        return this;
    }
    
    // ---- SYSTEM-STATUS ----
    getStatus() {
        return {
            isReady: this.isReady,
            eventCount: this.getEvents().length,
            historyCount: this.eventHistory.length,
            maxHistory: this.maxHistory,
            debug: this.debug
        };
    }
    
    // ---- WARTEN AUF EVENT ----
    waitFor(event, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.off(event, handler);
                reject(new Error(`Timeout: Event "${event}" wurde nicht ausgelöst`));
            }, timeout);
            
            const handler = (data) => {
                clearTimeout(timer);
                this.off(event, handler);
                resolve(data);
            };
            
            this.once(event, handler);
        });
    }
    
    // ---- EVENT-MONITORING ----
    monitor(event, callback) {
        const wrapped = (data) => {
            try {
                callback(data);
            } catch (error) {
                console.error(`❌ Monitor-Fehler (${event}):`, error);
            }
        };
        this.on(event, wrapped);
        return wrapped;
    }
    
    // ---- EVENT PIPELINE ----
    pipe(sourceEvent, targetEvent, transform = null) {
        const handler = (data) => {
            const transformed = transform ? transform(data) : data;
            this.emit(targetEvent, transformed);
        };
        this.on(sourceEvent, handler);
        return handler;
    }
}

// ---- EVENT BUS INSTANZ ----
const eventBus = new EventBus();
window.EventBus = eventBus;

// ---- VORDEFINIERTE EVENTS ----
/**
 * SYSTEM-EVENTS
 * system:ready      – System ist bereit
 * system:online     – Internetverbindung wiederhergestellt
 * system:offline    – Keine Internetverbindung
 * system:reboot     – System wird neu gestartet
 * system:shutdown   – System wird heruntergefahren
 * 
 * KERNEL-EVENTS
 * kernel:ready      – Kernel ist bereit
 * 
 * BOOT-EVENTS
 * boot:step         – Boot-Schritt wurde ausgeführt
 * boot:complete     – Boot abgeschlossen
 * boot:error        – Boot-Fehler
 * 
 * APP-EVENTS
 * app:registered    – App wurde registriert
 * app:installed     – App wurde installiert
 * app:uninstalled   – App wurde deinstalliert
 * app:opened        – App wurde geöffnet
 * app:closed        – App wurde geschlossen
 * app:error         – App-Fehler
 * 
 * AI-EVENTS
 * ai:ready          – AI ist bereit
 * ai:processing     – AI verarbeitet Anfrage
 * ai:response       – AI hat geantwortet
 * ai:error          – AI-Fehler
 * 
 * VOICE-EVENTS
 * voice:ready       – Voice-System ist bereit
 * voice:speaking    – Voice gibt aus
 * voice:listening   – Voice hört zu
 * voice:changed     – Voice-Einstellung geändert
 * 
 * LANGUAGE-EVENTS
 * language:changed  – Sprache wurde geändert
 * 
 * THEME-EVENTS
 * theme:changed     – Theme wurde geändert
 * 
 * STORAGE-EVENTS
 * storage:changed   – Storage-Eintrag geändert
 * storage:removed   – Storage-Eintrag entfernt
 * storage:cleared   – Storage geleert
 * 
 * NOTIFICATION-EVENTS
 * notification:new  – Neue Benachrichtigung
 * notification:read – Benachrichtigung gelesen
 * notification:clear – Benachrichtigungen geleert
 * 
 * WINDOW-EVENTS
 * window:opened     – Fenster geöffnet
 * window:closed     – Fenster geschlossen
 * window:minimized  – Fenster minimiert
 * window:maximized  – Fenster maximiert
 * window:focused    – Fenster im Fokus
 * 
 * COSMIC-EVENTS
 * cosmic:ready      – Cosmic World bereit
 * cosmic:planet-click – Planet angeklickt
 * cosmic:sun-click  – Sonne angeklickt
 * cosmic:quality-changed – Qualität geändert
 * 
 * NETWORK-EVENTS
 * network:online    – Online
 * network:offline   – Offline
 */

console.log('📡 Event Bus geladen – HalDo AI OS 24.6.0');
