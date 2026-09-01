/**
 * HALDO AI OS 24.6.0 – NOTES APP
 * Professionelle Notizverwaltung mit Kategorien, Suche und AI-Funktionen
 * Version: 1.0.0
 */

const NotesApp = {
    // ---- APP-INFO ----
    id: 'notes',
    name: 'Notizen',
    icon: '📝',
    category: 'tools',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Notizen verwalten, organisieren und durchsuchen',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    notes: [],
    currentCategory: 'all',
    searchQuery: '',
    selectedNote: null,
    editingNote: null,
    
    // ---- KATEGORIEN ----
    categories: [
        { id: 'all', label: '📋 Alle', icon: '📋' },
        { id: 'personal', label: '👤 Persönlich', icon: '👤' },
        { id: 'work', label: '💼 Arbeit', icon: '💼' },
        { id: 'study', label: '📚 Studium', icon: '📚' },
        { id: 'ideas', label: '💡 Ideen', icon: '💡' },
        { id: 'shopping', label: '🛒 Einkaufen', icon: '🛒' },
        { id: 'archive', label: '📦 Archiv', icon: '📦' }
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
            console.log('📝 Notes App registriert');
        }
        return this;
    },
    
    // ---- ÖFFNEN ----
    open(params = {}) {
        if (this.isOpen && this.window) {
            WindowManager.bringToFront(this.window);
            return this.window;
        }
        
        this.loadNotes();
        this.currentCategory = params.category || 'all';
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 520,
            params.height || 440
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
    
    // ---- NOTIZEN LADEN ----
    loadNotes() {
        this.notes = Storage.get('notes_data', []);
        // Migriere alte Notizen
        const oldNotes = Storage.get('notes', []);
        if (oldNotes.length > 0 && this.notes.length === 0) {
            this.notes = oldNotes.map(n => ({
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
                title: n.substring(0, 30) || 'Notiz',
                content: n,
                category: 'personal',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                favorite: false,
                archived: false,
                tags: []
            }));
            Storage.set('notes_data', this.notes);
            Storage.remove('notes');
        }
        return this.notes;
    },
    
    // ---- NOTIZEN SPEICHERN ----
    saveNotes() {
        Storage.set('notes_data', this.notes);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        const filteredNotes = this.getFilteredNotes();
        const noteCount = filteredNotes.length;
        const categoryLabel = this.categories.find(c => c.id === this.currentCategory)?.label || '📋 Alle';
        
        return `
            <div style="display:flex;height:100%;">
                <!-- Seitenleiste -->
                <div style="width:140px;padding:4px;border-right:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-shrink:0;overflow-y:auto;">
                    ${this.categories.map(cat => `
                        <div class="notes-category" data-category="${cat.id}" style="
                            padding:5px 10px;
                            margin:2px 0;
                            border-radius:6px;
                            cursor:pointer;
                            color: ${this.currentCategory === cat.id ? 'var(--text-primary)' : 'var(--text-secondary)'};
                            background: ${this.currentCategory === cat.id ? 'var(--primary, #6C3CE1)' : 'transparent'};
                            font-size:11px;
                            transition: all 0.15s ease;
                        " onclick="NotesApp.selectCategory('${cat.id}')">
                            ${cat.label}
                        </div>
                    `).join('')}
                    <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <div style="padding:5px 10px;font-size:10px;color:var(--text-muted);">Notizen: ${noteCount}</div>
                        <button class="haldo-btn" style="font-size:10px;padding:3px 8px;width:100%;" onclick="NotesApp.createNote()">➕ Neu</button>
                    </div>
                </div>
                
                <!-- Notizen-Liste -->
                <div style="flex:1;display:flex;flex-direction:column;padding:8px;">
                    <div style="display:flex;gap:4px;margin-bottom:6px;">
                        <input id="notes-search" class="haldo-input" placeholder="🔍 Suchen..." style="flex:1;font-size:11px;" 
                            oninput="NotesApp.searchNotes(this.value)">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 8px;" onclick="NotesApp.toggleView()">📐</button>
                    </div>
                    <div id="notes-list" style="flex:1;overflow-y:auto;">
                        ${noteCount === 0 ? `
                            <div style="text-align:center;padding:30px 10px;color:var(--text-muted);">
                                <div style="font-size:32px;">📝</div>
                                <p style="font-size:11px;">Keine Notizen in "${categoryLabel}"</p>
                                <button class="haldo-btn" style="font-size:11px;margin-top:8px;" onclick="NotesApp.createNote()">Erste Notiz erstellen</button>
                            </div>
                        ` : `
                            ${filteredNotes.map(note => this.renderNoteItem(note)).join('')}
                        `}
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- NOTIZ-ITEM RENDERN ----
    renderNoteItem(note) {
        const isSelected = this.selectedNote?.id === note.id;
        const date = new Date(note.updatedAt || note.createdAt);
        const dateStr = date.toLocaleDateString('de', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const category = this.categories.find(c => c.id === note.category)?.label || '📋';
        
        return `
            <div class="note-item" data-id="${note.id}" style="
                padding:6px 10px;
                margin:3px 0;
                background: ${isSelected ? 'var(--primary, #6C3CE1)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                border: 1px solid ${isSelected ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                border-radius:6px;
                cursor:pointer;
                transition: all 0.15s ease;
            " onclick="NotesApp.selectNote('${note.id}')">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="font-size:12px;font-weight:600;color:${isSelected ? 'white' : 'var(--text-primary)'};">
                        ${note.favorite ? '⭐ ' : ''}${note.title || 'Notiz'}
                    </div>
                    <div style="font-size:10px;color:${isSelected ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)'};">
                        ${category}
                    </div>
                </div>
                <div style="font-size:10px;color:${isSelected ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)'};margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">
                    ${note.content?.substring(0, 60) || ''}${note.content?.length > 60 ? '...' : ''}
                </div>
                <div style="font-size:9px;color:${isSelected ? 'rgba(255,255,255,0.4)' : 'var(--text-muted)'};margin-top:2px;">
                    ${dateStr} ${note.tags?.length > 0 ? '• ' + note.tags.join(', ') : ''}
                </div>
            </div>
        `;
    },
    
    // ---- NOTIZ ANZEIGEN ----
    renderNoteDetail(note) {
        if (!note) return '';
        const category = this.categories.find(c => c.id === note.category) || this.categories[0];
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap;">
                    <input id="note-title-input" class="haldo-input" value="${note.title || ''}" placeholder="Titel..." style="flex:1;font-size:12px;min-width:80px;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 8px;" onclick="NotesApp.saveNoteTitle()">💾</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 8px;" onclick="NotesApp.toggleFavorite()">${note.favorite ? '⭐' : '☆'}</button>
                </div>
                <div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap;">
                    <select id="note-category-select" class="haldo-input" style="font-size:10px;padding:3px 6px;flex:1;min-width:80px;" onchange="NotesApp.changeCategory(this.value)">
                        ${this.categories.filter(c => c.id !== 'all' && c.id !== 'archive').map(c => `
                            <option value="${c.id}" ${c.id === note.category ? 'selected' : ''}>${c.label}</option>
                        `).join('')}
                    </select>
                    <input id="note-tags-input" class="haldo-input" value="${note.tags?.join(', ') || ''}" placeholder="Tags..." style="flex:1;font-size:10px;min-width:80px;" onchange="NotesApp.saveTags(this.value)">
                </div>
                <textarea id="note-content-input" class="haldo-input" style="flex:1;font-size:12px;resize:none;min-height:120px;" 
                    oninput="NotesApp.autoSave()">${note.content || ''}</textarea>
                <div style="display:flex;gap:4px;margin-top:4px;justify-content:space-between;flex-wrap:wrap;">
                    <div style="font-size:10px;color:var(--text-muted);">
                        ${new Date(note.updatedAt || note.createdAt).toLocaleString()}
                        ${note.updatedAt !== note.createdAt ? ' (bearbeitet)' : ''}
                    </div>
                    <div style="display:flex;gap:4px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="NotesApp.aiSummarize()">🧠 Zusammenfassen</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="NotesApp.exportNote()">📤 Export</button>
                        <button class="haldo-btn" style="font-size:10px;padding:2px 8px;background:var(--danger, #FF3B30);" onclick="NotesApp.deleteNote()">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- EVENT BINDING ----
    attachEvents() {
        const container = this.window;
        if (!container) return;
        
        // Klick außerhalb der Notiz
        container.addEventListener('click', (e) => {
            const noteItem = e.target.closest('.note-item');
            const detailArea = e.target.closest('#note-detail-area');
            if (!noteItem && !detailArea && this.selectedNote) {
                // Speichern bevor Auswahl aufgehoben wird
                this.saveCurrentNote();
            }
        });
    },
    
    // ---- KATEGORIE AUSWÄHLEN ----
    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        this.selectedNote = null;
        this.saveCurrentNote();
        
        const container = this.window?.querySelector('.window-body');
        if (container) {
            container.innerHTML = this.render();
            this.attachEvents();
        }
    },
    
    // ---- NOTIZ AUSWÄHLEN ----
    selectNote(noteId) {
        this.saveCurrentNote();
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        this.selectedNote = note;
        this.updateNoteList();
        this.showNoteDetail(note);
    },
    
    // ---- NOTIZ DETAIL ANZEIGEN ----
    showNoteDetail(note) {
        const list = document.getElementById('notes-list');
        if (!list) return;
        
        const detailContainer = document.createElement('div');
        detailContainer.id = 'note-detail-area';
        detailContainer.style.cssText = `
            flex:1;
            padding:8px;
            background: var(--glass-bg, rgba(255,255,255,0.04));
            border-radius:6px;
            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
            min-height:200px;
            display:flex;
            flex-direction:column;
        `;
        detailContainer.innerHTML = this.renderNoteDetail(note);
        
        // Ersetze Liste durch Detailansicht
        list.parentNode.replaceChild(detailContainer, list);
    },
    
    // ---- NOTIZ LISTE AKTUALISIEREN ----
    updateNoteList() {
        const container = this.window?.querySelector('.window-body');
        if (container) {
            const currentContent = container.innerHTML;
            // Nur die Liste neu rendern, nicht den gesamten Inhalt
            const listArea = container.querySelector('#notes-list');
            if (listArea) {
                const filteredNotes = this.getFilteredNotes();
                listArea.innerHTML = filteredNotes.map(note => this.renderNoteItem(note)).join('');
            }
        }
    },
    
    // ---- GEFILTERTE NOTIZEN ----
    getFilteredNotes() {
        let notes = this.notes;
        
        // Kategorie filter
        if (this.currentCategory === 'archive') {
            notes = notes.filter(n => n.archived);
        } else if (this.currentCategory !== 'all') {
            notes = notes.filter(n => n.category === this.currentCategory && !n.archived);
        } else {
            notes = notes.filter(n => !n.archived);
        }
        
        // Suche
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            notes = notes.filter(n => 
                n.title?.toLowerCase().includes(query) ||
                n.content?.toLowerCase().includes(query) ||
                n.tags?.some(t => t.toLowerCase().includes(query))
            );
        }
        
        // Sortierung (nach Aktualität)
        notes.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
        
        return notes;
    },
    
    // ---- NOTIZEN SUCHE ----
    searchNotes(query) {
        this.searchQuery = query;
        const list = document.getElementById('notes-list');
        if (list) {
            const filteredNotes = this.getFilteredNotes();
            if (filteredNotes.length === 0) {
                list.innerHTML = `
                    <div style="text-align:center;padding:20px;color:var(--text-muted);">
                        <p style="font-size:11px;">Keine Notizen gefunden</p>
                    </div>
                `;
            } else {
                list.innerHTML = filteredNotes.map(note => this.renderNoteItem(note)).join('');
            }
        }
    },
    
    // ---- NOTIZ ERSTELLEN ----
    createNote() {
        const newNote = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
            title: 'Neue Notiz',
            content: '',
            category: this.currentCategory === 'all' || this.currentCategory === 'archive' ? 'personal' : this.currentCategory,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            favorite: false,
            archived: false,
            tags: []
        };
        
        this.notes.push(newNote);
        this.saveNotes();
        this.selectedNote = newNote;
        
        // UI aktualisieren
        const container = this.window?.querySelector('.window-body');
        if (container) {
            container.innerHTML = this.render();
            this.attachEvents();
            this.showNoteDetail(newNote);
            // Fokus auf Titel
            setTimeout(() => {
                const titleInput = document.getElementById('note-title-input');
                if (titleInput) {
                    titleInput.focus();
                    titleInput.select();
                }
            }, 100);
        }
        
        EventBus.emit('notes:created', { noteId: newNote.id });
        return newNote;
    },
    
    // ---- NOTIZ SPEICHERN ----
    saveCurrentNote() {
        if (!this.selectedNote) return;
        
        const titleInput = document.getElementById('note-title-input');
        const contentInput = document.getElementById('note-content-input');
        
        if (titleInput) {
            this.selectedNote.title = titleInput.value || 'Notiz';
        }
        if (contentInput) {
            this.selectedNote.content = contentInput.value;
        }
        this.selectedNote.updatedAt = Date.now();
        
        this.saveNotes();
        this.updateNoteList();
    },
    
    autoSave() {
        clearTimeout(this._autoSaveTimer);
        this._autoSaveTimer = setTimeout(() => {
            this.saveCurrentNote();
        }, 500);
    },
    
    saveNoteTitle() {
        const input = document.getElementById('note-title-input');
        if (input && this.selectedNote) {
            this.selectedNote.title = input.value || 'Notiz';
            this.selectedNote.updatedAt = Date.now();
            this.saveNotes();
            this.updateNoteList();
        }
    },
    
    // ---- KATEGORIE ÄNDERN ----
    changeCategory(categoryId) {
        if (this.selectedNote) {
            this.selectedNote.category = categoryId;
            this.selectedNote.updatedAt = Date.now();
            this.saveNotes();
            this.updateNoteList();
        }
    },
    
    // ---- TAGS SPEICHERN ----
    saveTags(value) {
        if (this.selectedNote) {
            this.selectedNote.tags = value.split(',').map(t => t.trim()).filter(Boolean);
            this.selectedNote.updatedAt = Date.now();
            this.saveNotes();
            this.updateNoteList();
        }
    },
    
    // ---- FAVORITE TOGGLE ----
    toggleFavorite() {
        if (this.selectedNote) {
            this.selectedNote.favorite = !this.selectedNote.favorite;
            this.selectedNote.updatedAt = Date.now();
            this.saveNotes();
            this.updateNoteList();
            this.showNoteDetail(this.selectedNote);
        }
    },
    
    // ---- NOTIZ LÖSCHEN ----
    deleteNote() {
        if (!this.selectedNote) return;
        if (!confirm(`Notiz "${this.selectedNote.title}" wirklich löschen?`)) return;
        
        const index = this.notes.findIndex(n => n.id === this.selectedNote.id);
        if (index !== -1) {
            this.notes.splice(index, 1);
            this.saveNotes();
            this.selectedNote = null;
            
            const container = this.window?.querySelector('.window-body');
            if (container) {
                container.innerHTML = this.render();
                this.attachEvents();
            }
            
            EventBus.emit('notes:deleted', { noteId: this.selectedNote?.id });
        }
    },
    
    // ---- AI: ZUSAMMENFASSEN ----
    async aiSummarize() {
        if (!this.selectedNote || !this.selectedNote.content) {
            alert('⚠️ Bitte zuerst einen Text schreiben.');
            return;
        }
        
        const text = this.selectedNote.content;
        if (text.length < 20) {
            alert('⚠️ Der Text ist zu kurz für eine Zusammenfassung.');
            return;
        }
        
        try {
            // Verwende den AICore für die Zusammenfassung
            const prompt = `Fasse folgenden Text kurz und prägnant zusammen (max. 3 Sätze):\n\n${text}`;
            
            if (typeof AICore !== 'undefined' && AICore.hasValidKey()) {
                const summary = await AICore.simpleChat(prompt);
                alert(`📝 Zusammenfassung:\n\n${summary}`);
            } else {
                // Fallback: einfache Zusammenfassung
                const words = text.split(/\s+/);
                const sentences = text.split(/[.!?]+/).filter(Boolean);
                const summary = sentences.slice(0, 2).join('. ') + '.';
                alert(`📝 Zusammenfassung (lokal):\n\n${summary}`);
            }
        } catch (error) {
            alert('❌ Fehler bei der Zusammenfassung: ' + error.message);
        }
    },
    
    // ---- NOTIZ EXPORTIEREN ----
    exportNote() {
        if (!this.selectedNote) return;
        const note = this.selectedNote;
        const content = `
Titel: ${note.title}
Kategorie: ${this.categories.find(c => c.id === note.category)?.label || 'Unbekannt'}
Datum: ${new Date(note.createdAt).toLocaleString()}
Tags: ${note.tags?.join(', ') || '-'}
${'-'.repeat(40)}

${note.content || '(Leer)'}
        `.trim();
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title || 'notiz'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    // ---- VIEW TOGGLE ----
    toggleView() {
        // Einfacher View-Toggle (aktuell nur List-View)
        // In einer erweiterten Version könnte hier zwischen Liste und Kacheln gewechselt werden
        alert('📐 Ansicht umgeschaltet (Liste)');
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('📝 Notes App wird installiert...');
        // Standard-Beispiel-Notizen erstellen
        const existing = Storage.get('notes_data', []);
        if (existing.length === 0) {
            const sampleNotes = [
                {
                    id: 'sample1',
                    title: 'Willkommen bei HalDo OS!',
                    content: 'Herzlich willkommen in deinem neuen HalDo AI OS. Dies ist eine Beispiel-Notiz. Du kannst sie bearbeiten, löschen oder neue Notizen erstellen.',
                    category: 'personal',
                    createdAt: Date.now() - 86400000,
                    updatedAt: Date.now() - 86400000,
                    favorite: true,
                    archived: false,
                    tags: ['willkommen', 'haldo']
                },
                {
                    id: 'sample2',
                    title: 'Wichtige Links',
                    content: 'HalDo AI OS - https://haldo-os.com\nGitHub - https://github.com\nGroq API - https://console.groq.com',
                    category: 'work',
                    createdAt: Date.now() - 172800000,
                    updatedAt: Date.now() - 172800000,
                    favorite: false,
                    archived: false,
                    tags: ['links', 'ressourcen']
                },
                {
                    id: 'sample3',
                    title: 'Nächste Schritte',
                    content: '1. Groq API Key einrichten\n2. Apps erkunden\n3. Notizen erstellen\n4. Cosmic World entdecken\n5. Mit HalDo AI chatten',
                    category: 'ideas',
                    createdAt: Date.now() - 259200000,
                    updatedAt: Date.now() - 259200000,
                    favorite: false,
                    archived: false,
                    tags: ['planung', 'todo']
                }
            ];
            Storage.set('notes_data', sampleNotes);
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Notes App wird deinstalliert...');
        // Optional: Daten löschen
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
NotesApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.NotesApp = NotesApp;

console.log('📝 Notes App geladen – HalDo AI OS 24.6.0');
