// ================================================================
//  HALDO APP GENERATOR — ALLE 84 APPS VON A BIS Z
//  TEIL 9/30
// ================================================================

var HalDoAppGenerator = {
    generateAll: function() {
        // ===== ALLE 84 APPS =====
        var appList = [
            // A
            { id: 'ai', title: 'HalDo AI', icon: '🤖' },
            { id: 'appcenter', title: 'App Center', icon: '📦' },
            { id: 'appmanager', title: 'App Manager', icon: '📋' },
            { id: 'audiorecorder', title: 'Audio Recorder', icon: '🎙️' },
            // B
            { id: 'backup', title: 'Backup & Restore', icon: '💾' },
            { id: 'browser', title: 'Browser', icon: '🌐' },
            // C
            { id: 'calculator', title: 'Calculator', icon: '🧮' },
            { id: 'calendar', title: 'Calendar', icon: '📅' },
            { id: 'camera', title: 'Camera', icon: '📷' },
            { id: 'contacts', title: 'Contacts', icon: '👤' },
            { id: 'cosmic', title: 'Cosmic World', icon: '🌌' },
            // D
            { id: 'documents', title: 'Documents', icon: '📄' },
            { id: 'downloads', title: 'Downloads', icon: '⬇️' },
            // E
            { id: 'ezidikeyboard', title: 'Êzîdî Keyboard', icon: '⌨️' },
            { id: 'email', title: 'Email / Mail', icon: '✉️' },
            // F
            { id: 'files', title: 'File Manager', icon: '📁' },
            { id: 'filetransfer', title: 'File Transfer', icon: '🔄' },
            // G
            { id: 'gallery', title: 'Gallery', icon: '🖼️' },
            { id: 'games', title: 'Games Center', icon: '🎮' },
            // H
            { id: 'haldoai', title: 'HalDo AI', icon: '🤖' },
            { id: 'help', title: 'Help Center', icon: '❓' },
            // I
            { id: 'imageeditor', title: 'Image Editor', icon: '🎨' },
            { id: 'internet', title: 'Internet Center', icon: '📶' },
            // J
            { id: 'journal', title: 'Journal / Diary', icon: '📖' },
            // K
            { id: 'keyboard', title: 'Keyboard Center', icon: '⌨️' },
            // L
            { id: 'language', title: 'Language Center', icon: '🌍' },
            { id: 'logs', title: 'System Logs', icon: '📋' },
            // M
            { id: 'maps', title: 'Maps', icon: '🗺️' },
            { id: 'mediacenter', title: 'Media Center', icon: '🎬' },
            { id: 'messages', title: 'Messages', icon: '💬' },
            { id: 'music', title: 'Music', icon: '🎵' },
            // N
            { id: 'notes', title: 'Notes', icon: '📝' },
            { id: 'notifications', title: 'Notification Center', icon: '🔔' },
            // O
            { id: 'office', title: 'Office Center', icon: '📊' },
            { id: 'about', title: 'OS Information', icon: 'ℹ️' },
            // P
            { id: 'pdfviewer', title: 'PDF Viewer', icon: '📕' },
            { id: 'photos', title: 'Photos', icon: '🖼️' },
            { id: 'privacy', title: 'Privacy Center', icon: '🔒' },
            { id: 'processmanager', title: 'Process Manager', icon: '⚡' },
            // Q
            { id: 'quicksettings', title: 'Quick Settings', icon: '⚙️' },
            { id: 'qrscanner', title: 'QR Scanner', icon: '📱' },
            // R
            { id: 'recovery', title: 'Recovery Center', icon: '🔄' },
            { id: 'reminders', title: 'Reminders', icon: '⏰' },
            // S
            { id: 'settings', title: 'Settings', icon: '⚙️' },
            { id: 'security', title: 'Security Center', icon: '🛡️' },
            { id: 'systemmonitor', title: 'System Monitor', icon: '📊' },
            { id: 'storagemanager', title: 'Storage Manager', icon: '💽' },
            { id: 'screenshot', title: 'Screenshot', icon: '📸' },
            { id: 'search', title: 'Search', icon: '🔍' },
            // T
            { id: 'taskmanager', title: 'Task Manager', icon: '✅' },
            { id: 'terminal', title: 'Terminal', icon: '⌨️' },
            { id: 'theme', title: 'Theme Center', icon: '🎨' },
            { id: 'clock', title: 'Time / Clock', icon: '🕐' },
            // U
            { id: 'update', title: 'Update Center', icon: '🔄' },
            { id: 'usercenter', title: 'User Center', icon: '👤' },
            // V
            { id: 'video', title: 'Video Player', icon: '🎬' },
            { id: 'voice', title: 'Voice Center', icon: '🎤' },
            { id: 'voicerecorder', title: 'Voice Recorder', icon: '🎙️' },
            // W
            { id: 'weather', title: 'Weather', icon: '🌤️' },
            { id: 'websearch', title: 'Web Search', icon: '🔎' },
            { id: 'windows', title: 'Window Center', icon: '🪟' },
            // X
            { id: 'extensions', title: 'Extensions Center', icon: '🧩' },
            // Y
            { id: 'personal', title: 'Your HalDo / Personal', icon: '💙' },
            // Z
            { id: 'zip', title: 'ZIP / Archive Manager', icon: '📦' },
            // Spezial-Apps
            { id: 'livingai', title: 'Living HalDo AI', icon: '🧠' },
            { id: 'cosmicdesktop', title: 'Cosmic Desktop', icon: '🌌' },
            { id: 'controlcenter', title: 'Control Center', icon: '🎛️' },
            { id: 'aicommand', title: 'AI Command Center', icon: '🤖' },
            { id: 'aimemory', title: 'AI Memory Center', icon: '🧠' },
            { id: 'aitools', title: 'AI Tools Center', icon: '🛠️' },
            { id: 'aiautomation', title: 'AI Automation', icon: '⚡' },
            { id: 'apppermissions', title: 'App Permissions', icon: '🔐' },
            { id: 'developer', title: 'Developer Center', icon: '💻' },
            { id: 'diagnostics', title: 'Diagnostics Center', icon: '🔬' },
            { id: 'systemrecovery', title: 'System Recovery', icon: '🔄' },
            { id: 'backupcenter', title: 'Backup Center', icon: '💾' },
            { id: 'migration', title: 'Migration Center', icon: '📤' },
            { id: 'rollback', title: 'Rollback Center', icon: '⏪' },
            { id: 'servicemanager', title: 'Service Manager', icon: '⚙️' },
            { id: 'modulemanager', title: 'Module Manager', icon: '🧩' },
            { id: 'eventcenter', title: 'Event Center', icon: '📡' },
            { id: 'sysinfo', title: 'System Information', icon: 'ℹ️' },
            { id: 'installation', title: 'Installation Center', icon: '📥' },
            { id: 'pwa', title: 'PWA / OS Installation', icon: '📲' },
            { id: 'appworld', title: 'App World', icon: '📱' }
        ];

        // Jede App registrieren
        for (var i = 0; i < appList.length; i++) {
            var app = appList[i];
            // Prüfen ob App schon existiert (überschreiben)
            if (window.HalDoState.apps[app.id]) {
                // Überschreiben mit neuer Funktion
                window.HalDoState.apps[app.id].title = app.title;
                window.HalDoState.apps[app.id].icon = app.icon;
            } else {
                // Neue App registrieren
                window.HalDoAppLoader.register(app.id, {
                    title: app.title,
                    icon: app.icon,
                    render: function(body) {
                        body.innerHTML =
                            '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;text-align:center;padding:12px;"><div style="font-size:2.5rem;">' +
                            app.icon +
                            '</div><h3 style="font-size:0.85rem;">' + app.title +
                            '</h3><p style="color:#8899bb;font-size:0.7rem;">Bereit für HalDo OS 24</p><button onclick="HalDoNotify(\'▶️ ' +
                            app.title +
                            ' wird geöffnet\')" style="padding:6px 14px;font-size:0.7rem;">▶️ Öffnen</button><div style="font-size:0.5rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;width:100%;">' +
                            app.id + ' · HalDo OS 24</div></div>';
                    }
                });
            }
        }

        console.log('[AppGenerator] ' + appList.length + ' Apps generiert');
        return appList.length;
    }
};
