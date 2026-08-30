// ================================================================
//  HALDO APP LOADER
// ================================================================

var HalDoAppLoader = {
    loadedApps: {},

    register: function(id, config) {
        window.HalDoState.apps[id] = {
            id: id,
            title: config.title || id,
            icon: config.icon || '📦',
            render: config.render || function() {}
        };
        console.log('[AppLoader] Registriert:', id);
    },

    loadApp: function(id) {
        // Prüfe ob App schon registriert ist
        if (window.HalDoState.apps[id]) {
            HalDoWindow.launch(id);
            return;
        }

        // Lade App dynamisch (für spätere Erweiterung)
        var script = document.createElement('script');
        script.src = 'apps/' + id + '/app.js';
        script.onload = function() {
            if (window.HalDoState.apps[id]) {
                HalDoWindow.launch(id);
            } else {
                if (window.HalDoNotify) window.HalDoNotify('❌ App "' + id + '" konnte nicht geladen werden',
                    'error');
            }
        };
        script.onerror = function() {
            if (window.HalDoNotify) window.HalDoNotify('❌ App "' + id + '" nicht gefunden', 'error');
        };
        document.head.appendChild(script);
    }
};
