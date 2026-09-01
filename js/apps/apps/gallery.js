/**
 * HALDO AI OS 24.6.0 – GALLERY APP
 * Professionelle Bildergalerie mit Alben, Vorschau und Verwaltung
 * Version: 1.0.0
 */

const GalleryApp = {
    // ---- APP-INFO ----
    id: 'gallery',
    name: 'Galerie',
    icon: '🖼️',
    category: 'media',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Bilder und Fotos verwalten, organisieren und anzeigen',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    images: [],
    albums: [],
    currentAlbum: null,
    selectedImage: null,
    viewMode: 'grid', // grid | list
    sortBy: 'date',
    sortOrder: 'desc',
    searchQuery: '',
    
    // ---- STANDARD-BILDER ----
    defaultImages: [
        { id: 'img1', title: 'Cosmic Sunset', album: 'Cosmic', url: '🌅', width: 800, height: 600, date: Date.now() - 86400000 * 1 },
        { id: 'img2', title: 'Starry Night', album: 'Cosmic', url: '🌌', width: 1024, height: 768, date: Date.now() - 86400000 * 2 },
        { id: 'img3', title: 'Mountain View', album: 'Nature', url: '🏔️', width: 800, height: 600, date: Date.now() - 86400000 * 3 },
        { id: 'img4', title: 'Ocean Waves', album: 'Nature', url: '🌊', width: 1024, height: 768, date: Date.now() - 86400000 * 4 },
        { id: 'img5', title: 'Forest Path', album: 'Nature', url: '🌲', width: 800, height: 600, date: Date.now() - 86400000 * 5 },
        { id: 'img6', title: 'City Lights', album: 'Urban', url: '🌃', width: 1024, height: 768, date: Date.now() - 86400000 * 6 },
        { id: 'img7', title: 'Sunset Beach', album: 'Nature', url: '🌅', width: 800, height: 600, date: Date.now() - 86400000 * 7 },
        { id: 'img8', title: 'Aurora Borealis', album: 'Cosmic', url: '🌠', width: 1024, height: 768, date: Date.now() - 86400000 * 8 }
    ],
    
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
            console.log('🖼️ Gallery App registriert');
        }
        return this;
    },
    
    // ---- ÖFFNEN ----
    open(params = {}) {
        if (this.isOpen && this.window) {
            WindowManager.bringToFront(this.window);
            return this.window;
        }
        
        this.loadData();
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 580,
            params.height || 480
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
    
    // ---- DATEN LADEN ----
    loadData() {
        this.images = Storage.get('gallery_images', this.defaultImages);
        this.albums = Storage.get('gallery_albums', [
            { id: 'album1', name: 'Cosmic', icon: '🌌' },
            { id: 'album2', name: 'Nature', icon: '🌿' },
            { id: 'album3', name: 'Urban', icon: '🏙️' }
        ]);
        this.currentAlbum = Storage.get('gallery_current_album', null);
        this.viewMode = Storage.get('gallery_view_mode', 'grid');
        this.sortBy = Storage.get('gallery_sort_by', 'date');
        this.sortOrder = Storage.get('gallery_sort_order', 'desc');
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('gallery_images', this.images);
        Storage.set('gallery_albums', this.albums);
        Storage.set('gallery_current_album', this.currentAlbum);
        Storage.set('gallery_view_mode', this.viewMode);
        Storage.set('gallery_sort_by', this.sortBy);
        Storage.set('gallery_sort_order', this.sortOrder);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        const images = this.getFilteredImages();
        const albumName = this.getAlbumName();
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopfleiste -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <div style="display:flex;gap:4px;flex:1;min-width:80px;">
                        <input id="gallery-search" class="haldo-input" placeholder="🔍 Suchen..." style="flex:1;font-size:11px;" 
                            oninput="GalleryApp.searchImages(this.value)">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="GalleryApp.toggleView()">${this.viewMode === 'grid' ? '📐' : '📋'}</button>
                    </div>
                    <div style="display:flex;gap:4px;">
                        <select id="gallery-album-select" class="haldo-input" style="font-size:10px;padding:2px 6px;width:120px;" onchange="GalleryApp.selectAlbum(this.value)">
                            <option value="">📁 Alle Alben</option>
                            ${this.albums.map(a => `
                                <option value="${a.id}" ${this.currentAlbum === a.id ? 'selected' : ''}>${a.icon} ${a.name}</option>
                            `).join('')}
                        </select>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="GalleryApp.createAlbum()">+</button>
                        <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="GalleryApp.uploadImage()">📤</button>
                    </div>
                </div>
                
                <!-- Sortierung -->
                <div style="display:flex;gap:4px;padding:2px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));flex-wrap:wrap;">
                    <span style="font-size:10px;color:var(--text-muted);">Sortieren:</span>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:1px 6px;" onclick="GalleryApp.sortBy('date')">📅 ${this.sortBy === 'date' ? (this.sortOrder === 'asc' ? '↑' : '↓') : ''}</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:1px 6px;" onclick="GalleryApp.sortBy('title')">🔤 ${this.sortBy === 'title' ? (this.sortOrder === 'asc' ? '↑' : '↓') : ''}</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:1px 6px;" onclick="GalleryApp.sortBy('album')">📁 ${this.sortBy === 'album' ? (this.sortOrder === 'asc' ? '↑' : '↓') : ''}</button>
                    <span style="font-size:10px;color:var(--text-muted);margin-left:8px;">${images.length} Bilder</span>
                </div>
                
                <!-- Inhalt -->
                <div id="gallery-content" style="flex:1;overflow-y:auto;padding:4px;">
                    ${this.renderImages(images)}
                </div>
                
                <!-- Statusleiste -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>${albumName}</span>
                    <span>${images.length} Bilder</span>
                </div>
            </div>
        `;
    },
    
    // ---- BILDER RENDERN ----
    renderImages(images) {
        if (images.length === 0) {
            return `
                <div style="text-align:center;padding:40px 20px;color:var(--text-muted);">
                    <div style="font-size:48px;">🖼️</div>
                    <p style="font-size:13px;">Keine Bilder gefunden</p>
                    <button class="haldo-btn" style="font-size:12px;margin-top:8px;" onclick="GalleryApp.uploadImage()">📤 Bilder hochladen</button>
                </div>
            `;
        }
        
        if (this.viewMode === 'list') {
            return this.renderList(images);
        }
        return this.renderGrid(images);
    },
    
    // ---- GITTERANSICHT ----
    renderGrid(images) {
        return `
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px;">
                ${images.map(img => `
                    <div class="gallery-item" style="
                        padding:8px;
                        background: var(--glass-bg, rgba(255,255,255,0.04));
                        border-radius:8px;
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        text-align:center;
                        cursor:pointer;
                        transition: all 0.15s ease;
                        aspect-ratio: 4/3;
                        display:flex;
                        flex-direction:column;
                        align-items:center;
                        justify-content:center;
                    " onclick="GalleryApp.previewImage('${img.id}')">
                        <div style="font-size:48px;">${img.url}</div>
                        <div style="font-size:10px;color:var(--text-secondary);margin-top:4px;word-wrap:break-word;max-width:100%;">${img.title}</div>
                        <div style="font-size:8px;color:var(--text-muted);">${img.album}</div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    // ---- LISTENANSICHT ----
    renderList(images) {
        return `
            <div style="display:flex;flex-direction:column;">
                ${images.map(img => `
                    <div class="gallery-item" style="
                        display:grid;
                        grid-template-columns:60px 1fr 100px 80px 60px;
                        gap:8px;
                        padding:6px 8px;
                        border-radius:6px;
                        border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));
                        cursor:pointer;
                        transition: all 0.15s ease;
                        align-items:center;
                    " onclick="GalleryApp.previewImage('${img.id}')" 
                       onmouseover="this.style.background='var(--glass-bg, rgba(255,255,255,0.04))'" 
                       onmouseout="this.style.background='transparent'">
                        <div style="font-size:32px;text-align:center;">${img.url}</div>
                        <div>
                            <div style="font-size:12px;color:var(--text-primary);">${img.title}</div>
                            <div style="font-size:10px;color:var(--text-muted);">${img.album}</div>
                        </div>
                        <div style="font-size:10px;color:var(--text-secondary);">${img.width}×${img.height}</div>
                        <div style="font-size:9px;color:var(--text-muted);">${new Date(img.date).toLocaleDateString('de')}</div>
                        <div style="display:flex;gap:2px;">
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();GalleryApp.editImage('${img.id}')">✏️</button>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();GalleryApp.deleteImage('${img.id}')">✕</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    // ---- BILD VORSCHAU ----
    previewImage(imageId) {
        const image = this.images.find(i => i.id === imageId);
        if (!image) return;
        
        this.selectedImage = image;
        
        const content = `
            <div style="display:flex;flex-direction:column;height:100%;padding:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <h3 style="color:var(--text-primary);font-size:16px;margin:0;">${image.title}</h3>
                    <div style="display:flex;gap:4px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="GalleryApp.editImage('${image.id}')">✏️</button>
                        <button class="haldo-btn" style="font-size:10px;padding:2px 8px;background:var(--danger, #FF3B30);" onclick="GalleryApp.deleteImage('${image.id}')">🗑️</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="WindowManager.closeWindow(this.closest('.window'))">✕</button>
                    </div>
                </div>
                <div style="flex:1;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.2);border-radius:8px;min-height:200px;">
                    <div style="font-size:120px;">${image.url}</div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px;font-size:11px;color:var(--text-secondary);">
                    <div>📁 Album: ${image.album}</div>
                    <div>📐 Größe: ${image.width}×${image.height}</div>
                    <div>📅 Datum: ${new Date(image.date).toLocaleString('de')}</div>
                    <div>🆔 ID: ${image.id}</div>
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'image-preview',
            '🖼️ ' + image.title,
            content,
            '🖼️',
            460,
            400
        );
    },
    
    // ---- BILD BEARBEITEN ----
    editImage(imageId) {
        const image = this.images.find(i => i.id === imageId);
        if (!image) return;
        
        const newTitle = prompt('✏️ Titel:', image.title);
        if (newTitle && newTitle.trim()) {
            image.title = newTitle.trim();
        }
        
        const newAlbum = prompt('📁 Album:', image.album);
        if (newAlbum && newAlbum.trim()) {
            image.album = newAlbum.trim();
        }
        
        image.date = Date.now();
        this.saveData();
        this.updateView();
        EventBus.emit('gallery:image-edited', { imageId });
    },
    
    // ---- BILD LÖSCHEN ----
    deleteImage(imageId) {
        if (!confirm('Bild wirklich löschen?')) return;
        
        this.images = this.images.filter(i => i.id !== imageId);
        this.saveData();
        this.updateView();
        EventBus.emit('gallery:image-deleted', { imageId });
    },
    
    // ---- BILD HOCHLADEN ----
    uploadImage() {
        const title = prompt('🖼️ Titel:');
        if (!title) return;
        const album = prompt('📁 Album:', 'Standard') || 'Standard';
        
        // Simuliertes Bild
        const emojis = ['🌅', '🌌', '🏔️', '🌊', '🌲', '🌃', '🌠', '🌄', '🌇', '🌉', '🌺', '🌸', '🌻', '🌹', '🌷', '🌿', '🍃', '🍂', '🍁', '🍀'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        this.images.push({
            id: 'img_' + Date.now().toString(36),
            title: title,
            album: album,
            url: randomEmoji,
            width: 800 + Math.floor(Math.random() * 400),
            height: 600 + Math.floor(Math.random() * 300),
            date: Date.now()
        });
        
        this.saveData();
        this.updateView();
        EventBus.emit('gallery:image-uploaded', { title, album });
    },
    
    // ---- SUCHE ----
    searchImages(query) {
        this.searchQuery = query;
        this.updateView();
    },
    
    getFilteredImages() {
        let images = [...this.images];
        
        // Album-Filter
        if (this.currentAlbum) {
            images = images.filter(i => i.album === this.getAlbumNameById(this.currentAlbum));
        }
        
        // Suche
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            images = images.filter(i => 
                i.title.toLowerCase().includes(query) ||
                i.album.toLowerCase().includes(query)
            );
        }
        
        // Sortierung
        images.sort((a, b) => {
            let comparison = 0;
            switch(this.sortBy) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'album':
                    comparison = a.album.localeCompare(b.album);
                    break;
                case 'date':
                default:
                    comparison = (a.date || 0) - (b.date || 0);
                    break;
            }
            return this.sortOrder === 'asc' ? comparison : -comparison;
        });
        
        return images;
    },
    
    // ---- ALBEN ----
    getAlbumName() {
        if (!this.currentAlbum) return '📁 Alle Alben';
        const album = this.albums.find(a => a.id === this.currentAlbum);
        return album ? `${album.icon} ${album.name}` : '📁 Alle Alben';
    },
    
    getAlbumNameById(albumId) {
        const album = this.albums.find(a => a.id === albumId);
        return album ? album.name : albumId;
    },
    
    selectAlbum(albumId) {
        this.currentAlbum = albumId || null;
        this.saveData();
        this.updateView();
    },
    
    createAlbum() {
        const name = prompt('📁 Name des neuen Albums:');
        if (!name) return;
        const icon = prompt('🎨 Icon (Emoji):', '📁') || '📁';
        
        this.albums.push({
            id: 'album_' + Date.now().toString(36),
            name: name,
            icon: icon
        });
        
        this.saveData();
        this.updateView();
    },
    
    // ---- SORTIERUNG ----
    sortBy(field) {
        if (this.sortBy === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = field;
            this.sortOrder = 'desc';
        }
        this.saveData();
        this.updateView();
    },
    
    // ---- ANSICHT WECHSELN ----
    toggleView() {
        this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
        this.saveData();
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
                if (e.key === 'Delete' && this.selectedImage) {
                    this.deleteImage(this.selectedImage.id);
                }
                if (e.ctrlKey && e.key === 'u') {
                    this.uploadImage();
                    e.preventDefault();
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🖼️ Gallery App wird installiert...');
        this.loadData();
        if (this.images.length === 0) {
            this.images = this.defaultImages;
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Gallery App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
GalleryApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.GalleryApp = GalleryApp;

console.log('🖼️ Gallery App geladen – HalDo AI OS 24.6.0');
