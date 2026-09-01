/**
 * HALDO AI OS 24.6.0 – KERNEL
 * Das Herz des Betriebssystems
 * Version: 1.0.0
 */

const Kernel = {
    // ---- SYSTEM-INFORMATIONEN ----
    version: '24.6.0',
    build: '2024.06.01',
    name: 'HalDo AI OS',
    codename: 'Cosmic Intelligence',
    author: 'HalDo Team',
    
    // ---- SYSTEM-STATUS ----
    state: {
        initialized: false,
        bootTime: 0,
        uptime: 0,
        memory: { used: 0, total: 0 },
        processes: [],
        services: {},
        modules: {}
    },
    
    // ---- SYSTEM-INFO ----
    info: {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        online: navigator.onLine,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth
        },
        browser: {
            name: this.getBrowserName(),
            version: this.getBrowserVersion()
        }
    },
    
    // ---- INITIALISIERUNG ----
    init() {
        console.log(`🔧 ${this.name} ${this.version} – Kernel wird initialisiert...`);
        
        this.state.initialized = true;
        this.state.bootTime = Date.now();
        this.state.uptime = 0;
        
        // System-Uhr starten
        setInterval(() => {
            this.state.uptime = Math.floor((Date.now() - this.state.bootTime) / 1000);
        }, 1000);
        
        // Online/Offline überwachen
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Speicher-Info
        this.updateMemoryInfo();
        
        // Event auslösen
        EventBus.emit('kernel:ready', { 
            version: this.version, 
            name: this.name,
            uptime: this.state.uptime 
        });
        
        console.log(`✅ Kernel ready – ${this.name} ${this.version}`);
        return this;
    },
    
    // ---- BROWSER-ERKENNUNG ----
    getBrowserName() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Opera')) return 'Opera';
        return 'Unknown';
    },
    
    getBrowserVersion() {
        const ua = navigator.userAgent;
        const match = ua.match(/(Chrome|Firefox|Safari|Edg|Opera)\/(\d+)/);
        return match ? match[2] : 'Unknown';
    },
    
    // ---- SPEICHER-INFO ----
    updateMemoryInfo() {
        if (performance && performance.memory) {
            this.state.memory.total = performance.memory.jsHeapSizeLimit;
            this.state.memory.used = performance.memory.usedJSHeapSize;
        }
    },
    
    // ---- ONLINE/OFFLINE ----
    handleOnline() {
        console.log('🌐 Verbindung wiederhergestellt');
        EventBus.emit('system:online');
        const nots = Storage.get('notifications', []);
        nots.push('🌐 Online – Verbindung wiederhergestellt');
        if (nots.length > 50) nots.shift();
        Storage.set('notifications', nots);
    },
    
    handleOffline() {
        console.warn('📴 Keine Internetverbindung');
        EventBus.emit('system:offline');
        const nots = Storage.get('notifications', []);
        nots.push('📴 Offline – Einige Funktionen sind eingeschränkt');
        if (nots.length > 50) nots.shift();
        Storage.set('notifications', nots);
    },
    
    // ---- SYSTEM-BEFEHLE ----
    execute(command, args = {}) {
        console.log(`⚡ Kernel-Befehl: ${command}`, args);
        
        switch(command) {
            case 'reboot':
                this.reboot();
                break;
            case 'shutdown':
                this.shutdown();
                break;
            case 'clear':
                console.clear();
                break;
            case 'status':
                return this.getStatus();
            case 'info':
                return this.getSystemInfo();
            case 'version':
                return this.version;
            case 'uptime':
                return this.getUptime();
            default:
                console.warn(`⚠️ Unbekannter Befehl: ${command}`);
                return null;
        }
    },
    
    // ---- SYSTEM-FUNKTIONEN ----
    getUptime() {
        return this.state.uptime;
    },
    
    getFormattedUptime() {
        const seconds = this.state.uptime;
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    },
    
    getStatus() {
        return {
            version: this.version,
            uptime: this.getFormattedUptime(),
            initialized: this.state.initialized,
            online: navigator.onLine,
            memory: this.state.memory,
            processes: this.state.processes.length,
            services: Object.keys(this.state.services).length,
            modules: Object.keys(this.state.modules).length
        };
    },
    
    getSystemInfo() {
        return {
            name: this.name,
            version: this.version,
            build: this.build,
            platform: this.info.platform,
            browser: this.info.browser,
            screen: this.info.screen,
            language: this.info.language
        };
    },
    
    // ---- SERVICE-MANAGEMENT ----
    registerService(name, service) {
        this.state.services[name] = {
            ...service,
            registeredAt: Date.now(),
            status: 'active'
        };
        EventBus.emit('service:registered', { name });
        console.log(`🔗 Service registriert: ${name}`);
        return this;
    },
    
    getService(name) {
        return this.state.services[name] || null;
    },
    
    unregisterService(name) {
        delete this.state.services[name];
        EventBus.emit('service:unregistered', { name });
        return this;
    },
    
    // ---- MODUL-MANAGEMENT ----
    registerModule(name, module) {
        this.state.modules[name] = {
            ...module,
            registeredAt: Date.now(),
            status: 'active'
        };
        EventBus.emit('module:registered', { name });
        console.log(`🧩 Modul registriert: ${name}`);
        return this;
    },
    
    getModule(name) {
        return this.state.modules[name] || null;
    },
    
    // ---- SYSTEM-NEUSTRART ----
    reboot() {
        console.log('🔄 System wird neu gestartet...');
        EventBus.emit('system:reboot');
        // Alle Fenster schließen
        if (typeof WindowManager !== 'undefined') {
            WindowManager.closeAll();
        }
        // Seite neu laden
        setTimeout(() => {
            location.reload();
        }, 500);
    },
    
    shutdown() {
        console.log('⏹️ System wird heruntergefahren...');
        EventBus.emit('system:shutdown');
        if (window.close) {
            window.close();
        } else {
            alert('⏹️ System heruntergefahren. Sie können das Fenster jetzt schließen.');
        }
    },
    
    // ---- VERSIONSPRÜFUNG ----
    checkVersion() {
        // In einer echten Umgebung würde hier eine API abgefragt werden
        const latestVersion = '24.6.0'; // Simuliert
        const isLatest = this.version === latestVersion;
        return {
            current: this.version,
            latest: latestVersion,
            isLatest: isLatest,
            updateAvailable: !isLatest
        };
    }
};

// Kernel global verfügbar machen
window.Kernel = Kernel;

console.log('💙❤️🚀 Kernel geladen – HalDo AI OS 24.6.0');
