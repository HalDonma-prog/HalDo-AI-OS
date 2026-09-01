/**
 * HALDO AI OS 24.6 – SERVICE BRIDGE
 * Verbindung zwischen Services und Apps
 */

const ServiceBridge = {
    services: {},
    registrations: {},

    register(serviceName, instance) {
        this.services[serviceName] = instance;
        this.registrations[serviceName] = {
            registeredAt: Date.now(),
            status: 'active'
        };
        EventBus.emit('service:registered', { name: serviceName });
        console.log(`🔗 Service registriert: ${serviceName}`);
        return this;
    },

    get(serviceName) {
        return this.services[serviceName] || null;
    },

    unregister(serviceName) {
        delete this.services[serviceName];
        delete this.registrations[serviceName];
        EventBus.emit('service:unregistered', { name: serviceName });
        return this;
    },

    call(serviceName, method, ...args) {
        const service = this.get(serviceName);
        if (!service) {
            console.warn(`⚠️ Service ${serviceName} nicht gefunden`);
            return null;
        }
        if (typeof service[method] !== 'function') {
            console.warn(`⚠️ Methode ${method} in ${serviceName} nicht gefunden`);
            return null;
        }
        return service[method](...args);
    },

    list() {
        return Object.keys(this.services);
    },

    status(serviceName) {
        const registration = this.registrations[serviceName];
        if (!registration) return 'not_found';
        return registration.status;
    },

    isReady(serviceName) {
        const service = this.get(serviceName);
        return service && typeof service.isReady === 'function' ? service.isReady() : true;
    }
};

window.ServiceBridge = ServiceBridge;
