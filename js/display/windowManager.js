/**
 * HALDO AI OS 24.6.0 – WINDOW MANAGER
 * Fenster verwalten: Öffnen, Schließen, Verschieben, Größe ändern
 */
const WindowManager = {
    windows: [],
    zIndex: 100,
    maxWindows: 20,
    isReady: false,
    container: null,

    init() {
        console.log('🪟 Window Manager wird initialisiert...');
        this.container = document.getElementById('window-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'window-container';
            this.container.style.cssText = `
                position: fixed;
                top: var(--menu-top-height, 40px);
                left: 0;
                width: 100%;
                height: calc(100% - var(--menu-top-height, 40px) - var(--taskbar-height, 48px));
                z-index: 10;
                pointer-events: none;
                padding: 6px;
            `;
            document.body.appendChild(this.container);
        }
        this.isReady = true;
        this.setupGlobalListeners();
        EventBus.emit('window:ready');
        console.log('✅ Window Manager ready');
        return this;
    },

    setupGlobalListeners() {
        document.addEventListener('mousedown', (e) => {
            const windowEl = e.target.closest('.window');
            if (windowEl) this.bringToFront(windowEl);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.getActiveWindow()) {
                this.closeWindow(this.getActiveWindow());
            }
        });
        window.addEventListener('resize', () => this.adjustWindows());
    },

    openWindow(appId, title, content, icon = null, width = 400, height = 320) {
        if (!this.isReady) { console.warn('⚠️ Window Manager nicht bereit'); return null; }

        const existing = this.windows.find(w => w.appId === appId && !w.minimized);
        if (existing) { this.bringToFront(existing.element); return existing.element; }

        if (this.windows.length >= this.maxWindows) {
            console.warn('⚠️ Maximale Fensteranzahl erreicht');
            return null;
        }

        const windowEl = this.createWindowElement(appId, title, content, icon, width, height);
        const windowData = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
            appId: appId,
            title: title,
            icon: icon,
            element: windowEl,
            width: width,
            height: height,
            x: this.getNextPosition().x,
            y: this.getNextPosition().y,
            minimized: false,
            maximized: false,
            zIndex: ++this.zIndex,
            openedAt: Date.now()
        };

        this.windows.push(windowData);
        this.activeWindow = windowEl;
        EventBus.emit('window:opened', windowData);
        this.updateTaskbar();
        console.log(`📂 Fenster geöffnet: ${title} (${appId})`);
        return windowEl;
    },

    createWindowElement(appId, title, content, icon, width, height) {
        const win = document.createElement('div');
        win.className = 'window';
        win.dataset.appId = appId;

        const w = Math.min(width, window.innerWidth - 40);
        const h = Math.min(height, window.innerHeight - 100);

        win.style.cssText = `
            position: absolute;
            left: ${this.getNextPosition().x}px;
            top: ${this.getNextPosition().y}px;
            width: ${w}px;
            height: ${h}px;
            z-index: ${++this.zIndex};
            min-width: 200px;
            min-height: 120px;
            max-width: 94vw;
            max-height: 88vh;
            background: var(--glass-bg, rgba(255,255,255,0.04));
            backdrop-filter: var(--glass-blur, blur(20px));
            border: 1px solid var(--glass-border, rgba(255,255,255,0.06));
            border-radius: var(--radius, 10px);
            box-shadow: var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.5));
            pointer-events: all;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: windowOpen 0.18s ease;
            font-family: var(--font-primary, Inter, sans-serif);
        `;

        // Header
        const header = document.createElement('div');
        header.className = 'window-header';
        header.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 8px;
            background: rgba(255,255,255,0.01);
            border-bottom: 1px solid var(--glass-border);
            cursor: grab;
            flex-shrink: 0;
            min-height: 28px;
            user-select: none;
        `;

        const titleEl = document.createElement('div');
        titleEl.className = 'window-title';
        titleEl.style.cssText = `
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-primary, #ffffff);
        `;
        if (icon) {
            const iconSpan = document.createElement('span');
            iconSpan.className = 'icon';
            iconSpan.textContent = icon;
            titleEl.appendChild(iconSpan);
        }
        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;
        titleEl.appendChild(titleSpan);
        header.appendChild(titleEl);

        const controls = document.createElement('div');
        controls.className = 'window-controls';
        controls.style.cssText = `display: flex; gap: 4px;`;

        const btnMin = document.createElement('button');
        btnMin.className = 'btn-minimize';
        btnMin.textContent = '−';
        btnMin.style.cssText = `width:10px;height:10px;border:none;border-radius:50%;cursor:pointer;padding:0;font-size:6px;line-height:10px;text-align:center;color:transparent;background:#FFBD2E;`;
        btnMin.onclick = (e) => { e.stopPropagation(); this.minimizeWindow(win); };
        controls.appendChild(btnMin);

        const btnMax = document.createElement('button');
        btnMax.className = 'btn-maximize';
        btnMax.textContent = '⛶';
        btnMax.style.cssText = `width:10px;height:10px;border:none;border-radius:50%;cursor:pointer;padding:0;font-size:6px;line-height:10px;text-align:center;color:transparent;background:#28C840;`;
        btnMax.onclick = (e) => { e.stopPropagation(); this.maximizeWindow(win); };
        controls.appendChild(btnMax);

        const btnClose = document.createElement('button');
        btnClose.className = 'btn-close';
        btnClose.textContent = '✕';
        btnClose.style.cssText = `width:10px;height:10px;border:none;border-radius:50%;cursor:pointer;padding:0;font-size:6px;line-height:10px;text-align:center;color:transparent;background:#FF5F57;`;
        btnClose.onclick = (e) => { e.stopPropagation(); this.closeWindow(win); };
        controls.appendChild(btnClose);

        header.appendChild(controls);
        win.appendChild(header);

        // Body
        const body = document.createElement('div');
        body.className = 'window-body';
        body.style.cssText = `
            flex: 1;
            padding: 8px;
            overflow: auto;
            color: var(--text-secondary, rgba(255,255,255,0.7));
            font-size: 12px;
            line-height: 1.4;
        `;
        if (typeof content === 'string') body.innerHTML = content;
        else if (content instanceof HTMLElement) body.appendChild(content);
        win.appendChild(body);

        // Drag
        this.makeDraggable(win, header);
        // Resize
        this.makeResizable(win);

        this.container.appendChild(win);

        // CSS-Animation für Fenster
        if (!document.getElementById('window-animations')) {
            const style = document.createElement('style');
            style.id = 'window-animations';
            style.textContent = `
                @keyframes windowOpen {
                    from { opacity: 0; transform: scale(0.94) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .window.minimized {
                    transform: scale(0.8) translateY(30px);
                    opacity: 0;
                    pointer-events: none;
                }
                .window.maximized {
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 0 !important;
                    max-width: 100vw !important;
                    max-height: 100vh !important;
                }
            `;
            document.head.appendChild(style);
        }

        return win;
    },

    makeDraggable(windowEl, handle) {
        let isDragging = false;
        let startX, startY, origX, origY;

        handle.addEventListener('mousedown', (e) => {
            const data = this.windows.find(w => w.element === windowEl);
            if (data && data.maximized) return;
            if (e.target.closest('.window-controls')) return;

            isDragging = true;
            const rect = windowEl.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            origX = rect.left;
            origY = rect.top;
            windowEl.style.cursor = 'grabbing';
            windowEl.style.transition = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            windowEl.style.left = (origX + dx) + 'px';
            windowEl.style.top = (origY + dy) + 'px';
            const data = this.windows.find(w => w.element === windowEl);
            if (data) { data.x = origX + dx;
                data.y = origY + dy; }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                windowEl.style.cursor = '';
                windowEl.style.transition = '';
            }
        });
    },

    makeResizable(windowEl) {
        const resizeHandle = document.createElement('div');
        resizeHandle.style.cssText = `
            position: absolute;
            bottom: 0;
            right: 0;
            width: 14px;
            height: 14px;
            cursor: nwse-resize;
            z-index: 1000;
            background: transparent;
        `;
        windowEl.appendChild(resizeHandle);

        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', (e) => {
            const data = this.windows.find(w => w.element === windowEl);
            if (data && data.maximized) return;
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = windowEl.offsetWidth;
            startHeight = windowEl.offsetHeight;
            windowEl.style.transition = 'none';
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const dw = e.clientX - startX;
            const dh = e.clientY - startY;
            windowEl.style.width = Math.max(200, startWidth + dw) + 'px';
            windowEl.style.height = Math.max(120, startHeight + dh) + 'px';
            const data = this.windows.find(w => w.element === windowEl);
            if (data) { data.width = Math.max(200, startWidth + dw);
                data.height = Math.max(120, startHeight + dh); }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                windowEl.style.transition = '';
            }
        });
    },

    closeWindow(windowEl) {
        const index = this.windows.findIndex(w => w.element === windowEl);
        if (index === -1) return false;
        const data = this.windows[index];
        data.element.remove();
        this.windows.splice(index, 1);
        if (this.activeWindow === windowEl) {
            this.activeWindow = this.windows.length > 0 ? this.windows[this.windows.length - 1].element : null;
        }
        EventBus.emit('window:closed', data);
        this.updateTaskbar();
        console.log(`📂 Fenster geschlossen: ${data.title}`);
        return true;
    },

    minimizeWindow(windowEl) {
        const data = this.windows.find(w => w.element === windowEl);
        if (!data) return false;
        data.minimized = !data.minimized;
        windowEl.classList.toggle('minimized', data.minimized);
        if (data.minimized) {
            this.activeWindow = null;
            EventBus.emit('window:minimized', data);
        } else {
            this.bringToFront(windowEl);
            EventBus.emit('window:restored', data);
        }
        this.updateTaskbar();
        return true;
    },

    maximizeWindow(windowEl) {
        const data = this.windows.find(w => w.element === windowEl);
        if (!data) return false;
        data.maximized = !data.maximized;
        windowEl.classList.toggle('maximized', data.maximized);
        if (data.maximized) {
            EventBus.emit('window:maximized', data);
        } else {
            windowEl.style.width = data.width + 'px';
            windowEl.style.height = data.height + 'px';
            windowEl.style.left = data.x + 'px';
            windowEl.style.top = data.y + 'px';
            EventBus.emit('window:restored', data);
        }
        this.bringToFront(windowEl);
        this.updateTaskbar();
        return true;
    },

    bringToFront(windowEl) {
        if (!windowEl) return false;
        this.activeWindow = windowEl;
        windowEl.style.zIndex = ++this.zIndex;
        const data = this.windows.find(w => w.element === windowEl);
        if (data && data.minimized) {
            data.minimized = false;
            windowEl.classList.remove('minimized');
            EventBus.emit('window:restored', data);
        }
        EventBus.emit('window:focused', data);
        this.updateTaskbar();
        return true;
    },

    getActiveWindow() { return this.activeWindow; },

    getNextPosition() {
        const offset = this.windows.length * 20;
        const actualOffset = Math.min(offset, 80);
        return { x: 20 + actualOffset % 60, y: 15 + Math.floor(actualOffset / 60) * 30 };
    },

    adjustWindows() {
        for (const data of this.windows) {
            if (!data.maximized && !data.minimized) {
                const maxW = window.innerWidth - 40;
                const maxH = window.innerHeight - 120;
                if (data.width > maxW) {
                    data.width = maxW;
                    data.element.style.width = maxW + 'px';
                }
                if (data.height > maxH) {
                    data.height = maxH;
                    data.element.style.height = maxH + 'px';
                }
                if (data.x + data.width > window.innerWidth - 20) {
                    data.x = window.innerWidth - data.width - 20;
                    data.element.style.left = data.x + 'px';
                }
                if (data.y + data.height > window.innerHeight - 100) {
                    data.y = window.innerHeight - data.height - 100;
                    data.element.style.top = data.y + 'px';
                }
            }
        }
    },

    closeAll() {
        const windows = [...this.windows];
        for (const data of windows) this.closeWindow(data.element);
        EventBus.emit('window:all-closed', { count: windows.length });
        return true;
    },

    getWindowByAppId(appId) { return this.windows.find(w => w.appId === appId) || null; },

    getStats() {
        const total = this.windows.length;
        const minimized = this.windows.filter(w => w.minimized).length;
        return { total, open: total - minimized, minimized, active: this.activeWindow ? this.windows.find(w => w.element ===
                this.activeWindow)?.title || null : null };
    },

    updateTaskbar() {
        const container = document.getElementById('taskbar-apps');
        if (!container) return;
        container.innerHTML = '';
        for (const data of this.windows) {
            const btn = document.createElement('button');
            btn.className = 'taskbar-app-btn' + (data.element === this.activeWindow ? ' active' : '') + (data.minimized ?
                ' minimized' : '');
            btn.textContent = data.icon ? `${data.icon} ${data.title}` : data.title;
            btn.title = data.title;
            btn.style.cssText = `
                padding:2px 6px;height:24px;background:${data.element === this.activeWindow ? 'rgba(108,60,225,0.2)' : 'rgba(255,255,255,0.03)'};
                border:1px solid ${data.element === this.activeWindow ? 'var(--primary)' : 'transparent'};
                border-radius:5px;color:var(--text-secondary);font-size:9px;font-weight:500;cursor:pointer;
                transition:all 0.15s ease;display:flex;align-items:center;gap:3px;white-space:nowrap;flex-shrink:0;
                font-family:var(--font-primary, Inter, sans-serif);
            `;
            btn.onclick = () => {
                if (data.minimized) {
                    data.minimized = false;
                    data.element.classList.remove('minimized');
                    this.bringToFront(data.element);
                } else if (data.element === this.activeWindow) {
                    this.minimizeWindow(data.element);
                } else {
                    this.bringToFront(data.element);
                }
                this.updateTaskbar();
            };
            container.appendChild(btn);
        }
    }
};
window.WindowManager = WindowManager;
