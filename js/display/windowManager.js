/**
 * HALDO AI OS 24.6 – WINDOW MANAGER
 * Fenster-System mit Drag, Resize, Minimize, Maximize
 */

const WindowManager = {
    windows: [],
    zIndex: 100,
    activeWindow: null,
    maxWindows: 20,

    init() {
        console.log('🪟 Window Manager initialisiert');
        this.setupGlobalListeners();
        return this;
    },

    setupGlobalListeners() {
        // Fenster nach vorne bringen bei Klick
        document.addEventListener('mousedown', (e) => {
            const windowEl = e.target.closest('.window');
            if (windowEl) {
                this.bringToFront(windowEl);
            }
        });

        // Escape schließt aktives Fenster
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeWindow) {
                this.closeWindow(this.activeWindow);
            }
        });
    },

    // ---- OPEN WINDOW ----

    openWindow(appId, title, content, icon = null, width = 600, height = 500) {
        if (this.windows.length >= this.maxWindows) {
            console.warn('⚠️ Maximale Fensteranzahl erreicht');
            return null;
        }

        // Prüfen ob schon offen
        const existing = this.windows.find(w => w.appId === appId && !w.minimized);
        if (existing) {
            this.bringToFront(existing.element);
            return existing.element;
        }

        const container = document.getElementById('window-container');
        const windowEl = document.createElement('div');
        windowEl.className = 'window';
        windowEl.dataset.appId = appId;

        // Position (leicht versetzt)
        const offset = this.windows.length * 28;
        const maxOffset = 120;
        const x = Math.min(offset, maxOffset) + 60;
        const y = Math.min(offset, maxOffset) + 40;

        Object.assign(windowEl.style, {
            left: x + 'px',
            top: y + 'px',
            width: Math.min(width, window.innerWidth - 80) + 'px',
            height: Math.min(height, window.innerHeight - 120) + 'px',
            zIndex: ++this.zIndex
        });

        // Header
        const header = document.createElement('div');
        header.className = 'window-header';

        const titleEl = document.createElement('div');
        titleEl.className = 'window-title';
        if (icon) {
            const img = document.createElement('img');
            img.src = icon;
            img.alt = title;
            titleEl.appendChild(img);
        }
        const span = document.createElement('span');
        span.textContent = title;
        titleEl.appendChild(span);
        header.appendChild(titleEl);

        // Controls
        const controls = document.createElement('div');
        controls.className = 'window-controls';

        const btnMin = document.createElement('button');
        btnMin.className = 'btn-minimize';
        btnMin.innerHTML = '−';
        btnMin.title = 'Minimieren';
        btnMin.onclick = (e) => { e.stopPropagation();
            this.minimizeWindow(windowEl); };

        const btnMax = document.createElement('button');
        btnMax.className = 'btn-maximize';
        btnMax.innerHTML = '⛶';
        btnMax.title = 'Maximieren';
        btnMax.onclick = (e) => { e.stopPropagation();
            this.maximizeWindow(windowEl); };

        const btnClose = document.createElement('button');
        btnClose.className = 'btn-close';
        btnClose.innerHTML = '✕';
        btnClose.title = 'Schließen';
        btnClose.onclick = (e) => { e.stopPropagation();
            this.closeWindow(windowEl); };

        controls.appendChild(btnMin);
        controls.appendChild(btnMax);
        controls.appendChild(btnClose);
        header.appendChild(controls);
        windowEl.appendChild(header);

        // Body
        const body = document.createElement('div');
        body.className = 'window-body';
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }
        windowEl.appendChild(body);

        container.appendChild(windowEl);

        // Drag
        this.makeDraggable(windowEl, header);

        // Resize
        this.makeResizable(windowEl);

        // Speichern
        const windowData = {
            id: Date.now(),
            appId,
            title,
            element: windowEl,
            minimized: false,
            maximized: false
        };
        this.windows.push(windowData);
        this.activeWindow = windowEl;

        // Taskbar aktualisieren
        EventBus.emit('window:opened', windowData);

        // App in Taskbar anzeigen
        this.updateTaskbar();

        console.log(`📂 Fenster geöffnet: ${title}`);
        return windowEl;
    },

    // ---- CLOSE WINDOW ----

    closeWindow(windowEl) {
        const index = this.windows.findIndex(w => w.element === windowEl);
        if (index === -1) return;

        const data = this.windows[index];
        data.element.remove();
        this.windows.splice(index, 1);

        if (this.activeWindow === windowEl) {
            this.activeWindow = this.windows.length > 0 ? this.windows[this.windows.length - 1].element : null;
        }

        EventBus.emit('window:closed', data);
        this.updateTaskbar();
        console.log(`📂 Fenster geschlossen: ${data.title}`);
    },

    // ---- MINIMIZE ----

    minimizeWindow(windowEl) {
        const data = this.windows.find(w => w.element === windowEl);
        if (!data) return;
        data.minimized = !data.minimized;
        windowEl.classList.toggle('minimized', data.minimized);
        if (data.minimized) {
            this.activeWindow = null;
        } else {
            this.bringToFront(windowEl);
        }
        this.updateTaskbar();
        EventBus.emit('window:minimized', data);
    },

    // ---- MAXIMIZE ----

    maximizeWindow(windowEl) {
        const data = this.windows.find(w => w.element === windowEl);
        if (!data) return;
        data.maximized = !data.maximized;
        windowEl.classList.toggle('maximized', data.maximized);

        if (data.maximized) {
            windowEl.style.left = '0';
            windowEl.style.top = '0';
            windowEl.style.width = '100%';
            windowEl.style.height = '100%';
        } else {
            windowEl.style.left = '60px';
            windowEl.style.top = '40px';
            windowEl.style.width = '600px';
            windowEl.style.height = '500px';
        }
        this.bringToFront(windowEl);
        EventBus.emit('window:maximized', data);
    },

    // ---- BRING TO FRONT ----

    bringToFront(windowEl) {
        if (!windowEl) return;
        this.activeWindow = windowEl;
        windowEl.style.zIndex = ++this.zIndex;
        const data = this.windows.find(w => w.element === windowEl);
        if (data && data.minimized) {
            data.minimized = false;
            windowEl.classList.remove('minimized');
        }
        this.updateTaskbar();
    },

    // ---- DRAGGABLE ----

    makeDraggable(windowEl, handle) {
        let isDragging = false;
        let startX, startY, origX, origY;

        handle.addEventListener('mousedown', (e) => {
            const data = this.windows.find(w => w.element === windowEl);
            if (data && data.maximized) return;

            isDragging = true;
            const rect = windowEl.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            origX = rect.left;
            origY = rect.top;
            windowEl.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            windowEl.style.left = (origX + dx) + 'px';
            windowEl.style.top = (origY + dy) + 'px';
            windowEl.style.right = 'auto';
            windowEl.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                windowEl.style.cursor = '';
            }
        });
    },

    // ---- RESIZABLE ----

    makeResizable(windowEl) {
        const resizeHandle = document.createElement('div');
        Object.assign(resizeHandle.style, {
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '16px',
            height: '16px',
            cursor: 'nwse-resize',
            zIndex: '1000'
        });
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
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const dw = e.clientX - startX;
            const dh = e.clientY - startY;
            windowEl.style.width = Math.max(300, startWidth + dw) + 'px';
            windowEl.style.height = Math.max(200, startHeight + dh) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    },

    // ---- TASKBAR ----

    updateTaskbar() {
        const container = document.getElementById('taskbar-apps');
        if (!container) return;

        container.innerHTML = '';
        this.windows.forEach(data => {
            const btn = document.createElement('button');
            btn.className = 'taskbar-app-btn' + (data.element === this.activeWindow ? ' active' : '') +
                (data.minimized ? ' minimized' : '');
            btn.textContent = data.title;
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
        });
    },

    // ---- HELPER ----

    getWindowByAppId(appId) {
        return this.windows.find(w => w.appId === appId);
    },

    closeAll() {
        this.windows.forEach(w => this.closeWindow(w.element));
    },

    getActiveWindow() {
        return this.activeWindow;
    }
};

window.WindowManager = WindowManager;
