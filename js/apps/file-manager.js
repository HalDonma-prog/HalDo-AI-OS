/* ============================================================
   HALDO AI OS 20
   FILE MANAGER
   ------------------------------------------------------------
   Datei:
       js/apps/file-manager.js

   Vollständige App:
   - UI
   - Navigation
   - Dateien
   - Ordner
   - Suche
   - Sortierung
   - Erstellen
   - Umbenennen
   - Löschen
   - Öffnen
   - Auswahl
   - Storage
   - App Manager
   - Window Manager
   - Router
   - Events
   - Einstellungen
   - Diagnostics
   ============================================================ */

"use strict";

(function (window, document) {

    if (
        window.HalDoFileManager &&
        window.HalDoFileManager.__haldoAI20
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    const HalDoOS =
        window.HalDoOS;

    const APP_ID =
        "file-manager";

    const VERSION =
        "20.0.0";

    const STORAGE_KEY =
        "haldo.os20.file-manager.data";

    const SETTINGS_KEY =
        "haldo.os20.file-manager.settings";


    /* ========================================================
       SERVICES
       ======================================================== */

    function getAppManager() {
        return (
            window.HalDoAppManager ||
            HalDoOS.appManager ||
            null
        );
    }

    function getStorage() {
        return (
            window.HalDoStorage ||
            HalDoOS.storage ||
            null
        );
    }

    function getRouter() {
        return (
            window.HalDoAppRouter ||
            HalDoOS.appRouter ||
            null
        );
    }

    function getWindowManager() {
        return (
            window.HalDoWindowManager ||
            HalDoOS.windowManager ||
            null
        );
    }


    /* ========================================================
       HELPERS
       ======================================================== */

    function id() {
        return (
            "file-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );
    }

    function clone(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return value;
        }

        if (
            Array.isArray(value)
        ) {
            return value.map(clone);
        }

        if (
            typeof value === "object"
        ) {
            const result = {};

            Object.keys(value).forEach(
                key => {
                    result[key] =
                        clone(value[key]);
                }
            );

            return result;
        }

        return value;
    }

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(timestamp) {

        try {

            return new Date(
                timestamp
            ).toLocaleString();

        } catch (_) {

            return "";

        }
    }

    function formatSize(bytes) {

        const value =
            Number(bytes) || 0;

        if (value < 1024) {
            return value + " B";
        }

        if (value < 1024 * 1024) {
            return (
                (value / 1024).toFixed(1) +
                " KB"
            );
        }

        if (value < 1024 * 1024 * 1024) {
            return (
                (value / (1024 * 1024))
                    .toFixed(1) +
                " MB"
            );
        }

        return (
            (value /
                (1024 * 1024 * 1024))
                .toFixed(1) +
            " GB"
        );
    }


    /* ========================================================
       DEFAULT DATA
       ======================================================== */

    function createDefaultData() {

        return {

            version:
                VERSION,

            currentFolder:
                "root",

            items: [

                {
                    id: "root-documents",
                    parentId: "root",
                    name: "Dokumente",
                    type: "folder",
                    size: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },

                {
                    id: "root-downloads",
                    parentId: "root",
                    name: "Downloads",
                    type: "folder",
                    size: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },

                {
                    id: "root-images",
                    parentId: "root",
                    name: "Bilder",
                    type: "folder",
                    size: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },

                {
                    id: "root-music",
                    parentId: "root",
                    name: "Musik",
                    type: "folder",
                    size: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },

                {
                    id: "root-videos",
                    parentId: "root",
                    name: "Videos",
                    type: "folder",
                    size: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },

                {
                    id: "root-halDo",
                    parentId: "root",
                    name: "HalDo AI OS",
                    type: "folder",
                    size: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }

            ]

        };

    }


    /* ========================================================
       SETTINGS
       ======================================================== */

    const settings = {

        view:
            "grid",

        sort:
            "name",

        sortDirection:
            "asc",

        showHidden:
            false

    };


    /* ========================================================
       INTERNAL STATE
       ======================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        mounted:
            false,

        currentFolder:
            "root",

        search:
            "",

        selectedId:
            null,

        data:
            null,

        rootElement:
            null,

        listeners:
            new Map(),

        statistics: {

            created:
                0,

            deleted:
                0,

            renamed:
                0,

            opened:
                0

        }

    };


    /* ========================================================
       EVENTS
       ======================================================== */

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {
            return () => {};
        }

        if (
            !state.listeners.has(event)
        ) {

            state.listeners.set(
                event,
                new Set()
            );

        }

        const set =
            state.listeners.get(event);

        set.add(callback);

        return () =>
            off(event, callback);
    }


    function off(
        event,
        callback
    ) {

        const set =
            state.listeners.get(event);

        if (!set) {
            return;
        }

        set.delete(callback);

        if (!set.size) {
            state.listeners.delete(event);
        }
    }


    function emit(
        event,
        detail = {}
    ) {

        const set =
            state.listeners.get(event);

        if (set) {

            [...set].forEach(
                callback => {

                    try {
                        callback(detail);
                    } catch (error) {
                        console.error(
                            "[HalDo File Manager]",
                            error
                        );
                    }

                }
            );

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    "haldo:file-manager:" + event,
                    {
                        detail
                    }
                )
            );

        } catch (_) {}

    }


    /* ========================================================
       STORAGE
       ======================================================== */

    async function save() {

        try {

            const storage =
                getStorage();

            if (
                storage &&
                typeof storage.set ===
                "function"
            ) {

                const result =
                    storage.set(
                        STORAGE_KEY,
                        state.data
                    );

                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {
                    await result;
                }

                return true;
            }

            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    state.data
                )
            );

            return true;

        } catch (error) {

            console.error(
                "[HalDo File Manager] Save",
                error
            );

            return false;
        }
    }


    async function load() {

        try {

            const storage =
                getStorage();

            if (
                storage &&
                typeof storage.get ===
                "function"
            ) {

                const result =
                    storage.get(
                        STORAGE_KEY
                    );

                const data =
                    result &&
                    typeof result.then ===
                    "function"
                        ? await result
                        : result;

                if (
                    data &&
                    Array.isArray(
                        data.items
                    )
                ) {

                    state.data =
                        data;

                    return true;
                }

            }

            const raw =
                window.localStorage.getItem(
                    STORAGE_KEY
                );

            if (raw) {

                const parsed =
                    JSON.parse(raw);

                if (
                    parsed &&
                    Array.isArray(
                        parsed.items
                    )
                ) {

                    state.data =
                        parsed;

                    return true;
                }

            }

        } catch (error) {

            console.warn(
                "[HalDo File Manager] Load",
                error
            );
        }

        state.data =
            createDefaultData();

        await save();

        return true;
    }


    /* ========================================================
       SETTINGS STORAGE
       ======================================================== */

    async function loadSettings() {

        try {

            const manager =
                getAppManager();

            if (
                manager &&
                typeof manager.loadAppSettings ===
                "function"
            ) {

                const result =
                    manager.loadAppSettings(
                        APP_ID
                    );

                const loaded =
                    result &&
                    typeof result.then ===
                    "function"
                        ? await result
                        : result;

                if (
                    loaded &&
                    typeof loaded ===
                    "object"
                ) {
                    Object.assign(
                        settings,
                        loaded
                    );
                }

                return;
            }

            const raw =
                window.localStorage.getItem(
                    SETTINGS_KEY
                );

            if (raw) {

                Object.assign(
                    settings,
                    JSON.parse(raw)
                );
            }

        } catch (error) {

            console.warn(
                "[HalDo File Manager] Settings",
                error
            );
        }
    }


    async function saveSettings() {

        try {

            const manager =
                getAppManager();

            if (
                manager &&
                typeof manager.setSettings ===
                "function"
            ) {

                const result =
                    manager.setSettings(
                        APP_ID,
                        settings
                    );

                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {
                    await result;
                }

                return;
            }

            window.localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );

        } catch (_) {}
    }


    /* ========================================================
       FILE OPERATIONS
       ======================================================== */

    function getItem(
        itemId
    ) {

        return state.data.items.find(
            item =>
                item.id === itemId
        ) || null;
    }


    function getCurrentItems() {

        const search =
            state.search
                .trim()
                .toLowerCase();

        let items =
            state.data.items.filter(
                item =>
                    item.parentId ===
                    state.currentFolder
            );

        if (search) {

            items =
                items.filter(
                    item =>
                        item.name
                            .toLowerCase()
                            .includes(search)
                );

        }

        items.sort(
            (a, b) => {

                let result = 0;

                if (
                    settings.sort ===
                    "date"
                ) {

                    result =
                        a.updatedAt -
                        b.updatedAt;

                } else if (
                    settings.sort ===
                    "size"
                ) {

                    result =
                        (a.size || 0) -
                        (b.size || 0);

                } else if (
                    settings.sort ===
                    "type"
                ) {

                    result =
                        a.type.localeCompare(
                            b.type
                        );

                } else {

                    result =
                        a.name.localeCompare(
                            b.name
                        );
                }

                return settings.sortDirection ===
                    "desc"
                    ? -result
                    : result;
            }
        );

        return items;
    }


    function getBreadcrumbs() {

        const result = [];

        let current =
            state.currentFolder;

        while (
            current &&
            current !== "root"
        ) {

            const item =
                getItem(current);

            if (!item) {
                break;
            }

            result.unshift(item);

            current =
                item.parentId;
        }

        return result;
    }


    function navigateTo(
        folderId
    ) {

        const folder =
            folderId === "root"
                ? {
                    id: "root",
                    type: "folder"
                }
                : getItem(folderId);

        if (
            !folder ||
            folder.type !== "folder"
        ) {
            return false;
        }

        state.currentFolder =
            folder.id;

        state.selectedId =
            null;

        state.data.currentFolder =
            folder.id;

        save();

        render();

        emit(
            "folder-changed",
            {
                folderId:
                    folder.id
            }
        );

        return true;
    }


    async function createFolder(
        name
    ) {

        const clean =
            String(name || "")
                .trim();

        if (!clean) {
            return null;
        }

        const duplicate =
            state.data.items.some(
                item =>
                    item.parentId ===
                        state.currentFolder &&
                    item.name.toLowerCase() ===
                        clean.toLowerCase()
            );

        if (duplicate) {
            throw new Error(
                "Ein Element mit diesem Namen existiert bereits."
            );
        }

        const item = {

            id:
                id(),

            parentId:
                state.currentFolder,

            name:
                clean,

            type:
                "folder",

            size:
                0,

            createdAt:
                Date.now(),

            updatedAt:
                Date.now()

        };

        state.data.items.push(item);

        state.statistics.created += 1;

        await save();

        render();

        emit(
            "created",
            {
                item:
                    clone(item)
            }
        );

        return item;
    }


    async function createFile(
        name,
        content = ""
    ) {

        const clean =
            String(name || "")
                .trim();

        if (!clean) {
            return null;
        }

        const item = {

            id:
                id(),

            parentId:
                state.currentFolder,

            name:
                clean,

            type:
                "file",

            content:
                String(content),

            size:
                String(content).length,

            createdAt:
                Date.now(),

            updatedAt:
                Date.now()

        };

        state.data.items.push(item);

        state.statistics.created += 1;

        await save();

        render();

        emit(
            "created",
            {
                item:
                    clone(item)
            }
        );

        return item;
    }


    async function rename(
        itemId,
        newName
    ) {

        const item =
            getItem(itemId);

        if (!item) {
            return false;
        }

        const clean =
            String(newName || "")
                .trim();

        if (!clean) {
            return false;
        }

        item.name =
            clean;

        item.updatedAt =
            Date.now();

        state.statistics.renamed += 1;

        await save();

        render();

        emit(
            "renamed",
            {
                item:
                    clone(item)
            }
        );

        return true;
    }


    async function remove(
        itemId
    ) {

        const item =
            getItem(itemId);

        if (!item) {
            return false;
        }

        const children =
            state.data.items.filter(
                child =>
                    child.parentId ===
                    itemId
            );

        for (
            const child of children
        ) {
            await remove(
                child.id
            );
        }

        state.data.items =
            state.data.items.filter(
                current =>
                    current.id !==
                    itemId
            );

        state.statistics.deleted += 1;

        if (
            state.selectedId ===
            itemId
        ) {
            state.selectedId =
                null;
        }

        await save();

        render();

        emit(
            "deleted",
            {
                item:
                    clone(item)
            }
        );

        return true;
    }


    async function openItem(
        itemId
    ) {

        const item =
            getItem(itemId);

        if (!item) {
            return false;
        }

        state.statistics.opened += 1;

        if (
            item.type ===
            "folder"
        ) {

            return navigateTo(
                item.id
            );
        }

        emit(
            "file-opened",
            {
                item:
                    clone(item)
            }
        );

        showFileViewer(item);

        return true;
    }


    /* ========================================================
       UI
       ======================================================== */

    function ensureStyles() {

        if (
            document.getElementById(
                "haldo-file-manager-style"
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "haldo-file-manager-style";

        style.textContent = `
            .haldo-file-manager {
                display:flex;
                flex-direction:column;
                width:100%;
                height:100%;
                min-height:500px;
                background:var(--haldo-app-bg,#101522);
                color:var(--haldo-text,#fff);
                overflow:hidden;
                font-family:system-ui,sans-serif;
            }

            .haldo-fm-toolbar {
                display:flex;
                align-items:center;
                gap:8px;
                padding:12px;
                border-bottom:1px solid rgba(255,255,255,.1);
                background:rgba(255,255,255,.04);
            }

            .haldo-fm-toolbar button,
            .haldo-fm-create button {
                border:0;
                border-radius:10px;
                padding:9px 13px;
                background:rgba(255,255,255,.08);
                color:inherit;
                cursor:pointer;
            }

            .haldo-fm-toolbar button:hover,
            .haldo-fm-create button:hover {
                background:rgba(255,255,255,.16);
            }

            .haldo-fm-search {
                flex:1;
                min-width:100px;
                padding:10px 13px;
                border-radius:10px;
                border:1px solid rgba(255,255,255,.1);
                background:rgba(0,0,0,.2);
                color:inherit;
                outline:none;
            }

            .haldo-fm-breadcrumbs {
                display:flex;
                align-items:center;
                gap:6px;
                padding:10px 14px;
                overflow:auto;
                white-space:nowrap;
                border-bottom:1px solid rgba(255,255,255,.08);
            }

            .haldo-fm-breadcrumb {
                border:0;
                background:transparent;
                color:inherit;
                opacity:.75;
                cursor:pointer;
            }

            .haldo-fm-content {
                flex:1;
                overflow:auto;
                padding:16px;
            }

            .haldo-fm-grid {
                display:grid;
                grid-template-columns:repeat(auto-fill,minmax(145px,1fr));
                gap:12px;
            }

            .haldo-fm-list {
                display:flex;
                flex-direction:column;
                gap:6px;
            }

            .haldo-fm-item {
                border:1px solid rgba(255,255,255,.08);
                background:rgba(255,255,255,.04);
                border-radius:14px;
                padding:15px;
                cursor:pointer;
                user-select:none;
                transition:.15s ease;
            }

            .haldo-fm-item:hover {
                background:rgba(255,255,255,.09);
            }

            .haldo-fm-item.selected {
                outline:2px solid rgba(100,170,255,.7);
            }

            .haldo-fm-icon {
                font-size:34px;
                margin-bottom:10px;
            }

            .haldo-fm-name {
                font-weight:600;
                word-break:break-word;
            }

            .haldo-fm-meta {
                margin-top:5px;
                font-size:12px;
                opacity:.55;
            }

            .haldo-fm-empty {
                text-align:center;
                opacity:.55;
                padding:50px 20px;
            }

            .haldo-fm-menu {
                position:fixed;
                z-index:99999;
                min-width:180px;
                padding:6px;
                border-radius:12px;
                background:#181d29;
                border:1px solid rgba(255,255,255,.12);
                box-shadow:0 20px 50px rgba(0,0,0,.4);
            }

            .haldo-fm-menu button {
                display:block;
                width:100%;
                border:0;
                background:transparent;
                color:white;
                text-align:left;
                padding:10px;
                border-radius:8px;
                cursor:pointer;
            }

            .haldo-fm-menu button:hover {
                background:rgba(255,255,255,.1);
            }

            .haldo-fm-viewer {
                position:fixed;
                inset:0;
                z-index:100000;
                display:flex;
                align-items:center;
                justify-content:center;
                background:rgba(0,0,0,.65);
                padding:20px;
            }

            .haldo-fm-viewer-card {
                width:min(800px,100%);
                max-height:85vh;
                overflow:auto;
                background:#151a25;
                border:1px solid rgba(255,255,255,.12);
                border-radius:18px;
                padding:20px;
            }

            .haldo-fm-viewer-card textarea {
                width:100%;
                min-height:350px;
                box-sizing:border-box;
                resize:vertical;
                background:#0c1018;
                color:white;
                border:1px solid rgba(255,255,255,.1);
                border-radius:10px;
                padding:12px;
            }
        `;

        document.head.appendChild(style);
    }


    function iconFor(
        item
    ) {

        if (
            item.type ===
            "folder"
        ) {
            return "📁";
        }

        const extension =
            item.name
                .split(".")
                .pop()
                .toLowerCase();

        const icons = {

            js: "📜",
            html: "🌐",
            css: "🎨",
            json: "🧩",
            txt: "📄",
            md: "📝",
            png: "🖼️",
            jpg: "🖼️",
            jpeg: "🖼️",
            mp3: "🎵",
            wav: "🎵",
            mp4: "🎬"

        };

        return icons[extension] ||
            "📄";
    }


    function render() {

        if (!state.rootElement) {
            return;
        }

        const root =
            state.rootElement;

        const items =
            getCurrentItems();

        const breadcrumbs =
            getBreadcrumbs();

        root.innerHTML = `
            <div class="haldo-file-manager">

                <div class="haldo-fm-toolbar">

                    <button
                        data-action="back"
                        title="Zurück"
                    >←</button>

                    <button
                        data-action="home"
                        title="Home"
                    >⌂</button>

                    <input
                        class="haldo-fm-search"
                        type="search"
                        placeholder="Dateien suchen..."
                        value="${escapeHTML(state.search)}"
                    >

                    <button
                        data-action="new-folder"
                    >＋ Ordner</button>

                    <button
                        data-action="new-file"
                    >＋ Datei</button>

                    <button
                        data-action="toggle-view"
                    >${settings.view === "grid" ? "☷" : "▦"}</button>

                    <button
                        data-action="sort"
                    >⇅</button>

                </div>

                <div class="haldo-fm-breadcrumbs">

                    <button
                        class="haldo-fm-breadcrumb"
                        data-folder="root"
                    >
                        HalDo AI OS
                    </button>

                    ${breadcrumbs.map(
                        item => `
                            <span>›</span>
                            <button
                                class="haldo-fm-breadcrumb"
                                data-folder="${escapeHTML(item.id)}"
                            >
                                ${escapeHTML(item.name)}
                            </button>
                        `
                    ).join("")}

                </div>

                <div class="haldo-fm-content">

                    ${
                        items.length
                            ? `
                                <div class="haldo-fm-${settings.view}">
                                    ${items.map(
                                        renderItem
                                    ).join("")}
                                </div>
                              `
                            : `
                                <div class="haldo-fm-empty">
                                    Dieser Ordner ist leer.
                                </div>
                              `
                    }

                </div>

            </div>
        `;

        bindEvents();
    }


    function renderItem(
        item
    ) {

        const selected =
            state.selectedId ===
            item.id
                ? "selected"
                : "";

        return `
            <div
                class="haldo-fm-item ${selected}"
                data-item="${escapeHTML(item.id)}"
                tabindex="0"
            >

                <div class="haldo-fm-icon">
                    ${iconFor(item)}
                </div>

                <div class="haldo-fm-name">
                    ${escapeHTML(item.name)}
                </div>

                <div class="haldo-fm-meta">
                    ${
                        item.type === "folder"
                            ? "Ordner"
                            : formatSize(item.size)
                    }
                </div>

            </div>
        `;
    }


    function bindEvents() {

        const root =
            state.rootElement;

        if (!root) {
            return;
        }

        const search =
            root.querySelector(
                ".haldo-fm-search"
            );

        if (search) {

            search.addEventListener(
                "input",
                event => {

                    state.search =
                        event.target.value;

                    render();

                    const input =
                        root.querySelector(
                            ".haldo-fm-search"
                        );

                    if (input) {

                        input.focus();

                        input.setSelectionRange(
                            input.value.length,
                            input.value.length
                        );
                    }
                }
            );
        }


        root.querySelectorAll(
            "[data-folder]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        navigateTo(
                            button.dataset.folder
                        )
                );

            }
        );


        root.querySelectorAll(
            "[data-item]"
        ).forEach(
            element => {

                element.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        state.selectedId =
                            element.dataset.item;

                        render();

                    }
                );

                element.addEventListener(
                    "dblclick",
                    event => {

                        event.stopPropagation();

                        openItem(
                            element.dataset.item
                        );

                    }
                );

                element.addEventListener(
                    "contextmenu",
                    event => {

                        event.preventDefault();

                        state.selectedId =
                            element.dataset.item;

                        render();

                        showContextMenu(
                            event.clientX,
                            event.clientY,
                            element.dataset.item
                        );

                    }
                );

            }
        );


        root.querySelectorAll(
            "[data-action]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const action =
                            button.dataset.action;

                        if (
                            action ===
                            "back"
                        ) {

                            const current =
                                getItem(
                                    state.currentFolder
                                );

                            navigateTo(
                                current
                                    ? current.parentId
                                    : "root"
                            );

                        }

                        else if (
                            action ===
                            "home"
                        ) {

                            navigateTo(
                                "root"
                            );

                        }

                        else if (
                            action ===
                            "new-folder"
                        ) {

                            const name =
                                window.prompt(
                                    "Name des neuen Ordners:"
                                );

                            if (name) {

                                try {
                                    await createFolder(
                                        name
                                    );
                                } catch (
                                    error
                                ) {
                                    window.alert(
                                        error.message
                                    );
                                }
                            }

                        }

                        else if (
                            action ===
                            "new-file"
                        ) {

                            const name =
                                window.prompt(
                                    "Name der neuen Datei:"
                                );

                            if (name) {

                                await createFile(
                                    name
                                );
                            }

                        }

                        else if (
                            action ===
                            "toggle-view"
                        ) {

                            settings.view =
                                settings.view ===
                                    "grid"
                                    ? "list"
                                    : "grid";

                            await saveSettings();

                            render();

                        }

                        else if (
                            action ===
                            "sort"
                        ) {

                            cycleSort();

                        }

                    }
                );

            }
        );
    }


    function cycleSort() {

        const values = [
            "name",
            "date",
            "size",
            "type"
        ];

        const index =
            values.indexOf(
                settings.sort
            );

        if (
            index >=
            values.length - 1
        ) {

            settings.sort =
                values[0];

            settings.sortDirection =
                settings.sortDirection ===
                    "asc"
                    ? "desc"
                    : "asc";

        } else {

            settings.sort =
                values[index + 1];

        }

        saveSettings();

        render();
    }


    /* ========================================================
       CONTEXT MENU
       ======================================================== */

    function showContextMenu(
        x,
        y,
        itemId
    ) {

        closeContextMenu();

        const item =
            getItem(itemId);

        if (!item) {
            return;
        }

        const menu =
            document.createElement(
                "div"
            );

        menu.className =
            "haldo-fm-menu";

        menu.innerHTML = `

            <button data-menu="open">
                Öffnen
            </button>

            <button data-menu="rename">
                Umbenennen
            </button>

            <button data-menu="delete">
                Löschen
            </button>

        `;

        menu.style.left =
            Math.min(
                x,
                window.innerWidth - 200
            ) + "px";

        menu.style.top =
            Math.min(
                y,
                window.innerHeight - 160
            ) + "px";

        menu.addEventListener(
            "click",
            async event => {

                const action =
                    event.target.dataset.menu;

                if (!action) {
                    return;
                }

                closeContextMenu();

                if (
                    action ===
                    "open"
                ) {

                    await openItem(
                        itemId
                    );

                }

                else if (
                    action ===
                    "rename"
                ) {

                    const name =
                        window.prompt(
                            "Neuer Name:",
                            item.name
                        );

                    if (name) {
                        await rename(
                            itemId,
                            name
                        );
                    }

                }

                else if (
                    action ===
                    "delete"
                ) {

                    const confirmed =
                        window.confirm(
                            "Dieses Element wirklich löschen?"
                        );

                    if (confirmed) {
                        await remove(
                            itemId
                        );
                    }

                }

            }
        );

        document.body.appendChild(
            menu
        );

        menu.dataset.haldoContext =
            "true";
    }


    function closeContextMenu() {

        document
            .querySelectorAll(
                '[data-haldo-context="true"]'
            )
            .forEach(
                element =>
                    element.remove()
            );
    }


    document.addEventListener(
        "click",
        closeContextMenu
    );


    /* ========================================================
       FILE VIEWER
       ======================================================== */

    function showFileViewer(
        item
    ) {

        closeViewer();

        const viewer =
            document.createElement(
                "div"
            );

        viewer.className =
            "haldo-fm-viewer";

        viewer.innerHTML = `

            <div class="haldo-fm-viewer-card">

                <h2>
                    ${escapeHTML(item.name)}
                </h2>

                <textarea>${escapeHTML(
                    item.content || ""
                )}</textarea>

                <div style="
                    display:flex;
                    gap:8px;
                    margin-top:12px;
                ">

                    <button
                        data-viewer="save"
                    >
                        Speichern
                    </button>

                    <button
                        data-viewer="close"
                    >
                        Schließen
                    </button>

                </div>

            </div>
        `;

        viewer.addEventListener(
            "click",
            async event => {

                if (
                    event.target ===
                    viewer
                ) {
                    closeViewer();
                    return;
                }

                const action =
                    event.target.dataset.viewer;

                if (
                    action ===
                    "close"
                ) {

                    closeViewer();

                }

                if (
                    action ===
                    "save"
                ) {

                    const textarea =
                        viewer.querySelector(
                            "textarea"
                        );

                    item.content =
                        textarea.value;

                    item.size =
                        item.content.length;

                    item.updatedAt =
                        Date.now();

                    await save();

                    closeViewer();

                    render();

                    emit(
                        "file-saved",
                        {
                            item:
                                clone(item)
                        }
                    );
                }

            }
        );

        document.body.appendChild(
            viewer
        );
    }


    function closeViewer() {

        document
            .querySelectorAll(
                ".haldo-fm-viewer"
            )
            .forEach(
                element =>
                    element.remove()
            );
    }


    /* ========================================================
       MOUNT
       ======================================================== */

    function mount(
        container
    ) {

        if (!container) {
            return false;
        }

        ensureStyles();

        state.rootElement =
            typeof container ===
                "string"
                ? document.querySelector(
                    container
                )
                : container;

        if (!state.rootElement) {
            return false;
        }

        state.mounted =
            true;

        render();

        emit(
            "mounted",
            {
                element:
                    state.rootElement
            }
        );

        return true;
    }


    function unmount() {

        if (
            state.rootElement
        ) {

            state.rootElement.innerHTML =
                "";

        }

        state.rootElement =
            null;

        state.mounted =
            false;

        closeContextMenu();
        closeViewer();

        emit(
            "unmounted"
        );
    }


    /* ========================================================
       APP LIFECYCLE
       ======================================================== */

    async function initialize() {

        if (
            state.initialized
        ) {
            return api;
        }

        await loadSettings();
        await load();

        state.currentFolder =
            state.data.currentFolder ||
            "root";

        state.initialized =
            true;

        state.ready =
            true;

        emit(
            "ready",
            {
                appId:
                    APP_ID
            }
        );

        return api;
    }


    async function open(
        options = {}
    ) {

        await initialize();

        let container =
            options.container ||
            null;

        if (!container) {

            container =
                document.querySelector(
                    '[data-haldo-app="file-manager"]'
                );

        }

        if (container) {
            mount(container);
        }

        emit(
            "opened",
            {
                options
            }
        );

        return {
            ok: true,
            appId: APP_ID
        };
    }


    async function close() {

        unmount();

        emit(
            "closed"
        );

        return {
            ok: true
        };
    }


    /* ========================================================
       DIAGNOSTICS
       ======================================================== */

    function diagnostics() {

        return {

            appId:
                APP_ID,

            version:
                VERSION,

            initialized:
                state.initialized,

            ready:
                state.ready,

            mounted:
                state.mounted,

            currentFolder:
                state.currentFolder,

            itemCount:
                state.data
                    ? state.data.items.length
                    : 0,

            statistics:
                clone(
                    state.statistics
                ),

            timestamp:
                new Date().toISOString()

        };
    }


    /* ========================================================
       APP DEFINITION
       ======================================================== */

    const definition = {

        id:
            APP_ID,

        name:
            "File Manager",

        title:
            "Dateien",

        description:
            "Vollständige Dateiverwaltung für HalDo AI OS 20.",

        version:
            VERSION,

        category:
            "system",

        icon:
            "📁",

        singleton:
            true,

        enabled:
            true,

        visible:
            true,

        dependencies:
            [],

        permissions:
            [
                "storage",
                "filesystem"
            ],

        init:
            initialize,

        open,

        close

    };


    /* ========================================================
       PUBLIC API
       ======================================================== */

    const api = {

        __haldoAI20:
            true,

        id:
            APP_ID,

        name:
            definition.name,

        title:
            definition.title,

        version:
            VERSION,

        definition,

        state,

        settings,

        on,

        off,

        emit,

        initialize,

        open,

        close,

        mount,

        unmount,

        navigateTo,

        getItem,

        getCurrentItems,

        getBreadcrumbs,

        createFolder,

        createFile,

        rename,

        remove,

        openItem,

        getSettings() {
            return clone(settings);
        },

        async setSettings(changes) {

            Object.assign(
                settings,
                changes || {}
            );

            await saveSettings();

            render();

            return clone(settings);
        },

        diagnostics

    };


    /* ========================================================
       GLOBAL
       ======================================================== */

    window.HalDoFileManager =
        api;

    HalDoOS.fileManager =
        api;


    /* ========================================================
       APP MANAGER REGISTRATION
       ======================================================== */

    function registerWithAppManager() {

        const manager =
            getAppManager();

        if (
            !manager ||
            typeof manager.register !==
            "function"
        ) {
            return false;
        }

        try {

            manager.register(
                definition
            );

            return true;

        } catch (error) {

            console.error(
                "[HalDo File Manager] Registration",
                error
            );

            return false;
        }
    }


    /* ========================================================
       START
       ======================================================== */

    function boot() {

        registerWithAppManager();

        initialize()
            .catch(
                error => {

                    console.error(
                        "[HalDo File Manager] Boot",
                        error
                    );

                }
            );
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once: true
            }
        );

    } else {

        boot();

    }


})(window, document);

/* ============================================================
   END FILE MANAGER
   ============================================================ */