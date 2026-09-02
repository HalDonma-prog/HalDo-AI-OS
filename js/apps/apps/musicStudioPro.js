/**
 * HALDO AI OS 24.6.0 – MUSIC STUDIO PRO
 * Erweiterte Musikproduktion mit MIDI, Audio, Mixing, Effekten und Mastering
 * Version: 1.0.0
 */

const MusicStudioProApp = {
    // ---- APP-INFO ----
    id: 'music-studio-pro',
    name: 'Music Studio Pro',
    icon: '🎚️',
    category: 'music',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Professionelle Musikproduktion mit MIDI, Audio, Effekten und Mastering',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'arrangement', // arrangement | mixer | effects | mastering | export
    selectedTrack: null,
    selectedClip: null,
    isPlaying: false,
    isRecording: false,
    currentTime: 0,
    tempo: 120,
    timeSignature: '4/4',
    projectName: 'Mein Track',
    
    // ---- PROJEKTDATEN ----
    tracks: [],
    clips: [],
    patterns: [],
    effects: [],
    automation: [],
    
    // ---- STANDARD-TRACKS ----
    defaultTracks: [
        { id: 't1', name: 'Kick', type: 'midi', color: '#FF6B6B', volume: 80, pan: 0, muted: false, solo: false, armed: false },
        { id: 't2', name: 'Snare', type: 'midi', color: '#FFA94D', volume: 75, pan: 0, muted: false, solo: false, armed: false },
        { id: 't3', name: 'Hi-Hat', type: 'midi', color: '#FFD93D', volume: 70, pan: 0, muted: false, solo: false, armed: false },
        { id: 't4', name: 'Bass', type: 'midi', color: '#6BCB77', volume: 85, pan: 0, muted: false, solo: false, armed: false },
        { id: 't5', name: 'Synth Lead', type: 'midi', color: '#4D96FF', volume: 80, pan: -10, muted: false, solo: false, armed: false },
        { id: 't6', name: 'Pad', type: 'midi', color: '#9B59B6', volume: 75, pan: 10, muted: false, solo: false, armed: false },
        { id: 't7', name: 'Vocals', type: 'audio', color: '#FF6B9D', volume: 90, pan: 0, muted: false, solo: false, armed: false }
    ],
    
    // ---- STANDARD-CLIPS ----
    defaultClips: [
        { id: 'c1', trackId: 't1', start: 0, duration: 4, name: 'Kick Pattern', color: '#FF6B6B' },
        { id: 'c2', trackId: 't2', start: 0, duration: 4, name: 'Snare Pattern', color: '#FFA94D' },
        { id: 'c3', trackId: 't4', start: 0, duration: 8, name: 'Bass Line', color: '#6BCB77' },
        { id: 'c4', trackId: 't5', start: 4, duration: 4, name: 'Lead Melody', color: '#4D96FF' },
        { id: 'c5', trackId: 't6', start: 8, duration: 8, name: 'Pad Chords', color: '#9B59B6' }
    ],
    
    // ---- STANDARD-EFFEKTE ----
    defaultEffects: [
        { id: 'e1', name: 'Hall', type: 'reverb', parameters: { size: 50, damping: 30, wet: 20 } },
        { id: 'e2', name: 'Echo', type: 'delay', parameters: { time: 500, feedback: 30, mix: 15 } },
        { id: 'e3', name: 'Kompressor', type: 'compressor', parameters: { threshold: -20, ratio: 4, attack: 10 } },
        { id: 'e4', name: 'Equalizer', type: 'eq', parameters: { low: 0, mid: 0, high: 0 } }
    ],
    
    // ---- STANDARD-PATTERNS ----
    defaultPatterns: [
        { id: 'p1', name: 'Kick Basic', notes: [36, 36, 36, 36] },
        { id: 'p2', name: 'Snare Basic', notes: [38, 38] },
        { id: 'p3', name: 'Bass Line', notes: [40, 44, 47, 40] }
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
            console.log('🎚️ Music Studio Pro App registriert');
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
        this.currentMode = params.mode || 'arrangement';
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 720,
            params.height || 560
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
        this.tracks = Storage.get('musicpro_tracks', this.defaultTracks);
        this.clips = Storage.get('musicpro_clips', this.defaultClips);
        this.patterns = Storage.get('musicpro_patterns', this.defaultPatterns);
        this.effects = Storage.get('musicpro_effects', this.defaultEffects);
        this.automation = Storage.get('musicpro_automation', []);
        this.tempo = Storage.get('musicpro_tempo', 120);
        this.projectName = Storage.get('musicpro_project', 'Mein Track');
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('musicpro_tracks', this.tracks);
        Storage.set('musicpro_clips', this.clips);
        Storage.set('musicpro_patterns', this.patterns);
        Storage.set('musicpro_effects', this.effects);
        Storage.set('musicpro_automation', this.automation);
        Storage.set('musicpro_tempo', this.tempo);
        Storage.set('musicpro_project', this.projectName);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'arrangement': return this.renderArrangement();
            case 'mixer': return this.renderMixer();
            case 'effects': return this.renderEffects();
            case 'mastering': return this.renderMastering();
            case 'export': return this.renderExport();
            default: return this.renderArrangement();
        }
    },
    
    // ---- ARRANGEMENT ----
    renderArrangement() {
        const totalDuration = this.clips.reduce((max, c) => Math.max(max, c.start + c.duration), 0);
        const ticks = Math.ceil(totalDuration / 4) * 4;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <button class="haldo-btn ${this.currentMode === 'arrangement' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('arrangement')">🎹 Arrangement</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('mixer')">🎛️ Mixer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('mastering')">🔊 Mastering</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('export')">📤 Export</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <span style="font-size:11px;color:var(--text-muted);">♩ ${this.tempo} BPM</span>
                    <input type="range" min="60" max="200" value="${this.tempo}" style="width:80px;accent-color:var(--primary);" 
                        oninput="MusicStudioProApp.setTempo(this.value)">
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="MusicStudioProApp.addTrack()">+</button>
                </div>
                
                <!-- Transport -->
                <div style="display:flex;gap:8px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));align-items:center;flex-wrap:wrap;">
                    <button class="haldo-btn" style="font-size:14px;padding:4px 12px;" onclick="MusicStudioProApp.togglePlay()">${this.isPlaying ? '⏸' : '▶️'}</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:14px;padding:4px 10px;" onclick="MusicStudioProApp.stopPlayback()">⏹</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:14px;padding:4px 10px;" onclick="MusicStudioProApp.toggleRecord()">${this.isRecording ? '⏺️' : '🔴'}</button>
                    <span style="font-size:12px;color:var(--text-secondary);font-variant-numeric:tabular-nums;">
                        ${this.formatTime(this.currentTime)}
                    </span>
                    <span style="font-size:11px;color:var(--text-muted);">|</span>
                    <span style="font-size:11px;color:var(--text-muted);">${this.formatTime(totalDuration)}</span>
                    <div style="flex:1;"></div>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="MusicStudioProApp.openPianoRoll()">🎹 Piano Roll</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="MusicStudioProApp.quantize()">⚡ Quantisieren</button>
                </div>
                
                <!-- Tracks & Clips -->
                <div style="flex:1;overflow-y:auto;padding:4px;">
                    <div style="display:grid;grid-template-columns:120px 1fr;gap:2px;">
                        <!-- Track-Kopf -->
                        <div style="border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));padding:4px 8px;font-size:10px;color:var(--text-muted);">Spur</div>
                        <div style="border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));padding:4px 8px;font-size:10px;color:var(--text-muted);">Clips</div>
                        
                        ${this.tracks.map(track => {
                            const trackClips = this.clips.filter(c => c.trackId === track.id);
                            return `
                                <div style="
                                    padding:4px 8px;
                                    background: ${this.selectedTrack === track.id ? 'rgba(108,60,225,0.15)' : 'transparent'};
                                    border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));
                                    display:flex;
                                    align-items:center;
                                    gap:4px;
                                    cursor:pointer;
                                " onclick="MusicStudioProApp.selectTrack('${track.id}')">
                                    <div style="width:12px;height:12px;border-radius:3px;background:${track.color};flex-shrink:0;"></div>
                                    <div style="font-size:11px;color:${track.muted ? 'var(--text-muted)' : 'var(--text-primary)'};">
                                        ${track.name}
                                    </div>
                                    <div style="display:flex;gap:2px;margin-left:auto;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();MusicStudioProApp.toggleMute('${track.id}')">
                                            ${track.muted ? '🔇' : '🔊'}
                                        </button>
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();MusicStudioProApp.deleteTrack('${track.id}')">✕</button>
                                    </div>
                                </div>
                                <div style="
                                    padding:4px;
                                    border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));
                                    min-height:36px;
                                    display:flex;
                                    gap:2px;
                                    flex-wrap:wrap;
                                ">
                                    ${trackClips.length === 0 ? `
                                        <div style="font-size:9px;color:var(--text-muted);padding:4px;">Keine Clips</div>
                                    ` : `
                                        ${trackClips.map(clip => `
                                            <div style="
                                                padding:4px 8px;
                                                background: ${this.selectedClip === clip.id ? 'rgba(108,60,225,0.3)' : 'rgba(255,255,255,0.05)'};
                                                border:1px solid ${this.selectedClip === clip.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                                border-radius:4px;
                                                font-size:10px;
                                                color:var(--text-primary);
                                                cursor:pointer;
                                                display:flex;
                                                align-items:center;
                                                gap:4px;
                                            " onclick="event.stopPropagation();MusicStudioProApp.selectClip('${clip.id}')">
                                                <span style="color:${clip.color};">▌</span>
                                                ${clip.name}
                                                <span style="font-size:8px;color:var(--text-muted);">${clip.start}s-${clip.start+clip.duration}s</span>
                                            </div>
                                        `).join('')}
                                    `}
                                    <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();MusicStudioProApp.addClip('${track.id}')">+</button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🎚️ ${this.tracks.length} Spuren • ${this.clips.length} Clips</span>
                    <span>${this.projectName}</span>
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
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('arrangement')">🎹 Arrangement</button>
                    <button class="haldo-btn ${this.currentMode === 'mixer' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('mixer')">🎛️ Mixer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('mastering')">🔊 Mastering</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('export')">📤 Export</button>
                </div>
                
                <!-- Mixer -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:flex;gap:12px;flex-wrap:nowrap;overflow-x:auto;">
                    ${this.tracks.map(track => `
                        <div style="
                            flex:0 0 80px;
                            padding:8px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            text-align:center;
                        ">
                            <div style="font-size:10px;color:var(--text-secondary);">${track.name}</div>
                            <div style="margin:4px 0;">
                                <input type="range" min="0" max="100" value="${track.volume}" style="writing-mode:bt-lr;width:16px;height:80px;accent-color:${track.color};" 
                                    oninput="MusicStudioProApp.setVolume('${track.id}', this.value)">
                            </div>
                            <div style="font-size:10px;color:var(--text-primary);">${track.volume}%</div>
                            <div style="margin-top:4px;display:flex;gap:2px;justify-content:center;">
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="MusicStudioProApp.toggleMute('${track.id}')">
                                    ${track.muted ? '🔇' : '🔊'}
                                </button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="MusicStudioProApp.toggleSolo('${track.id}')">
                                    ${track.solo ? '🎧' : ''}
                                </button>
                            </div>
                            <div style="font-size:8px;color:var(--text-muted);margin-top:2px;">
                                ${track.pan > 0 ? 'R' : track.pan < 0 ? 'L' : 'M'}
                            </div>
                        </div>
                    `).join('')}
                    
                    <!-- Master -->
                    <div style="
                        flex:0 0 80px;
                        padding:8px;
                        background: rgba(108,60,225,0.1);
                        border-radius:8px;
                        border:2px solid var(--primary, #6C3CE1);
                        text-align:center;
                    ">
                        <div style="font-size:10px;color:var(--text-secondary);">Master</div>
                        <div style="margin:4px 0;">
                            <input type="range" min="0" max="100" value="85" style="writing-mode:bt-lr;width:16px;height:80px;accent-color:var(--gold, #FFD700);">
                        </div>
                        <div style="font-size:10px;color:var(--text-primary);">85%</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- EFFEKTE ----
    renderEffects() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('arrangement')">🎹 Arrangement</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('mixer')">🎛️ Mixer</button>
                    <button class="haldo-btn ${this.currentMode === 'effects' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('mastering')">🔊 Mastering</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('export')">📤 Export</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="MusicStudioProApp.addEffect()">+</button>
                </div>
                
                <!-- Effekte -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${this.effects.map(effect => `
                        <div style="
                            padding:12px;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        ">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${effect.name}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${effect.type}</div>
                                </div>
                                <div>
                                    <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="MusicStudioProApp.editEffect('${effect.id}')">✏️</button>
                                    <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();MusicStudioProApp.deleteEffect('${effect.id}')">✕</button>
                                </div>
                            </div>
                            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">
                                ${Object.entries(effect.parameters).map(([key, value]) => `
                                    <span style="font-size:9px;padding:1px 6px;background:var(--glass-bg);border-radius:4px;color:var(--text-muted);">${key}: ${value}</span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- MASTERING ----
    renderMastering() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('arrangement')">🎹 Arrangement</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('mixer')">🎛️ Mixer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn ${this.currentMode === 'mastering' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('mastering')">🔊 Mastering</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('export')">📤 Export</button>
                </div>
                
                <!-- Mastering -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                            <h4 style="color:var(--text-primary);font-size:13px;margin:0;">🎚️ Lautstärke</h4>
                            <div style="margin-top:8px;">
                                <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                    <span>Gain</span>
                                    <span>+2.0 dB</span>
                                </div>
                                <input type="range" min="-10" max="10" value="2" step="0.5" style="width:100%;accent-color:var(--primary);">
                            </div>
                            <div style="margin-top:8px;">
                                <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                    <span>Limiter</span>
                                    <span>-0.5 dB</span>
                                </div>
                                <input type="range" min="-6" max="0" value="-0.5" step="0.5" style="width:100%;accent-color:var(--primary);">
                            </div>
                        </div>
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                            <h4 style="color:var(--text-primary);font-size:13px;margin:0;">🎨 EQ</h4>
                            <div style="margin-top:8px;">
                                <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                    <span>Sub</span>
                                    <span>0 dB</span>
                                </div>
                                <input type="range" min="-12" max="12" value="0" style="width:100%;accent-color:var(--primary);">
                            </div>
                            <div style="margin-top:8px;">
                                <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                    <span>Mid</span>
                                    <span>+2 dB</span>
                                </div>
                                <input type="range" min="-12" max="12" value="2" style="width:100%;accent-color:var(--primary);">
                            </div>
                            <div style="margin-top:8px;">
                                <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                    <span>High</span>
                                    <span>+3 dB</span>
                                </div>
                                <input type="range" min="-12" max="12" value="3" style="width:100%;accent-color:var(--primary);">
                            </div>
                        </div>
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                            <h4 style="color:var(--text-primary);font-size:13px;margin:0;">📊 Kompression</h4>
                            <div style="margin-top:8px;">
                                <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                    <span>Threshold</span>
                                    <span>-15 dB</span>
                                </div>
                                <input type="range" min="-30" max="0" value="-15" style="width:100%;accent-color:var(--primary);">
                            </div>
                            <div style="margin-top:8px;">
                                <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                    <span>Ratio</span>
                                    <span>3:1</span>
                                </div>
                                <input type="range" min="1" max="10" value="3" step="0.5" style="width:100%;accent-color:var(--primary);">
                            </div>
                        </div>
                        <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                            <h4 style="color:var(--text-primary);font-size:13px;margin:0;">🔊 Stereo</h4>
                            <div style="margin-top:8px;">
                                <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                    <span>Stereo Width</span>
                                    <span>100%</span>
                                </div>
                                <input type="range" min="0" max="200" value="100" style="width:100%;accent-color:var(--primary);">
                            </div>
                            <div style="margin-top:8px;">
                                <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
                                    <span>Mid/Side</span>
                                    <span>50%</span>
                                </div>
                                <input type="range" min="0" max="100" value="50" style="width:100%;accent-color:var(--primary);">
                            </div>
                            <button class="haldo-btn" style="font-size:11px;margin-top:8px;padding:4px 12px;" onclick="alert('🔊 Mastering-Vorschau wird abgespielt...')">🎧 Vorschau</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- EXPORT ----
    renderExport() {
        const totalDuration = this.clips.reduce((max, c) => Math.max(max, c.start + c.duration), 0);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('arrangement')">🎹 Arrangement</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('mixer')">🎛️ Mixer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('mastering')">🔊 Mastering</button>
                    <button class="haldo-btn ${this.currentMode === 'export' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="MusicStudioProApp.setMode('export')">📤 Export</button>
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
                                    <option>WAV (44.1kHz, 24-bit)</option>
                                    <option>MP3 (320 kbps)</option>
                                    <option>MP3 (192 kbps)</option>
                                    <option>AAC (256 kbps)</option>
                                    <option>FLAC</option>
                                    <option>AIFF</option>
                                </select>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Name:</span>
                                <input class="haldo-input" value="${this.projectName}" style="flex:1;font-size:11px;" 
                                    onchange="MusicStudioProApp.projectName = this.value; MusicStudioProApp.saveData();">
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Dauer:</span>
                                <span style="font-size:11px;color:var(--text-primary);">${this.formatTime(totalDuration)}</span>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Qualität:</span>
                                <select class="haldo-input" style="font-size:10px;padding:2px 6px;flex:1;">
                                    <option>Hoch (48kHz, 24-bit)</option>
                                    <option>Mittel (44.1kHz, 16-bit)</option>
                                    <option>Niedrig (22.05kHz, 16-bit)</option>
                                    <option>Meister (96kHz, 24-bit)</option>
                                </select>
                            </div>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                                <button class="haldo-btn" style="font-size:12px;padding:6px 16px;" onclick="MusicStudioProApp.exportProject()">📤 Exportieren</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:6px 16px;" onclick="MusicStudioProApp.previewProject()">🎧 Vorschau</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:6px 16px;" onclick="if(confirm('Projekt wirklich löschen?')){MusicStudioProApp.clearProject();}">🗑️ Projekt löschen</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- FUNKTIONEN ----
    setMode(mode) {
        this.currentMode = mode;
        this.updateView();
    },
    
    // ---- TRACKS ----
    addTrack() {
        const name = prompt('🎵 Track-Name:', `Track ${this.tracks.length + 1}`);
        if (!name) return;
        const type = prompt('📁 Typ (midi/audio):', 'midi') || 'midi';
        
        this.tracks.push({
            id: 't_' + Date.now().toString(36),
            name: name,
            type: type,
            color: this.getRandomColor(),
            volume: 80,
            pan: 0,
            muted: false,
            solo: false,
            armed: false
        });
        this.saveData();
        this.updateView();
    },
    
    selectTrack(trackId) {
        this.selectedTrack = this.selectedTrack === trackId ? null : trackId;
        this.updateView();
    },
    
    deleteTrack(trackId) {
        if (!confirm('Track wirklich löschen?')) return;
        this.tracks = this.tracks.filter(t => t.id !== trackId);
        this.clips = this.clips.filter(c => c.trackId !== trackId);
        this.saveData();
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
    
    // ---- CLIPS ----
    addClip(trackId) {
        const name = prompt('🎵 Clip-Name:', `Clip ${this.clips.length + 1}`);
        if (!name) return;
        const duration = parseInt(prompt('⏱️ Dauer (Sekunden):', '4')) || 4;
        const start = parseFloat(prompt('▶️ Start (Sekunden):', '0')) || 0;
        
        this.clips.push({
            id: 'c_' + Date.now().toString(36),
            trackId: trackId,
            start: start,
            duration: duration,
            name: name,
            color: this.getRandomColor()
        });
        this.saveData();
        this.updateView();
    },
    
    selectClip(clipId) {
        this.selectedClip = this.selectedClip === clipId ? null : clipId;
        this.updateView();
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
        this.isRecording = !this.isRecording;
        this.updateView();
    },
    
    simulatePlayback() {
        if (this._playbackInterval) {
            clearInterval(this._playbackInterval);
        }
        const totalDuration = this.clips.reduce((max, c) => Math.max(max, c.start + c.duration), 0) || 120;
        
        this._playbackInterval = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(this._playbackInterval);
                return;
            }
            this.currentTime += 0.1;
            if (this.currentTime >= totalDuration) {
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
    
    // ---- PIANO ROLL ----
    openPianoRoll() {
        const selectedClip = this.clips.find(c => c.id === this.selectedClip);
        if (!selectedClip) {
            alert('⚠️ Bitte wähle einen Clip aus.');
            return;
        }
        
        // Piano Roll in eigenem Fenster
        const content = `
            <div style="padding:12px;text-align:center;">
                <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🎹 Piano Roll</h3>
                <p style="font-size:11px;color:var(--text-secondary);">${selectedClip.name}</p>
                <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:20px;min-height:200px;display:flex;align-items:center;justify-content:center;flex-direction:column;">
                    <div style="font-size:48px;">🎹</div>
                    <p style="color:var(--text-muted);font-size:11px;">Piano-Roll Editor</p>
                    <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:2px;max-width:300px;margin-top:8px;">
                        ${['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'].map(n => `
                            <div style="padding:4px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:3px;font-size:10px;color:var(--text-muted);text-align:center;">${n}</div>
                        `).join('')}
                    </div>
                </div>
                <div style="margin-top:8px;display:flex;gap:4px;justify-content:center;">
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="alert('🎵 Noten eingefügt')">➕ Hinzufügen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="alert('🎶 Noten gelöscht')">🗑️ Löschen</button>
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'piano-roll',
            '🎹 Piano Roll',
            content,
            '🎹',
            400,
            350
        );
    },
    
    // ---- QUANTISIEREN ----
    quantize() {
        const selectedClip = this.clips.find(c => c.id === this.selectedClip);
        if (!selectedClip) {
            alert('⚠️ Bitte wähle einen Clip aus.');
            return;
        }
        alert(`⚡ Clip "${selectedClip.name}" wurde quantisiert!`);
    },
    
    // ---- EFFEKTE ----
    addEffect() {
        const name = prompt('✨ Effekt-Name:', `Effekt ${this.effects.length + 1}`);
        if (!name) return;
        const type = prompt('📂 Typ (reverb/delay/compressor/eq):', 'reverb') || 'reverb';
        
        const parameters = {
            reverb: { size: 50, damping: 30, wet: 20 },
            delay: { time: 500, feedback: 30, mix: 15 },
            compressor: { threshold: -20, ratio: 4, attack: 10 },
            eq: { low: 0, mid: 0, high: 0 }
        };
        
        this.effects.push({
            id: 'e_' + Date.now().toString(36),
            name: name,
            type: type,
            parameters: parameters[type] || { value: 50 }
        });
        this.saveData();
        this.updateView();
    },
    
    editEffect(effectId) {
        const effect = this.effects.find(e => e.id === effectId);
        if (!effect) return;
        
        const newName = prompt('✏️ Neuer Name:', effect.name);
        if (newName) {
            effect.name = newName;
            this.saveData();
            this.updateView();
        }
    },
    
    deleteEffect(effectId) {
        if (!confirm('Effekt wirklich löschen?')) return;
        this.effects = this.effects.filter(e => e.id !== effectId);
        this.saveData();
        this.updateView();
    },
    
    // ---- EXPORT ----
    exportProject() {
        const totalDuration = this.clips.reduce((max, c) => Math.max(max, c.start + c.duration), 0) || 120;
        
        // Simulierter Export
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
            <div style="font-size:24px;">🎚️</div>
            <div style="font-size:14px;color:var(--text-primary);margin-top:8px;">Exportiere Projekt...</div>
            <div style="width:200px;height:4px;background:var(--glass-border);border-radius:10px;margin-top:12px;overflow:hidden;">
                <div id="export-progress" style="width:0%;height:100%;background:var(--primary);border-radius:10px;transition:width 0.3s ease;"></div>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${this.projectName}</div>
        `;
        document.body.appendChild(progress);
        
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 12 + 3;
            if (p >= 100) {
                clearInterval(interval);
                document.body.removeChild(progress);
                alert('✅ Projekt erfolgreich exportiert!\n\nDatei: ' + this.projectName + '.wav\nDauer: ' + this.formatTime(totalDuration));
                EventBus.emit('studio:exported', { name: this.projectName });
                this.updateView();
            } else {
                const bar = document.getElementById('export-progress');
                if (bar) bar.style.width = Math.min(p, 100) + '%';
            }
        }, 300);
    },
    
    previewProject() {
        alert('🎧 Vorschau wird abgespielt...');
    },
    
    clearProject() {
        this.tracks = [];
        this.clips = [];
        this.effects = [];
        this.currentTime = 0;
        this.isPlaying = false;
        this.isRecording = false;
        this.saveData();
        this.updateView();
        alert('🗑️ Projekt gelöscht');
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
                if (e.key === 'Escape') {
                    this.setMode('arrangement');
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🎚️ Music Studio Pro App wird installiert...');
        this.loadData();
        if (this.tracks.length === 0) {
            this.tracks = this.defaultTracks;
            this.clips = this.defaultClips;
            this.patterns = this.defaultPatterns;
            this.effects = this.defaultEffects;
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Music Studio Pro App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
MusicStudioProApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.MusicStudioProApp = MusicStudioProApp;

console.log('🎚️ Music Studio Pro App geladen – HalDo AI OS 24.6.0');
