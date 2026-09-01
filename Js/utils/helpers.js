/**
 * HALDO AI OS 24.6 – HELPERS
 * Hilfsfunktionen
 */

const Helpers = {
    // ---- ZEIT ----

    getTime() {
        const now = new Date();
        return now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    },

    getDate() {
        const now = new Date();
        return now.toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    getDateTime() {
        return `${this.getDate()} • ${this.getTime()}`;
    },

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    },

    // ---- ZUFALL ----

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    randomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    randomColor() {
        const colors = ['#6C3CE1', '#00D4FF', '#FF6B9D', '#FFD700', '#00FF88', '#FF3B30', '#FFB800', '#8B5CF6'];
        return this.randomItem(colors);
    },

    randomId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    // ---- STRING ----

    truncate(text, length = 50) {
        if (text.length <= length) return text;
        return text.substr(0, length) + '...';
    },

    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    },

    slugify(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    },

    // ---- VALIDIERUNG ----

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // ---- DOM ----

    $(selector, context = document) {
        return context.querySelector(selector);
    },

    $$(selector, context = document) {
        return context.querySelectorAll(selector);
    },

    createElement(tag, className = '', innerHTML = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (innerHTML) el.innerHTML = innerHTML;
        return el;
    },

    // ---- SPEICHER ----

    getSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    },

    // ---- DEBOUNCE / THROTTLE ----

    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },

    throttle(fn, limit = 300) {
        let inThrottle = false;
        return (...args) => {
            if (!inThrottle) {
                fn(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // ---- COOKIES ----

    setCookie(name, value, days = 30) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    },

    getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    },

    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    },

    // ---- BROWSER ----

    isMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    getOS() {
        const ua = navigator.userAgent;
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        return 'Unknown';
    },

    getBrowser() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edg')) return 'Edge';
        return 'Unknown';
    },

    // ---- TASTATUR ----

    isModifierKey(e) {
        return ['Control', 'Shift', 'Alt', 'Meta', 'Escape', 'Tab', 'CapsLock'].includes(e.key);
    },

    // ---- JSON ----

    safeJSON(str) {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    },

    // ---- FARBE ----

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('');
    },

    // ---- LOG ----

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        if (data) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
        // In System-Logs speichern
        if (Storage.get('system_logs', true)) {
            const logs = Storage.get('logs', []);
            logs.push({ timestamp, level, message, data });
            if (logs.length > 1000) logs.splice(0, logs.length - 1000);
            Storage.set('logs', logs);
        }
    },

    info(msg, data = null) { this.log('info', msg, data); },
    warn(msg, data = null) { this.log('warn', msg, data); },
    error(msg, data = null) { this.log('error', msg, data); }
};

window.Helpers = Helpers;
