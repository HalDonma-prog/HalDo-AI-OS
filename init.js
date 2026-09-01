// ================================================================
//  HALDO AI OS 24 – INIT (BOOT, DOCK, MENÜS, SHORTCUTS)
// ================================================================

// ============================================================
//  WINDOW MANAGER
// ============================================================
var WindowManager = {
    getSafePosition: function() {
        var vw = window.innerWidth,
            vh = window.innerHeight;
        var w = Math.min(480, vw - 30);
        var h = Math.min(380, vh - 150);
        return {
            x: Math.max(10, (vw - w) / 2 + (Math.random() - 0.5) * 30),
            y: Math.max(40, (vh - h) / 2 - 20 + (Math.random() - 0.5) * 30),
            w: w,
            h: h
        };
    },

    launch: function(id) {
        var app = state.apps[id];
        if (!app) {
            Notify.error(t('error') + ': "' + id + '"');
            return null;
        }

        for (var i = 0; i < state.windows.length; i++) {
            if (state.windows[i].appId === id) {
                this._focus(state.windows[i].id);
                return state.windows[i];
            }
        }

        var pos = this.getSafePosition();
        var winId = 'win-' + uid();
        var win = {
            id: winId,
            appId: id,
            title: app.title || id,
            icon: app.icon || '📦',
            x: pos.x,
            y: pos.y,
            width: pos.w,
            height: pos.h,
            zIndex: state.windowZIndex++,
            element: null,
            minimized: false,
            _prev: {}
        };

        state.windows.push(win);
        this._render(win);
        this._focus(winId);

        if (app.render) {
            var body = win.element.querySelector('.window-body');
            app.render(body, win);
        }

        state.system.appLaunches++;
        Notify.info('🔄 ' + (app.title || id) + ' ' + (CONFIG.language === 'en' ? 'opened' : CONFIG
            .language === 'ku' ? 'vebû' : 'geöffnet'));
        return win;
    },

    _render: function(win) {
        var existing = document.getElementById(win.id);
        if (existing) existing.remove();

        var el = document.createElement('div');
        el.id = win.id;
        el.className = 'window active';
        el.style.left = win.x + 'px';
        el.style.top = win.y + 'px';
        el.style.width = win.width + 'px';
        el.style.height = win.height + 'px';
        el.style.zIndex = win.zIndex;
        el.dataset.appId = win.appId;

        el.innerHTML =
            '<div class="window-header">' +
            '<span class="window-title"><span class="icon">' + win.icon + '</span>' + win.title +
            '</span>' +
            '<div class="window-controls">' +
            '<button class="win-btn minimize" data-action="minimize">─</button>' +
            '<button class="win-btn maximize" data-action="maximize">⧉</button>' +
            '<button class="win-btn close" data-action="close">✕</button>' +
            '</div>' +
            '</div>' +
            '<div class="window-body"></div>';

        DOM.appContainer.appendChild(el);
        win.element = el;

        var btns = el.querySelectorAll('.win-btn');
        for (var i = 0; i < btns.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var action = btn.dataset.action;
                    if (action === 'close') WindowManager.close(win.id);
                    else if (action === 'minimize') WindowManager.minimize(win.id);
                    else if (action === 'maximize') WindowManager.maximize(win.id);
                });
            })(btns[i]);
        }

        this._setupDrag(win, el);
        this._setupResize(win, el);
    },

    _setupDrag: function(win, el) {
        var header = el.querySelector('.window-header');
        var drag = false,
            startX, startY, origX, origY;

        function startDrag(cx, cy) {
            if (header.querySelector('.win-btn')) return;
            drag = true;
            startX = cx;
            startY = cy;
            origX = win.x;
            origY = win.y;
            WindowManager._focus(win.id);
            el.style.cursor = 'grabbing';
        }

        function moveDrag(cx, cy) {
            if (!drag) return;
            var dx = cx - startX,
                dy = cy - startY;
            win.x = clamp(origX + dx, 0, window.innerWidth - win.width);
            win.y = clamp(origY + dy, 0, window.innerHeight - win.height - 60);
            el.style.left = win.x + 'px';
            el.style.top = win.y + 'px';
        }

        function endDrag() {
            if (drag) { drag = false;
                el.style.cursor = ''; }
        }

        header.addEventListener('mousedown', function(e) {
            if (!e.target.closest('.win-btn')) startDrag(e.clientX, e.clientY);
        });
        document.addEventListener('mousemove', function(e) { if (drag) moveDrag(e.clientX, e.clientY); });
        document.addEventListener('mouseup', endDrag);

        header.addEventListener('touchstart', function(e) {
            var t = e.touches[0];
            if (!e.target.closest('.win-btn')) startDrag(t.clientX, t.clientY);
        }, { passive: true });
        document.addEventListener('touchmove', function(e) {
            if (drag) { var t = e.touches[0];
                moveDrag(t.clientX, t.clientY); }
        }, { passive: true });
        document.addEventListener('touchend', endDrag, { passive: true });
    },

    _setupResize: function(win, el) {
        var handle = document.createElement('div');
        handle.style.cssText =
            'position:absolute;bottom:0;right:0;width:20px;height:20px;cursor:se-resize;touch-action:none;';
        el.appendChild(handle);

        var resize = false,
            startW, startH, startX2, startY2;

        function startResize(cx, cy) {
            resize = true;
            startW = win.width;
            startH = win.height;
            startX2 = cx;
            startY2 = cy;
        }

        function moveResize(cx, cy) {
            if (!resize) return;
            var dw = cx - startX2,
                dh = cy - startY2;
            win.width = clamp(startW + dw, 160, window.innerWidth - win.x - 10);
            win.height = clamp(startH + dh, 100, window.innerHeight - win.y - 70);
            el.style.width = win.width + 'px';
            el.style.height = win.height + 'px';
        }

        function endResize() { resize = false; }

        handle.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            startResize(e.clientX, e.clientY);
        });
        document.addEventListener('mousemove', function(e) { if (resize) moveResize(e.clientX, e.clientY); });
        document.addEventListener('mouseup', endResize);

        handle.addEventListener('touchstart', function(e) {
            var t = e.touches[0];
            e.stopPropagation();
            startResize(t.clientX, t.clientY);
        }, { passive: true });
        document.addEventListener('touchmove', function(e) {
            if (resize) { var t = e.touches[
