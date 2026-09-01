/**
 * HALDO AI OS 24.6.0 – VIDEO STUDIO APP
 * Professionelle Videobearbeitung mit Projektverwaltung, Timeline, Effekten und Export
 * Version: 1.0.0
 */

const VideoStudioApp = {
    // ---- APP-INFO ----
    id: 'video-studio',
    name: 'Video Studio',
    icon: '🎬',
    category: 'media',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Videos erstellen, schneiden, bearbeiten und exportieren',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'project', // project | edit | export
    currentTime: 0,
    duration: 120,
    isPlaying: false,
    projectName: 'Mein Video',
    
    // ---- PROJEKTDATEN ----
    clips: [],
    timeline: [],
    selectedClip: null,
    effects: [],
    transitions: [],
    
    // ---- STANDARD-CLIPS ----
    defaultClips: [
        { id: 'clip1', name: 'Einführung', type: 'video', duration: 15, thumbnail: '🎬', color: '#FF6B6B' },
        { id: 'clip2', name: 'Hauptteil', type: 'video', duration: 45, thumbnail: '🎥', color: '#4D96FF' },
        { id: 'clip3', name: 'Zwischensequenz', type: 'video', duration: 20, thumbnail: '🎞️', color: '#6BCB77' },
        { id: 'clip4', name: 'Abschluss', type: 'video', duration: 30, thumbnail: '🏁', color: '#FFA94D' },
        { id: 'clip5', name: 'Musik', type: 'audio', duration: 60, thumbnail: '🎵', color: '#9B59B6' },
        { id: 'clip6', name: 'Voiceover', type: 'audio', duration: 35, thumbnail: '🎤', color: '#FF6B9D' }
    ],
    
    // ---- STANDARD-EFFEKTE ----
    defaultEffects: [
        { id: 'eff1', name: 'Weichzeichnen', icon: '🌫️', desc: 'Weichzeichnungs-Effekt' },
        { id: 'eff2', name: 'Sepia', icon: '🟫', desc: 'Alter Sepia-Look' },
        { id: 'eff3', name: 'Schwarz-Weiß', icon: '⚫', desc: 'Schwarz-Weiß-Filter' },
        { id: 'eff4', name: 'Vintage', icon: '📻', desc: 'Vintage-Look' },
        { id: 'eff5', name: 'HDR', icon: '🌈', desc: 'HDR-Effekt' }
    ],
    
    // ---- STANDARD-ÜBERGÄNGE ----
    defaultTransitions: [
        { id: 't1', name: 'Überblendung', icon: '🌊', desc: 'Sanfter Übergang' },
        { id: 't2', name: 'Wisch', icon: '➡️', desc: 'Wisch-Übergang' },
        { id: 't3', name: 'Zoom', icon: '🔍', desc: 'Zoom-Übergang' },
        { id: 't4', name: 'Drehung', icon: '🔄', desc: 'Rotierender Übergang' },
        { id: 't5', name: 'Licht', icon: '💡', desc: 'Licht-Übergang' }
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
            console.log('🎬 Video Studio App registriert');
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
        this.currentMode = params.mode || 'project';
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 700,
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
        this.clips = Storage.get('video_studio_clips', this.defaultClips);
        this.timeline = Storage.get('video_studio_timeline', this.defaultClips.map(c => c.id));
        this.projectName = Storage.get('video_studio_project', 'Mein Video');
        this.effects = Storage.get('video_studio_effects', this.defaultEffects);
        this.transitions = Storage.get('video_studio_transitions', this.defaultTransitions);
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('video_studio_clips', this.clips);
        Storage.set('video_studio_timeline', this.timeline);
        Storage.set('video_studio_project', this.projectName);
        Storage.set('video_studio_effects', this.effects);
        Storage.set('video_studio_transitions', this.transitions);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'project': return this.renderProject();
            case 'edit': return this.renderEdit();
            case 'export': return this.renderExport();
            default: return this.renderProject();
        }
    },
    
    // ---- PROJEKTANSICHT ----
    renderProject() {
        const totalDuration = this.timeline.reduce((sum, id) => {
            const clip = this.clips.find(c => c.id === id);
            return sum + (clip ? clip.duration : 0);
        }, 0);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <button class="haldo-btn ${this.currentMode === 'project' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioApp.setMode('project')">📁 Projekt</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioApp.setMode('edit')">✂️ Bearbeiten</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioApp.setMode('export')">📤 Export</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <input class="haldo-input" value="${this.projectName}" placeholder="Projektname..." style="width:150px;font-size:11px;" 
                        onchange="VideoStudioApp.projectName = this.value; VideoStudioApp.saveData();">
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="VideoStudioApp.addClip()">+ Clip</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="VideoStudioApp.importClip()">📥 Import</button>
                </div>
                
                <!-- Übersicht -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));">
                    <div style="padding:4px;text-align:center;">
                        <div style="font-size:10px;color:var(--text-muted);">Clips</div>
                        <div style="font-size:16px;font-weight:700;color:var(--text-primary);">${this.clips.length}</div>
                    </div>
                    <div style="padding:4px;text-align:center;">
                        <div style="font-size:10px;color:var(--text-muted);">Timeline</div>
                        <div style="font-size:16px;font-weight:700;color:var(--text-primary);">${this.timeline.length}</div>
                    </div>
                    <div style="padding:4px;text-align:center;">
                        <div style="font-size:10px;color:var(--text-muted);">Dauer</div>
                        <div style="font-size:16px;font-weight:700;color:var(--text-primary);">${this.formatTime(totalDuration)}</div>
                    </div>
                    <div style="padding:4px;text-align:center;">
                        <div style="font-size:10px;color:var(--text-muted);">Effekte</div>
                        <div style="font-size:16px;font-weight:700;color:var(--text-primary);">${this.effects.length}</div>
                    </div>
                </div>
                
                <!-- Clip-Bibliothek -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:6px;">🎬 Clip-Bibliothek</div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px;">
                        ${this.clips.map(clip => {
                            const inTimeline = this.timeline.includes(clip.id);
                            return `
                                <div style="
                                    padding:8px;
                                    background: ${inTimeline ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                    border-radius:8px;
                                    border:1px solid ${inTimeline ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                    cursor:pointer;
                                    transition: all 0.15s ease;
                                " onclick="VideoStudioApp.selectClip('${clip.id}')">
                                    <div style="display:flex;gap:8px;align-items:center;">
                                        <div style="font-size:24px;">${clip.thumbnail || '🎬'}</div>
                                        <div style="flex:1;">
                                            <div style="font-size:11px;font-weight:600;color:var(--text-primary);">${clip.name}</div>
                                            <div style="font-size:9px;color:var(--text-muted);">${clip.type} • ${clip.duration}s</div>
                                        </div>
                                    </div>
                                    <div style="margin-top:4px;display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();VideoStudioApp.addToTimeline('${clip.id}')">📥 Timeline</button>
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();VideoStudioApp.deleteClip('${clip.id}')">✕</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>🎬 ${this.clips.length} Clips • ${this.timeline.length} in Timeline</span>
                    <span>${this.projectName} • ${this.formatTime(totalDuration)}</span>
                </div>
            </div>
        `;
    },
    
    // ---- BEARBEITUNGSANSICHT ----
    renderEdit() {
        const timelineClips = this.timeline.map(id => this.clips.find(c => c.id === id)).filter(Boolean);
        const totalDuration = timelineClips.reduce((sum, c) => sum + (c ? c.duration : 0), 0);
        const progress = this.duration > 0 ? (this.currentTime / this.duration * 100) : 0;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioApp.setMode('project')">📁 Projekt</button>
                    <button class="haldo-btn ${this.currentMode === 'edit' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioApp.setMode('edit')">✂️ Bearbeiten</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioApp.setMode('export')">📤 Export</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="VideoStudioApp.previewVideo()">👁️ Vorschau</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="VideoStudioApp.addEffect()">✨ Effekt</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="VideoStudioApp.addTransition()">🌊 Übergang</button>
                </div>
                
                <!-- Vorschau -->
                <div style="padding:8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));">
                    <div style="
                        aspect-ratio:16/9;
                        background:rgba(0,0,0,0.5);
                        border-radius:8px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                    ">
                        <div style="text-align:center;">
                            <div style="font-size:48px;">🎬</div>
                            <div style="font-size:14px;color:var(--text-secondary);">${this.projectName}</div>
                            <div style="font-size:11px;color:var(--text-muted);">${timelineClips.length} Clips • ${this.formatTime(totalDuration)}</div>
                            <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">
                                <button class="haldo-btn" style="font-size:12px;padding:4px 12px;" onclick="VideoStudioApp.togglePlayback()">${this.isPlaying ? '⏸' : '▶️'}</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:4px 12px;" onclick="VideoStudioApp.stopPlayback()">⏹</button>
                            </div>
                            <div style="margin-top:8px;display:flex;gap:4px;align-items:center;width:80%;margin-left:auto;margin-right:auto;">
                                <span style="font-size:10px;color:var(--text-muted);">${this.formatTime(this.currentTime)}</span>
                                <input type="range" min="0" max="100" value="${progress}" style="flex:1;accent-color:var(--primary);" 
                                    oninput="VideoStudioApp.seekTo(this.value)">
                                <span style="font-size:10px;color:var(--text-muted);">${this.formatTime(totalDuration)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Timeline -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:6px;">📋 Timeline</div>
                    ${timelineClips.length === 0 ? `
                        <div style="text-align:center;padding:20px;color:var(--text-muted);">
                            <p style="font-size:12px;">Keine Clips in der Timeline</p>
                            <button class="haldo-btn" style="font-size:11px;margin-top:4px;" onclick="VideoStudioApp.setMode('project')">📁 Clips hinzufügen</button>
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:2px;">
                            ${timelineClips.map((clip, index) => `
                                <div style="
                                    display:grid;
                                    grid-template-columns:30px 120px 1fr 80px 60px;
                                    gap:4px;
                                    padding:4px 8px;
                                    background: ${this.selectedClip === clip.id ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                    border-radius:6px;
                                    border:1px solid ${this.selectedClip === clip.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                    align-items:center;
                                    cursor:pointer;
                                    transition: all 0.15s ease;
                                " onclick="VideoStudioApp.selectTimelineClip('${clip.id}')">
                                    <div style="font-size:14px;">${clip.thumbnail || '🎬'}</div>
                                    <div style="font-size:11px;color:var(--text-primary);">${clip.name}</div>
                                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();VideoStudioApp.editClip('${clip.id}')">✂️</button>
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();VideoStudioApp.moveUp('${clip.id}')">⬆️</button>
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();VideoStudioApp.moveDown('${clip.id}')">⬇️</button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();VideoStudioApp.removeFromTimeline('${clip.id}')">✕</button>
                                    </div>
                                    <div style="font-size:10px;color:var(--text-muted);">${clip.duration}s</div>
                                    <div style="font-size:9px;color:var(--text-muted);">#${index + 1}</div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>✂️ ${timelineClips.length} Clips in Timeline</span>
                    <span>📊 ${this.formatTime(totalDuration)}</span>
                </div>
            </div>
        `;
    },
    
    // ---- EXPORT ----
    renderExport() {
        const timelineClips = this.timeline.map(id => this.clips.find(c => c.id === id)).filter(Boolean);
        const totalDuration = timelineClips.reduce((sum, c) => sum + (c ? c.duration : 0), 0);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioApp.setMode('project')">📁 Projekt</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioApp.setMode('edit')">✂️ Bearbeiten</button>
                    <button class="haldo-btn ${this.currentMode === 'export' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioApp.setMode('export')">📤 Export</button>
                </div>
                
                <!-- Export -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <div style="padding:16px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <h3 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">📤 Video exportieren</h3>
                        <p style="font-size:11px;color:var(--text-secondary);">Exportiere dein Video in verschiedenen Formaten</p>
                        
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
                                    onchange="VideoStudioApp.projectName = this.value; VideoStudioApp.saveData();">
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Dauer:</span>
                                <span style="font-size:11px;color:var(--text-primary);">${this.formatTime(totalDuration)}</span>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <span style="font-size:11px;color:var(--text-secondary);">Qualität:</span>
                                <select class="haldo-input" style="font-size:10px;padding:2px 6px;flex:1;">
                                    <option>Hoch (1080p)</option>
                                    <option>Mittel (720p)</option>
                                    <option>Niedrig (480p)</option>
                                    <option>Sehr hoch (4K)</option>
                                </select>
                            </div>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                                <button class="haldo-btn" style="font-size:12px;padding:6px 16px;" onclick="VideoStudioApp.exportVideo()">📤 Exportieren</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:6px 16px;" onclick="VideoStudioApp.previewVideo()">🎬 Vorschau</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:6px 16px;" onclick="if(confirm('Projekt wirklich löschen?')){VideoStudioApp.clearProject();}">🗑️ Projekt löschen</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:8px;padding:8px 12px;background:rgba(0,255,136,0.05);border-radius:8px;border:1px solid rgba(0,255,136,0.1);">
                        <div style="font-size:11px;color:var(--text-secondary);">💡 Tipp: Füge Effekte und Übergänge hinzu, bevor du exportierst.</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- CLIPS VERWALTEN ----
    addClip() {
        const name = prompt('🎬 Clip-Name:', `Clip ${this.clips.length + 1}`);
        if (!name) return;
        const type = prompt('📁 Typ (video/audio/image):', 'video') || 'video';
        const duration = parseInt(prompt('⏱️ Dauer (Sekunden):', '10')) || 10;
        
        this.clips.push({
            id: 'clip_' + Date.now().toString(36),
            name: name,
            type: type,
            duration: duration,
            thumbnail: this.getRandomThumbnail(),
            color: this.getRandomColor()
        });
        
        this.saveData();
        this.updateView();
        EventBus.emit('studio:clip-added', { name });
    },
    
    importClip() {
        const name = prompt('📥 Dateiname:', `import_${this.clips.length + 1}`);
        if (!name) return;
        const type = prompt('📁 Typ (video/audio/image):', 'video') || 'video';
        const duration = parseInt(prompt('⏱️ Dauer (Sekunden):', '15')) || 15;
        
        this.clips.push({
            id: 'clip_' + Date.now().toString(36),
            name: name,
            type: type,
            duration: duration,
            thumbnail: this.getRandomThumbnail(),
            color: this.getRandomColor(),
            imported: true
        });
        
        this.saveData();
        this.updateView();
        alert('✅ Clip importiert!');
        EventBus.emit('studio:clip-imported', { name });
    },
    
    selectClip(clipId) {
        this.selectedClip = clipId;
        this.updateView();
    },
    
    deleteClip(clipId) {
        if (!confirm('Clip wirklich löschen?')) return;
        this.clips = this.clips.filter(c => c.id !== clipId);
        this.timeline = this.timeline.filter(id => id !== clipId);
        this.saveData();
        this.updateView();
    },
    
    // ---- TIMELINE ----
    addToTimeline(clipId) {
        if (this.timeline.includes(clipId)) {
            alert('ℹ️ Clip bereits in der Timeline.');
            return;
        }
        this.timeline.push(clipId);
        this.saveData();
        this.updateView();
        EventBus.emit('studio:clip-added-to-timeline', { clipId });
    },
    
    removeFromTimeline(clipId) {
        this.timeline = this.timeline.filter(id => id !== clipId);
        this.saveData();
        this.updateView();
    },
    
    selectTimelineClip(clipId) {
        this.selectedClip = clipId;
        this.updateView();
    },
    
    moveUp(clipId) {
        const index = this.timeline.indexOf(clipId);
        if (index <= 0) return;
        [this.timeline[index], this.timeline[index - 1]] = [this.timeline[index - 1], this.timeline[index]];
        this.saveData();
        this.updateView();
    },
    
    moveDown(clipId) {
        const index = this.timeline.indexOf(clipId);
        if (index >= this.timeline.length - 1) return;
        [this.timeline[index], this.timeline[index + 1]] = [this.timeline[index + 1], this.timeline[index]];
        this.saveData();
        this.updateView();
    },
    
    editClip(clipId) {
        const clip = this.clips.find(c => c.id === clipId);
        if (!clip) return;
        
        const newName = prompt('✂️ Neuer Name:', clip.name);
        if (newName && newName.trim()) {
            clip.name = newName.trim();
        }
        const newDuration = parseInt(prompt('⏱️ Neue Dauer (Sekunden):', clip.duration));
        if (newDuration && newDuration > 0) {
            clip.duration = newDuration;
        }
        
        this.saveData();
        this.updateView();
    },
    
    // ---- EFFEKTE ----
    addEffect() {
        const name = prompt('✨ Name des Effekts:', `Effekt ${this.effects.length + 1}`);
        if (!name) return;
        const icon = prompt('🎨 Icon (Emoji):', '✨') || '✨';
        
        this.effects.push({
            id: 'eff_' + Date.now().toString(36),
            name: name,
            icon: icon,
            desc: `${name}-Effekt`
        });
        
        this.saveData();
        this.updateView();
        alert('✅ Effekt hinzugefügt!');
    },
    
    // ---- ÜBERGÄNGE ----
    addTransition() {
        const name = prompt('🌊 Name des Übergangs:', `Übergang ${this.transitions.length + 1}`);
        if (!name) return;
        const icon = prompt('🎨 Icon (Emoji):', '🌊') || '🌊';
        
        this.transitions.push({
            id: 't_' + Date.now().toString(36),
            name: name,
            icon: icon,
            desc: `${name}-Übergang`
        });
        
        this.saveData();
        this.updateView();
        alert('✅ Übergang hinzugefügt!');
    },
    
    // ---- PLAYBACK ----
    togglePlayback() {
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
        const totalDuration = this.timeline.reduce((sum, id) => {
            const clip = this.clips.find(c => c.id === id);
            return sum + (clip ? clip.duration : 0);
        }, 0);
        this.duration = totalDuration || 120;
        
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
    
    // ---- VORSCHAU ----
    previewVideo() {
        const timelineClips = this.timeline.map(id => this.clips.find(c => c.id === id)).filter(Boolean);
        const totalDuration = timelineClips.reduce((sum, c) => sum + (c ? c.duration : 0), 0);
        
        let previewContent = `
            <div style="text-align:center;padding:12px;">
                <div style="font-size:48px;">🎬</div>
                <h3 style="color:var(--text-primary);font-size:16px;margin:4px 0;">${this.projectName}</h3>
                <p style="font-size:12px;color:var(--text-secondary);">${timelineClips.length} Clips • ${this.formatTime(totalDuration)}</p>
                <div style="display:flex;flex-direction:column;gap:4px;margin-top:8px;text-align:left;max-height:200px;overflow-y:auto;">
        `;
        
        timelineClips.forEach((clip, i) => {
            previewContent += `
                <div style="display:flex;gap:8px;padding:4px 8px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:4px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <span style="font-size:16px;">${clip.thumbnail || '🎬'}</span>
                    <span style="font-size:11px;color:var(--text-primary);">${i+1}. ${clip.name}</span>
                    <span style="font-size:10px;color:var(--text-muted);">${clip.duration}s</span>
                </div>
            `;
        });
        
        previewContent += `
                </div>
                <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;">
                    <button class="haldo-btn" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioApp.togglePlayback()">${this.isPlaying ? '⏸' : '▶️'}</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="VideoStudioApp.stopPlayback()">⏹</button>
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'video-preview',
            '🎬 Vorschau',
            previewContent,
            '🎬',
            400,
            350
        );
    },
    
    // ---- EXPORT ----
    exportVideo() {
        const timelineClips = this.timeline.map(id => this.clips.find(c => c.id === id)).filter(Boolean);
        const totalDuration = timelineClips.reduce((sum, c) => sum + (c ? c.duration : 0), 0);
        
        if (timelineClips.length === 0) {
            alert('⚠️ Keine Clips in der Timeline. Bitte füge zuerst Clips hinzu.');
            return;
        }
        
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
            <div style="font-size:24px;">🎬</div>
            <div style="font-size:14px;color:var(--text-primary);margin-top:8px;">Exportiere Video...</div>
            <div style="width:200px;height:4px;background:var(--glass-border);border-radius:10px;margin-top:12px;overflow:hidden;">
                <div id="video-export-progress" style="width:0%;height:100%;background:var(--primary);border-radius:10px;transition:width 0.3s ease;"></div>
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
                alert('✅ Video erfolgreich exportiert!\n\nDatei: ' + this.projectName + '.mp4\nDauer: ' + this.formatTime(totalDuration));
                EventBus.emit('studio:video-exported', { name: this.projectName });
                this.updateView();
            } else {
                const bar = document.getElementById('video-export-progress');
                if (bar) bar.style.width = Math.min(p, 100) + '%';
            }
        }, 300);
    },
    
    clearProject() {
        this.clips = [];
        this.timeline = [];
        this.effects = this.defaultEffects;
        this.transitions = this.defaultTransitions;
        this.currentTime = 0;
        this.isPlaying = false;
        this.saveData();
        this.updateView();
        alert('🗑️ Projekt gelöscht');
    },
    
    // ---- MODUS ----
    setMode(mode) {
        this.currentMode = mode;
        this.updateView();
    },
    
    // ---- HELPER ----
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },
    
    getRandomThumbnail() {
        const thumbnails = ['🎬', '🎥', '🎞️', '📹', '🎦', '📽️', '🎬', '🎥'];
        return thumbnails[Math.floor(Math.random() * thumbnails.length)];
    },
    
    getRandomColor() {
        const colors = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFA94D', '#9B59B6', '#FF6B9D', '#2ECC71', '#F39C12'];
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
                    this.togglePlayback();
                }
                if (e.key === 's' || e.key === 'S') {
                    this.stopPlayback();
                }
                if (e.key === 'Escape') {
                    this.setMode('project');
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🎬 Video Studio App wird installiert...');
        this.loadData();
        if (this.clips.length === 0) {
            this.clips = this.defaultClips;
            this.timeline = this.defaultClips.map(c => c.id);
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Video Studio App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
VideoStudioApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.VideoStudioApp = VideoStudioApp;

console.log('🎬 Video Studio App geladen – HalDo AI OS 24.6.0');
