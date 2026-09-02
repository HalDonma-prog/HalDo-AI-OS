/**
 * HALDO AI OS 24.6.0 – HELPERS
 */
const Helpers = {
    getTime() {
        const now = new Date();
        return now.toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    },
    getDate() {
        const now = new Date();
        return now.toLocaleDateString('de', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },
    random(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    randomId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); },
    truncate(text, length = 50) { return text.length <= length ? text : text.substr(0, length) + '...'; },
    capitalize(text) { return text.charAt(0).toUpperCase() + text.slice(1); },
    isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); },
    isValidUrl(url) { try { new URL(url); return true; } catch { return false; } },
    $(selector, context = document) { return context.querySelector(selector); },
    $$(selector, context = document) { return context.querySelectorAll(selector); },
    debounce(fn, delay = 300) {
        let timer;
        return (...args) => { clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay); };
    },
    throttle(fn, limit = 300) {
        let inThrottle = false;
        return (...args) => { if (!inThrottle) { fn(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit); } };
    },
    getSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    },
    isMobile() { return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); }
};
window.Helpers = Helpers;
