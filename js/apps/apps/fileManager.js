/**
 * HALDO AI OS 24.6.0 – FILE MANAGER APP
 * Professionelle Dateiverwaltung mit Ordnernavigation, Operationen und Vorschau
 * Version: 1.0.0
 */

const FileManagerApp = {
    // ---- APP-INFO ----
    id: 'file-manager',
    name: 'Dateien',
    icon: '📂',
    category: 'system',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Dateien und Ordner verwalten, organisieren und durchsuchen',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentPath: '/',
    selectedFiles: [],
    viewMode: 'list', // list | grid
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
    
    // ---- DATEISYSTEM (Simuliert) ----
    fileSystem: {
        '/': {
            type: 'folder',
            name: 'Root',
            children: [
                { name: 'Dokumente', type: 'folder', children: [] },
                { name: 'Bilder', type: 'folder', children: [] },
                { name: 'Musik', type: 'folder', children: [] },
                { name: 'Videos', type: 'folder', children: [] },
                { name: 'Downloads', type: 'folder', children: [] },
                { name: 'Notizen.txt', type: 'file', size: '2.4 KB', modified: Date.now() - 3600000 },
                { name: 'Projekt.pdf', type: 'file', size: '1.2 MB', modified: Date.now() - 86400000 },
                { name: 'Foto.jpg', type: 'file', size: '3.8 MB', modified: Date.now() - 172800000 }
            ]
        },
        '/Dokumente': {
            type: 'folder',
            name: 'Dokumente',
            children: [
                { name: 'Bericht.docx', type: 'file', size: '156 KB', modified: Date.now() - 3600000 },
                { name: 'Präsentation.pptx', type: 'file', size: '2.1 MB', modified: Date.now() - 7200000 },
                { name: 'Tabelle.xlsx', type: 'file', size: '89 KB', modified: Date.now() - 14400000 }
            ]
        },
        '/Bilder': {
            type: 'folder',
            name: 'Bilder',
            children: [
                { name: 'Urlaub.jpg', type: 'file', size: '4.2 MB', modified: Date.now() - 3600000 },
                { name: 'Profil.png', type: 'file', size: '856 KB', modified: Date.now() - 7200000 },
                { name: 'Screenshot.png', type: 'file', size: '1.3 MB', modified: Date.now() - 14400000 }
            ]
        },
        '/Musik': {
            type: 'folder',
            name: 'Musik',
            children: [
                { name: 'Album', type: 'folder', children: [] },
                { name: 'Playlist.m3u', type: 'file', size: '12 KB', modified: Date.now() - 3600000 }
            ]
        },
        '/Videos': {
            type: 'folder',
            name: 'Videos',
            children: [
                { name: 'Film.mp4', type: 'file', size: '850 MB', modified: Date.now() - 3600000 }
            ]
        },
        '/Downloads': {
            type: 'folder',
            name: 'Downloads',
            children: []
        },
        '/Musik/Album': {
            type: 'folder',
            name: 'Album',
            children: [
                { name: 'Song1.mp3', type: 'file', size: '4.5 MB', modified: Date.now() - 3600000 },
                { name: 'Song2.mp3', type: 'file', size: '3.8 MB', modified: Date.now() - 7200000 }
            ]
        }
    },
    
    // ---- REGISTRIERUNG ----
    register() {
        if (typeof AppRegistry !== 'undefined') {
            AppRegistry.register({
                id: this.id,
                name: this.name,
                icon: this.icon,
                category: this.category,
                version: this.version,
                author: this.author,
                description: this.description,
                open: (params) => this.open(params),
                close: () => this.close(),
                install: () => this.install(),
                uninstall: () => this.uninstall()
            });
            console.log('📂 File Manager App registriert');
        }
        return this;
    },
    
    // ---- ÖFFNEN ----
    open(params = {}) {
        if (this.isOpen && this.window) {
            WindowManager.bringToFront(this.window);
            return this.window;
        }
        
        if (params.path) {
            this.currentPath = params.path;
        }
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 560,
            params.height || 460
        );
        
        if (this.window) {
            this.attachEvents();
        }
        
        EventBus.emit('app:opened', { appId: this.id });
        return this.window;
    },
    
    // ---- SCHLIEßEN ----
    close() {
        if (this.window) {
            WindowManager.closeWindow(this.window);
            this.isOpen = false;
            this.window = null;
        }
        EventBus.emit('app:closed', { appId: this.id });
        return this;
    },
    
    // ---- RENDER ----
    render() {
        const currentFolder = this.getCurrentFolder();
        const items = this.getFolderItems(currentFolder);
        const breadcrumb = this.getBreadcrumb();
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopfleiste -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="FileManagerApp.navigateBack()">◀</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="FileManagerApp.navigateHome()">🏠</button>
                    <div style="flex:1;min-width:80px;display:flex;gap:4px;">
                        <input id="file-search" class="haldo-input" placeholder="🔍 Suchen..." style="flex:1;font-size:11px;" 
                            oninput="FileManagerApp.searchFiles(this.value)">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="FileManagerApp.toggleView()">${this.viewMode === 'list' ? '📐' : '📋'}</button>
                    </div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="FileManagerApp.createFolder()">📁</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="FileManagerApp.uploadFile()">📤</button>
                </div>
                
                <!-- Breadcrumb -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:11px;color:var(--text-secondary);overflow-x:auto;flex-wrap:wrap;">
                    ${breadcrumb.map((part, index) => `
                        <span style="cursor:pointer;color:${index === breadcrumb.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)'};" onclick="FileManagerApp.navigateTo('${part.path}')">
                            ${part.name}
                        </span>
                        ${index < breadcrumb.length - 1 ? ' <span style="color:var(--text-muted);">/</span> ' : ''}
                    `).join('')}
                </div>
                
                <!-- Inhalt -->
                <div id="file-content" style="flex:1;overflow-y:auto;padding:4px;">
                    ${this.renderItems(items)}
                </div>
                
                <!-- Statusleiste -->
                <div style="display:flex;justify-content:space-between;padding:4px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>${items.length} Elemente</span>
                    <span>${this.currentPath}</span>
                </div>
            </div>
        `;
    },
    
    // ---- ITEMS RENDERN ----
    renderItems(items) {
        if (items.length === 0) {
            return `
                <div style="text-align:center;padding:40px 20px;color:var(--text-muted);">
                    <div style="font-size:48px;">📂</div>
                    <p style="font-size:13px;">Dieser Ordner ist leer</p>
                    <button class="haldo-btn" style="font-size:12px;margin-top:8px;" onclick="FileManagerApp.createFolder()">📁 Ordner erstellen</button>
                </div>
            `;
        }
        
        if (this.viewMode === 'grid') {
            return this.renderGrid(items);
        }
        return this.renderList(items);
    },
    
    // ---- LISTENANSICHT ----
    renderList(items) {
        return `
            <div style="display:flex;flex-direction:column;">
                <!-- Kopfzeile -->
                <div style="display:grid;grid-template-columns:30px 1fr 120px 140px 60px;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);font-weight:600;">
                    <div></div>
                    <div onclick="FileManagerApp.sortBy('name')" style="cursor:pointer;">Name ${this.getSortIndicator('name')}</div>
                    <div onclick="FileManagerApp.sortBy('size')" style="cursor:pointer;">Größe ${this.getSortIndicator('size')}</div>
                    <div onclick="FileManagerApp.sortBy('modified')" style="cursor:pointer;">Geändert ${this.getSortIndicator('modified')}</div>
                    <div></div>
                </div>
                
                ${items.map(item => this.renderListItem(item)).join('')}
            </div>
        `;
    },
    
    renderListItem(item) {
        const isFolder = item.type === 'folder';
        const icon = isFolder ? '📁' : this.getFileIcon(item.name);
        const date = new Date(item.modified || Date.now());
        const dateStr = date.toLocaleDateString('de') + ' ' + date.toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="file-item" style="
                display:grid;
                grid-template-columns:30px 1fr 120px 140px 60px;
                gap:4px;
                padding:4px 8px;
                border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));
                cursor:pointer;
                transition: all 0.15s ease;
                align-items:center;
            " onclick="FileManagerApp.openItem('${this.escapePath(item.name)}', ${isFolder})" 
               onmouseover="this.style.background='var(--glass-bg, rgba(255,255,255,0.04))'" 
               onmouseout="this.style.background='transparent'">
                <div style="font-size:18px;">${icon}</div>
                <div style="font-size:12px;color:var(--text-primary);${isFolder ? 'font-weight:600;' : ''}">${item.name}</div>
                <div style="font-size:11px;color:var(--text-secondary);">${isFolder ? '—' : item.size || '0 B'}</div>
                <div style="font-size:10px;color:var(--text-muted);">${dateStr}</div>
                <div style="display:flex;gap:2px;">
                    ${isFolder ? '' : `<button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();FileManagerApp.previewFile('${this.escapePath(item.name)}')">👁️</button>`}
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();FileManagerApp.deleteItem('${this.escapePath(item.name)}')">✕</button>
                </div>
            </div>
        `;
    },
    
    // ---- GITTERANSICHT ----
    renderGrid(items) {
        return `
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;">
                ${items.map(item => {
                    const isFolder = item.type === 'folder';
                    const icon = isFolder ? '📁' : this.getFileIcon(item.name);
                    return `
                        <div class="file-grid-item" style="
                            padding:12px 8px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            text-align:center;
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="FileManagerApp.openItem('${this.escapePath(item.name)}', ${isFolder})">
                            <div style="font-size:32px;">${icon}</div>
                            <div style="font-size:10px;color:var(--text-primary);margin-top:4px;word-wrap:break-word;">${item.name}</div>
                            <div style="font-size:8px;color:var(--text-muted);">${isFolder ? 'Ordner' : item.size || '0 B'}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    // ---- DATEISYSTEM OPERATIONEN ----
    getCurrentFolder() {
        return this.fileSystem[this.currentPath] || this.fileSystem['/'];
    },
    
    getFolderItems(folder) {
        if (!folder || !folder.children) return [];
        
        let items = folder.children.map(child => {
            // Für Unterordner den Pfad speichern
            if (child.type === 'folder') {
                const path = this.currentPath === '/' ? '/' + child.name : this.currentPath + '/' + child.name;
                return { ...child, path: path };
            }
            return child;
        });
        
        // Sortierung
        items = this.sortItems(items);
        
        // Suche
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            items = items.filter(item => item.name.toLowerCase().includes(query));
        }
        
        return items;
    },
    
    sortItems(items) {
        const order = this.sortOrder === 'asc' ? 1 : -1;
        return items.sort((a, b) => {
            // Ordner zuerst
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (b.type === 'folder' && a.type !== 'folder') return 1;
            
            switch(this.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name) * order;
                case 'size':
                    const sizeA = parseInt(a.size) || 0;
                    const sizeB = parseInt(b.size) || 0;
                    return (sizeA - sizeB) * order;
                case 'modified':
                    return ((a.modified || 0) - (b.modified || 0)) * order;
                default:
                    return 0;
            }
        });
    },
    
    getSortIndicator(field) {
        if (this.sortBy !== field) return '';
        return this.sortOrder === 'asc' ? '↑' : '↓';
    },
    
    // ---- NAVIGATION ----
    getBreadcrumb() {
        const parts = this.currentPath.split('/').filter(Boolean);
        const breadcrumb = [];
        let path = '';
        
        breadcrumb.push({ name: 'Root', path: '/' });
        
        for (const part of parts) {
            path += '/' + part;
            breadcrumb.push({ name: part, path: path });
        }
        
        return breadcrumb;
    },
    
    navigateTo(path) {
        if (this.fileSystem[path]) {
            this.currentPath = path;
            this.searchQuery = '';
            this.selectedFiles = [];
            this.updateView();
        }
    },
    
    navigateBack() {
        if (this.currentPath === '/') return;
        const parts = this.currentPath.split('/').filter(Boolean);
        parts.pop();
        const path = '/' + parts.join('/');
        this.navigateTo(path || '/');
    },
    
    navigateHome() {
        this.navigateTo('/');
    },
    
    // ---- ITEM OPERATIONEN ----
    openItem(name, isFolder) {
        if (isFolder) {
            const path = this.currentPath === '/' ? '/' + name : this.currentPath + '/' + name;
            if (this.fileSystem[path]) {
                this.navigateTo(path);
            } else {
                // Ordner existiert nicht -> erstellen
                this.createFolder(name);
            }
        } else {
            this.previewFile(name);
        }
    },
    
    // ---- ORDNER ERSTELLEN ----
    createFolder(name = null) {
        const folderName = name || prompt('📁 Name des neuen Ordners:');
        if (!folderName) return;
        
        const path = this.currentPath === '/' ? '/' + folderName : this.currentPath + '/' + folderName;
        if (this.fileSystem[path]) {
            alert('⚠️ Ordner existiert bereits.');
            return;
        }
        
        this.fileSystem[path] = {
            type: 'folder',
            name: folderName,
            children: []
        };
        
        // Zum aktuellen Ordner hinzufügen
        const current = this.getCurrentFolder();
        current.children.push({
            name: folderName,
            type: 'folder',
            children: []
        });
        
        this.updateView();
        EventBus.emit('file:folder-created', { path });
    },
    
    // ---- DATEI LÖSCHEN ----
    deleteItem(name) {
        if (!confirm(`"${name}" wirklich löschen?`)) return;
        
        const current = this.getCurrentFolder();
        const index = current.children.findIndex(c => c.name === name);
        if (index === -1) return;
        
        const item = current.children[index];
        if (item.type === 'folder') {
            const path = this.currentPath === '/' ? '/' + name : this.currentPath + '/' + name;
            delete this.fileSystem[path];
        }
        
        current.children.splice(index, 1);
        this.updateView();
        EventBus.emit('file:deleted', { name });
    },
    
    // ---- DATEI VORSCHAU ----
    previewFile(name) {
        const current = this.getCurrentFolder();
        const item = current.children.find(c => c.name === name);
        if (!item || item.type === 'folder') return;
        
        const ext = name.split('.').pop().toLowerCase();
        let content = '';
        let title = name;
        
        // Simulierte Vorschau basierend auf Dateityp
        switch(ext) {
            case 'txt':
            case 'md':
                content = `<div style="padding:12px;background:rgba(0,0,0,0.2);border-radius:4px;font-family:monospace;font-size:12px;white-space:pre-wrap;">Inhalt von ${name}\n\n${'='.repeat(40)}\n\nDies ist eine Beispiel-Textdatei.\nDer Inhalt wird hier angezeigt.\n\nHalDo AI OS 24.6.0</div>`;
                break;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                content = `<div style="text-align:center;padding:12px;"><div style="font-size:80px;">🖼️</div><p style="color:var(--text-muted);font-size:12px;">Bild: ${name}</p></div>`;
                break;
            case 'pdf':
                content = `<div style="text-align:center;padding:12px;"><div style="font-size:80px;">📕</div><p style="color:var(--text-muted);font-size:12px;">PDF-Dokument: ${name}</p></div>`;
                break;
            case 'mp3':
            case 'wav':
                content = `<div style="text-align:center;padding:12px;"><div style="font-size:80px;">🎵</div><p style="color:var(--text-muted);font-size:12px;">Audiodatei: ${name}</p></div>`;
                break;
            case 'mp4':
            case 'mov':
                content = `<div style="text-align:center;padding:12px;"><div style="font-size:80px;">🎬</div><p style="color:var(--text-muted);font-size:12px;">Videodatei: ${name}</p></div>`;
                break;
            default:
                content = `<div style="text-align:center;padding:12px;"><div style="font-size:80px;">📄</div><p style="color:var(--text-muted);font-size:12px;">Datei: ${name}</p><p style="color:var(--text-muted);font-size:10px;">Größe: ${item.size || '0 B'}</p></div>`;
        }
        
        // In einem separaten Fenster anzeigen
        WindowManager.openWindow(
            'preview',
            '📄 ' + title,
            `<div style="padding:8px;">${content}</div>`,
            '👁️',
            400,
            300
        );
    },
    
    // ---- DATEI UPLOAD ----
    uploadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const current = this.getCurrentFolder();
            // Prüfen ob Datei bereits existiert
            if (current.children.find(c => c.name === file.name)) {
                if (!confirm(`"${file.name}" existiert bereits. Überschreiben?`)) return;
                const index = current.children.findIndex(c => c.name === file.name);
                if (index !== -1) current.children.splice(index, 1);
            }
            
            current.children.push({
                name: file.name,
                type: 'file',
                size: this.formatSize(file.size),
                modified: Date.now()
            });
            
            this.updateView();
            EventBus.emit('file:uploaded', { name: file.name });
        };
        input.click();
    },
    
    // ---- SUCHE ----
    searchFiles(query) {
        this.searchQuery = query;
        this.updateView();
    },
    
    // ---- ANSICHT WECHSELN ----
    toggleView() {
        this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
        this.updateView();
    },
    
    // ---- SORTIERUNG ----
    sortBy(field) {
        if (this.sortBy === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = field;
            this.sortOrder = 'asc';
        }
        this.updateView();
    },
    
    // ---- UPDATE ----
    updateView() {
        const container = this.window?.querySelector('.window-body');
        if (container) {
            container.innerHTML = this.render();
            this.attachEvents();
        }
    },
    
    // ---- EVENT BINDING ----
    attachEvents() {
        // Tastatur-Shortcuts
        if (this.window) {
            this.window.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    this.navigateBack();
                    e.preventDefault();
                }
                if (e.key === 'Home') {
                    this.navigateHome();
                    e.preventDefault();
                }
                if (e.ctrlKey && e.key === 'n') {
                    this.createFolder();
                    e.preventDefault();
                }
            });
        }
    },
    
    // ---- HELPER ----
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'txt': '📄',
            'md': '📄',
            'pdf': '📕',
            'doc': '📘',
            'docx': '📘',
            'xls': '📊',
            'xlsx': '📊',
            'ppt': '📙',
            'pptx': '📙',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'png': '🖼️',
            'gif': '🖼️',
            'mp3': '🎵',
            'wav': '🎵',
            'mp4': '🎬',
            'mov': '🎬',
            'zip': '📦',
            'rar': '📦',
            '7z': '📦',
            'js': '💻',
            'html': '🌐',
            'css': '🎨',
            'json': '📋',
            'xml': '📋'
        };
        return icons[ext] || '📄';
    },
    
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    },
    
    escapePath(name) {
        return name.replace(/'/g, "\\'").replace(/"/g, '\\"');
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('📂 File Manager App wird installiert...');
        // Standard-Ordner erstellen falls nicht vorhanden
        const defaultFolders = ['/Dokumente', '/Bilder', '/Musik', '/Videos', '/Downloads'];
        for (const folder of defaultFolders) {
            if (!this.fileSystem[folder]) {
                const name = folder.split('/').pop();
                this.fileSystem[folder] = {
                    type: 'folder',
                    name: name,
                    children: []
                };
                // Zum Root hinzufügen
                if (!this.fileSystem['/'].children.find(c => c.name === name)) {
                    this.fileSystem['/'].children.push({
                        name: name,
                        type: 'folder',
                        children: []
                    });
                }
            }
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ File Manager App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
FileManagerApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.FileManagerApp = FileManagerApp;

console.log('📂 File Manager App geladen – HalDo AI OS 24.6.0');
