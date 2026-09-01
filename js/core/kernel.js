/**
 * HALDO AI OS 24.6 – KERNEL
 * Das Herz des Betriebssystems
 */

const Kernel = {
    version: '24.6',
    build: '2024.06',
    name: 'HalDo AI OS',
    codename: 'Cosmic Intelligence',

    state: {
        initialized: false,
        uptime: 0,
        memory: { used: 0, total: 0 },
        processes: []
    },

    info: {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        online: navigator.onLine
    },

    init() {
        console.log(`🔧 ${this.name} ${this.version} – Kernel initialisiert`);
        this.state.initialized = true;
        this.state.uptime = Date.now();

        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        EventBus.emit('kernel:ready', this);
        return this;
    },

    getUptime() {
        return Math.floor((Date.now() - this.state.uptime) / 1000);
    },

    getFormattedUptime() {
        const s = this.getUptime();
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h}h ${m}m ${sec}s`;
    },

    handleOnline() {
        console.log('🌐 Verbindung wiederhergestellt');
        EventBus.emit('system:online');
    },

    handleOffline() {
        console.warn('⚠️ Keine Internetverbindung');
        EventBus.emit('system:offline');
    },

    execute(command, args = {}) {
        console.log(`⚡ Kernel-Befehl: ${command}`, args);
        switch (command) {
            case 'reboot':
                this.reboot();
                break;
            case 'shutdown':
                this.shutdown();
                break;
            case 'clear':
                console.clear();
                break;
            default:
                console.warn(`⚠️ Unbekannter Befehl: ${command}`);
        }
    },

    reboot() {
        console.log('🔄 System wird neu gestartet...');
        EventBus.emit('system:reboot');
        location.reload();
    },

    shutdown() {
        console.log('⏹️ System wird heruntergefahren...');
        EventBus.emit('system:shutdown');
        if (window.close) window.close();
    }
};

window.Kernel = Kernel;
