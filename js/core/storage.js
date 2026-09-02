/**
 * HALDO AI OS 24.6.0 – STORAGE
 */
const Storage = {
    prefix: 'haldo_',
    get(key, fallback = null) {
        try { const d = localStorage.getItem(this.prefix + key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem(this.prefix + key, JSON.stringify(value)); return true; } catch { return false; }
    },
    remove(key) { localStorage.removeItem(this.prefix + key); return true; },
    clear() {
        Object.keys(localStorage).filter(k => k.startsWith(this.prefix)).forEach(k => localStorage.removeItem(k));
        return true;
    },
    getAll() {
        const result = {};
        Object.keys(localStorage).filter(k => k.startsWith(this.prefix)).forEach(k => {
            const key = k.replace(this.prefix, '');
            try { result[key] = JSON.parse(localStorage.getItem(k)); } catch { result[key] = localStorage.getItem(k); }
        });
        return result;
    }
};
window.Storage = Storage;
