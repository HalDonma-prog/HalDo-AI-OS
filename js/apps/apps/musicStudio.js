/**
 * HALDO AI OS 24.6.0 – MUSIC STUDIO APP
 * Professionelle DAW zum Erstellen, Aufnehmen, Bearbeiten und Mischen von Musik
 * Version: 1.0.0
 */

const MusicStudioApp = {
    // ---- APP-INFO ----
    id: 'music-studio',
    name: 'Musik Studio',
    icon: '🎹',
    category: 'music',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Musik erstellen, aufnehmen, bearbeiten und mischen',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'tracks', // tracks | mixer | effects | export
    tracks: [],
    selectedTrack: null,
    isPlaying: false,
    isRecording: false,
    tempo: 120,
    timeSignature: '4/4',
    currentTime: 0,
    duration: 0,
    projectName: 'Mein Song',
    audioContext: null,
    recorder: null,
    recordedBlobs: [],
    
    // ---- STANDARD-TRACKS ----
    defaultTracks: [
        { id: 'track1', name: 'Kick', type: 'drum', muted: false, solo: false, volume: 80, pan: 0, color: '#FF6B6B' },
        { id: 'track2', name: 'Snare', type: 'drum', muted: false, solo: false, volume: 75, pan: 0, color: '#FFA94D' },
        { id: 'track3', name: 'Hi-Hat', type: 'drum', muted: false, solo: false, volume: 70, pan: 0, color: '#FFD93D' },
        { id: 'track4', name: 'Bass', type: 'instrument', muted: false, solo: false, volume: 85, pan: 0, color: '#6BCB77' },
        { id: 'track5', name: 'Piano', type: 'instrument', muted: false, solo: false, volume: 80, pan: -10, color: '#4D96FF' },
        { id: 'track6', name: 'Synth', type: 'instrument', muted: false, solo: false, volume: 75, pan: 10, color: '#9B59B6' },
        { id: 'track7', name: 'Vocals', type: 'vocal', muted: false, solo: false, volume: 90, pan: 0, color: '#FF6B9D' },
        { id: 'track8', name: 'Gitarre', type: 'instrument', muted: false, solo: false, volume: 78, pan: -15, color: '#2ECC71' }
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
            console.log('🎹 Music Studio App registriert');
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
        this.currentMode = params.mode || 'tracks';
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 700,
            params.height || 520
        );
        
        if (this.window) {
            this.attachEvents();
            this.initAudio();
        }
        
        EventBus.emit('app:opened', { appId: this.id });
        return this.window;
    },
    
    // ---- SCHLIEßEN ----
    close() {
        if (this.audioContext) {
            this.audioContext.close();
        }
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
        this.tracks = Storage.get('music_studio_tracks', this.defaultTracks);
        this.tempo = Storage.get('music_studio_tempo', 120);
        this.projectName = Storage.get('music_studio_project', 'Mein Song');
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('music_studio_tracks', this.tracks);
        Storage.set('music_studio_tempo', this.tempo);
        Storage.set('music_studio_project', this.projectName);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'tracks': return this.renderTracks();
            case 'mixer': return this.renderMixer();
            case 'effects': return this.renderEffects();
            case 'export': return this.renderExport();
            default: return this.renderTracks();
        }
    },
    
    // ---- TRACKS-ANSICHT ----
    renderTracks() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <button class="haldo-btn ${this.currentMode === 'tracks' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('tracks')">🎵 Tracks</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('mixer')">🎛️ Mixer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('export')">📤 Export</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <span style="font-size:11px;color:var(--text-muted);">♩ ${this.tempo} BPM</span>
                    <input type="range" min="60" max="200" value="${this.tempo}" style="width:80px;accent-color:var(--primary);" 
                        oninput="MusicStudioApp.setTempo(this.value)">
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="MusicStudioApp.addTrack()">+</button>
                </div>
                
                <!-- Transport -->
                <div style="display:flex;gap:8px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));align-items:center;flex-wrap:wrap;">
                    <button class="haldo-btn" style="font-size:14px;padding:4px 12px;" onclick="MusicStudioApp.togglePlay()">${this.isPlaying ? '⏸' : '▶️'}</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:14px;padding:4px 10px;" onclick="MusicStudioApp.stopPlayback()">⏹</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:14px;padding:4px 10px;" onclick="MusicStudioApp.toggleRecord()">${this.isRecording ? '⏺️' : '🔴'}</button>
                    <span style="font-size:12px;color:var(--text-secondary);font-variant-numeric:tabular-nums;">
                        ${this.formatTime(this.currentTime)}
                    </span>
                    <span style="font-size:11px;color:var(--text-muted);">|</span>
                    <span style="font-size:11px;color:var(--text-muted);">${this.formatTime(this.duration)}</span>
                    <div style="flex:1;"></div>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="MusicStudioApp.undoAction()">↩️</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="MusicStudioApp.redoAction()">↪️</button>
                </div>
                
                <!-- Tracks -->
                <div style="flex:1;overflow-y:auto;padding:4px;">
                    ${this.tracks.map((track, index) => `
                        <div class="track-item" style="
                            display:grid;
                            grid-template-columns:30px 120px 60px 1fr 80px 40px;
                            gap:4px;
                            padding:4px 8px;
                            margin:2px 0;
                            background: ${this.selectedTrack === track.id ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                            border-radius:6px;
                            border:1px solid ${this.selectedTrack === track.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                            align-items:center;
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="MusicStudioApp.selectTrack('${track.id}')">
                            <div style="font-size:12px;color:${track.color || 'var(--text-secondary)'};">●</div>
                            <div style="font-size:11px;font-weight:500;color:var(--text-primary);">${track.name}</div>
                            <div style="font-size:9px;color:var(--text-muted);">${track.type}</div>
                            <div style="display:flex;gap:2px;align-items:center;">
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();MusicStudioApp.toggleMute('${track.id}')">
                                    ${track.muted ? '🔇' : '🔊'}
                                </button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();MusicStudioApp.toggleSolo('${track.id}')">
                                    ${track.solo ? '🎧' : ''}
                                </button>
                            </div>
                            <input type="range" min="0" max="100" value="${track.volume}" style="width:100%;accent-color:${track.color || 'var(--primary)'};" 
                                oninput="MusicStudioApp.setVolume('${track.id}', this.value)">
                            <div style="font-size:10px;color:var(--text-muted);">${track.volume}%</div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🎵 ${this.tracks.length} Tracks</span>
                    <span>${this.projectName}</span>
                    <span>🎚️ ${this.tracks.filter(t => !t.muted).length} aktiv</span>
                </div>
            </div>
        `;
    },
    
    // ---- MIXER ----
    renderMixer() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('tracks')">🎵 Tracks</button>
                    <button class="haldo-btn ${this.currentMode === 'mixer' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('mixer')">🎛️ Mixer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('export')">📤 Export</button>
                </div>
                
                <!-- Mixer -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:flex;gap:12px;flex-wrap:nowrap;overflow-x:auto;">
                    ${this.tracks.map(track => `
                        <div style="
                            flex:0 0 100px;
                            padding:8px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            text-align:center;
                        ">
                            <div style="font-size:10px;color:var(--text-secondary);">${track.name}</div>
                            <div style="margin:4px 0;">
                                <input type="range" min="0" max="100" value="${track.volume}" style="writing-mode:bt-lr;width:20px;height:80px;accent-color:${track.color || 'var(--primary)'};" 
                                    oninput="MusicStudioApp.setVolume('${track.id}', this.value)">
                            </div>
                            <div style="font-size:10px;color:var(--text-primary);">${track.volume}%</div>
                            <div style="margin-top:4px;display:flex;gap:2px;justify-content:center;">
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="MusicStudioApp.toggleMute('${track.id}')">
                                    ${track.muted ? '🔇' : '🔊'}
                                </button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="MusicStudioApp.toggleSolo('${track.id}')">
                                    ${track.solo ? '🎧' : ''}
                                </button>
                            </div>
                            <div style="font-size:8px;color:var(--text-muted);margin-top:2px;">
                                ${track.pan > 0 ? 'R' : track.pan < 0 ? 'L' : 'M'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- EFFEKTE ----
    renderEffects() {
        const effects = [
            { id: 'reverb', name: 'Hall', icon: '🌊', params: ['Room Size', 'Damping', 'Wet/Dry'] },
            { id: 'delay', name: 'Echo', icon: '⏳', params: ['Time', 'Feedback', 'Mix'] },
            { id: 'equalizer', name: 'Equalizer', icon: '🎚️', params: ['Low', 'Mid', 'High'] },
            { id: 'compressor', name: 'Kompression', icon: '📊', params: ['Threshold', 'Ratio', 'Attack'] },
            { id: 'distortion', name: 'Verzerrung', icon: '⚡', params: ['Drive', 'Tone', 'Mix'] },
            { id: 'chorus', name: 'Chorus', icon: '🎶', params: ['Rate', 'Depth', 'Mix'] }
        ];
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('tracks')">🎵 Tracks</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('mixer')">🎛️ Mixer</button>
                    <button class="haldo-btn ${this.currentMode === 'effects' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('export')">📤 Export</button>
                </div>
                
                <!-- Effekte -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${effects.map(effect => `
                        <div style="
                            padding:12px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        ">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:24px;">${effect.icon}</div>
                                <div>
                                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${effect.name}</div>
                                    <div style="font-size:9px;color:var(--text-muted);">${effect.params.join(' • ')}</div>
                                </div>
                            </div>
                            <div style="margin-top:8px;">
                                ${effect.params.map(p => `
                                    <div style="display:flex;gap:4px;align-items:center;margin:2px 0;">
                                        <span style="font-size:9px;color:var(--text-muted);width:60px;">${p}</span>
                                        <input type="range" min="0" max="100" value="50" style="flex:1;accent-color:var(--primary);">
                                        <span style="font-size:9px;color:var(--text-muted);width:30px;">50%</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div style="margin-top:4px;display:flex;gap:4px;">
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="alert('✨ Effekt ${effect.name} aktiviert')">🔊 Aktivieren</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="alert('⚙️ ${effect.name} Einstellungen')">⚙️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- EXPORT ----
    renderExport() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('tracks')">🎵 Tracks</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('mixer')">🎛️ Mixer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn ${this.currentMode === 'export' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioApp.setMode('export')">📤 Export</button>
                </div>
                
                <!-- Export -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <div style="padding:16px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">📤 Projekt exportieren</h3>
                        <p style="font-size:11px;color:var(--text-secondary);">Exportiere dein Projekt als Audio-Datei</p>
                        
                        <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Format:</span>
                                <select class="haldo-input" style="font-size:10px;padding:2px 6px;flex:1;">
                                    <option>WAV (44.1kHz, 16-bit)</option>
                                    <option>MP3 (320 kbps)</option>
                                    <option>MP3 (192 kbps)</option>
                                    <option>AAC (256 kbps)</option>
                                    <option>FLAC</option>
                                </select>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Name:</span>
                                <input class="haldo-input" value="${this.projectName}" style="flex:1;font-size:11px;" onchange="MusicStudioApp.projectName = this.value; MusicStudioApp.saveData();">
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Dauer:</span>
                                <span style="font-size:11px;color:var(--text-primary);">${this.formatTime(this.duration || 180)}</span>
                            </div>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                                <button class="haldo-btn" style="font-size:12px;padding:6px 16px;" onclick="MusicStudioApp.exportProject()">📤 Exportieren</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:6px 16px;" onclick="alert('🎶 Vorschau wird abgespielt...')">🎧 Vorschau</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:6px 16px;" onclick="if(confirm('Projekt wirklich löschen?')){MusicStudioApp.clearProject();}">🗑️ Projekt löschen</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:8px;padding:8px 12px;background:rgba(0,255,136,0.05);border-radius:8px;border:1px solid rgba(0,255,136,0.1);">
                        <div style="font-size:11px;color:var(--text-secondary);">💡 Tipp: Füge Effekte hinzu und mische deine Tracks, bevor du exportierst.</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- TRACKS VERWALTEN ----
    addTrack() {
        const name = prompt('🎵 Track-Name:', `Track ${this.tracks.length + 1}`);
        if (!name) return;
        const type = prompt('🎵 Track-Typ (drum/instrument/vocal):', 'instrument') || 'instrument';
        
        this.tracks.push({
            id: 'track_' + Date.now().toString(36),
            name: name,
            type: type,
            muted: false,
            solo: false,
            volume: 80,
            pan: 0,
            color: this.getRandomColor()
        });
        
        this.saveData();
        this.updateView();
        EventBus.emit('studio:track-added', { name });
    },
    
    selectTrack(trackId) {
        this.selectedTrack = trackId;
        this.updateView();
    },
    
    toggleMute(trackId) {
        const track = this.tracks.find(t => t.id === trackId);
        if (track) {
            track.muted = !track.muted;
            this.saveData();
            this.updateView();
        }
    },
    
    toggleSolo(trackId) {
        const track = this.tracks.find(t => t.id === trackId);
        if (track) {
            track.solo = !track.solo;
            this.saveData();
            this.updateView();
        }
    },
    
    setVolume(trackId, value) {
        const track = this.tracks.find(t => t.id === trackId);
        if (track) {
            track.volume = parseInt(value);
            this.saveData();
            this.updateView();
        }
    },
    
    // ---- TRANSPORT ----
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.simulatePlayback();
        }
        this.updateView();
    },
    
    stopPlayback() {
        this.isPlaying = false;
        this.isRecording = false;
        this.currentTime = 0;
        if (this._playbackInterval) {
            clearInterval(this._playbackInterval);
        }
        this.updateView();
    },
    
    toggleRecord() {
        if (!this.isRecording) {
            this.currentTime = 0;
            this.recordedBlobs = [];
        }
        this.isRecording = !this.isRecording;
        this.updateView();
    },
    
    simulatePlayback() {
        if (this._playbackInterval) {
            clearInterval(this._playbackInterval);
        }
        this._playbackInterval = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(this._playbackInterval);
                return;
            }
            this.currentTime += 0.1;
            if (this.currentTime >= (this.duration || 180)) {
                this.stopPlayback();
            }
            this.updateView();
        }, 100);
    },
    
    setTempo(value) {
        this.tempo = parseInt(value);
        this.saveData();
        this.updateView();
    },
    
    // ---- EXPORT ----
    exportProject() {
        // Simulierter Export
        const duration = this.duration || 180;
        const progress = document.createElement('div');
        progress.style.cssText = `
            position:fixed;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%);
            background:var(--bg-primary);
            padding:20px 40px;
            border-radius:12px;
            border:1px solid var(--glass-border);
            z-index:9999;
            text-align:center;
        `;
        progress.innerHTML = `
            <div style="font-size:24px;">🎵</div>
            <div style="font-size:14px;color:var(--text-primary);margin-top:8px;">Exportiere Projekt...</div>
            <div style="width:200px;height:4px;background:var(--glass-border);border-radius:10px;margin-top:12px;overflow:hidden;">
                <div id="export-progress" style="width:0%;height:100%;background:var(--primary);border-radius:10px;transition:width 0.3s ease;"></div>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${this.projectName}</div>
        `;
        document.body.appendChild(progress);
        
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 15 + 5;
            if (p >= 100) {
                clearInterval(interval);
                document.body.removeChild(progress);
                alert('✅ Projekt erfolgreich exportiert!\n\nDatei: ' + this.projectName + '.wav\nDauer: ' + this.formatTime(duration));
                EventBus.emit('studio:exported', { name: this.projectName });
                this.updateView();
            } else {
                const bar = document.getElementById('export-progress');
                if (bar) bar.style.width = Math.min(p, 100) + '%';
            }
        }, 300);
    },
    
    clearProject() {
        this.tracks = this.defaultTracks;
        this.currentTime = 0;
        this.duration = 0;
        this.isPlaying = false;
        this.isRecording = false;
        this.saveData();
        this.updateView();
        alert('🗑️ Projekt gelöscht');
    },
    
    // ---- UNDO / REDO ----
    undoAction() {
        alert('↩️ Rückgängig (simuliert)');
    },
    
    redoAction() {
        alert('↪️ Wiederherstellen (simuliert)');
    },
    
    // ---- MODUS ----
    setMode(mode) {
        this.currentMode = mode;
        this.updateView();
    },
    
    // ---- AUDIO ----
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('⚠️ AudioContext nicht verfügbar');
        }
    },
    
    // ---- HELPER ----
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },
    
    getRandomColor() {
        const colors = ['#FF6B6B', '#FFA94D', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6', '#FF6B9D', '#2ECC71', '#F39C12', '#E74C3C'];
        return colors[Math.floor(Math.random() * colors.length)];
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
                if (e.key === ' ' || e.key === 'Space') {
                    e.preventDefault();
                    this.togglePlay();
                }
                if (e.key === 'r' || e.key === 'R') {
                    this.toggleRecord();
                }
                if (e.key === 's' || e.key === 'S') {
                    this.stopPlayback();
                }
                if (e.key === '+' || e.key === '=') {
                    this.addTrack();
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🎹 Music Studio App wird installiert...');
        this.loadData();
        if (this.tracks.length === 0) {
            this.tracks = this.defaultTracks;
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Music Studio App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
MusicStudioApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.MusicStudioApp = MusicStudioApp;

console.log('🎹 Music Studio App geladen – HalDo AI OS 24.6.0');
