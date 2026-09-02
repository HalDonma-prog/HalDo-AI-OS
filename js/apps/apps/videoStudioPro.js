/**
 * HALDO AI OS 24.6.0 – VIDEO STUDIO PRO
 * Erweiterte Videoproduktion mit Timeline, Clips, Effekten, Titeln und Export
 * Version: 1.0.0
 */

const VideoStudioProApp = {
    // ---- APP-INFO ----
    id: 'video-studio-pro',
    name: 'Video Studio Pro',
    icon: '🎥',
    category: 'media',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Professionelle Videoproduktion mit Timeline, Effekten und Export',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'timeline', // timeline | preview | effects | titles | export
    selectedClip: null,
    selectedTrack: null,
    isPlaying: false,
    currentTime: 0,
    projectName: 'Mein Video',
    duration: 60,
    
    // ---- PROJEKTDATEN ----
    tracks: [],
    clips: [],
    transitions: [],
    titles: [],
    effects: [],
    
    // ---- STANDARD-TRACKS ----
    defaultTracks: [
        { id: 't1', name: 'Video 1', type: 'video', color: '#4D96FF', visible: true, locked: false },
        { id: 't2', name: 'Video 2', type: 'video', color: '#6BCB77', visible: true, locked: false },
        { id: 't3', name: 'Audio 1', type: 'audio', color: '#FFA94D', visible: true, locked: false },
        { id: 't4', name: 'Audio 2', type: 'audio', color: '#FF6B9D', visible: true, locked: false },
        { id: 't5', name: 'Titel', type: 'title', color: '#9B59B6', visible: true, locked: false }
    ],
    
    // ---- STANDARD-CLIPS ----
    defaultClips: [
        { id: 'c1', trackId: 't1', start: 0, duration: 10, name: 'Einführung', color: '#4D96FF', thumbnail: '🎬' },
        { id: 'c2', trackId: 't1', start: 12, duration: 15, name: 'Hauptteil', color: '#4D96FF', thumbnail: '🎥' },
        { id: 'c3', trackId: 't2', start: 0, duration: 25, name: 'B-Roll', color: '#6BCB77', thumbnail: '📹' },
        { id: 'c4', trackId: 't3', start: 0, duration: 25, name: 'Musik', color: '#FFA94D', thumbnail: '🎵' },
        { id: 'c5', trackId: 't5', start: 2, duration: 3, name: 'Titel einblenden', color: '#9B59B6', thumbnail: '📝' }
    ],
    
    // ---- STANDARD-ÜBERGÄNGE ----
    defaultTransitions: [
        { id: 'tr1', name: 'Überblendung', type: 'crossfade', duration: 0.5, color: '#4D96FF' },
        { id: 'tr2', name: 'Wisch', type: 'wipe', duration: 0.5, color: '#6BCB77' },
        { id: 'tr3', name: 'Zoom', type: 'zoom', duration: 0.5, color: '#FFA94D' }
    ],
    
    // ---- STANDARD-EFFEKTE ----
    defaultEffects: [
        { id: 'e1', name: 'Schwarz-Weiß', type: 'filter', intensity: 100 },
        { id: 'e2', name: 'Sepia', type: 'filter', intensity: 80 },
        { id: 'e3', name: 'Weichzeichnen', type: 'blur', intensity: 50 },
        { id: 'e4', name: 'Vintage', type: 'filter', intensity: 60 }
    ],
    
    // ---- STANDARD-TITEL ----
    defaultTitles: [
        { id: 'ti1', text: '🎬 Mein Video', start: 2, duration: 3, size: 48, color: '#FFFFFF', position: 'center' },
        { id: 'ti2', text: 'HalDo AI OS', start: 30, duration: 2, size: 36, color: '#FFD700', position: 'bottom' }
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
            console.log('🎥 Video Studio Pro App registriert');
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
        this.currentMode = params.mode || 'timeline';
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
        this.tracks = Storage.get('videopro_tracks', this.defaultTracks);
        this.clips = Storage.get('videopro_clips', this.defaultClips);
        this.transitions = Storage.get('videopro_transitions', this.defaultTransitions);
        this.titles = Storage.get('videopro_titles', this.defaultTitles);
        this.effects = Storage.get('videopro_effects', this.defaultEffects);
        this.projectName = Storage.get('videopro_project', 'Mein Video');
        this.duration = Storage.get('videopro_duration', 60);
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('videopro_tracks', this.tracks);
        Storage.set('videopro_clips', this.clips);
        Storage.set('videopro_transitions', this.transitions);
        Storage.set('videopro_titles', this.titles);
        Storage.set('videopro_effects', this.effects);
        Storage.set('videopro_project', this.projectName);
        Storage.set('videopro_duration', this.duration);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'timeline': return this.renderTimeline();
            case 'preview': return this.renderPreview();
            case 'effects': return this.renderEffects();
            case 'titles': return this.renderTitles();
            case 'export': return this.renderExport();
            default: return this.renderTimeline();
        }
    },
    
    // ---- TIMELINE ----
    renderTimeline() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <button class="haldo-btn ${this.currentMode === 'timeline' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('timeline')">🎞️ Timeline</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('preview')">👁️ Vorschau</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('titles')">📝 Titel</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('export')">📤 Export</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <span style="font-size:11px;color:var(--text-muted);">${this.formatTime(this.duration)}</span>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="VideoStudioProApp.addTrack()">+</button>
                </div>
                
                <!-- Transport -->
                <div style="display:flex;gap:8px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));align-items:center;flex-wrap:wrap;">
                    <button class="haldo-btn" style="font-size:14px;padding:4px 12px;" onclick="VideoStudioProApp.togglePlay()">${this.isPlaying ? '⏸' : '▶️'}</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:14px;padding:4px 10px;" onclick="VideoStudioProApp.stopPlayback()">⏹</button>
                    <span style="font-size:12px;color:var(--text-secondary);font-variant-numeric:tabular-nums;">
                        ${this.formatTime(this.currentTime)}
                    </span>
                    <span style="font-size:11px;color:var(--text-muted);">|</span>
                    <span style="font-size:11px;color:var(--text-muted);">${this.formatTime(this.duration)}</span>
                    <div style="flex:1;"></div>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="VideoStudioProApp.addClip()">+ Clip</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="VideoStudioProApp.addTransition()">🌊 Übergang</button>
                </div>
                
                <!-- Tracks & Clips -->
                <div style="flex:1;overflow-y:auto;padding:4px;">
                    <div style="display:grid;grid-template-columns:100px 1fr;gap:2px;">
                        <!-- Track-Kopf -->
                        <div style="border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));padding:4px 6px;font-size:9px;color:var(--text-muted);">Spur</div>
                        <div style="border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));padding:4px 6px;font-size:9px;color:var(--text-muted);">Timeline</div>
                        
                        ${this.tracks.map(track => {
                            const trackClips = this.clips.filter(c => c.trackId === track.id);
                            return `
                                <div style="
                                    padding:4px 6px;
                                    background: ${this.selectedTrack === track.id ? 'rgba(108,60,225,0.15)' : 'transparent'};
                                    border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));
                                    display:flex;
                                    align-items:center;
                                    gap:4px;
                                    cursor:pointer;
                                    font-size:10px;
                                " onclick="VideoStudioProApp.selectTrack('${track.id}')">
                                    <div style="width:10px;height:10px;border-radius:3px;background:${track.color};flex-shrink:0;"></div>
                                    <span style="color:${track.locked ? 'var(--text-muted)' : 'var(--text-primary)'};">${track.name}</span>
                                    <button class="haldo-btn haldo-btn-secondary" style="font-size:7px;padding:1px 3px;margin-left:auto;" onclick="event.stopPropagation();VideoStudioProApp.toggleVisibility('${track.id}')">
                                        ${track.visible ? '👁️' : '🚫'}
                                    </button>
                                </div>
                                <div style="
                                    padding:4px;
                                    border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));
                                    min-height:32px;
                                    display:flex;
                                    gap:2px;
                                    flex-wrap:wrap;
                                    align-items:center;
                                    position:relative;
                                ">
                                    ${trackClips.map(clip => {
                                        const width = (clip.duration / this.duration) * 100;
                                        const left = (clip.start / this.duration) * 100;
                                        return `
                                            <div style="
                                                position:absolute;
                                                left:${left}%;
                                                width:${width}%;
                                                height:24px;
                                                background: ${this.selectedClip === clip.id ? 'rgba(108,60,225,0.4)' : 'rgba(255,255,255,0.08)'};
                                                border:1px solid ${this.selectedClip === clip.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                                border-radius:4px;
                                                cursor:pointer;
                                                display:flex;
                                                align-items:center;
                                                padding:0 4px;
                                                font-size:8px;
                                                color:var(--text-primary);
                                                overflow:hidden;
                                                white-space:nowrap;
                                            " onclick="event.stopPropagation();VideoStudioProApp.selectClip('${clip.id}')">
                                                <span style="color:${clip.color};">▌</span>
                                                ${clip.name}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🎞️ ${this.tracks.length} Spuren • ${this.clips.length} Clips • ${this.titles.length} Titel</span>
                    <span>${this.projectName}</span>
                </div>
            </div>
        `;
    },
    
    // ---- VORSCHAU ----
    renderPreview() {
        const selectedClip = this.clips.find(c => c.id === this.selectedClip);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('timeline')">🎞️ Timeline</button>
                    <button class="haldo-btn ${this.currentMode === 'preview' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('preview')">👁️ Vorschau</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('titles')">📝 Titel</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('export')">📤 Export</button>
                </div>
                
                <!-- Player -->
                <div style="flex:1;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                    <div style="
                        aspect-ratio:16/9;
                        background:rgba(0,0,0,0.5);
                        border-radius:12px;
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        width:100%;
                        max-width:600px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        flex-direction:column;
                        padding:20px;
                    ">
                        <div style="font-size:64px;">🎬</div>
                        <div style="font-size:14px;color:var(--text-secondary);margin-top:8px;">${selectedClip ? selectedClip.name : 'Vorschau'}</div>
                        <div style="font-size:11px;color:var(--text-muted);">${this.formatTime(this.currentTime)} / ${this.formatTime(this.duration)}</div>
                        <div style="width:80%;margin-top:8px;display:flex;gap:8px;align-items:center;">
                            <span style="font-size:10px;color:var(--text-muted);">${this.formatTime(this.currentTime)}</span>
                            <input type="range" min="0" max="100" value="${(this.currentTime / this.duration) * 100}" style="flex:1;accent-color:var(--primary);" 
                                oninput="VideoStudioProApp.seekTo(this.value)">
                            <span style="font-size:10px;color:var(--text-muted);">${this.formatTime(this.duration)}</span>
                        </div>
                        <div style="margin-top:8px;display:flex;gap:8px;">
                            <button class="haldo-btn" style="font-size:12px;padding:4px 12px;" onclick="VideoStudioProApp.togglePlay()">${this.isPlaying ? '⏸' : '▶️'}</button>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:4px 12px;" onclick="VideoStudioProApp.stopPlayback()">⏹</button>
                        </div>
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
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('timeline')">🎞️ Timeline</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('preview')">👁️ Vorschau</button>
                    <button class="haldo-btn ${this.currentMode === 'effects' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('titles')">📝 Titel</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('export')">📤 Export</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="VideoStudioProApp.addEffect()">+</button>
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
                                    <div style="font-size:10px;color:var(--text-secondary);">${effect.type} • ${effect.intensity}%</div>
                                </div>
                                <div>
                                    <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="VideoStudioProApp.editEffect('${effect.id}')">✏️</button>
                                    <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();VideoStudioProApp.deleteEffect('${effect.id}')">✕</button>
                                </div>
                            </div>
                            <div style="margin-top:4px;display:flex;gap:4px;align-items:center;">
                                <span style="font-size:9px;color:var(--text-muted);">Intensität</span>
                                <input type="range" min="0" max="100" value="${effect.intensity}" style="flex:1;accent-color:var(--primary);" 
                                    oninput="VideoStudioProApp.updateEffectIntensity('${effect.id}', this.value)">
                                <span style="font-size:9px;color:var(--text-muted);">${effect.intensity}%</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- TITEL ----
    renderTitles() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('timeline')">🎞️ Timeline</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('preview')">👁️ Vorschau</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn ${this.currentMode === 'titles' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('titles')">📝 Titel</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('export')">📤 Export</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="VideoStudioProApp.addTitle()">+</button>
                </div>
                
                <!-- Titel -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.titles.map(title => `
                        <div style="
                            padding:10px 12px;
                            margin:4px 0;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        ">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${title.text}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${title.start}s - ${title.start + title.duration}s • ${title.size}px</div>
                                    <div style="font-size:9px;color:var(--text-muted);">${title.position}</div>
                                </div>
                                <div style="display:flex;gap:4px;">
                                    <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="VideoStudioProApp.editTitle('${title.id}')">✏️</button>
                                    <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();VideoStudioProApp.deleteTitle('${title.id}')">✕</button>
                                </div>
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
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('timeline')">🎞️ Timeline</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('preview')">👁️ Vorschau</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('effects')">✨ Effekte</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('titles')">📝 Titel</button>
                    <button class="haldo-btn ${this.currentMode === 'export' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioProApp.setMode('export')">📤 Export</button>
                </div>
                
                <!-- Export -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <div style="padding:16px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">📤 Video exportieren</h3>
                        <p style="font-size:11px;color:var(--text-secondary);">Exportiere dein Projekt als Videodatei</p>
                        
                        <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Format:</span>
                                <select class="haldo-input" style="font-size:10px;padding:2px 6px;flex:1;">
                                    <option>MP4 (H.264, 1080p)</option>
                                    <option>MP4 (H.264, 720p)</option>
                                    <option>MOV (ProRes)</option>
                                    <option>AVI</option>
                                    <option>WebM</option>
                                    <option>GIF</option>
                                </select>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Name:</span>
                                <input class="haldo-input" value="${this.projectName}" style="flex:1;font-size:11px;" 
                                    onchange="VideoStudioProApp.projectName = this.value; VideoStudioProApp.saveData();">
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Dauer:</span>
                                <span style="font-size:11px;color:var(--text-primary);">${this.formatTime(this.duration)}</span>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Qualität:</span>
                                <select class="haldo-input" style="font-size:10px;padding:2px 6px;flex:1;">
                                    <option>Hoch (1080p, 30fps)</option>
                                    <option>Mittel (720p, 30fps)</option>
                                    <option>Niedrig (480p, 24fps)</option>
                                    <option>4K (2160p, 60fps)</option>
                                </select>
                            </div>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                                <button class="haldo-btn" style="font-size:12px;padding:6px 16px;" onclick="VideoStudioProApp.exportVideo()">📤 Exportieren</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:6px 16px;" onclick="VideoStudioProApp.previewProject()">🎬 Vorschau</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:6px 16px;" onclick="if(confirm('Projekt wirklich löschen?')){VideoStudioProApp.clearProject();}">🗑️ Projekt löschen</button>
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
        const name = prompt('🎞️ Track-Name:', `Track ${this.tracks.length + 1}`);
        if (!name) return;
        const type = prompt('📁 Typ (video/audio/title):', 'video') || 'video';
        
        this.tracks.push({
            id: 't_' + Date.now().toString(36),
            name: name,
            type: type,
            color: this.getRandomColor(),
            visible: true,
            locked: false
        });
        this.saveData();
        this.updateView();
    },
    
    selectTrack(trackId) {
        this.selectedTrack = this.selectedTrack === trackId ? null : trackId;
        this.updateView();
    },
    
    toggleVisibility(trackId) {
        const track = this.tracks.find(t => t.id === trackId);
        if (track) {
            track.visible = !track.visible;
            this.saveData();
            this.updateView();
        }
    },
    
    // ---- CLIPS ----
    addClip() {
        const name = prompt('🎬 Clip-Name:', `Clip ${this.clips.length + 1}`);
        if (!name) return;
        const trackId = this.selectedTrack || this.tracks[0]?.id;
        if (!trackId) {
            alert('⚠️ Bitte wähle zuerst eine Spur aus.');
            return;
        }
        const duration = parseInt(prompt('⏱️ Dauer (Sekunden):', '5')) || 5;
        const start = parseFloat(prompt('▶️ Start (Sekunden):', '0')) || 0;
        
        this.clips.push({
            id: 'c_' + Date.now().toString(36),
            trackId: trackId,
            start: start,
            duration: duration,
            name: name,
            color: this.getRandomColor(),
            thumbnail: '🎬'
        });
        this.saveData();
        this.updateView();
    },
    
    selectClip(clipId) {
        this.selectedClip = this.selectedClip === clipId ? null : clipId;
        this.updateView();
    },
    
    // ---- ÜBERGÄNGE ----
    addTransition() {
        const name = prompt('🌊 Übergangs-Name:', `Übergang ${this.transitions.length + 1}`);
        if (!name) return;
        const duration = parseFloat(prompt('⏱️ Dauer (Sekunden):', '0.5')) || 0.5;
        
        this.transitions.push({
            id: 'tr_' + Date.now().toString(36),
            name: name,
            type: 'crossfade',
            duration: duration,
            color: this.getRandomColor()
        });
        this.saveData();
        this.updateView();
    },
    
    // ---- EFFEKTE ----
    addEffect() {
        const name = prompt('✨ Effekt-Name:', `Effekt ${this.effects.length + 1}`);
        if (!name) return;
        const type = prompt('📂 Typ (filter/blur):', 'filter') || 'filter';
        const intensity = parseInt(prompt('📊 Intensität (0-100):', '50')) || 50;
        
        this.effects.push({
            id: 'e_' + Date.now().toString(36),
            name: name,
            type: type,
            intensity: intensity
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
    
    updateEffectIntensity(effectId, value) {
        const effect = this.effects.find(e => e.id === effectId);
        if (effect) {
            effect.intensity = parseInt(value);
            this.saveData();
            this.updateView();
        }
    },
    
    // ---- TITEL ----
    addTitle() {
        const text = prompt('📝 Titel-Text:', 'Mein Titel');
        if (!text) return;
        const start = parseFloat(prompt('▶️ Start (Sekunden):', '0')) || 0;
        const duration = parseInt(prompt('⏱️ Dauer (Sekunden):', '3')) || 3;
        const size = parseInt(prompt('📏 Schriftgröße:', '48')) || 48;
        const color = prompt('🎨 Farbe (Hex):', '#FFFFFF') || '#FFFFFF';
        const position = prompt('📍 Position (center/top/bottom):', 'center') || 'center';
        
        this.titles.push({
            id: 'ti_' + Date.now().toString(36),
            text: text,
            start: start,
            duration: duration,
            size: size,
            color: color,
            position: position
        });
        this.saveData();
        this.updateView();
    },
    
    editTitle(titleId) {
        const title = this.titles.find(t => t.id === titleId);
        if (!title) return;
        const newText = prompt('✏️ Neuer Text:', title.text);
        if (newText) {
            title.text = newText;
            this.saveData();
            this.updateView();
        }
    },
    
    deleteTitle(titleId) {
        if (!confirm('Titel wirklich löschen?')) return;
        this.titles = this.titles.filter(t => t.id !== titleId);
        this.saveData();
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
        this.currentTime = 0;
        if (this._playbackInterval) {
            clearInterval(this._playbackInterval);
        }
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
            if (this.currentTime >= this.duration) {
                this.stopPlayback();
            }
            this.updateView();
        }, 100);
    },
    
    seekTo(value) {
        const percent = parseInt(value) / 100;
        this.currentTime = percent * this.duration;
        this.updateView();
    },
    
    // ---- EXPORT ----
    exportVideo() {
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
            <div style="font-size:24px;">🎥</div>
            <div style="font-size:14px;color:var(--text-primary);margin-top:8px;">Exportiere Video...</div>
            <div style="width:200px;height:4px;background:var(--glass-border);border-radius:10px;margin-top:12px;overflow:hidden;">
                <div id="export-progress" style="width:0%;height:100%;background:var(--primary);border-radius:10px;transition:width 0.3s ease;"></div>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${this.projectName}</div>
        `;
        document.body.appendChild(progress);
        
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 10 + 5;
            if (p >= 100) {
                clearInterval(interval);
                document.body.removeChild(progress);
                alert('✅ Video erfolgreich exportiert!\n\nDatei: ' + this.projectName + '.mp4\nDauer: ' + this.formatTime(this.duration));
                EventBus.emit('studio:video-exported', { name: this.projectName });
                this.updateView();
            } else {
                const bar = document.getElementById('export-progress');
                if (bar) bar.style.width = Math.min(p, 100) + '%';
            }
        }, 300);
    },
    
    previewProject() {
        alert('🎬 Vorschau wird abgespielt...');
    },
    
    clearProject() {
        this.tracks = [];
        this.clips = [];
        this.transitions = [];
        this.titles = [];
        this.effects = [];
        this.currentTime = 0;
        this.isPlaying = false;
        this.saveData();
        this.updateView();
        alert('🗑️ Projekt gelöscht');
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
                if (e.key === 's' || e.key === 'S') {
                    this.stopPlayback();
                }
                if (e.key === 'Escape') {
                    this.setMode('timeline');
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🎥 Video Studio Pro App wird installiert...');
        this.loadData();
        if (this.tracks.length === 0) {
            this.tracks = this.defaultTracks;
            this.clips = this.defaultClips;
            this.transitions = this.defaultTransitions;
            this.titles = this.defaultTitles;
            this.effects = this.defaultEffects;
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Video Studio Pro App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
VideoStudioProApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.VideoStudioProApp = VideoStudioProApp;

console.log('🎥 Video Studio Pro App geladen – HalDo AI OS 24.6.0');
