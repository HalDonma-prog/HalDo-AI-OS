/**
 * HALDO AI OS 24.6.0 – AI VIDEO GENERATOR
 * Professionelle App zur Generierung von Videos aus Textbeschreibungen
 * Version: 1.0.0
 */

const AIVideoGeneratorApp = {
    // ---- APP-INFO ----
    id: 'ai-video-generator',
    name: 'AI Video Generator',
    icon: '🤖',
    category: 'ai',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Videos aus Textbeschreibungen mit KI generieren',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'generate', // generate | gallery | settings
    isGenerating: false,
    generatedVideos: [],
    selectedVideo: null,
    
    // ---- PARAMETER ----
    prompt: '',
    style: 'realistic',
    duration: 5,
    resolution: '1080p',
    aspectRatio: '16:9',
    camera: 'static',
    mood: 'neutral',
    colors: 'vibrant',
    
    // ---- STILE ----
    styles: [
        { id: 'realistic', label: '🎥 Realistisch', desc: 'Realistischer Film-Look' },
        { id: 'cinematic', label: '🎬 Cinematic', desc: 'Kinematografischer Stil' },
        { id: 'anime', label: '🎨 Anime', desc: 'Japanischer Animationsstil' },
        { id: 'cartoon', label: '✏️ Cartoon', desc: 'Comic- und Cartoon-Stil' },
        { id: 'painting', label: '🖌️ Malerei', desc: 'Gemälde-Stil' },
        { id: '3d', label: '🎮 3D', desc: '3D-Animation' },
        { id: 'vintage', label: '📻 Vintage', desc: 'Alter Film-Look' },
        { id: 'cyberpunk', label: '🌆 Cyberpunk', desc: 'Cyberpunk-Ästhetik' },
        { id: 'fantasy', label: '🐉 Fantasy', desc: 'Fantasy-Welt' },
        { id: 'space', label: '🚀 Space', desc: 'Weltraum-Design' }
    ],
    
    // ---- KAMERA-OPTIONEN ----
    cameraOptions: [
        { id: 'static', label: '📷 Statisch', desc: 'Feste Kamera' },
        { id: 'pan', label: '🔄 Schwenk', desc: 'Seitlicher Schwenk' },
        { id: 'zoom', label: '🔍 Zoom', desc: 'Ein-/Auszoomen' },
        { id: 'orbit', label: '🌐 Orbit', desc: 'Kreisbewegung' },
        { id: 'drone', label: '🚁 Drohne', desc: 'Drohnenperspektive' },
        { id: 'follow', label: '👤 Follow', desc: 'Verfolgt das Objekt' }
    ],
    
    // ---- MOODS ----
    moods: [
        { id: 'neutral', label: '😐 Neutral', icon: '😐' },
        { id: 'happy', label: '😊 Fröhlich', icon: '😊' },
        { id: 'dramatic', label: '🎭 Dramatisch', icon: '🎭' },
        { id: 'mysterious', label: '🔮 Mystisch', icon: '🔮' },
        { id: 'romantic', label: '💕 Romantisch', icon: '💕' },
        { id: 'epic', label: '⚡ Episch', icon: '⚡' },
        { id: 'calm', label: '🌊 Ruhig', icon: '🌊' },
        { id: 'energetic', label: '⚡ Energisch', icon: '⚡' }
    ],
    
    // ---- GENERIERTE VIDEOS (MOCK) ----
    mockVideos: [
        { id: 'vid1', title: 'Berglandschaft bei Sonnenuntergang', style: 'realistic', prompt: 'Eine atemberaubende Berglandschaft mit goldenem Sonnenlicht', duration: 5, date: Date.now() - 3600000, thumbnail: '🏔️' },
        { id: 'vid2', title: 'Cyberpunk City Night', style: 'cyberpunk', prompt: 'Eine futuristische Cyberpunk-Stadt bei Nacht mit Neonlichtern', duration: 8, date: Date.now() - 7200000, thumbnail: '🌆' },
        { id: 'vid3', title: 'Animierte Fantasiewelt', style: 'fantasy', prompt: 'Eine magische Fantasiewelt mit schwebenden Inseln', duration: 6, date: Date.now() - 14400000, thumbnail: '🐉' },
        { id: 'vid4', title: 'Weltraum-Reise', style: 'space', prompt: 'Eine Reise durch den Weltraum vorbei an Planeten und Galaxien', duration: 10, date: Date.now() - 28800000, thumbnail: '🚀' }
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
            console.log('🤖 AI Video Generator App registriert');
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
        this.currentMode = params.mode || 'generate';
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 620,
            params.height || 540
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
        this.generatedVideos = Storage.get('ai_videos', this.mockVideos);
        this.style = Storage.get('ai_video_style', 'realistic');
        this.duration = Storage.get('ai_video_duration', 5);
        this.resolution = Storage.get('ai_video_resolution', '1080p');
        this.aspectRatio = Storage.get('ai_video_aspect', '16:9');
        this.camera = Storage.get('ai_video_camera', 'static');
        this.mood = Storage.get('ai_video_mood', 'neutral');
        this.colors = Storage.get('ai_video_colors', 'vibrant');
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('ai_videos', this.generatedVideos);
        Storage.set('ai_video_style', this.style);
        Storage.set('ai_video_duration', this.duration);
        Storage.set('ai_video_resolution', this.resolution);
        Storage.set('ai_video_aspect', this.aspectRatio);
        Storage.set('ai_video_camera', this.camera);
        Storage.set('ai_video_mood', this.mood);
        Storage.set('ai_video_colors', this.colors);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'generate': return this.renderGenerate();
            case 'gallery': return this.renderGallery();
            case 'settings': return this.renderSettings();
            default: return this.renderGenerate();
        }
    },
    
    // ---- GENERIEREN ----
    renderGenerate() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'generate' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="AIVideoGeneratorApp.setMode('generate')">🤖 Generieren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AIVideoGeneratorApp.setMode('gallery')">🎬 Galerie</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AIVideoGeneratorApp.setMode('settings')">⚙️ Einstellungen</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="AIVideoGeneratorApp.generateVideo()" id="ai-generate-btn">
                        ${this.isGenerating ? '⏳ Generiere...' : '🚀 Generieren'}
                    </button>
                </div>
                
                <!-- Prompt -->
                <div style="padding:8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));">
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        <textarea id="ai-prompt-input" class="haldo-input" placeholder="Beschreibe das Video, das du generieren möchtest..." style="
                            flex:1;
                            min-height:60px;
                            font-size:13px;
                            resize:vertical;
                            font-family:var(--font-primary);
                        ">${this.prompt}</textarea>
                    </div>
                    <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;">
                        <span style="font-size:9px;color:var(--text-muted);">💡 Beispiele: "Eine Reise durch den Weltraum", "Tanzende Blumen im Wind", "Futuristische Stadt bei Nacht"</span>
                    </div>
                </div>
                
                <!-- Parameter -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));flex-wrap:wrap;">
                    <select class="haldo-input" style="font-size:10px;padding:2px 6px;flex:1;min-width:80px;" onchange="AIVideoGeneratorApp.style = this.value; AIVideoGeneratorApp.saveData();">
                        ${this.styles.map(s => `
                            <option value="${s.id}" ${s.id === this.style ? 'selected' : ''}>${s.label}</option>
                        `).join('')}
                    </select>
                    <select class="haldo-input" style="font-size:10px;padding:2px 6px;flex:1;min-width:80px;" onchange="AIVideoGeneratorApp.mood = this.value; AIVideoGeneratorApp.saveData();">
                        ${this.moods.map(m => `
                            <option value="${m.id}" ${m.id === this.mood ? 'selected' : ''}>${m.label}</option>
                        `).join('')}
                    </select>
                    <select class="haldo-input" style="font-size:10px;padding:2px 6px;flex:1;min-width:80px;" onchange="AIVideoGeneratorApp.camera = this.value; AIVideoGeneratorApp.saveData();">
                        ${this.cameraOptions.map(c => `
                            <option value="${c.id}" ${c.id === this.camera ? 'selected' : ''}>${c.label}</option>
                        `).join('')}
                    </select>
                    <input class="haldo-input" type="number" value="${this.duration}" min="3" max="60" style="width:60px;font-size:10px;" 
                        onchange="AIVideoGeneratorApp.duration = parseInt(this.value); AIVideoGeneratorApp.saveData();">
                    <span style="font-size:9px;color:var(--text-muted);display:flex;align-items:center;">Sek.</span>
                </div>
                
                <!-- Vorschau / Ergebnis -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    <div style="
                        aspect-ratio:16/9;
                        background:rgba(0,0,0,0.3);
                        border-radius:8px;
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        ${this.isGenerating ? 'position:relative;' : ''}
                    ">
                        ${this.isGenerating ? `
                            <div style="text-align:center;">
                                <div style="font-size:48px;">🎬</div>
                                <div style="font-size:16px;color:var(--text-primary);margin-top:8px;">Generiere Video...</div>
                                <div style="width:200px;height:4px;background:var(--glass-border);border-radius:10px;margin-top:12px;overflow:hidden;">
                                    <div id="ai-video-progress" style="width:0%;height:100%;background:var(--primary);border-radius:10px;transition:width 0.3s ease;"></div>
                                </div>
                                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${this.style} • ${this.duration}s</div>
                            </div>
                        ` : this.prompt ? `
                            <div style="text-align:center;padding:20px;">
                                <div style="font-size:48px;">🎬</div>
                                <div style="font-size:14px;color:var(--text-secondary);margin-top:8px;">Bereit für die Generierung</div>
                                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">"${this.prompt.substring(0, 50)}${this.prompt.length > 50 ? '...' : ''}"</div>
                                <div style="display:flex;gap:4px;justify-content:center;margin-top:8px;flex-wrap:wrap;">
                                    <span style="font-size:9px;color:var(--text-muted);padding:2px 6px;background:var(--glass-bg);border-radius:4px;">${this.styles.find(s => s.id === this.style)?.label || 'Realistisch'}</span>
                                    <span style="font-size:9px;color:var(--text-muted);padding:2px 6px;background:var(--glass-bg);border-radius:4px;">${this.duration}s</span>
                                    <span style="font-size:9px;color:var(--text-muted);padding:2px 6px;background:var(--glass-bg);border-radius:4px;">${this.cameraOptions.find(c => c.id === this.camera)?.label || 'Statisch'}</span>
                                </div>
                            </div>
                        ` : `
                            <div style="text-align:center;padding:20px;">
                                <div style="font-size:48px;">🤖</div>
                                <div style="font-size:16px;color:var(--text-secondary);margin-top:8px;">Beschreibe dein Video</div>
                                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Gib eine Beschreibung ein und klicke auf "Generieren"</div>
                            </div>
                        `}
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🤖 ${this.generatedVideos.length} generierte Videos</span>
                    <span>${this.resolution} • ${this.aspectRatio}</span>
                </div>
            </div>
        `;
    },
    
    // ---- GALERIE ----
    renderGallery() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AIVideoGeneratorApp.setMode('generate')">🤖 Generieren</button>
                    <button class="haldo-btn ${this.currentMode === 'gallery' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="AIVideoGeneratorApp.setMode('gallery')">🎬 Galerie</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AIVideoGeneratorApp.setMode('settings')">⚙️ Einstellungen</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="AIVideoGeneratorApp.clearGallery()">🗑️ Alle löschen</button>
                </div>
                
                <!-- Videos -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.generatedVideos.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:var(--text-muted);">
                            <div style="font-size:48px;">🎬</div>
                            <p style="font-size:13px;">Noch keine Videos generiert</p>
                            <button class="haldo-btn" style="font-size:12px;margin-top:8px;" onclick="AIVideoGeneratorApp.setMode('generate')">🤖 Erstes Video generieren</button>
                        </div>
                    ` : `
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
                            ${this.generatedVideos.map(video => `
                                <div style="
                                    padding:10px;
                                    background: var(--glass-bg, rgba(255,255,255,0.04));
                                    border-radius:8px;
                                    border:1px solid ${this.selectedVideo === video.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                    cursor:pointer;
                                    transition: all 0.15s ease;
                                " onclick="AIVideoGeneratorApp.selectVideo('${video.id}')">
                                    <div style="aspect-ratio:16/9;background:rgba(0,0,0,0.3);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:48px;">
                                        ${video.thumbnail || '🎬'}
                                    </div>
                                    <div style="margin-top:6px;">
                                        <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${video.title}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">${video.style} • ${video.duration}s</div>
                                        <div style="font-size:9px;color:var(--text-muted);">${new Date(video.date).toLocaleDateString()}</div>
                                    </div>
                                    <div style="display:flex;gap:4px;margin-top:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();AIVideoGeneratorApp.previewVideo('${video.id}')">👁️</button>
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();AIVideoGeneratorApp.exportVideo('${video.id}')">📤</button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();AIVideoGeneratorApp.deleteVideo('${video.id}')">✕</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🎬 ${this.generatedVideos.length} Videos</span>
                    <span>🤖 KI-generiert</span>
                </div>
            </div>
        `;
    },
    
    // ---- EINSTELLUNGEN ----
    renderSettings() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AIVideoGeneratorApp.setMode('generate')">🤖 Generieren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="AIVideoGeneratorApp.setMode('gallery')">🎬 Galerie</button>
                    <button class="haldo-btn ${this.currentMode === 'settings' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="AIVideoGeneratorApp.setMode('settings')">⚙️ Einstellungen</button>
                </div>
                
                <!-- Einstellungen -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                            <label style="font-size:12px;font-weight:600;color:var(--text-primary);">🎨 Stil</label>
                            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:4px;">
                                ${this.styles.map(s => `
                                    <div style="
                                        padding:4px 8px;
                                        background: ${this.style === s.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                        border-radius:4px;
                                        border:1px solid ${this.style === s.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                        cursor:pointer;
                                        text-align:center;
                                        font-size:10px;
                                        color:${this.style === s.id ? 'white' : 'var(--text-secondary)'};
                                    " onclick="AIVideoGeneratorApp.style = '${s.id}'; AIVideoGeneratorApp.saveData(); AIVideoGeneratorApp.updateView();">
                                        ${s.label}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                            <label style="font-size:12px;font-weight:600;color:var(--text-primary);">📷 Kamera</label>
                            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:4px;">
                                ${this.cameraOptions.map(c => `
                                    <div style="
                                        padding:4px 8px;
                                        background: ${this.camera === c.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                        border-radius:4px;
                                        border:1px solid ${this.camera === c.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                        cursor:pointer;
                                        text-align:center;
                                        font-size:10px;
                                        color:${this.camera === c.id ? 'white' : 'var(--text-secondary)'};
                                    " onclick="AIVideoGeneratorApp.camera = '${c.id}'; AIVideoGeneratorApp.saveData(); AIVideoGeneratorApp.updateView();">
                                        ${c.label}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                            <label style="font-size:12px;font-weight:600;color:var(--text-primary);">🎭 Stimmung</label>
                            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;margin-top:4px;">
                                ${this.moods.map(m => `
                                    <div style="
                                        padding:4px 8px;
                                        background: ${this.mood === m.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                        border-radius:4px;
                                        border:1px solid ${this.mood === m.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                        cursor:pointer;
                                        text-align:center;
                                        font-size:10px;
                                        color:${this.mood === m.id ? 'white' : 'var(--text-secondary)'};
                                    " onclick="AIVideoGeneratorApp.mood = '${m.id}'; AIVideoGeneratorApp.saveData(); AIVideoGeneratorApp.updateView();">
                                        ${m.label}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                            <label style="font-size:12px;font-weight:600;color:var(--text-primary);">⏱️ Dauer (Sekunden)</label>
                            <input type="range" min="3" max="60" value="${this.duration}" style="width:100%;accent-color:var(--primary);" 
                                oninput="AIVideoGeneratorApp.duration = parseInt(this.value); AIVideoGeneratorApp.saveData(); document.getElementById('duration-display').textContent = this.value + 's';">
                            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);">
                                <span>3s</span>
                                <span id="duration-display">${this.duration}s</span>
                                <span>60s</span>
                            </div>
                        </div>
                        
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                            <label style="font-size:12px;font-weight:600;color:var(--text-primary);">📐 Auflösung</label>
                            <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;">
                                ${['480p', '720p', '1080p', '1440p', '4K'].map(res => `
                                    <div style="
                                        padding:4px 12px;
                                        background: ${this.resolution === res ? 'var(--primary, #6C3CE1)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                        border-radius:4px;
                                        border:1px solid ${this.resolution === res ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                        cursor:pointer;
                                        font-size:10px;
                                        color:${this.resolution === res ? 'white' : 'var(--text-secondary)'};
                                    " onclick="AIVideoGeneratorApp.resolution = '${res}'; AIVideoGeneratorApp.saveData(); AIVideoGeneratorApp.updateView();">
                                        ${res}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                            <label style="font-size:12px;font-weight:600;color:var(--text-primary);">📐 Seitenverhältnis</label>
                            <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;">
                                ${['16:9', '4:3', '1:1', '9:16', '21:9'].map(ratio => `
                                    <div style="
                                        padding:4px 12px;
                                        background: ${this.aspectRatio === ratio ? 'var(--primary, #6C3CE1)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                        border-radius:4px;
                                        border:1px solid ${this.aspectRatio === ratio ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                        cursor:pointer;
                                        font-size:10px;
                                        color:${this.aspectRatio === ratio ? 'white' : 'var(--text-secondary)'};
                                    " onclick="AIVideoGeneratorApp.aspectRatio = '${ratio}'; AIVideoGeneratorApp.saveData(); AIVideoGeneratorApp.updateView();">
                                        ${ratio}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>⚙️ Einstellungen</span>
                    <span>${this.generatedVideos.length} Videos generiert</span>
                </div>
            </div>
        `;
    },
    
    // ---- VIDEO GENERIEREN ----
    generateVideo() {
        if (this.isGenerating) return;
        
        const prompt = document.getElementById('ai-prompt-input')?.value;
        if (!prompt || prompt.trim().length < 5) {
            alert('⚠️ Bitte eine ausführlichere Beschreibung eingeben (mindestens 5 Zeichen).');
            return;
        }
        
        this.prompt = prompt.trim();
        this.isGenerating = true;
        this.saveData();
        this.updateView();
        
        // Fortschritt simulieren
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 8 + 2;
            const bar = document.getElementById('ai-video-progress');
            if (bar) {
                bar.style.width = Math.min(progress, 100) + '%';
            }
            if (progress >= 100) {
                clearInterval(interval);
                this.isGenerating = false;
                
                // Video speichern
                const style = this.styles.find(s => s.id === this.style);
                const newVideo = {
                    id: 'vid_' + Date.now().toString(36),
                    title: this.prompt.substring(0, 30) + (this.prompt.length > 30 ? '...' : ''),
                    style: this.style,
                    prompt: this.prompt,
                    duration: this.duration,
                    date: Date.now(),
                    thumbnail: this.getRandomThumbnail(),
                    resolution: this.resolution,
                    aspectRatio: this.aspectRatio,
                    camera: this.camera,
                    mood: this.mood
                };
                this.generatedVideos.unshift(newVideo);
                this.saveData();
                this.updateView();
                
                alert('✅ Video erfolgreich generiert!\n\n' + 
                      'Titel: ' + newVideo.title + '\n' +
                      'Stil: ' + (style ? style.label : this.style) + '\n' +
                      'Dauer: ' + this.duration + 's');
                
                EventBus.emit('ai-video:generated', { id: newVideo.id });
            }
        }, 300);
    },
    
    // ---- GALERIE FUNKTIONEN ----
    selectVideo(videoId) {
        this.selectedVideo = this.selectedVideo === videoId ? null : videoId;
        this.updateView();
    },
    
    previewVideo(videoId) {
        const video = this.generatedVideos.find(v => v.id === videoId);
        if (!video) return;
        
        const style = this.styles.find(s => s.id === video.style);
        
        const content = `
            <div style="text-align:center;padding:12px;">
                <div style="aspect-ratio:16/9;background:rgba(0,0,0,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:64px;">
                    ${video.thumbnail || '🎬'}
                </div>
                <div style="margin-top:8px;">
                    <div style="font-size:16px;font-weight:600;color:var(--text-primary);">${video.title}</div>
                    <div style="font-size:12px;color:var(--text-secondary);">${style ? style.label : video.style} • ${video.duration}s</div>
                    <div style="font-size:10px;color:var(--text-muted);">${new Date(video.date).toLocaleString()}</div>
                    <div style="margin-top:8px;padding:8px;background:var(--glass-bg);border-radius:4px;font-size:11px;color:var(--text-secondary);text-align:left;">
                        <strong>Prompt:</strong> ${video.prompt}
                    </div>
                    <div style="display:flex;gap:4px;justify-content:center;margin-top:8px;flex-wrap:wrap;">
                        <span style="font-size:9px;color:var(--text-muted);padding:2px 6px;background:var(--glass-bg);border-radius:4px;">📐 ${video.resolution || '1080p'}</span>
                        <span style="font-size:9px;color:var(--text-muted);padding:2px 6px;background:var(--glass-bg);border-radius:4px;">📐 ${video.aspectRatio || '16:9'}</span>
                        <span style="font-size:9px;color:var(--text-muted);padding:2px 6px;background:var(--glass-bg);border-radius:4px;">🎭 ${video.mood || 'neutral'}</span>
                    </div>
                    <div style="display:flex;gap:4px;justify-content:center;margin-top:8px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="window.close()">Schließen</button>
                        <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="alert('📤 Video wird exportiert...')">📤 Export</button>
                    </div>
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'video-preview',
            '🎬 ' + video.title,
            content,
            '🎬',
            450,
            400
        );
    },
    
    exportVideo(videoId) {
        const video = this.generatedVideos.find(v => v.id === videoId);
        if (!video) return;
        
        // Simulierter Export
        const content = `Video: ${video.title}\nStil: ${video.style}\nDauer: ${video.duration}s\nPrompt: ${video.prompt}\nDatum: ${new Date(video.date).toLocaleString()}\n\n🤖 Generiert mit HalDo AI Video Generator`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${video.title || 'video'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('📤 Video-Info exportiert!');
    },
    
    deleteVideo(videoId) {
        if (!confirm('Video wirklich löschen?')) return;
        this.generatedVideos = this.generatedVideos.filter(v => v.id !== videoId);
        this.saveData();
        this.updateView();
    },
    
    clearGallery() {
        if (this.generatedVideos.length === 0) return;
        if (!confirm('Alle Videos wirklich löschen?')) return;
        this.generatedVideos = [];
        this.saveData();
        this.updateView();
    },
    
    // ---- MODUS ----
    setMode(mode) {
        this.currentMode = mode;
        this.updateView();
    },
    
    // ---- HELPER ----
    getRandomThumbnail() {
        const thumbnails = ['🎬', '🎥', '🎞️', '📹', '🎦', '📽️', '🌅', '🌌', '🏔️', '🌊', '🌆', '🌠'];
        return thumbnails[Math.floor(Math.random() * thumbnails.length)];
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
        if (this.window) {
            this.window.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.generateVideo();
                }
                if (e.key === 'Escape') {
                    this.setMode('generate');
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🤖 AI Video Generator App wird installiert...');
        this.loadData();
        if (this.generatedVideos.length === 0) {
            this.generatedVideos = this.mockVideos;
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ AI Video Generator App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
AIVideoGeneratorApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.AIVideoGeneratorApp = AIVideoGeneratorApp;

console.log('🤖 AI Video Generator App geladen – HalDo AI OS 24.6.0');
