/**
 * HALDO AI OS 24.6.0 – MUSIC APP
 * Professioneller Musikplayer mit Bibliothek, Playlists und Player
 * Version: 1.0.0
 */

const MusicApp = {
    // ---- APP-INFO ----
    id: 'music',
    name: 'Musik',
    icon: '🎵',
    category: 'media',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Musikbibliothek, Playlists und Player',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    tracks: [],
    playlists: [],
    currentPlaylist: null,
    currentTrack: null,
    currentTrackIndex: -1,
    isPlaying: false,
    isShuffled: false,
    repeatMode: 'none', // none | one | all
    volume: 80,
    progress: 0,
    duration: 0,
    audio: null,
    searchQuery: '',
    viewMode: 'list', // list | grid
    
    // ---- STANDARD-TRACKS ----
    defaultTracks: [
        { id: 'track1', title: 'Cosmic Dreams', artist: 'HalDo AI', album: 'Cosmic World', duration: 210, cover: '🌌', path: '/audio/cosmic.mp3' },
        { id: 'track2', title: 'Digital Sunrise', artist: 'HalDo AI', album: 'Digital World', duration: 180, cover: '🌅', path: '/audio/sunrise.mp3' },
        { id: 'track3', title: 'Neon Lights', artist: 'HalDo AI', album: 'Night City', duration: 240, cover: '🌃', path: '/audio/neon.mp3' },
        { id: 'track4', title: 'Starlight Journey', artist: 'HalDo AI', album: 'Cosmic World', duration: 195, cover: '⭐', path: '/audio/starlight.mp3' },
        { id: 'track5', title: 'Ocean Waves', artist: 'HalDo AI', album: 'Nature Sounds', duration: 165, cover: '🌊', path: '/audio/ocean.mp3' },
        { id: 'track6', title: 'Midnight Groove', artist: 'HalDo AI', album: 'Night City', duration: 220, cover: '🌙', path: '/audio/midnight.mp3' }
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
            console.log('🎵 Music App registriert');
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
            params.width || 560,
            params.height || 480
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
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
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
        this.tracks = Storage.get('music_tracks', this.defaultTracks);
        this.playlists = Storage.get('music_playlists', [
            { id: 'playlist1', name: 'Favoriten', tracks: ['track1', 'track3', 'track5'] },
            { id: 'playlist2', name: 'Chill', tracks: ['track4', 'track6'] },
            { id: 'playlist3', name: 'Workout', tracks: ['track2', 'track5'] }
        ]);
        this.currentPlaylist = Storage.get('music_current_playlist', null);
        this.currentTrackIndex = Storage.get('music_current_track_index', -1);
        this.isShuffled = Storage.get('music_shuffled', false);
        this.repeatMode = Storage.get('music_repeat_mode', 'none');
        this.volume = Storage.get('music_volume', 80);
        
        if (this.currentTrackIndex >= 0 && this.tracks.length > 0) {
            this.currentTrack = this.tracks[this.currentTrackIndex] || null;
        }
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('music_tracks', this.tracks);
        Storage.set('music_playlists', this.playlists);
        Storage.set('music_current_playlist', this.currentPlaylist);
        Storage.set('music_current_track_index', this.currentTrackIndex);
        Storage.set('music_shuffled', this.isShuffled);
        Storage.set('music_repeat_mode', this.repeatMode);
        Storage.set('music_volume', this.volume);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        const tracks = this.getFilteredTracks();
        const playlistTracks = this.getPlaylistTracks();
        const currentTrack = this.currentTrack;
        const progressPercent = this.duration > 0 ? (this.progress / this.duration * 100) : 0;
        const volumePercent = this.volume;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopfleiste -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <div style="display:flex;gap:4px;flex:1;min-width:80px;">
                        <input id="music-search" class="haldo-input" placeholder="🔍 Suchen..." style="flex:1;font-size:11px;" 
                            oninput="MusicApp.searchMusic(this.value)">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="MusicApp.toggleView()">${this.viewMode === 'list' ? '📐' : '📋'}</button>
                    </div>
                    <div style="display:flex;gap:4px;">
                        <select id="music-playlist-select" class="haldo-input" style="font-size:10px;padding:2px 6px;width:120px;" onchange="MusicApp.selectPlaylist(this.value)">
                            <option value="">📋 Alle Tracks</option>
                            ${this.playlists.map(p => `
                                <option value="${p.id}" ${this.currentPlaylist === p.id ? 'selected' : ''}>${p.name}</option>
                            `).join('')}
                        </select>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="MusicApp.createPlaylist()">+</button>
                    </div>
                </div>
                
                <!-- Inhalt -->
                <div id="music-content" style="flex:1;overflow-y:auto;padding:4px;">
                    ${this.renderTracks(tracks)}
                </div>
                
                <!-- Player -->
                <div style="
                    border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));
                    padding:6px 10px;
                    background: var(--glass-bg, rgba(255,255,255,0.04));
                ">
                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                        <!-- Info -->
                        <div style="flex:1;min-width:120px;">
                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);">
                                ${currentTrack ? currentTrack.title : 'Kein Track ausgewählt'}
                            </div>
                            <div style="font-size:10px;color:var(--text-muted);">
                                ${currentTrack ? `${currentTrack.artist} • ${currentTrack.album}` : '—'}
                            </div>
                        </div>
                        
                        <!-- Steuerung -->
                        <div style="display:flex;gap:4px;align-items:center;">
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:2px 6px;" onclick="MusicApp.toggleShuffle()">${this.isShuffled ? '🔀' : '🔀'}</button>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:14px;padding:2px 8px;" onclick="MusicApp.previousTrack()">⏮</button>
                            <button class="haldo-btn" style="font-size:16px;padding:4px 12px;" onclick="MusicApp.togglePlay()">${this.isPlaying ? '⏸' : '▶️'}</button>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:14px;padding:2px 8px;" onclick="MusicApp.nextTrack()">⏭</button>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:12px;padding:2px 6px;" onclick="MusicApp.toggleRepeat()">
                                ${this.repeatMode === 'none' ? '🔁' : this.repeatMode === 'one' ? '🔂' : '🔁'}
                            </button>
                        </div>
                        
                        <!-- Fortschritt -->
                        <div style="flex:1;min-width:100px;display:flex;gap:4px;align-items:center;">
                            <span style="font-size:9px;color:var(--text-muted);">${this.formatTime(this.progress)}</span>
                            <input type="range" min="0" max="100" value="${progressPercent}" style="flex:1;accent-color:var(--primary);" 
                                oninput="MusicApp.seekTo(this.value)">
                            <span style="font-size:9px;color:var(--text-muted);">${this.formatTime(this.duration)}</span>
                        </div>
                        
                        <!-- Lautstärke -->
                        <div style="display:flex;gap:4px;align-items:center;width:100px;">
                            <span style="font-size:12px;">🔊</span>
                            <input type="range" min="0" max="100" value="${volumePercent}" style="flex:1;accent-color:var(--primary);" 
                                oninput="MusicApp.setVolume(this.value)">
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- TRACKS RENDERN ----
    renderTracks(tracks) {
        if (tracks.length === 0) {
            return `
                <div style="text-align:center;padding:40px 20px;color:var(--text-muted);">
                    <div style="font-size:48px;">🎵</div>
                    <p style="font-size:13px;">Keine Tracks gefunden</p>
                    <button class="haldo-btn" style="font-size:12px;margin-top:8px;" onclick="MusicApp.addTrack()">➕ Track hinzufügen</button>
                </div>
            `;
        }
        
        if (this.viewMode === 'grid') {
            return this.renderGrid(tracks);
        }
        return this.renderList(tracks);
    },
    
    // ---- LISTENANSICHT ----
    renderList(tracks) {
        return `
            <div style="display:flex;flex-direction:column;">
                ${tracks.map((track, index) => {
                    const isCurrent = this.currentTrack && this.currentTrack.id === track.id;
                    return `
                        <div class="music-track" style="
                            display:grid;
                            grid-template-columns:30px 1fr 120px 80px 60px;
                            gap:4px;
                            padding:6px 8px;
                            border-radius:6px;
                            border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));
                            cursor:pointer;
                            transition: all 0.15s ease;
                            align-items:center;
                            background: ${isCurrent ? 'rgba(108,60,225,0.15)' : 'transparent'};
                        " onclick="MusicApp.playTrack(${index})" 
                           onmouseover="this.style.background='var(--glass-bg, rgba(255,255,255,0.04))'" 
                           onmouseout="this.style.background='${isCurrent ? 'rgba(108,60,225,0.15)' : 'transparent'}'">
                            <div style="font-size:14px;color:${isCurrent ? 'var(--primary, #6C3CE1)' : 'var(--text-secondary)'};">
                                ${isCurrent ? (this.isPlaying ? '▶️' : '⏸') : '🎵'}
                            </div>
                            <div>
                                <div style="font-size:12px;font-weight:${isCurrent ? '600' : '400'};color:${isCurrent ? 'var(--primary, #6C3CE1)' : 'var(--text-primary)'};">${track.title}</div>
                                <div style="font-size:10px;color:var(--text-muted);">${track.artist}</div>
                            </div>
                            <div style="font-size:11px;color:var(--text-secondary);">${track.album}</div>
                            <div style="font-size:10px;color:var(--text-muted);">${this.formatTime(track.duration)}</div>
                            <div style="display:flex;gap:2px;">
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();MusicApp.addToPlaylist('${track.id}')">+</button>
                                <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();MusicApp.deleteTrack('${track.id}')">✕</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    // ---- GITTERANSICHT ----
    renderGrid(tracks) {
        return `
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;">
                ${tracks.map((track, index) => {
                    const isCurrent = this.currentTrack && this.currentTrack.id === track.id;
                    return `
                        <div class="music-grid-item" style="
                            padding:12px 8px;
                            background: ${isCurrent ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                            border-radius:8px;
                            border:1px solid ${isCurrent ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                            text-align:center;
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="MusicApp.playTrack(${index})">
                            <div style="font-size:40px;">${track.cover || '🎵'}</div>
                            <div style="font-size:12px;font-weight:${isCurrent ? '600' : '400'};color:${isCurrent ? 'var(--primary, #6C3CE1)' : 'var(--text-primary)'};margin-top:4px;">${track.title}</div>
                            <div style="font-size:10px;color:var(--text-muted);">${track.artist}</div>
                            <div style="font-size:9px;color:var(--text-muted);">${track.album}</div>
                            <div style="font-size:9px;color:var(--text-muted);">${this.formatTime(track.duration)}</div>
                            ${isCurrent ? `<div style="font-size:12px;margin-top:4px;">${this.isPlaying ? '▶️' : '⏸'}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    // ---- AUDIO PLAYER ----
    initAudio() {
        if (!this.audio) {
            this.audio = new Audio();
            this.audio.volume = this.volume / 100;
            
            this.audio.addEventListener('timeupdate', () => {
                this.progress = this.audio.currentTime;
                this.duration = this.audio.duration || 0;
                this.updateProgress();
            });
            
            this.audio.addEventListener('ended', () => {
                this.onTrackEnded();
            });
            
            this.audio.addEventListener('loadedmetadata', () => {
                this.duration = this.audio.duration || 0;
                this.updateProgress();
            });
        }
    },
    
    // ---- TRACK ABSPIELEN ----
    playTrack(index) {
        const tracks = this.getFilteredTracks();
        if (index < 0 || index >= tracks.length) return;
        
        const track = tracks[index];
        this.currentTrack = track;
        this.currentTrackIndex = this.tracks.findIndex(t => t.id === track.id);
        this.saveData();
        
        // Audio laden
        if (this.audio) {
            // Simuliertes Audio (weil echte Dateien nicht vorhanden)
            // In einer echten App würde hier die Datei geladen werden
            this.audio.src = track.path || '';
            this.audio.load();
            this.audio.play().catch(() => {
                // Fallback: Simuliertes Abspielen
                this.simulatePlayback();
            });
            this.isPlaying = true;
            this.updateView();
        }
        
        EventBus.emit('music:track-played', { track: track.id });
    },
    
    // ---- SIMULIERTES ABSPIELEN ----
    simulatePlayback() {
        // Für Demozwecke: Simulierte Wiedergabe ohne echte Audio-Datei
        if (this._simulationInterval) {
            clearInterval(this._simulationInterval);
        }
        
        this.duration = this.currentTrack ? this.currentTrack.duration : 180;
        this.progress = 0;
        this.isPlaying = true;
        this.updateView();
        
        this._simulationInterval = setInterval(() => {
            if (!this.isPlaying) return;
            this.progress += 1;
            this.updateProgress();
            
            if (this.progress >= this.duration) {
                this.onTrackEnded();
            }
        }, 1000);
    },
    
    // ---- TOGGLE PLAY ----
    togglePlay() {
        if (!this.currentTrack) {
            const tracks = this.getFilteredTracks();
            if (tracks.length > 0) {
                this.playTrack(0);
            }
            return;
        }
        
        if (this.isPlaying) {
            if (this.audio) {
                this.audio.pause();
            } else {
                clearInterval(this._simulationInterval);
            }
            this.isPlaying = false;
        } else {
            if (this.audio) {
                this.audio.play().catch(() => {
                    this.simulatePlayback();
                });
            } else {
                this.simulatePlayback();
            }
            this.isPlaying = true;
        }
        this.updateView();
    },
    
    // ---- NÄCHSTER/ VORHERIGER TRACK ----
    nextTrack() {
        const tracks = this.getFilteredTracks();
        if (tracks.length === 0) return;
        
        let index = tracks.findIndex(t => t.id === this.currentTrack?.id);
        if (index === -1) index = 0;
        
        if (this.isShuffled) {
            index = Math.floor(Math.random() * tracks.length);
        } else {
            index = (index + 1) % tracks.length;
        }
        
        this.playTrack(index);
    },
    
    previousTrack() {
        const tracks = this.getFilteredTracks();
        if (tracks.length === 0) return;
        
        let index = tracks.findIndex(t => t.id === this.currentTrack?.id);
        if (index === -1) index = 0;
        
        if (this.progress > 3) {
            // Wenn mehr als 3 Sekunden gespielt, zum Anfang springen
            this.progress = 0;
            if (this.audio) this.audio.currentTime = 0;
            this.updateProgress();
            return;
        }
        
        index = (index - 1 + tracks.length) % tracks.length;
        this.playTrack(index);
    },
    
    // ---- TRACK ENDE ----
    onTrackEnded() {
        if (this.repeatMode === 'one') {
            // Track wiederholen
            this.progress = 0;
            if (this.audio) {
                this.audio.currentTime = 0;
                this.audio.play();
            } else {
                this.simulatePlayback();
            }
            return;
        }
        
        if (this.repeatMode === 'all') {
            this.nextTrack();
            return;
        }
        
        const tracks = this.getFilteredTracks();
        const index = tracks.findIndex(t => t.id === this.currentTrack?.id);
        if (index < tracks.length - 1) {
            this.nextTrack();
        } else {
            this.isPlaying = false;
            this.progress = 0;
            if (this.audio) {
                this.audio.pause();
                this.audio.currentTime = 0;
            }
            clearInterval(this._simulationInterval);
            this.updateView();
        }
    },
    
    // ---- SUCHE ----
    searchMusic(query) {
        this.searchQuery = query;
        this.updateView();
    },
    
    getFilteredTracks() {
        let tracks = [...this.tracks];
        
        // Playlist-Filter
        if (this.currentPlaylist) {
            const playlist = this.playlists.find(p => p.id === this.currentPlaylist);
            if (playlist) {
                tracks = tracks.filter(t => playlist.tracks.includes(t.id));
            }
        }
        
        // Suche
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            tracks = tracks.filter(t => 
                t.title.toLowerCase().includes(query) ||
                t.artist.toLowerCase().includes(query) ||
                t.album.toLowerCase().includes(query)
            );
        }
        
        return tracks;
    },
    
    getPlaylistTracks() {
        if (!this.currentPlaylist) return this.tracks;
        const playlist = this.playlists.find(p => p.id === this.currentPlaylist);
        if (!playlist) return this.tracks;
        return this.tracks.filter(t => playlist.tracks.includes(t.id));
    },
    
    // ---- PLAYLISTS ----
    selectPlaylist(playlistId) {
        this.currentPlaylist = playlistId || null;
        this.saveData();
        this.updateView();
    },
    
    createPlaylist() {
        const name = prompt('📋 Name der neuen Playlist:');
        if (!name) return;
        
        this.playlists.push({
            id: 'playlist_' + Date.now().toString(36),
            name: name,
            tracks: []
        });
        
        this.saveData();
        this.updateView();
    },
    
    addToPlaylist(trackId) {
        if (this.playlists.length === 0) {
            alert('⚠️ Erstelle zuerst eine Playlist.');
            return;
        }
        
        const playlistId = prompt(`📋 Zu welcher Playlist hinzufügen?\n${this.playlists.map(p => `- ${p.name}`).join('\n')}`);
        if (!playlistId) return;
        
        const playlist = this.playlists.find(p => p.name === playlistId);
        if (!playlist) {
            alert('⚠️ Playlist nicht gefunden.');
            return;
        }
        
        if (playlist.tracks.includes(trackId)) {
            alert('ℹ️ Track bereits in der Playlist.');
            return;
        }
        
        playlist.tracks.push(trackId);
        this.saveData();
        alert('✅ Track zur Playlist hinzugefügt!');
    },
    
    // ---- TRACKS VERWALTEN ----
    addTrack() {
        const title = prompt('🎵 Titel:');
        if (!title) return;
        const artist = prompt('👤 Künstler:') || 'Unbekannt';
        const album = prompt('💿 Album:') || 'Unbekannt';
        const duration = parseInt(prompt('⏱️ Dauer (Sekunden):') || '180');
        
        this.tracks.push({
            id: 'track_' + Date.now().toString(36),
            title: title,
            artist: artist,
            album: album,
            duration: duration,
            cover: '🎵',
            path: '/audio/' + title.toLowerCase().replace(/\s/g, '_') + '.mp3'
        });
        
        this.saveData();
        this.updateView();
    },
    
    deleteTrack(trackId) {
        if (!confirm('Track wirklich löschen?')) return;
        
        this.tracks = this.tracks.filter(t => t.id !== trackId);
        // Aus Playlists entfernen
        for (const playlist of this.playlists) {
            playlist.tracks = playlist.tracks.filter(id => id !== trackId);
        }
        
        if (this.currentTrack?.id === trackId) {
            this.currentTrack = null;
            this.currentTrackIndex = -1;
            this.isPlaying = false;
            if (this.audio) {
                this.audio.pause();
                this.audio.src = '';
            }
            clearInterval(this._simulationInterval);
        }
        
        this.saveData();
        this.updateView();
    },
    
    // ---- PLAYER STEUERUNG ----
    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.saveData();
        this.updateView();
    },
    
    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        this.saveData();
        this.updateView();
    },
    
    setVolume(value) {
        this.volume = parseInt(value);
        if (this.audio) {
            this.audio.volume = this.volume / 100;
        }
        this.saveData();
        this.updateView();
    },
    
    seekTo(value) {
        const percent = parseInt(value) / 100;
        const time = percent * this.duration;
        this.progress = time;
        if (this.audio) {
            this.audio.currentTime = time;
        }
        this.updateProgress();
    },
    
    updateProgress() {
        const progressBar = document.querySelector('#music-content + div input[type="range"]');
        if (progressBar) {
            const percent = this.duration > 0 ? (this.progress / this.duration * 100) : 0;
            progressBar.value = percent;
        }
        // Zeit aktualisieren
        const timeElements = document.querySelectorAll('#music-content + div .music-time');
        if (timeElements.length >= 2) {
            timeElements[0].textContent = this.formatTime(this.progress);
            timeElements[1].textContent = this.formatTime(this.duration);
        }
    },
    
    // ---- VIEW WECHSELN ----
    toggleView() {
        this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
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
        // Audio-Player Events
        // (werden bereits in initAudio gesetzt)
    },
    
    // ---- HELPER ----
    formatTime(seconds) {
        if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🎵 Music App wird installiert...');
        this.loadData();
        if (this.tracks.length === 0) {
            this.tracks = this.defaultTracks;
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Music App wird deinstalliert...');
        // Daten behalten
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
MusicApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.MusicApp = MusicApp;

console.log('🎵 Music App geladen – HalDo AI OS 24.6.0');
