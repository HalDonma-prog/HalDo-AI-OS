/**
 * HALDO AI OS 24.6.0 – AI SONGWRITER APP
 * Professionelle App zum Schreiben, Korrigieren und Formulieren von Songtexten
 * Version: 1.0.0
 */

const AISongwriterApp = {
    // ---- APP-INFO ----
    id: 'ai-songwriter',
    name: 'AI Songwriter',
    icon: '✍️',
    category: 'music',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Songtexte schreiben, korrigieren und formulieren mit KI',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'write', // write | correct | brainstorm | saved
    currentText: '',
    savedTexts: [],
    selectedSaved: null,
    isGenerating: false,
    genre: 'pop',
    mood: 'happy',
    style: 'modern',
    title: 'Mein Song',
    characterLimit: 1000,
    
    // ---- GENRES ----
    genres: [
        { id: 'pop', label: '🎵 Pop', icon: '🎵' },
        { id: 'rock', label: '🎸 Rock', icon: '🎸' },
        { id: 'rap', label: '🎤 Rap', icon: '🎤' },
        { id: 'r&b', label: '🎶 R&B', icon: '🎶' },
        { id: 'country', label: '🤠 Country', icon: '🤠' },
        { id: 'electronic', label: '🎧 Electronic', icon: '🎧' },
        { id: 'jazz', label: '🎷 Jazz', icon: '🎷' },
        { id: 'classical', label: '🎻 Klassik', icon: '🎻' },
        { id: 'folk', label: '🪕 Folk', icon: '🪕' },
        { id: 'soul', label: '💜 Soul', icon: '💜' }
    ],
    
    // ---- MOODS ----
    moods: [
        { id: 'happy', label: '😊 Glücklich', icon: '😊' },
        { id: 'sad', label: '😢 Traurig', icon: '😢' },
        { id: 'angry', label: '😡 Wütend', icon: '😡' },
        { id: 'romantic', label: '💕 Romantisch', icon: '💕' },
        { id: 'motivational', label: '💪 Motivierend', icon: '💪' },
        { id: 'nostalgic', label: '🌅 Nostalgisch', icon: '🌅' },
        { id: 'dreamy', label: '🌙 Verträumt', icon: '🌙' },
        { id: 'energetic', label: '⚡ Energisch', icon: '⚡' },
        { id: 'dark', label: '🌑 Düster', icon: '🌑' },
        { id: 'playful', label: '🎈 Verspielt', icon: '🎈' }
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
            console.log('✍️ AI Songwriter App registriert');
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
        this.currentMode = params.mode || 'write';
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 580,
            params.height || 520
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
        this.savedTexts = Storage.get('songwriter_saved', []);
        this.genre = Storage.get('songwriter_genre', 'pop');
        this.mood = Storage.get('songwriter_mood', 'happy');
        this.style = Storage.get('songwriter_style', 'modern');
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('songwriter_saved', this.savedTexts);
        Storage.set('songwriter_genre', this.genre);
        Storage.set('songwriter_mood', this.mood);
        Storage.set('songwriter_style', this.style);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'write': return this.renderWrite();
            case 'correct': return this.renderCorrect();
            case 'brainstorm': return this.renderBrainstorm();
            case 'saved': return this.renderSaved();
            default: return this.renderWrite();
        }
    },
    
    // ---- SCHREIB-MODUS ----
    renderWrite() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'write' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('write')">✍️ Schreiben</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('correct')">🔧 Korrigieren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('brainstorm')">💡 Brainstorm</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('saved')">💾 Gespeichert</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="AISongwriterApp.generateText()">🤖 Generieren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="AISongwriterApp.saveText()">💾 Speichern</button>
                </div>
                
                <!-- Einstellungen -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));flex-wrap:wrap;">
                    <select class="haldo-input" style="font-size:10px;padding:2px 6px;width:100px;" onchange="AISongwriterApp.setGenre(this.value)">
                        ${this.genres.map(g => `
                            <option value="${g.id}" ${g.id === this.genre ? 'selected' : ''}>${g.label}</option>
                        `).join('')}
                    </select>
                    <select class="haldo-input" style="font-size:10px;padding:2px 6px;width:100px;" onchange="AISongwriterApp.setMood(this.value)">
                        ${this.moods.map(m => `
                            <option value="${m.id}" ${m.id === this.mood ? 'selected' : ''}>${m.label}</option>
                        `).join('')}
                    </select>
                    <input class="haldo-input" value="${this.title}" placeholder="Titel..." style="flex:1;font-size:11px;min-width:80px;" 
                        onchange="AISongwriterApp.title = this.value; AISongwriterApp.saveData();">
                    <span style="font-size:10px;color:var(--text-muted);">${this.currentText.length}/${this.characterLimit}</span>
                </div>
                
                <!-- Editor -->
                <div style="flex:1;padding:4px;">
                    <textarea id="song-text-editor" class="haldo-input" style="
                        width:100%;
                        height:100%;
                        font-family:monospace;
                        font-size:14px;
                        line-height:1.6;
                        resize:none;
                        background:rgba(0,0,0,0.1);
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        border-radius:6px;
                        padding:8px;
                        color:var(--text-primary);
                    " oninput="AISongwriterApp.currentText = this.value; AISongwriterApp.updateCounter()">${this.currentText}</textarea>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>✍️ ${this.genres.find(g => g.id === this.genre)?.label || 'Pop'} • ${this.moods.find(m => m.id === this.mood)?.label || 'Glücklich'}</span>
                    <span>📊 ${this.savedTexts.length} gespeichert</span>
                </div>
            </div>
        `;
    },
    
    // ---- KORRIGIEREN ----
    renderCorrect() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('write')">✍️ Schreiben</button>
                    <button class="haldo-btn ${this.currentMode === 'correct' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('correct')">🔧 Korrigieren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('brainstorm')">💡 Brainstorm</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('saved')">💾 Gespeichert</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="AISongwriterApp.correctText()">🔧 Korrigieren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="AISongwriterApp.formatText()">📝 Formatieren</button>
                </div>
                
                <!-- Vorschläge -->
                <div style="padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));font-size:10px;color:var(--text-muted);">
                    💡 Korrekturvorschläge für deinen Text
                </div>
                
                <!-- Editor + Vorschläge -->
                <div style="flex:1;display:flex;gap:4px;padding:4px;overflow:hidden;">
                    <div style="flex:1;display:flex;flex-direction:column;">
                        <div style="font-size:10px;color:var(--text-muted);padding:2px 4px;">Original</div>
                        <textarea id="song-original-text" class="haldo-input" style="
                            flex:1;
                            font-family:monospace;
                            font-size:14px;
                            line-height:1.6;
                            resize:none;
                            background:rgba(0,0,0,0.1);
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            border-radius:6px;
                            padding:8px;
                            color:var(--text-primary);
                            min-height:100px;
                        ">${this.currentText}</textarea>
                    </div>
                    <div style="flex:1;display:flex;flex-direction:column;">
                        <div style="font-size:10px;color:var(--text-muted);padding:2px 4px;">Korrigiert</div>
                        <div id="corrected-result" style="
                            flex:1;
                            font-family:monospace;
                            font-size:14px;
                            line-height:1.6;
                            background:rgba(0,0,0,0.1);
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            border-radius:6px;
                            padding:8px;
                            color:var(--text-primary);
                            overflow-y:auto;
                            min-height:100px;
                        ">
                            ${this.correctionResult || 'Klicke auf "Korrigieren" für Vorschläge'}
                        </div>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🔧 Korrektur-Modus</span>
                    <span>${this.currentText.length} Zeichen</span>
                </div>
            </div>
        `;
    },
    
    // ---- BRAINSTORM ----
    renderBrainstorm() {
        const ideas = [
            { title: '🎵 Liebe', icon: '💕', desc: 'Ein Song über die große Liebe' },
            { title: '🌅 Freiheit', icon: '🕊️', desc: 'Die Welt entdecken und frei sein' },
            { title: '💪 Stärke', icon: '⚡', desc: 'Kämpfen und niemals aufgeben' },
            { title: '🌙 Träume', icon: '🌙', desc: 'Verfolge deine Träume' },
            { title: '💔 Herzschmerz', icon: '💔', desc: 'Eine zerbrochene Liebe' },
            { title: '🌍 Weltfrieden', icon: '☮️', desc: 'Hoffnung für die Welt' },
            { title: '🎉 Feiern', icon: '🎉', desc: 'Das Leben genießen' },
            { title: '🌀 Veränderung', icon: '🌀', desc: 'Alles wird anders' }
        ];
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('write')">✍️ Schreiben</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('correct')">🔧 Korrigieren</button>
                    <button class="haldo-btn ${this.currentMode === 'brainstorm' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('brainstorm')">💡 Brainstorm</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('saved')">💾 Gespeichert</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="AISongwriterApp.generateIdeas()">🔄 Neue Ideen</button>
                </div>
                
                <!-- Ideen -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                    ${ideas.map(idea => `
                        <div style="
                            padding:12px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            cursor:pointer;
                            transition: all 0.15s ease;
                            text-align:center;
                        " onclick="AISongwriterApp.useIdea('${idea.title}')">
                            <div style="font-size:32px;">${idea.icon}</div>
                            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-top:4px;">${idea.title}</div>
                            <div style="font-size:10px;color:var(--text-secondary);">${idea.desc}</div>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:2px 6px;margin-top:6px;">📝 Verwenden</button>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>💡 Brainstorm-Modus</span>
                    <span>💡 Klicke auf eine Idee zum Verwenden</span>
                </div>
            </div>
        `;
    },
    
    // ---- GESPEICHERT ----
    renderSaved() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('write')">✍️ Schreiben</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('correct')">🔧 Korrigieren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('brainstorm')">💡 Brainstorm</button>
                    <button class="haldo-btn ${this.currentMode === 'saved' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="AISongwriterApp.setMode('saved')">💾 Gespeichert</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="AISongwriterApp.exportAll()">📤 Alle exportieren</button>
                </div>
                
                <!-- Liste -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.savedTexts.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:var(--text-muted);">
                            <div style="font-size:48px;">💾</div>
                            <p style="font-size:13px;">Keine gespeicherten Texte</p>
                            <button class="haldo-btn" style="font-size:12px;margin-top:8px;" onclick="AISongwriterApp.setMode('write')">✍️ Ersten Text schreiben</button>
                        </div>
                    ` : `
                        ${this.savedTexts.map((text, index) => `
                            <div style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: ${this.selectedSaved === index ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                border-radius:8px;
                                border:1px solid ${this.selectedSaved === index ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                cursor:pointer;
                                transition: all 0.15s ease;
                            " onclick="AISongwriterApp.selectSaved(${index})">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${text.title || 'Unbenannt'}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">${text.genre || 'Pop'} • ${text.mood || 'Glücklich'}</div>
                                        <div style="font-size:9px;color:var(--text-muted);">${new Date(text.savedAt).toLocaleString()}</div>
                                    </div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();AISongwriterApp.loadText(${index})">📂</button>
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();AISongwriterApp.exportText(${index})">📤</button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();AISongwriterApp.deleteSaved(${index})">✕</button>
                                    </div>
                                </div>
                                <div style="font-size:10px;color:var(--text-secondary);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">
                                    ${text.text.substring(0, 100)}${text.text.length > 100 ? '...' : ''}
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>💾 ${this.savedTexts.length} gespeicherte Texte</span>
                    <span>📝 ${this.savedTexts.reduce((sum, t) => sum + t.text.length, 0)} Zeichen total</span>
                </div>
            </div>
        `;
    },
    
    // ---- FUNKTIONEN ----
    setMode(mode) {
        this.currentMode = mode;
        this.updateView();
    },
    
    setGenre(genre) {
        this.genre = genre;
        this.saveData();
        this.updateView();
    },
    
    setMood(mood) {
        this.mood = mood;
        this.saveData();
        this.updateView();
    },
    
    updateCounter() {
        const editor = document.getElementById('song-text-editor');
        if (editor) {
            this.currentText = editor.value;
        }
        this.updateView();
    },
    
    // ---- KI-TEXT GENERIEREN ----
    async generateText() {
        if (this.isGenerating) return;
        
        const prompt = `Schreibe einen Songtext im Genre "${this.genre}" mit der Stimmung "${this.mood}". 
        Der Text sollte eine Strophe (4 Zeilen) und einen Refrain (4 Zeilen) enthalten.
        Thema: ${this.title || 'Liebe, Hoffnung und Träume'}
        Stil: Modern, eingängig, emotional.`;
        
        this.isGenerating = true;
        this.updateView();
        
        const loadingEl = document.getElementById('song-text-editor');
        if (loadingEl) {
            loadingEl.value = '🤖 HalDo schreibt einen Song...\n\n';
            loadingEl.value += 'Generiere Text...';
        }
        
        try {
            let result = '';
            
            // Versuche KI zu verwenden
            if (typeof AICore !== 'undefined' && AICore.hasValidKey()) {
                result = await AICore.simpleChat(prompt);
            } else {
                // Fallback: Vorgefertigte Texte
                result = this.getFallbackText();
            }
            
            this.currentText = result;
            this.characterLimit = Math.max(1000, result.length + 100);
            
            const editor = document.getElementById('song-text-editor');
            if (editor) {
                editor.value = result;
            }
            
            EventBus.emit('songwriter:generated', { title: this.title, genre: this.genre });
            
        } catch (error) {
            console.error('❌ Textgenerierung fehlgeschlagen:', error);
            const editor = document.getElementById('song-text-editor');
            if (editor) {
                editor.value = '❌ Fehler bei der Generierung. Bitte versuche es später erneut.';
            }
        }
        
        this.isGenerating = false;
        this.updateView();
    },
    
    getFallbackText() {
        const texts = [
            `🎵 ${this.title || 'Mein Song'} 🎵

Strophe 1:
In der Stille der Nacht, wo die Sterne erwachen,
Finde ich deinen Blick, der mein Herz zum Lachen bringt.
Jeder Moment mit dir ist ein Geschenk der Ewigkeit,
Deine Liebe ist der Kompass, der mich durch die Dunkelheit führt.

Refrain:
Oh, du bist mein Licht, mein Herz, mein Zuhause,
In deinen Armen finde ich den Frieden, den ich suche.
Durch alle Stürme, durch jede Zeit,
Bleibe ich an deiner Seite, für die Ewigkeit.

Strophe 2:
Die Welt ist voller Farben, doch du bist mein Regenbogen,
Deine Worte sind die Melodie, die mein Herz berührt.
Mit dir möchte ich jeden Augenblick teilen,
Bis der letzte Stern am Himmel erlischt.

Refrain:
Oh, du bist mein Licht, mein Herz, mein Zuhause,
In deinen Armen finde ich den Frieden, den ich suche.
Durch alle Stürme, durch jede Zeit,
Bleibe ich an deiner Seite, für die Ewigkeit.`,
            `🎵 ${this.title || 'Unser Weg'} 🎵

Strophe 1:
Die Straßen sind leer, der Himmel so weit,
Wir gehen unseren Weg, bereit für die Zeit.
Keine Grenzen, keine Regeln, nur wir zwei,
Die Welt gehört uns, das ist unser Gesetz.

Refrain:
Wir sind unbesiegbar, wenn wir gemeinsam gehen,
Kein Berg zu hoch, kein Meer zu weit.
Mit dir an meiner Seite kann ich alles erreichen,
Unser Weg ist grenzenlos, für immer und alle Zeit.

Strophe 2:
Die Sonne geht auf, ein neuer Tag beginnt,
Mit dir an meiner Seite ist alles möglich.
Wir träumen von einer besseren Welt,
In der Liebe und Hoffnung für immer bestehen.

Refrain:
Wir sind unbesiegbar, wenn wir gemeinsam gehen,
Kein Berg zu hoch, kein Meer zu weit.
Mit dir an meiner Seite kann ich alles erreichen,
Unser Weg ist grenzenlos, für immer und alle Zeit.`
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    },
    
    // ---- KORRIGIEREN ----
    async correctText() {
        const original = document.getElementById('song-original-text')?.value || this.currentText;
        if (!original) {
            alert('⚠️ Bitte zuerst einen Text einfügen.');
            return;
        }
        
        const result = document.getElementById('corrected-result');
        if (result) {
            result.textContent = '🤖 Korrigiere Text...';
        }
        
        try {
            let corrected = '';
            if (typeof AICore !== 'undefined' && AICore.hasValidKey()) {
                const prompt = `Korrigiere den folgenden Songtext: Rechtschreibung, Grammatik, Stil und Formulierung. 
                Verbessere den Text, aber verändere nicht den Inhalt.\n\n${original}`;
                corrected = await AICore.simpleChat(prompt);
            } else {
                // Einfache Korrektur (simuliert)
                corrected = original
                    .replace(/ich/g, 'Ich')
                    .replace(/du/g, 'Du')
                    .replace(/wir/g, 'Wir')
                    .replace(/  +/g, ' ')
                    .trim();
            }
            
            if (result) {
                result.textContent = corrected;
            }
            
            this.correctionResult = corrected;
            
        } catch (error) {
            console.error('❌ Korrektur fehlgeschlagen:', error);
            if (result) {
                result.textContent = '❌ Fehler bei der Korrektur. Bitte versuche es später erneut.';
            }
        }
    },
    
    formatText() {
        const original = document.getElementById('song-original-text')?.value || this.currentText;
        if (!original) {
            alert('⚠️ Bitte zuerst einen Text einfügen.');
            return;
        }
        
        const formatted = original
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n\n');
        
        const result = document.getElementById('corrected-result');
        if (result) {
            result.textContent = formatted;
        }
        this.correctionResult = formatted;
    },
    
    // ---- BRAINSTORM ----
    generateIdeas() {
        const ideas = [
            { title: '🎵 Liebe', icon: '💕', desc: 'Ein Song über die große Liebe' },
            { title: '🌅 Freiheit', icon: '🕊️', desc: 'Die Welt entdecken und frei sein' },
            { title: '💪 Stärke', icon: '⚡', desc: 'Kämpfen und niemals aufgeben' },
            { title: '🌙 Träume', icon: '🌙', desc: 'Verfolge deine Träume' },
            { title: '💔 Herzschmerz', icon: '💔', desc: 'Eine zerbrochene Liebe' },
            { title: '🌍 Weltfrieden', icon: '☮️', desc: 'Hoffnung für die Welt' },
            { title: '🎉 Feiern', icon: '🎉', desc: 'Das Leben genießen' },
            { title: '🌀 Veränderung', icon: '🌀', desc: 'Alles wird anders' }
        ];
        
        // Shuffle und neu anzeigen
        this.updateView();
    },
    
    useIdea(title) {
        this.title = title.replace(/[🎵🌅💪🌙💔🌍🎉🌀]/g, '').trim();
        if (this.title) {
            this.saveData();
            this.setMode('write');
            const input = document.querySelector('#song-text-editor');
            if (input) {
                input.focus();
            }
        }
    },
    
    // ---- SPEICHERN ----
    saveText() {
        const text = document.getElementById('song-text-editor')?.value || this.currentText;
        if (!text || text.length < 10) {
            alert('⚠️ Bitte zuerst einen Text schreiben oder generieren.');
            return;
        }
        
        const title = prompt('📝 Titel für den Song:', this.title || 'Mein Song');
        if (title === null) return;
        
        this.savedTexts.push({
            title: title || 'Unbenannt',
            text: text,
            genre: this.genre,
            mood: this.mood,
            savedAt: Date.now()
        });
        
        this.saveData();
        this.updateView();
        alert('✅ Text gespeichert!');
        EventBus.emit('songwriter:saved', { title });
    },
    
    loadText(index) {
        const text = this.savedTexts[index];
        if (!text) return;
        
        this.currentText = text.text;
        this.title = text.title || 'Mein Song';
        this.genre = text.genre || 'pop';
        this.mood = text.mood || 'happy';
        this.selectedSaved = index;
        
        this.saveData();
        this.setMode('write');
        
        const editor = document.getElementById('song-text-editor');
        if (editor) {
            editor.value = text.text;
        }
    },
    
    selectSaved(index) {
        this.selectedSaved = this.selectedSaved === index ? null : index;
        this.updateView();
    },
    
    deleteSaved(index) {
        if (!confirm('Text wirklich löschen?')) return;
        this.savedTexts.splice(index, 1);
        this.selectedSaved = null;
        this.saveData();
        this.updateView();
    },
    
    exportText(index) {
        const text = this.savedTexts[index];
        if (!text) return;
        
        const content = `Titel: ${text.title}\nGenre: ${text.genre}\nStimmung: ${text.mood}\nDatum: ${new Date(text.savedAt).toLocaleString()}\n\n${text.text}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${text.title || 'song'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    exportAll() {
        if (this.savedTexts.length === 0) {
            alert('⚠️ Keine Texte zum Exportieren.');
            return;
        }
        
        const content = this.savedTexts.map((text, i) => {
            return `[${i+1}] ${text.title}\nGenre: ${text.genre}\nStimmung: ${text.mood}\nDatum: ${new Date(text.savedAt).toLocaleString()}\n\n${text.text}\n${'='.repeat(50)}\n`;
        }).join('\n');
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alle_songtexte_${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
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
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.saveText();
                }
                if (e.ctrlKey && e.key === 'g') {
                    e.preventDefault();
                    this.generateText();
                }
                if (e.ctrlKey && e.key === 'c') {
                    e.preventDefault();
                    this.correctText();
                }
                if (e.key === 'Escape') {
                    this.setMode('write');
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('✍️ AI Songwriter App wird installiert...');
        this.loadData();
        return true;
    },
    
    uninstall() {
        console.log('🗑️ AI Songwriter App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
AISongwriterApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.AISongwriterApp = AISongwriterApp;

console.log('✍️ AI Songwriter App geladen – HalDo AI OS 24.6.0');
