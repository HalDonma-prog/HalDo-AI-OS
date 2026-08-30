// ================================================================
//  HALDO MENU SYSTEM — ZWEI HAUPTMENÜS
//  TEIL 10/30
// ================================================================

var HalDoMenu = {
    init: function() {
        this.createMenus();
        this.bindEvents();
    },

    createMenus: function() {
        // Linkes Menü (System)
        var leftMenu = document.createElement('div');
        leftMenu.id = 'haldo-menu-left';
        leftMenu.style.cssText = `
            position: fixed;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            z-index: 100;
            background: rgba(10, 10, 30, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 0 16px 16px 0;
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-left: none;
            padding: 12px 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 4px 0 30px rgba(0, 0, 0, 0.4);
            transition: transform 0.3s ease;
        `;
        leftMenu.innerHTML = `
            <div class="menu-item" data-menu="system" title="System-Menü">
                <img src="assets/logo.png" alt="HalDo" style="width:32px;height:32px;border-radius:50%;border:2px solid #00d4ff;" onerror="this.style.display='none';this.parentElement.textContent='⟡';" />
                <span style="font-size:0.6rem;color:#8899bb;text-align:center;display:block;margin-top:2px;">System</span>
            </div>
            <div class="menu-divider" style="height:1px;background:rgba(255,255,255,0.05);margin:4px 0;"></div>
            <div class="menu-item" data-menu="ai" title="HalDo AI" style="cursor:pointer;text-align:center;padding:4px 0;">
                <span style="font-size:1.5rem;">🤖</span>
                <span style="font-size:0.6rem;color:#8899bb;text-align:center;display:block;">AI</span>
            </div>
            <div class="menu-item" data-menu="files" title="Dateien" style="cursor:pointer;text-align:center;padding:4px 0;">
                <span style="font-size:1.5rem;">📁</span>
                <span style="font-size:0.6rem;color:#8899bb;text-align:center;display:block;">Dateien</span>
            </div>
            <div class="menu-item" data-menu="settings" title="Einstellungen" style="cursor:pointer;text-align:center;padding:4px 0;">
                <span style="font-size:1.5rem;">⚙️</span>
                <span style="font-size:0.6rem;color:#8899bb;text-align:center;display:block;">Einstell.</span>
            </div>
        `;

        // Rechtes Menü (App World)
        var rightMenu = document.createElement('div');
        rightMenu.id = 'haldo-menu-right';
        rightMenu.style.cssText = `
            position: fixed;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            z-index: 100;
            background: rgba(10, 10, 30, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 16px 0 0 16px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-right: none;
            padding: 12px 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: -4px 0 30px rgba(0, 0, 0, 0.4);
            transition: transform 0.3s ease;
        `;
        rightMenu.innerHTML = `
            <div class="menu-item" data-menu="appworld" title="App World" style="cursor:pointer;text-align:center;padding:4px 0;">
                <span style="font-size:1.8rem;">📱</span>
                <span style="font-size:0.6rem;color:#8899bb;text-align:center;display:block;">App World</span>
            </div>
            <div class="menu-divider" style="height:1px;background:rgba(255,255,255,0.05);margin:4px 0;"></div>
            <div class="menu-item" data-menu="mail" title="E-Mail" style="cursor:pointer;text-align:center;padding:4px 0;">
                <span style="font-size:1.5rem;">✉️</span>
                <span style="font-size:0.6rem;color:#8899bb;text-align:center;display:block;">Mail</span>
            </div>
            <div class="menu-item" data-menu="chat" title="Chat" style="cursor:pointer;text-align:center;padding:4px 0;">
                <span style="font-size:1.5rem;">💬</span>
                <span style="font-size:0.6rem;color:#8899bb;text-align:center;display:block;">Chat</span>
            </div>
            <div class="menu-item" data-menu="contacts" title="Kontakte" style="cursor:pointer;text-align:center;padding:4px 0;">
                <span style="font-size:1.5rem;">👤</span>
                <span style="font-size:0.6rem;color:#8899bb;text-align:center;display:block;">Kontakte</span>
            </div>
            <div class="menu-item" data-menu="cosmic" title="Cosmic World" style="cursor:pointer;text-align:center;padding:4px 0;">
                <span style="font-size:1.5rem;">🌌</span>
                <span style="font-size:0.6rem;color:#8899bb;text-align:center;display:block;">Cosmic</span>
            </div>
            <div class="menu-divider" style="height:1px;background:rgba(255,255,255,0.05);margin:4px 0;"></div>
            <div class="menu-item" data-menu="search" title="Suche" style="cursor:pointer;text-align:center;padding:4px 0;">
                <span style="font-size:1.5rem;">🔍</span>
                <span style="font-size:0.6rem;color:#8899bb;text-align:center;display:block;">Suche</span>
            </div>
        `;

        document.body.appendChild(leftMenu);
        document.body.appendChild(rightMenu);
    },

    bindEvents: function() {
        // Linkes Menü
        document.querySelectorAll('#haldo-menu-left .menu-item[data-menu]').forEach(function(item) {
            item.addEventListener('click', function() {
                var menu = this.dataset.menu;
                if (menu === 'system') {
                    if (window.HalDoNotify) HalDoNotify('⚙️ System-Menü geöffnet');
                    if (window.HalDoWindow) HalDoWindow.launch('settings');
                } else if (menu === 'ai') {
                    if (window.HalDoWindow) HalDoWindow.launch('ai');
                } else if (menu === 'files') {
                    if (window.HalDoWindow) HalDoWindow.launch('files');
                } else if (menu === 'settings') {
                    if (window.HalDoWindow) HalDoWindow.launch('settings');
                }
            });
        });

        // Rechtes Menü
        document.querySelectorAll('#haldo-menu-right .menu-item[data-menu]').forEach(function(item) {
            item.addEventListener('click', function() {
                var menu = this.dataset.menu;
                if (menu === 'appworld') {
                    if (window.HalDoWindow) HalDoWindow.launch('appworld');
                } else if (menu === 'mail') {
                    if (window.HalDoWindow) HalDoWindow.launch('email');
                } else if (menu === 'chat') {
                    if (window.HalDoWindow) HalDoWindow.launch('messages');
                } else if (menu === 'contacts') {
                    if (window.HalDoWindow) HalDoWindow.launch('contacts');
                } else if (menu === 'cosmic') {
                    if (window.HalDoWindow) HalDoWindow.launch('cosmic');
                } else if (menu === 'search') {
                    if (window.HalDoNotify) HalDoNotify('🔍 Suche wird geöffnet');
                    if (window.HalDoWindow) HalDoWindow.launch('search');
                }
            });
        });

        console.log('[Menu] Zwei Hauptmenüs aktiviert');
    }
};
