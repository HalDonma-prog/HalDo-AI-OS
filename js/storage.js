// ================================================================
//  HALDO STORAGE — IndexedDB + LocalStorage
//  TEIL 2/30
// ================================================================

var HalDoStorage = {
    db: null,

    init: function() {
        return new Promise(function(resolve) {
            var req = indexedDB.open('HalDoOS', 1);
            req.onupgradeneeded = function(e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains('appData')) {
                    db.createObjectStore('appData', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('userData')) {
                    db.createObjectStore('userData', { keyPath: 'key' });
                }
            };
            req.onsuccess = function(e) {
                this.db = e.target.result;
                console.log('[Storage] IndexedDB bereit');
                resolve();
            }.bind(this);
            req.onerror = function(e) {
                console.log('[Storage] Fehler:', e.target.error);
                resolve();
            };
        }.bind(this));
    },

    set: function(store, data) {
        return new Promise(function(resolve) {
            var tx = this.db.transaction(store, 'readwrite');
            var obj = tx.objectStore(store);
            var req = obj.put(data);
            req.onsuccess = function() { resolve(true); };
            req.onerror = function() { resolve(false); };
        }.bind(this));
    },

    get: function(store, key) {
        return new Promise(function(resolve) {
            var tx = this.db.transaction(store, 'readonly');
            var obj = tx.objectStore(store);
            var req = obj.get(key);
            req.onsuccess = function() { resolve(req.result); };
            req.onerror = function() { resolve(null); };
        }.bind(this));
    },

    getAll: function(store) {
        return new Promise(function(resolve) {
            var tx = this.db.transaction(store, 'readonly');
            var obj = tx.objectStore(store);
            var req = obj.getAll();
            req.onsuccess = function() { resolve(req.result); };
            req.onerror = function() { resolve([]); };
        }.bind(this));
    },

    delete: function(store, key) {
        return new Promise(function(resolve) {
            var tx = this.db.transaction(store, 'readwrite');
            var obj = tx.objectStore(store);
            var req = obj.delete(key);
            req.onsuccess = function() { resolve(true); };
            req.onerror = function() { resolve(false); };
        }.bind(this));
    },

    setLocal: function(key, data) {
        try {
            localStorage.setItem('haldo_' + key, JSON.stringify(data));
            return true;
        } catch (e) { return false; }
    },

    getLocal: function(key) {
        try {
            var data = localStorage.getItem('haldo_' + key);
            return data ? JSON.parse(data) : null;
        } catch (e) { return null; }
    }
};
