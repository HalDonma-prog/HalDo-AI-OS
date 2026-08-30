// ================================================================
//  HALDO WINDOW MANAGER
//  TEIL 5/30
// ================================================================

var HalDoWindow = {
    getSafePosition: function() {
        var vw = window.innerWidth,
            vh = window.innerHeight;
        var w = Math.min(500, vw - 40);
        var h = Math.min(380, vh - 160);
        return { x: Math.max(10, (vw - w) / 2), y: Math.max(40, (vh - h) / 2 - 20), w: w, h: h };
    },

    launch: function(id) {
        var state = window.HalDoState;
        var app = state.apps[id];
        if (!app) {
            if (window.HalDoNotify) window.HalDoNotify('❌ App "' + id + '" nicht gefunden', 'error');
            return;
        }

        // Prüfe ob bereits offen
        for (var i = 0; i < state.windows.length; i++) {
            if (state.windows[i].appId === id) {
                this.focus(state.windows[i].id);
                return;
            }
        }

        var pos = this.getSafePosition();
        var winId = 'win-' + Date.now();
        var win = {
            id: winId,
            appId: id,
            title: app.title || id,
            icon: app.icon || '📦',
            x: pos.x + Math.random() * 30,
            y: pos.y + Math.random() * 30,
            width: pos.w,
            height: pos.h,
            zIndex: state.windowZIndex++,
            element: null
        };

        state.windows.push(win);
        this.render(win);
        this.focus(winId);
        if (app.render) {
            var body = win.element.querySelector('.window-body');
            app.render(body, win);
        }
        if (window.HalDoNotify) window.HalDoNotify('🔄 ' + (app.title || id) + ' geöffnet');
        return win;
    },

    render: function(win) {
        var existing = document.getElementById(win.id);
        if (existing) existing.remove();

        var el = document.createElement('div');
        el.id = win.id;
        el.className = 'window';
        el.style.left = win.x + 'px';
        el.style.top = win.y + 'px';
        el.style.width = win.width + 'px';
        el.style.height = win.height + 'px';
        el.style.zIndex = win.zIndex;
        el.dataset.appId = win.appId;

        el.innerHTML = '<div class="window-header"><span class="window-title">' + win.icon + ' ' + win.title +
            '</span><div class="window-controls"><button class="win-btn" data-action="minimize">─</button><button class="win-btn" data-action="maximize">⧉</button><button class="win-btn close" data-action="close">✕</button></div></div><div class="window-body"></div>';

        var container = document.getElementById('app-container');
        if (container) container.appendChild(el);
        win.element = el;

        // Controls
        var btns = el.querySelectorAll('.win-btn');
        for (var i = 0; i < btns.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var action = btn.dataset.action;
                    if (action === 'close') HalDoWindow.close(win.id);
                    else if (action === 'minimize') HalDoWindow.minimize(win.id);
                    else if (action === 'maximize') HalDoWindow.maximize(win.id);
                });
            })(btns[i]);
        }

        // Drag
        var header = el.querySelector('.window-header');
        var drag = false,
            startX, startY, origX, origY, isTouch = false;

        function startDrag(cx, cy) {
            if (header.querySelector('.win-btn') && document.activeElement && document.activeElement.tagName ===
                'BUTTON') return;
            drag = true;
            startX = cx;
            startY = cy;
            origX = win.x;
            origY = win.y;
            HalDoWindow.focus(win.id);
            el.style.cursor = 'grabbing';
        }

        function moveDrag(cx, cy) {
            if (!drag) return;
            var dx = cx - startX,
                dy = cy - startY;
            win.x = Math.max(0, Math.min(window.innerWidth - win.width, origX + dx));
            win.y = Math.max(0, Math.min(window.innerHeight - win.height - 60, origY + dy));
            el.style.left = win.x + 'px';
            el.style.top = win.y + 'px';
        }

        function endDrag() { if (drag) { drag = false;
                el.style.cursor = ''; } }

        header.addEventListener('mousedown', function(e) { if (!e.target.closest('.win-btn')) startDrag(e.clientX, e
                .clientY); });
        document.addEventListener('mousemove', function(e) { if (drag) moveDrag(e.clientX, e.clientY); });
        document.addEventListener('mouseup', endDrag);

        header.addEventListener('touchstart', function(e) {
            var t = e.touches[0];
            if (!e.target.closest('.win-btn')) { isTouch = true;
                startDrag(t.clientX, t.clientY); }
        }, { passive: true });
        document.addEventListener('touchmove', function(e) {
            if (drag && isTouch) { var t = e.touches[0];
                moveDrag(t.clientX, t.clientY); }
        }, { passive: true });
        document.addEventListener('touchend', function() { if (isTouch) { isTouch = false;
                endDrag(); } }, { passive: true });

        // Resize
        var resizeHandle = document.createElement('div');
        resizeHandle.style.cssText =
            'position:absolute;bottom:0;right:0;width:24px;height:24px;cursor:se-resize;touch-action:none;';
        el.appendChild(resizeHandle);

        var resize = false,
            startW, startH, startX2, startY2;

        function startResize(cx, cy) { resize = true;
            startW = win.width;
            startH = win.height;
            startX2 = cx;
            startY2 = cy; }

        function moveResize(cx, cy) {
            if (!resize) return;
            var dw = cx - startX2,
                dh = cy - startY2;
            win.width = Math.max(200, Math.min(window.innerWidth - win.x - 10, startW + dw));
            win.height = Math.max(120, Math.min(window.innerHeight - win.y - 80, startH + dh));
            el.style.width = win.width + 'px';
            el.style.height = win.height + 'px';
        }

        function endResize() { resize = false; }

        resizeHandle.addEventListener('mousedown', function(e) { e.stopPropagation();
            startResize(e.clientX, e.clientY); });
        document.addEventListener('mousemove', function(e) { if (resize) moveResize(e.clientX, e.clientY); });
        document.addEventListener('mouseup', endResize);

        resizeHandle.addEventListener('touchstart', function(e) { var t = e.touches[0];
            e.stopPropagation();
            startResize(t.clientX, t.clientY); }, { passive: true });
        document.addEventListener('touchmove', function(e) { if (resize) { var t = e.touches[0];
                moveResize(t.clientX, t.clientY); } }, { passive: true });
        document.addEventListener('touchend', endResize, { passive: true });
    },

    close: function(winId) {
        var state = window.HalDoState;
        var idx = -1;
        for (var i = 0; i < state.windows.length; i++) {
            if (state.windows[i].id === winId) { idx = i; break; }
        }
        if (idx === -1) return;
        var win = state.windows[idx];
        if (win.element) win.element.remove();
        state.windows.splice(idx, 1);
        if (state.activeWindow === winId) state.activeWindow = null;
        if (state.windows.length > 0) {
            this.focus(state.windows[state.windows.length - 1].id);
        }
    },

    focus: function(winId) {
        var state = window.HalDoState;
        var win = null;
        for (var i = 0; i < state.windows.length; i++) {
            if (state.windows[i].id === winId) { win = state.windows[i]; break; }
        }
        if (!win) return;
        state.activeWindow = winId;
        win.zIndex = state.windowZIndex++;
        if (win.element) {
            win.element.style.zIndex = win.zIndex;
            win.element.classList.add('active');
            for (var j = 0; j < state.windows.length; j++) {
                if (state.windows[j].id !== winId && state.windows[j].element) {
                    state.windows[j].element.classList.remove('active');
                }
            }
        }
    },

    minimize: function(winId) {
        var state = window.HalDoState;
        var win = null;
        for (var i = 0; i < state.windows.length; i++) {
            if (state.windows[i].id === winId) { win = state.windows[i]; break; }
        }
        if (win && win.element) {
            win.element.style.display = 'none';
            if (window.HalDoNotify) window.HalDoNotify('⏬ ' + win.title + ' minimiert');
        }
    },

    maximize: function(winId) {
        var state = window.HalDoState;
        var win = null;
        for (var i = 0; i < state.windows.length; i++) {
            if (state.windows[i].id === winId) { win = state.windows[i]; break; }
        }
        if (!win || !win.element) return;
        if (win.width === window.innerWidth - 20) {
            win.width = win._prevWidth || 500;
            win.height = win._prevHeight || 380;
            win.x = win._prevX || 20;
            win.y = win._prevY || 40;
        } else {
            win._prevWidth = win.width;
            win._prevHeight = win.height;
            win._prevX = win.x;
            win._prevY = win.y;
            win.width = window.innerWidth - 20;
            win.height = window.innerHeight - 100;
            win.x = 10;
            win.y = 30;
        }
        win.element.style.width = win.width + 'px';
        win.element.style.height = win.height + 'px';
        win.element.style.left = win.x + 'px';
        win.element.style.top = win.y + 'px';
    }
};
