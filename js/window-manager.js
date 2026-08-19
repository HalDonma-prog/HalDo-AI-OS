/* ============================================================
 * HalDo AI OS 20
 * Window Manager
 *
 * Verantwortlich für:
 *  - App-Fenster
 *  - Fensterposition
 *  - Fenstergröße
 *  - Aktivierung
 *  - Minimieren
 *  - Maximieren
 *  - Wiederherstellen
 *  - Schließen
 *  - Drag & Drop
 *  - Z-Index
 *  - Multi-Window
 *  - Mobile Anpassung
 *
 * Architektur:
 *
 * Kernel
 *   ↓
 * System
 *   ↓
 * Event Bus
 *   ↓
 * App Runtime
 *   ↓
 * App Manager
 *   ↓
 * App Router
 *   ↓
 * Window Manager
 *   ↓
 * Application Window
 *
 * ============================================================ */

(function (global) {
    "use strict";

    const VERSION = "20.0.0";

    class HalDoWindowManager {

        constructor(options = {}) {

            this.version = VERSION;

            this.options = {
                containerSelector: options.containerSelector || "#haldo-window-layer",
                desktopSelector: options.desktopSelector || "#haldo-desktop",
                defaultWidth: options.defaultWidth || 760,
                defaultHeight: options.defaultHeight || 540,
                minWidth: options.minWidth || 320,
                minHeight: options.minHeight || 220,
                topOffset: options.topOffset || 70,
                cascadeOffset: options.cascadeOffset || 28
            };

            this.windows = new Map();

            this.activeWindowId = null;

            this.zIndex = 1000;

            this.windowSequence = 0;

            this.initialized = false;

            this.dragState = null;

            this.resizeState = null;

            this.boundEvents = false;

            this.eventBus = null;

            this.appManager = null;

            this.appRouter = null;

            this.runtime = null;

            this.system = null;

            this.kernel = null;
        }


        /* =====================================================
         * INITIALISIERUNG
         * ===================================================== */

        init() {

            if (this.initialized) {
                return this;
            }

            this.resolveDependencies();

            this.ensureWindowLayer();

            this.bindGlobalEvents();

            this.initialized = true;

            this.emit("window-manager:ready", {
                version: this.version
            });

            return this;
        }


        /* =====================================================
         * ABHÄNGIGKEITEN
         * ===================================================== */

        resolveDependencies() {

            this.eventBus =
                global.HalDoAppEvents ||
                global.HalDoEventBus ||
                global.HalDoEvents ||
                null;

            this.appManager =
                global.HalDoAppManager ||
                (global.HalDoOS && global.HalDoOS.appManager) ||
                null;

            this.appRouter =
                global.HalDoAppRouter ||
                (global.HalDoOS && global.HalDoOS.appRouter) ||
                null;

            this.runtime =
                global.HalDoAppRuntime ||
                (global.HalDoOS && global.HalDoOS.appRuntime) ||
                null;

            this.system =
                global.HalDoSystem ||
                (global.HalDoOS && global.HalDoOS.system) ||
                null;

            this.kernel =
                global.HalDoKernel ||
                (global.HalDoOS && global.HalDoOS.kernel) ||
                null;
        }


        /* =====================================================
         * WINDOW LAYER
         * ===================================================== */

        ensureWindowLayer() {

            let layer = document.querySelector(
                this.options.containerSelector
            );

            if (!layer) {

                layer = document.createElement("div");

                layer.id = "haldo-window-layer";

                layer.className = "haldo-window-layer";

                Object.assign(layer.style, {
                    position: "fixed",
                    inset: "0",
                    pointerEvents: "none",
                    overflow: "hidden",
                    zIndex: "100"
                });

                document.body.appendChild(layer);
            }

            this.layer = layer;

            return layer;
        }


        /* =====================================================
         * WINDOW ÖFFNEN
         * ===================================================== */

        open(app, options = {}) {

            if (!this.initialized) {
                this.init();
            }

            const normalized = this.normalizeApp(app, options);

            const existing = this.findWindowByAppId(
                normalized.id
            );

            if (existing && !options.newInstance) {

                if (existing.minimized) {
                    this.restore(existing.id);
                }

                this.focus(existing.id);

                return existing;
            }

            const windowId =
                options.windowId ||
                this.createWindowId(normalized.id);

            const geometry =
                this.calculateInitialGeometry(
                    normalized,
                    options
                );

            const record = {

                id: windowId,

                appId: normalized.id,

                title: normalized.title,

                icon: normalized.icon,

                component: normalized.component,

                element: null,

                state: "normal",

                minimized: false,

                maximized: false,

                focused: false,

                x: geometry.x,

                y: geometry.y,

                width: geometry.width,

                height: geometry.height,

                previousGeometry: null,

                createdAt: Date.now(),

                updatedAt: Date.now(),

                instance: options.instance || null,

                data: options.data || {},

                options: options
            };

            const element =
                this.createWindowElement(record);

            record.element = element;

            this.windows.set(
                windowId,
                record
            );

            this.layer.appendChild(element);

            this.applyGeometry(record);

            this.focus(windowId);

            this.mountContent(record, normalized, options);

            this.emit("window:opened", {
                windowId,
                appId: record.appId,
                title: record.title
            });

            return record;
        }


        /* =====================================================
         * APP NORMALISIEREN
         * ===================================================== */

        normalizeApp(app, options = {}) {

            if (typeof app === "string") {

                return {
                    id: app,
                    title:
                        options.title ||
                        this.humanizeAppId(app),
                    icon:
                        options.icon ||
                        "",
                    component:
                        options.component ||
                        null
                };
            }

            if (!app || typeof app !== "object") {

                throw new Error(
                    "HalDoWindowManager: Ungültige App."
                );
            }

            return {

                id:
                    app.id ||
                    app.appId ||
                    app.name ||
                    this.createWindowId("app"),

                title:
                    app.title ||
                    app.name ||
                    app.label ||
                    this.humanizeAppId(
                        app.id ||
                        app.appId ||
                        app.name ||
                        "App"
                    ),

                icon:
                    app.icon ||
                    app.logo ||
                    "",

                component:
                    app.component ||
                    app.module ||
                    app.element ||
                    null
            };
        }


        /* =====================================================
         * WINDOW ID
         * ===================================================== */

        createWindowId(appId) {

            this.windowSequence++;

            return (
                "haldo-window-" +
                String(appId)
                    .replace(/[^a-zA-Z0-9_-]/g, "-") +
                "-" +
                this.windowSequence
            );
        }


        /* =====================================================
         * INITIALGEOMETRIE
         * ===================================================== */

        calculateInitialGeometry(app, options = {}) {

            const viewportWidth =
                window.innerWidth;

            const viewportHeight =
                window.innerHeight;

            let width =
                Number(options.width) ||
                this.options.defaultWidth;

            let height =
                Number(options.height) ||
                this.options.defaultHeight;

            width = Math.min(
                width,
                viewportWidth - 30
            );

            height = Math.min(
                height,
                viewportHeight - 100
            );

            width = Math.max(
                width,
                this.options.minWidth
            );

            height = Math.max(
                height,
                this.options.minHeight
            );

            const count =
                this.windows.size;

            let x =
                Number(options.x);

            let y =
                Number(options.y);

            if (!Number.isFinite(x)) {

                x =
                    Math.max(
                        15,
                        (
                            viewportWidth -
                            width
                        ) / 2
                    );

                x +=
                    (count % 5) *
                    this.options.cascadeOffset;
            }

            if (!Number.isFinite(y)) {

                y =
                    this.options.topOffset;

                y +=
                    (count % 5) *
                    this.options.cascadeOffset;
            }

            x = Math.min(
                x,
                Math.max(
                    10,
                    viewportWidth - width - 10
                )
            );

            y = Math.min(
                y,
                Math.max(
                    50,
                    viewportHeight - height - 10
                )
            );

            return {
                x,
                y,
                width,
                height
            };
        }


        /* =====================================================
         * WINDOW ELEMENT
         * ===================================================== */

        createWindowElement(record) {

            const windowElement =
                document.createElement("section");

            windowElement.className =
                "haldo-window";

            windowElement.dataset.windowId =
                record.id;

            windowElement.dataset.appId =
                record.appId;

            Object.assign(
                windowElement.style,
                {
                    position: "fixed",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    pointerEvents: "auto",
                    overflow: "hidden",
                    minWidth:
                        this.options.minWidth + "px",
                    minHeight:
                        this.options.minHeight + "px",
                    borderRadius: "14px",
                    background:
                        "var(--haldo-window-background, #111827)",
                    color:
                        "var(--haldo-window-color, #ffffff)",
                    boxShadow:
                        "0 20px 60px rgba(0,0,0,.35)",
                    border:
                        "1px solid rgba(255,255,255,.12)",
                    transition:
                        "box-shadow .15s ease, opacity .15s ease",
                    userSelect: "none"
                }
            );


            /* =================================================
             * TITLE BAR
             * ================================================= */

            const titleBar =
                document.createElement("header");

            titleBar.className =
                "haldo-window-titlebar";

            Object.assign(
                titleBar.style,
                {
                    height: "48px",
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 10px 0 14px",
                    gap: "10px",
                    cursor: "grab",
                    background:
                        "var(--haldo-titlebar-background, rgba(255,255,255,.06))",
                    borderBottom:
                        "1px solid rgba(255,255,255,.08)"
                }
            );


            /* =================================================
             * ICON
             * ================================================= */

            const icon =
                document.createElement("div");

            icon.className =
                "haldo-window-icon";

            Object.assign(
                icon.style,
                {
                    width: "28px",
                    height: "28px",
                    flex: "0 0 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: "7px"
                }
            );

            if (record.icon) {

                const image =
                    document.createElement("img");

                image.src = record.icon;

                image.alt =
                    record.title;

                image.draggable = false;

                Object.assign(
                    image.style,
                    {
                        width: "100%",
                        height: "100%",
                        objectFit: "contain"
                    }
                );

                icon.appendChild(image);
            }


            /* =================================================
             * TITLE
             * ================================================= */

            const title =
                document.createElement("div");

            title.className =
                "haldo-window-title";

            title.textContent =
                record.title;

            Object.assign(
                title.style,
                {
                    flex: "1",
                    minWidth: "0",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    fontSize: "14px",
                    fontWeight: "600"
                }
            );


            /* =================================================
             * CONTROLS
             * ================================================= */

            const controls =
                document.createElement("div");

            controls.className =
                "haldo-window-controls";

            Object.assign(
                controls.style,
                {
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                }
            );


            const minimize =
                this.createWindowButton(
                    "minimize",
                    "−"
                );

            const maximize =
                this.createWindowButton(
                    "maximize",
                    "□"
                );

            const close =
                this.createWindowButton(
                    "close",
                    "×"
                );


            minimize.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    this.minimize(record.id);
                }
            );


            maximize.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    if (record.maximized) {
                        this.restore(record.id);
                    } else {
                        this.maximize(record.id);
                    }
                }
            );


            close.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    this.close(record.id);
                }
            );


            controls.appendChild(minimize);

            controls.appendChild(maximize);

            controls.appendChild(close);


            titleBar.appendChild(icon);

            titleBar.appendChild(title);

            titleBar.appendChild(controls);


            /* =================================================
             * CONTENT
             * ================================================= */

            const content =
                document.createElement("main");

            content.className =
                "haldo-window-content";

            Object.assign(
                content.style,
                {
                    position: "relative",
                    flex: "1",
                    minHeight: "0",
                    overflow: "auto",
                    userSelect: "text"
                }
            );


            /* =================================================
             * RESIZE HANDLE
             * ================================================= */

            const resizeHandle =
                document.createElement("div");

            resizeHandle.className =
                "haldo-window-resize-handle";

            Object.assign(
                resizeHandle.style,
                {
                    position: "absolute",
                    right: "0",
                    bottom: "0",
                    width: "18px",
                    height: "18px",
                    cursor: "nwse-resize",
                    zIndex: "20"
                }
            );


            windowElement.appendChild(
                titleBar
            );

            windowElement.appendChild(
                content
            );

            windowElement.appendChild(
                resizeHandle
            );


            /* =================================================
             * EVENTS
             * ================================================= */

            windowElement.addEventListener(
                "pointerdown",
                () => {
                    this.focus(record.id);
                }
            );


            titleBar.addEventListener(
                "dblclick",
                event => {

                    if (
                        event.target.closest(
                            ".haldo-window-controls"
                        )
                    ) {
                        return;
                    }

                    if (record.maximized) {
                        this.restore(record.id);
                    } else {
                        this.maximize(record.id);
                    }
                }
            );


            titleBar.addEventListener(
                "pointerdown",
                event => {

                    if (event.button !== 0) {
                        return;
                    }

                    if (
                        event.target.closest(
                            ".haldo-window-controls"
                        )
                    ) {
                        return;
                    }

                    this.startDrag(
                        record.id,
                        event
                    );
                }
            );


            resizeHandle.addEventListener(
                "pointerdown",
                event => {

                    if (event.button !== 0) {
                        return;
                    }

                    event.preventDefault();

                    this.startResize(
                        record.id,
                        event
                    );
                }
            );


            return windowElement;
        }


        /* =====================================================
         * BUTTON
         * ===================================================== */

        createWindowButton(type, label) {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "haldo-window-button haldo-window-button-" +
                type;

            button.textContent = label;

            button.setAttribute(
                "aria-label",
                type
            );

            Object.assign(
                button.style,
                {
                    width: "32px",
                    height: "30px",
                    border: "0",
                    borderRadius: "7px",
                    background: "transparent",
                    color: "inherit",
                    cursor: "pointer",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }
            );

            return button;
        }


        /* =====================================================
         * CONTENT MOUNTEN
         * ===================================================== */

        mountContent(record, app, options) {

            const content =
                record.element.querySelector(
                    ".haldo-window-content"
                );

            if (!content) {
                return;
            }


            /* Bereits vorhandenes DOM-Element */

            if (
                app.component instanceof HTMLElement
            ) {

                content.appendChild(
                    app.component
                );

                return;
            }


            /* Factory */

            if (
                typeof app.component === "function"
            ) {

                try {

                    const result =
                        app.component({
                            appId: record.appId,
                            windowId: record.id,
                            data: record.data,
                            window: record
                        });

                    if (
                        result instanceof HTMLElement
                    ) {
                        content.appendChild(result);
                    }

                    else if (
                        typeof result === "string"
                    ) {
                        content.innerHTML =
                            result;
                    }

                    return;

                } catch (error) {

                    this.showError(
                        content,
                        error
                    );

                    return;
                }
            }


            /* Runtime */

            if (
                this.runtime &&
                typeof this.runtime.mountApp === "function"
            ) {

                try {

                    const result =
                        this.runtime.mountApp(
                            record.appId,
                            content,
                            {
                                windowId: record.id,
                                data: record.data
                            }
                        );

                    if (
                        result &&
                        typeof result.then === "function"
                    ) {

                        result.catch(
                            error => {
                                this.showError(
                                    content,
                                    error
                                );
                            }
                        );
                    }

                    return;

                } catch (error) {

                    this.showError(
                        content,
                        error
                    );

                    return;
                }
            }


            /* App Manager */

            if (
                this.appManager &&
                typeof this.appManager.mountApp === "function"
            ) {

                try {

                    this.appManager.mountApp(
                        record.appId,
                        content,
                        {
                            windowId: record.id,
                            data: record.data
                        }
                    );

                    return;

                } catch (error) {

                    this.showError(
                        content,
                        error
                    );

                    return;
                }
            }


            /* Fallback */

            content.innerHTML = `
                <div style="
                    min-height:100%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:30px;
                    box-sizing:border-box;
                    text-align:center;
                    font-family:system-ui,sans-serif;
                ">
                    <div>
                        <strong style="
                            display:block;
                            font-size:20px;
                            margin-bottom:8px;
                        ">
                            ${this.escapeHTML(record.title)}
                        </strong>

                        <span style="
                            opacity:.7;
                        ">
                            App-Runtime wird vorbereitet.
                        </span>
                    </div>
                </div>
            `;
        }


        /* =====================================================
         * FEHLERANZEIGE
         * ===================================================== */

        showError(container, error) {

            container.innerHTML = `
                <div style="
                    padding:30px;
                    font-family:system-ui,sans-serif;
                ">
                    <h3>
                        HalDo App Fehler
                    </h3>

                    <p style="opacity:.7;">
                        Die Anwendung konnte nicht geladen werden.
                    </p>

                    <pre style="
                        white-space:pre-wrap;
                        overflow:auto;
                        padding:12px;
                        border-radius:8px;
                        background:rgba(255,0,0,.08);
                    ">${this.escapeHTML(
                        error?.message ||
                        String(error)
                    )}</pre>
                </div>
            `;
        }


        /* =====================================================
         * FOCUS
         * ===================================================== */

        focus(windowId) {

            const record =
                this.windows.get(windowId);

            if (!record) {
                return null;
            }

            this.zIndex++;

            record.element.style.zIndex =
                String(this.zIndex);

            this.windows.forEach(
                windowRecord => {

                    windowRecord.focused =
                        windowRecord.id === windowId;

                    if (
                        windowRecord.element
                    ) {

                        windowRecord.element.classList.toggle(
                            "is-active",
                            windowRecord.id === windowId
                        );
                    }
                }
            );

            record.focused = true;

            this.activeWindowId =
                windowId;

            record.updatedAt =
                Date.now();

            this.emit(
                "window:focused",
                {
                    windowId,
                    appId: record.appId
                }
            );

            return record;
        }


        /* =====================================================
         * MINIMIEREN
         * ===================================================== */

        minimize(windowId) {

            const record =
                this.windows.get(windowId);

            if (!record) {
                return false;
            }

            record.minimized = true;

            record.state = "minimized";

            record.element.style.display =
                "none";

            record.focused = false;

            if (
                this.activeWindowId === windowId
            ) {
                this.activeWindowId = null;

                this.focusNextWindow();
            }

            this.emit(
                "window:minimized",
                {
                    windowId,
                    appId: record.appId
                }
            );

            return true;
        }


        /* =====================================================
         * WIEDERHERSTELLEN
         * ===================================================== */

        restore(windowId) {

            const record =
                this.windows.get(windowId);

            if (!record) {
                return false;
            }

            if (record.maximized) {

                record.maximized = false;

                record.state = "normal";

                if (
                    record.previousGeometry
                ) {

                    record.x =
                        record.previousGeometry.x;

                    record.y =
                        record.previousGeometry.y;

                    record.width =
                        record.previousGeometry.width;

                    record.height =
                        record.previousGeometry.height;
                }
            }

            record.minimized = false;

            record.state = "normal";

            record.element.style.display =
                "flex";

            this.applyGeometry(record);

            this.focus(windowId);

            this.emit(
                "window:restored",
                {
                    windowId,
                    appId: record.appId
                }
            );

            return true;
        }


        /* =====================================================
         * MAXIMIEREN
         * ===================================================== */

        maximize(windowId) {

            const record =
                this.windows.get(windowId);

            if (!record) {
                return false;
            }

            if (record.maximized) {
                return true;
            }

            record.previousGeometry = {
                x: record.x,
                y: record.y,
                width: record.width,
                height: record.height
            };

            record.maximized = true;

            record.minimized = false;

            record.state = "maximized";

            record.element.style.display =
                "flex";

            record.element.style.left = "0px";

            record.element.style.top = "0px";

            record.element.style.width =
                "100vw";

            record.element.style.height =
                "100vh";

            this.focus(windowId);

            this.emit(
                "window:maximized",
                {
                    windowId,
                    appId: record.appId
                }
            );

            return true;
        }


        /* =====================================================
         * SCHLIESSEN
         * ===================================================== */

        close(windowId) {

            const record =
                this.windows.get(windowId);

            if (!record) {
                return false;
            }

            this.emit(
                "window:before-close",
                {
                    windowId,
                    appId: record.appId
                }
            );

            try {

                if (
                    this.runtime &&
                    typeof this.runtime.unmountApp ===
                    "function"
                ) {

                    this.runtime.unmountApp(
                        record.appId,
                        record.element,
                        {
                            windowId
                        }
                    );
                }

            } catch (error) {

                console.warn(
                    "HalDo Window Manager:",
                    error
                );
            }

            if (
                record.element &&
                record.element.parentNode
            ) {

                record.element.parentNode.removeChild(
                    record.element
                );
            }

            this.windows.delete(
                windowId
            );

            if (
                this.activeWindowId ===
                windowId
            ) {

                this.activeWindowId =
                    null;

                this.focusNextWindow();
            }

            this.emit(
                "window:closed",
                {
                    windowId,
                    appId: record.appId
                }
            );

            return true;
        }


        /* =====================================================
         * ALLE FENSTER SCHLIESSEN
         * ===================================================== */

        closeAll() {

            const ids =
                Array.from(
                    this.windows.keys()
                );

            ids.forEach(
                id => this.close(id)
            );
        }


        /* =====================================================
         * NÄCHSTES FENSTER
         * ===================================================== */

        focusNextWindow() {

            const visible =
                Array.from(
                    this.windows.values()
                )
                .filter(
                    record =>
                        !record.minimized
                )
                .sort(
                    (a, b) =>
                        Number(
                            b.element.style.zIndex
                        ) -
                        Number(
                            a.element.style.zIndex
                        )
                );

            if (visible.length) {
                this.focus(
                    visible[0].id
                );
            }
        }


        /* =====================================================
         * DRAG START
         * ===================================================== */

        startDrag(windowId, event) {

            const record =
                this.windows.get(windowId);

            if (!record || record.maximized) {
                return;
            }

            this.focus(windowId);

            this.dragState = {

                windowId,

                startX: event.clientX,

                startY: event.clientY,

                originalX: record.x,

                originalY: record.y
            };

            event.currentTarget.setPointerCapture?.(
                event.pointerId
            );
        }


        /* =====================================================
         * RESIZE START
         * ===================================================== */

        startResize(windowId, event) {

            const record =
                this.windows.get(windowId);

            if (!record || record.maximized) {
                return;
            }

            this.focus(windowId);

            this.resizeState = {

                windowId,

                startX: event.clientX,

                startY: event.clientY,

                originalWidth:
                    record.width,

                originalHeight:
                    record.height
            };
        }


        /* =====================================================
         * GLOBALE POINTER EVENTS
         * ===================================================== */

        bindGlobalEvents() {

            if (this.boundEvents) {
                return;
            }

            this.boundEvents = true;


            document.addEventListener(
                "pointermove",
                event => {

                    if (this.dragState) {

                        this.handleDrag(
                            event
                        );
                    }

                    if (this.resizeState) {

                        this.handleResize(
                            event
                        );
                    }
                }
            );


            document.addEventListener(
                "pointerup",
                () => {

                    this.dragState =
                        null;

                    this.resizeState =
                        null;
                }
            );


            window.addEventListener(
                "resize",
                () => {

                    this.handleViewportResize();
                }
            );
        }


        /* =====================================================
         * DRAG
         * ===================================================== */

        handleDrag(event) {

            const state =
                this.dragState;

            if (!state) {
                return;
            }

            const record =
                this.windows.get(
                    state.windowId
                );

            if (!record) {
                return;
            }

            const deltaX =
                event.clientX -
                state.startX;

            const deltaY =
                event.clientY -
                state.startY;

            record.x =
                state.originalX +
                deltaX;

            record.y =
                state.originalY +
                deltaY;

            const maxX =
                Math.max(
                    10,
                    window.innerWidth -
                    record.width -
                    10
                );

            const maxY =
                Math.max(
                    50,
                    window.innerHeight -
                    record.height -
                    10
                );

            record.x =
                Math.max(
                    10,
                    Math.min(
                        record.x,
                        maxX
                    )
                );

            record.y =
                Math.max(
                    50,
                    Math.min(
                        record.y,
                        maxY
                    )
                );

            this.applyGeometry(
                record
            );
        }


        /* =====================================================
         * RESIZE
         * ===================================================== */

        handleResize(event) {

            const state =
                this.resizeState;

            if (!state) {
                return;
            }

            const record =
                this.windows.get(
                    state.windowId
                );

            if (!record) {
                return;
            }

            const deltaX =
                event.clientX -
                state.startX;

            const deltaY =
                event.clientY -
                state.startY;

            record.width =
                Math.max(
                    this.options.minWidth,
                    state.originalWidth +
                    deltaX
                );

            record.height =
                Math.max(
                    this.options.minHeight,
                    state.originalHeight +
                    deltaY
                );

            record.width =
                Math.min(
                    record.width,
                    window.innerWidth -
                    record.x -
                    10
                );

            record.height =
                Math.min(
                    record.height,
                    window.innerHeight -
                    record.y -
                    10
                );

            this.applyGeometry(
                record
            );
        }


        /* =====================================================
         * VIEWPORT RESIZE
         * ===================================================== */

        handleViewportResize() {

            this.windows.forEach(
                record => {

                    if (
                        record.maximized
                    ) {
                        return;
                    }

                    record.width =
                        Math.min(
                            record.width,
                            window.innerWidth -
                            record.x -
                            10
                        );

                    record.height =
                        Math.min(
                            record.height,
                            window.innerHeight -
                            record.y -
                            10
                        );

                    record.x =
                        Math.max(
                            10,
                            Math.min(
                                record.x,
                                window.innerWidth -
                                record.width -
                                10
                            )
                        );

                    record.y =
                        Math.max(
                            50,
                            Math.min(
                                record.y,
                                window.innerHeight -
                                record.height -
                                10
                            )
                        );

                    this.applyGeometry(
                        record
                    );
                }
            );
        }


        /* =====================================================
         * GEOMETRIE ANWENDEN
         * ===================================================== */

        applyGeometry(record) {

            if (!record.element) {
                return;
            }

            record.element.style.left =
                `${record.x}px`;

            record.element.style.top =
                `${record.y}px`;

            record.element.style.width =
                `${record.width}px`;

            record.element.style.height =
                `${record.height}px`;
        }


        /* =====================================================
         * APP-FENSTER SUCHEN
         * ===================================================== */

        findWindowByAppId(appId) {

            return Array.from(
                this.windows.values()
            ).find(
                record =>
                    record.appId === appId
            ) || null;
        }


        /* =====================================================
         * WINDOW SUCHEN
         * ===================================================== */

        get(windowId) {

            return this.windows.get(
                windowId
            ) || null;
        }


        /* =====================================================
         * ALLE FENSTER
         * ===================================================== */

        getAll() {

            return Array.from(
                this.windows.values()
            );
        }


        /* =====================================================
         * AKTIVES FENSTER
         * ===================================================== */

        getActive() {

            if (!this.activeWindowId) {
                return null;
            }

            return this.get(
                this.activeWindowId
            );
        }


        /* =====================================================
         * APP SCHLIESSEN
         * ===================================================== */

        closeApp(appId) {

            const records =
                Array.from(
                    this.windows.values()
                )
                .filter(
                    record =>
                        record.appId === appId
                );

            records.forEach(
                record =>
                    this.close(record.id)
            );

            return records.length;
        }


        /* =====================================================
         * APP MINIMIEREN
         * ===================================================== */

        minimizeApp(appId) {

            const record =
                this.findWindowByAppId(
                    appId
                );

            if (!record) {
                return false;
            }

            return this.minimize(
                record.id
            );
        }


        /* =====================================================
         * APP FOKUS
         * ===================================================== */

        focusApp(appId) {

            const record =
                this.findWindowByAppId(
                    appId
                );

            if (!record) {
                return false;
            }

            this.restore(
                record.id
            );

            this.focus(
                record.id
            );

            return true;
        }


        /* =====================================================
         * ESCAPE HTML
         * ===================================================== */

        escapeHTML(value) {

            return String(value)
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );
        }


        /* =====================================================
         * APP-ID → TITEL
         * ===================================================== */

        humanizeAppId(id) {

            return String(id || "App")
                .replace(
                    /^haldo[-_]?/i,
                    ""
                )
                .replace(
                    /[-_]+/g,
                    " "
                )
                .replace(
                    /\b\w/g,
                    letter =>
                        letter.toUpperCase()
                );
        }


        /* =====================================================
         * EVENT
         * ===================================================== */

        emit(eventName, detail = {}) {

            try {

                document.dispatchEvent(
                    new CustomEvent(
                        eventName,
                        {
                            detail
                        }
                    )
                );

            } catch (error) {

                console.warn(
                    "HalDo Window Event:",
                    error
                );
            }


            /* Event Bus */

            try {

                if (
                    this.eventBus &&
                    typeof this.eventBus.emit ===
                    "function"
                ) {

                    this.eventBus.emit(
                        eventName,
                        detail
                    );
                }

            } catch (error) {

                console.warn(
                    "HalDo Event Bus:",
                    error
                );
            }
        }


        /* =====================================================
         * STATUS
         * ===================================================== */

        getStatus() {

            return {

                version:
                    this.version,

                initialized:
                    this.initialized,

                windowCount:
                    this.windows.size,

                activeWindowId:
                    this.activeWindowId,

                windows:
                    this.getAll().map(
                        record => ({
                            id:
                                record.id,
                            appId:
                                record.appId,
                            title:
                                record.title,
                            state:
                                record.state,
                            minimized:
                                record.minimized,
                            maximized:
                                record.maximized,
                            focused:
                                record.focused,
                            x:
                                record.x,
                            y:
                                record.y,
                            width:
                                record.width,
                            height:
                                record.height
                        })
                    )
            };
        }


        /* =====================================================
         * DESTROY
         * ===================================================== */

        destroy() {

            this.closeAll();

            this.windows.clear();

            this.activeWindowId =
                null;

            this.initialized =
                false;

            this.dragState =
                null;

            this.resizeState =
                null;
        }
    }


    /* ========================================================
     * GLOBALE REGISTRIERUNG
     * ======================================================== */

    const manager =
        new HalDoWindowManager();


    global.HalDoWindowManager =
        manager;


    global.HalDoWindowManagerClass =
        HalDoWindowManager;


    if (!global.HalDoOS) {
        global.HalDoOS = {};
    }


    global.HalDoOS.windowManager =
        manager;


    /* ========================================================
     * AUTOMATISCHE INITIALISIERUNG
     * ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {
                manager.init();
            },
            {
                once: true
            }
        );

    } else {

        manager.init();
    }


    /* ========================================================
     * GLOBALER API-ZUGRIFF
     * ======================================================== */

    global.HalDoWindow = {

        open:
            (...args) =>
                manager.open(...args),

        close:
            (...args) =>
                manager.close(...args),

        minimize:
            (...args) =>
                manager.minimize(...args),

        maximize:
            (...args) =>
                manager.maximize(...args),

        restore:
            (...args) =>
                manager.restore(...args),

        focus:
            (...args) =>
                manager.focus(...args),

        get:
            (...args) =>
                manager.get(...args),

        getAll:
            (...args) =>
                manager.getAll(...args),

        getActive:
            () =>
                manager.getActive(),

        closeApp:
            (...args) =>
                manager.closeApp(...args),

        focusApp:
            (...args) =>
                manager.focusApp(...args),

        minimizeApp:
            (...args) =>
                manager.minimizeApp(...args),

        status:
            () =>
                manager.getStatus()
    };


})(window);
