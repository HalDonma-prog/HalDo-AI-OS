/**
 * HALDO AI OS 24.6.0 – KERNEL
 * Das Herz des Betriebssystems
 */
const Kernel = {
    version: '24.6.0',
    name: 'HalDo AI OS',
    state: { initialized: false, uptime: 0 },
    init() {
        console.log(`🔧 ${this.name} ${this.version} – Kernel initialisiert`);
        this.state.initialized = true;
        this.state.uptime = Date.now();
        EventBus.emit('kernel:ready');
        return this;
    },
    getUptime() { return Math.floor((Date.now() - this.state.uptime) / 1000); },
    reboot() { location.reload(); },
    shutdown() { if (window.close) window.close(); }
};
window.Kernel = Kernel;
