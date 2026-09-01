/**
 * HALDO AI OS 24.6 – NOTES APP
 * Einfache Notizverwaltung
 */

const NotesApp = {
    id: 'notes',
    name: 'Notizen',
    icon: '📝',
    notes: [],
    container: null,
    
    open(params = {}) {
        console.log('📝 Notizen werden geöffnet...');
        this.notes = Storage.get('notes', []);
        
        const content = this.render();
        const windowEl = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 450,
            params.height || 500
        );
        
        if (windowEl) {
            this.container = windowEl.querySelector('.window-body');
            this.renderNotes();
            this.setupListeners();
        }
    },
    
    render() {
        return `
            <div style="padding:0;height:100%;display:flex;flex-direction:column;">
                <div style="display:flex;gap:8px;padding:12px;border-bottom:1px solid var(--glass-border);">
                    <input id="notes-input" type="text" placeholder="Neue Notiz..." style="
                        flex:1;
                        padding:8px 12px;
                        background:var(--glass-bg);
                        border:1px solid var(--glass-border);
                        border-radius:8px;
                        color:var(--text-primary);
                        font-family:var(--font-primary);
                        outline:none;
                    ">
                    <button id="notes-add" style="
                        padding:8px 16px;
                        background:var(--primary);
                        border:none;
                        border-radius:8px;
                        color:white;
                        cursor:pointer;
                    ">+ Hinzufügen</button>
                </div>
                <div id="notes-list" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;">
                    <!-- Notizen erscheinen hier -->
                </div>
            </div>
        `;
    },
    
    renderNotes() {
        const list = this.container?.querySelector('#notes-list');
        if (!list) return;
        
        if (this.notes.length === 0) {
            list.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:20px;">Keine Notizen vorhanden</p>`;
            return;
        }
        
        list.innerHTML = this.notes.map((note, index) => `
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                padding:10px 14px;
                background:var(--glass-bg);
                border-radius:8px;
                border:1px solid var(--glass-border);
                animation:fadeIn 0.2s ease;
            ">
                <span style="color:var(--text-primary);">${note}</span>
                <button onclick="NotesApp.deleteNote(${index})" style="
                    background:none;
                    border:none;
                    color:var(--text-muted);
                    cursor:pointer;
                    font-size:16px;
                ">✕</button>
            </div>
        `).join('');
    },
    
    setupListeners() {
        const input = this.container?.querySelector('#notes-input');
        const addBtn = this.container?.querySelector('#notes-add');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addNote());
        }
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.addNote();
            });
        }
    },
    
    addNote() {
        const input = this.container?.querySelector('#notes-input');
        if (!input) return;
        
        const text = input.value.trim();
        if (!text) return;
        
        this.notes.push(text);
        Storage.set('notes', this.notes);
        input.value = '';
        this.renderNotes();
    },
    
    deleteNote(index) {
        this.notes.splice(index, 1);
        Storage.set('notes', this.notes);
        this.renderNotes();
    }
};

// Registrieren
if (typeof AppRegistry !== 'undefined') {
    AppRegistry.register({
        id: 'notes',
        name: 'Notizen',
        icon: '📝',
        category: 'Tools',
        description: 'Einfache Notizverwaltung',
        open: (params) => NotesApp.open(params)
    });
}

window.NotesApp = NotesApp;
