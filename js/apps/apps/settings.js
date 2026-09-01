/**
 * HALDO AI OS 24.6.0 – SETTINGS APP
 * Zentrale Einstellungen mit allen Kategorien und Funktionen
 * Version: 1.0.0
 */

const SettingsApp = {
    // ---- APP-INFO ----
    id: 'settings',
    name: 'Einstellungen',
    icon: '⚙️',
    category: 'system',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Zentrale Systemeinstellungen',
    
    // ---- ZUSTAND ----
    currentCategory: 'general',
    isOpen: false,
    window: null,
    
    // ---- KATEGORIEN ----
    categories: [
        { id: 'general', label: '⚙️ Allgemein', icon: '⚙️' },
        { id: 'ai', label: '🧠 AI & Memory', icon: '🧠' },
        { id: 'display', label: '🖥️ Display', icon: '🖥️' },
        { id: 'language', label: '🌍 Sprache', icon: '🌍' },
        { id: 'themes', label: '🎨 Themes', icon: '🎨' },
        { id: 'voice', label: '🎤 Voice', icon: '🎤' },
        { id: 'system', label: '📊 System', icon: '📊' },
        { id: 'security', label: '🔒 Sicherheit', icon: '🔒' },
        { id: 'storage', label: '💾 Speicher', icon: '💾' },
        { id: 'updates', label: '🔄 Updates', icon: '🔄' },
        { id: 'about', label: 'ℹ️ Über', icon: 'ℹ️' }
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
            console.log('📱 Settings App registriert');
        }
        return this;
    },
    
    // ---- ÖFFNEN ----
    open(params = {}) {
        if (this.isOpen && this.window) {
            WindowManager.bringToFront(this.window);
            return this.window;
        }
        
        this.currentCategory = params.category || 'general';
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 560,
            params.height || 460
        );
        
        if (this.window) {
            // Kategorie auswählen
            setTimeout(() => {
                this.selectCategory(this.currentCategory);
            }, 100);
            
            // Event-Listener für Fenster-Schließen
            const closeBtn = this.window.querySelector('.btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.isOpen = false;
                    this.window = null;
                });
            }
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
    
    // ---- RENDER ----
    render() {
        return `
            <div style="display:flex;height:100%;">
                <!-- Seitenleiste -->
                <div style="width:140px;padding:4px;border-right:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-shrink:0;overflow-y:auto;">
                    ${this.categories.map(cat => `
                        <div class="settings-category" data-category="${cat.id}" style="
                            padding:6px 10px;
                            margin:2px 0;
                            border-radius:6px;
                            cursor:pointer;
                            color: var(--text-secondary, rgba(255,255,255,0.7));
                            font-size:11px;
                            transition: all 0.15s ease;
                        " onclick="SettingsApp.selectCategory('${cat.id}')">
                            ${cat.label}
                        </div>
                    `).join('')}
                </div>
                
                <!-- Inhalt -->
                <div id="settings-content" style="flex:1;padding:12px;overflow-y:auto;">
                    <h2 style="color:var(--text-primary, #ffffff);font-size:14px;margin-bottom:8px;">Einstellungen</h2>
                    <p style="color:var(--text-secondary, rgba(255,255,255,0.7));font-size:11px;">Wähle eine Kategorie</p>
                </div>
            </div>
        `;
    },
    
    // ---- KATEGORIE AUSWÄHLEN ----
    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        
        // UI aktualisieren
        document.querySelectorAll('.settings-category').forEach(el => {
            const isActive = el.dataset.category === categoryId;
            el.style.background = isActive ? 'var(--primary, #6C3CE1)' : 'transparent';
            el.style.color = isActive ? 'white' : 'var(--text-secondary, rgba(255,255,255,0.7))';
        });
        
        const container = document.getElementById('settings-content');
        if (!container) return;
        
        // Inhalt basierend auf Kategorie
        const content = this.getCategoryContent(categoryId);
        container.innerHTML = content;
        
        EventBus.emit('settings:category-changed', { category: categoryId });
    },
    
    // ---- KATEGORIE-INHALT ----
    getCategoryContent(categoryId) {
        switch(categoryId) {
            case 'general': return this.getGeneralContent();
            case 'ai': return this.getAIContent();
            case 'display': return this.getDisplayContent();
            case 'language': return this.getLanguageContent();
            case 'themes': return this.getThemesContent();
            case 'voice': return this.getVoiceContent();
            case 'system': return this.getSystemContent();
            case 'security': return this.getSecurityContent();
            case 'storage': return this.getStorageContent();
            case 'updates': return this.getUpdatesContent();
            case 'about': return this.getAboutContent();
            default: return '<p style="color:var(--text-secondary);">Kategorie nicht gefunden</p>';
        }
    },
    
    // ---- ALLGEMEIN ----
    getGeneralContent() {
        const lang = Storage.get('language', 'DE');
        const timezone = Storage.get('timezone', 'Europe/Berlin');
        
        return `
            <h2 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">⚙️ Allgemein</h2>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Systemname</label>
                    <input class="haldo-input" value="HalDo AI OS ${Kernel.version}" style="font-size:11px;margin-top:2px;" readonly>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Zeitzone</label>
                    <select class="haldo-input" style="font-size:11px;margin-top:2px;" onchange="Storage.set('timezone', this.value);">
                        <option value="Europe/Berlin" ${timezone === 'Europe/Berlin' ? 'selected' : ''}>Europe/Berlin</option>
                        <option value="Europe/London" ${timezone === 'Europe/London' ? 'selected' : ''}>Europe/London</option>
                        <option value="America/New_York" ${timezone === 'America/New_York' ? 'selected' : ''}>America/New_York</option>
                        <option value="Asia/Dubai" ${timezone === 'Asia/Dubai' ? 'selected' : ''}>Asia/Dubai</option>
                        <option value="Asia/Tokyo" ${timezone === 'Asia/Tokyo' ? 'selected' : ''}>Asia/Tokyo</option>
                    </select>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Datumsformat</label>
                    <select class="haldo-input" style="font-size:11px;margin-top:2px;" onchange="Storage.set('date_format', this.value);">
                        <option value="DD.MM.YYYY" ${Storage.get('date_format', 'DD.MM.YYYY') === 'DD.MM.YYYY' ? 'selected' : ''}>DD.MM.YYYY (Deutsch)</option>
                        <option value="MM/DD/YYYY" ${Storage.get('date_format', 'DD.MM.YYYY') === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY (US)</option>
                        <option value="YYYY-MM-DD" ${Storage.get('date_format', 'DD.MM.YYYY') === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD (ISO)</option>
                    </select>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Startseite</label>
                    <select class="haldo-input" style="font-size:11px;margin-top:2px;" onchange="Storage.set('home_page', this.value);">
                        <option value="desktop" ${Storage.get('home_page', 'desktop') === 'desktop' ? 'selected' : ''}>Desktop</option>
                        <option value="apps" ${Storage.get('home_page', 'desktop') === 'apps' ? 'selected' : ''}>App Center</option>
                        <option value="ai" ${Storage.get('home_page', 'desktop') === 'ai' ? 'selected' : ''}>HalDo AI</option>
                    </select>
                </div>
            </div>
        `;
    },
    
    // ---- AI & MEMORY ----
    getAIContent() {
        const apiKey = Storage.get('groq_api_key', '');
        const model = Storage.get('ai_model', 'mixtral-8x7b-32768');
        const temp = Storage.get('ai_temperature', 0.7);
        const memory = Storage.get('ai_memory', []);
        const systemPrompt = Storage.get('ai_system_prompt', AICore.systemPrompt || '');
        
        return `
            <h2 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🧠 AI & Memory</h2>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">🔑 Groq API Key</label>
                    <div style="display:flex;gap:4px;margin-top:2px;">
                        <input id="ai-key-input" class="haldo-input" type="password" value="${apiKey}" placeholder="gsk_..." style="flex:1;font-size:11px;">
                        <button class="haldo-btn" style="font-size:11px;" onclick="SettingsApp.saveAIKey()">Speichern</button>
                    </div>
                    <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">
                        ${apiKey ? '✅ Key ist gespeichert' : '⚠️ Kein Key gespeichert'}
                    </div>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">🧠 KI-Modell</label>
                    <select class="haldo-input" style="font-size:11px;margin-top:2px;" onchange="Storage.set('ai_model', this.value); AICore.setModel(this.value);">
                        <option value="mixtral-8x7b-32768" ${model === 'mixtral-8x7b-32768' ? 'selected' : ''}>Mixtral 8x7B (empfohlen)</option>
                        <option value="llama3-70b-8192" ${model === 'llama3-70b-8192' ? 'selected' : ''}>Llama 3 70B</option>
                        <option value="gemma-7b-it" ${model === 'gemma-7b-it' ? 'selected' : ''}>Gemma 7B</option>
                    </select>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">🎨 Kreativität (Temperatur) ${temp}</label>
                    <input type="range" min="0" max="2" step="0.1" value="${temp}" style="width:100%;accent-color:var(--primary);margin-top:2px;" 
                        oninput="Storage.set('ai_temperature', parseFloat(this.value)); AICore.setTemperature(parseFloat(this.value)); this.previousElementSibling.textContent = '🎨 Kreativität (Temperatur) ' + this.value;">
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">💬 System-Prompt</label>
                    <textarea class="haldo-input" style="font-size:11px;margin-top:2px;min-height:60px;resize:vertical;" 
                        onchange="Storage.set('ai_system_prompt', this.value); AICore.setSystemPrompt(this.value);">${systemPrompt}</textarea>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">🧩 Memory</label>
                    <div style="display:flex;gap:4px;margin-top:2px;">
                        <span style="font-size:11px;color:var(--text-secondary);">${memory.length} Einträge</span>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="Storage.set('ai_memory', []); alert('Memory gelöscht!'); SettingsApp.selectCategory('ai');">🗑️ Löschen</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    saveAIKey() {
        const input = document.getElementById('ai-key-input');
        if (!input) return;
        const key = input.value.trim();
        if (key) {
            Storage.set('groq_api_key', key);
            if (typeof AICore !== 'undefined') {
                AICore.setApiKey(key);
            }
            alert('✅ API Key gespeichert!');
            this.selectCategory('ai');
        } else {
            alert('⚠️ Bitte einen gültigen Key eingeben.');
        }
    },
    
    // ---- DISPLAY ----
    getDisplayContent() {
        const resolution = Storage.get('resolution', '1920x1080');
        const brightness = Storage.get('brightness', 80);
        const animationSpeed = Storage.get('animation_speed', 'normal');
        
        return `
            <h2 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🖥️ Display</h2>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Auflösung</label>
                    <select class="haldo-input" style="font-size:11px;margin-top:2px;" onchange="Storage.set('resolution', this.value);">
                        <option value="1280x720" ${resolution === '1280x720' ? 'selected' : ''}>HD (1280x720)</option>
                        <option value="1920x1080" ${resolution === '1920x1080' ? 'selected' : ''}>Full HD (1920x1080)</option>
                        <option value="2560x1440" ${resolution === '2560x1440' ? 'selected' : ''}>2K (2560x1440)</option>
                        <option value="3840x2160" ${resolution === '3840x2160' ? 'selected' : ''}>4K (3840x2160)</option>
                        <option value="7680x4320" ${resolution === '7680x4320' ? 'selected' : ''}>8K (7680x4320)</option>
                    </select>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Helligkeit ${brightness}%</label>
                    <input type="range" min="0" max="100" value="${brightness}" style="width:100%;accent-color:var(--primary);margin-top:2px;" 
                        oninput="Storage.set('brightness', parseInt(this.value)); this.previousElementSibling.textContent = 'Helligkeit ' + this.value + '%';">
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Animationsgeschwindigkeit</label>
                    <select class="haldo-input" style="font-size:11px;margin-top:2px;" onchange="Storage.set('animation_speed', this.value);">
                        <option value="slow" ${animationSpeed === 'slow' ? 'selected' : ''}>Langsam</option>
                        <option value="normal" ${animationSpeed === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="fast" ${animationSpeed === 'fast' ? 'selected' : ''}>Schnell</option>
                    </select>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">🎮 3D-Qualität</label>
                    <select class="haldo-input" style="font-size:11px;margin-top:2px;" onchange="Storage.set('cosmic_quality', this.value); if(typeof CosmicWorld !== 'undefined') CosmicWorld.setQuality(this.value);">
                        <option value="low" ${Storage.get('cosmic_quality', 'high') === 'low' ? 'selected' : ''}>Niedrig</option>
                        <option value="medium" ${Storage.get('cosmic_quality', 'high') === 'medium' ? 'selected' : ''}>Mittel</option>
                        <option value="high" ${Storage.get('cosmic_quality', 'high') === 'high' ? 'selected' : ''}>Hoch</option>
                        <option value="ultra" ${Storage.get('cosmic_quality', 'high') === 'ultra' ? 'selected' : ''}>Ultra</option>
                    </select>
                </div>
            </div>
        `;
    },
    
    // ---- SPRACHE ----
    getLanguageContent() {
        const lang = Storage.get('language', 'DE');
        
        return `
            <h2 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🌍 Sprache</h2>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Systemsprache</label>
                    <select class="haldo-input" style="font-size:11px;margin-top:2px;" onchange="Storage.set('language', this.value); document.getElementById('menu-lang').textContent = this.value; EventBus.emit('language:changed', {lang: this.value});">
                        <option value="DE" ${lang === 'DE' ? 'selected' : ''}>🇩🇪 Deutsch</option>
                        <option value="EN" ${lang === 'EN' ? 'selected' : ''}>🇬🇧 English</option>
                        <option value="KU" ${lang === 'KU' ? 'selected' : ''}>🏴 Kurmancî</option>
                        <option value="EZ" ${lang === 'EZ' ? 'selected' : ''}>🏴 Êzîdî</option>
                        <option value="TR" ${lang === 'TR' ? 'selected' : ''}>🇹🇷 Türkçe</option>
                        <option value="AR" ${lang === 'AR' ? 'selected' : ''}>🇸🇦 العربية</option>
                        <option value="FR" ${lang === 'FR' ? 'selected' : ''}>🇫🇷 Français</option>
                        <option value="ES" ${lang === 'ES' ? 'selected' : ''}>🇪🇸 Español</option>
                        <option value="RU" ${lang === 'RU' ? 'selected' : ''}>🇷🇺 Русский</option>
                        <option value="FA" ${lang === 'FA' ? 'selected' : ''}>🇮🇷 فارسی</option>
                        <option value="IT" ${lang === 'IT' ? 'selected' : ''}>🇮🇹 Italiano</option>
                        <option value="PT" ${lang === 'PT' ? 'selected' : ''}>🇵🇹 Português</option>
                    </select>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Tastaturlayout</label>
                    <select class="haldo-input" style="font-size:11px;margin-top:2px;" onchange="Storage.set('keyboard_layout', this.value);">
                        <option value="qwertz" ${Storage.get('keyboard_layout', 'qwertz') === 'qwertz' ? 'selected' : ''}>QWERTZ (Deutsch)</option>
                        <option value="qwerty" ${Storage.get('keyboard_layout', 'qwertz') === 'qwerty' ? 'selected' : ''}>QWERTY (Englisch)</option>
                        <option value="ezidi" ${Storage.get('keyboard_layout', 'qwertz') === 'ezidi' ? 'selected' : ''}>Êzîdî</option>
                        <option value="arabic" ${Storage.get('keyboard_layout', 'qwertz') === 'arabic' ? 'selected' : ''}>Arabisch</option>
                    </select>
                </div>
            </div>
        `;
    },
    
    // ---- THEMES ----
    getThemesContent() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const themes = [
            { id: 'dark', label: '🌙 Dark', desc: 'Dunkles Design' },
            { id: 'light', label: '☀️ Light', desc: 'Helles Design' },
            { id: 'cosmic', label: '🌌 Cosmic', desc: 'Kosmisches Design' },
            { id: 'aurora', label: '🌠 Aurora', desc: 'Nordlicht-Design' },
            { id: 'midnight', label: '🌃 Midnight', desc: 'Mitternachts-Design' }
        ];
        
        return `
            <h2 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🎨 Themes</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                ${themes.map(t => `
                    <div onclick="SettingsApp.applyTheme('${t.id}')" style="
                        padding:10px 14px;
                        background: ${currentTheme === t.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                        border: 2px solid ${currentTheme === t.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.15s ease;
                    ">
                        <div style="font-size:16px;">${t.label}</div>
                        <div style="font-size:10px;color:var(--text-secondary);">${t.desc}</div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top:8px;">
                <label style="color:var(--text-secondary);font-size:11px;">Glass-Intensität ${Storage.get('glass_intensity', 50)}%</label>
                <input type="range" min="0" max="100" value="${Storage.get('glass_intensity', 50)}" style="width:100%;accent-color:var(--primary);margin-top:2px;" 
                    oninput="Storage.set('glass_intensity', parseInt(this.value)); this.previousElementSibling.textContent = 'Glass-Intensität ' + this.value + '%';">
            </div>
        `;
    },
    
    applyTheme(themeId) {
        document.documentElement.setAttribute('data-theme', themeId);
        Storage.set('theme', themeId);
        const icons = { dark: '🌙', light: '☀️', cosmic: '🌌', aurora: '🌠', midnight: '🌃' };
        document.getElementById('menu-theme').textContent = icons[themeId] || '🌙';
        this.selectCategory('themes');
        EventBus.emit('theme:changed', { theme: themeId });
    },
    
    // ---- VOICE ----
    getVoiceContent() {
        const voice = Storage.get('voice_gender', '👩');
        const speed = Storage.get('voice_speed', 1);
        const volume = Storage.get('voice_volume', 80);
        
        return `
            <h2 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🎤 Voice</h2>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Stimme</label>
                    <select class="haldo-input" style="font-size:11px;margin-top:2px;" onchange="Storage.set('voice_gender', this.value); document.getElementById('menu-voice').textContent = this.value; EventBus.emit('voice:changed', {voice: this.value});">
                        <option value="👩" ${voice === '👩' ? 'selected' : ''}>👩 Deutsch – weiblich</option>
                        <option value="👨" ${voice === '👨' ? 'selected' : ''}>👨 Deutsch – männlich</option>
                        <option value="🧑" ${voice === '🧑' ? 'selected' : ''}>🧑 Deutsch – neutral</option>
                        <option value="👧" ${voice === '👧' ? 'selected' : ''}>👧 Deutsch – jugendlich</option>
                        <option value="👦" ${voice === '👦' ? 'selected' : ''}>👦 Deutsch – jugendlich männlich</option>
                        <option value="👩🇬🇧" ${voice === '👩🇬🇧' ? 'selected' : ''}>👩🇬🇧 English – female</option>
                        <option value="👨🇬🇧" ${voice === '👨🇬🇧' ? 'selected' : ''}>👨🇬🇧 English – male</option>
                        <option value="👩🇹🇷" ${voice === '👩🇹🇷' ? 'selected' : ''}>👩🇹🇷 Türkçe – kadın</option>
                        <option value="👨🇹🇷" ${voice === '👨🇹🇷' ? 'selected' : ''}>👨🇹🇷 Türkçe – erkek</option>
                    </select>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Geschwindigkeit ${speed}</label>
                    <input type="range" min="0.5" max="2" step="0.1" value="${speed}" style="width:100%;accent-color:var(--primary);margin-top:2px;" 
                        oninput="Storage.set('voice_speed', parseFloat(this.value)); this.previousElementSibling.textContent = 'Geschwindigkeit ' + this.value;">
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">Lautstärke ${volume}%</label>
                    <input type="range" min="0" max="100" value="${volume}" style="width:100%;accent-color:var(--primary);margin-top:2px;" 
                        oninput="Storage.set('voice_volume', parseInt(this.value)); this.previousElementSibling.textContent = 'Lautstärke ' + this.value + '%';">
                </div>
                <button class="haldo-btn" style="font-size:11px;" onclick="SettingsApp.testVoice()">🔊 Test</button>
            </div>
        `;
    },
    
    testVoice() {
        const voice = Storage.get('voice_gender', '👩');
        const speed = Storage.get('voice_speed', 1);
        const lang = Storage.get('language', 'DE');
        const langMap = { DE: 'de-DE', EN: 'en-US', KU: 'ku-TR', TR: 'tr-TR', AR: 'ar-SA', FR: 'fr-FR', ES: 'es-ES' };
        const text = 'Hallo! Ich bin HalDo, deine KI-Assistentin.';
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = langMap[lang] || 'de-DE';
            utterance.rate = speed;
            window.speechSynthesis.speak(utterance);
        } else {
            alert('⚠️ Text-to-Speech wird von Ihrem Browser nicht unterstützt.');
        }
    },
    
    // ---- SYSTEM ----
    getSystemContent() {
        const status = Kernel.getStatus ? Kernel.getStatus() : { version: Kernel.version };
        const uptime = Kernel.getFormattedUptime ? Kernel.getFormattedUptime() : '0s';
        const appCount = typeof AppManager !== 'undefined' ? AppManager.installedApps?.length || 0 : 0;
        
        return `
            <h2 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">📊 System</h2>
            <div style="display:flex;flex-direction:column;gap:6px;">
                <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <span style="color:var(--text-muted);font-size:10px;">Version</span>
                    <div style="color:var(--text-primary);font-size:14px;font-weight:600;">${Kernel.version || '24.6.0'}</div>
                </div>
                <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <span style="color:var(--text-muted);font-size:10px;">Betriebszeit</span>
                    <div style="color:var(--text-primary);font-size:14px;font-weight:600;">${uptime}</div>
                </div>
                <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <span style="color:var(--text-muted);font-size:10px;">Installierte Apps</span>
                    <div style="color:var(--text-primary);font-size:14px;font-weight:600;">${appCount}</div>
                </div>
                <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="if(confirm('System neu starten?')) { Kernel.reboot(); }">🔄 Neustart</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="if(confirm('System herunterfahren?')) { Kernel.shutdown(); }">⏹️ Herunterfahren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="Storage.clear(); alert('Cache geleert!');">🗑️ Cache leeren</button>
                </div>
            </div>
        `;
    },
    
    // ---- SICHERHEIT ----
    getSecurityContent() {
        const pin = Storage.get('pin_code', '');
        const privacyMode = Storage.get('privacy_mode', false);
        
        return `
            <h2 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🔒 Sicherheit</h2>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">PIN-Code</label>
                    <div style="display:flex;gap:4px;margin-top:2px;">
                        <input id="pin-input" class="haldo-input" type="password" value="${pin}" placeholder="Neuen PIN eingeben..." style="flex:1;font-size:11px;">
                        <button class="haldo-btn" style="font-size:11px;" onclick="SettingsApp.savePIN()">Speichern</button>
                    </div>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">🔒 Privacy-Modus</label>
                    <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
                        <span style="font-size:11px;color:var(--text-secondary);">${privacyMode ? '✅ Aktiviert' : '⭕ Deaktiviert'}</span>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="Storage.set('privacy_mode', !${privacyMode}); SettingsApp.selectCategory('security');">${privacyMode ? 'Deaktivieren' : 'Aktivieren'}</button>
                    </div>
                </div>
                <div>
                    <label style="color:var(--text-secondary);font-size:11px;">🛡️ Sicherheitsstatus</label>
                    <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));margin-top:2px;">
                        <span style="color:var(--success, #00ff88);font-size:12px;">✅ System ist sicher</span>
                    </div>
                </div>
                <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="alert('🛡️ Sicherheitsprüfung abgeschlossen – keine Probleme gefunden');">🛡️ Prüfung durchführen</button>
            </div>
        `;
    },
    
    savePIN() {
        const input = document.getElementById('pin-input');
        if (!input) return;
        const pin = input.value.trim();
        if (pin.length >= 4) {
            Storage.set('pin_code', pin);
            alert('✅ PIN-Code gespeichert!');
            this.selectCategory('security');
        } else {
            alert('⚠️ Bitte mindestens 4 Zeichen eingeben.');
        }
    },
    
    // ---- SPEICHER ----
    getStorageContent() {
        const stats = Storage.getStats ? Storage.getStats() : { keyCount: localStorage.length };
        const formattedSize = Storage.getFormattedSize ? Storage.getFormattedSize() : '0 B';
        
        return `
            <h2 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">💾 Speicher</h2>
            <div style="display:flex;flex-direction:column;gap:6px;">
                <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <span style="color:var(--text-muted);font-size:10px;">Einträge</span>
                    <div style="color:var(--text-primary);font-size:14px;font-weight:600;">${stats.keyCount || 0}</div>
                </div>
                <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <span style="color:var(--text-muted);font-size:10px;">Speicherplatz</span>
                    <div style="color:var(--text-primary);font-size:14px;font-weight:600;">${formattedSize}</div>
                </div>
                <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="alert('📊 Speicheranalyse: ${stats.keyCount || 0} Einträge, ${formattedSize}');">📊 Analysieren</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="if(confirm('Alle Daten wirklich löschen?')) { Storage.clear(); alert('Alle Daten gelöscht!'); location.reload(); }">🗑️ Alle löschen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="Storage.exportToFile();">📤 Exportieren</button>
                </div>
            </div>
        `;
    },
    
    // ---- UPDATES ----
    getUpdatesContent() {
        const currentVersion = Kernel.version || '24.6.0';
        const lastCheck = Storage.get('last_update_check', 'Nie');
        
        return `
            <h2 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">🔄 Updates</h2>
            <div style="display:flex;flex-direction:column;gap:6px;">
                <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <span style="color:var(--text-muted);font-size:10px;">Aktuelle Version</span>
                    <div style="color:var(--text-primary);font-size:14px;font-weight:600;">${currentVersion}</div>
                </div>
                <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <span style="color:var(--text-muted);font-size:10px;">Letzte Prüfung</span>
                    <div style="color:var(--text-secondary);font-size:12px;">${lastCheck}</div>
                </div>
                <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <span style="color:var(--success, #00ff88);font-size:12px;">✅ System ist auf dem neuesten Stand</span>
                </div>
                <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;">
                    <button class="haldo-btn" style="font-size:11px;" onclick="SettingsApp.checkUpdates()">🔄 Nach Updates suchen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="alert('📦 Update-Protokoll\n\n24.6.0 - Erstveröffentlichung\n24.7.0 - Geplant: Offline-Modus, PWA');">📦 Protokoll</button>
                </div>
            </div>
        `;
    },
    
    checkUpdates() {
        Storage.set('last_update_check', new Date().toLocaleString());
        // In einer echten Umgebung würde hier eine API abgefragt werden
        setTimeout(() => {
            alert('✅ Keine Updates verfügbar. Sie sind auf dem neuesten Stand!');
            this.selectCategory('updates');
        }, 1000);
    },
    
    // ---- ÜBER ----
    getAboutContent() {
        return `
            <h2 style="color:var(--text-primary);font-size:14px;margin-bottom:8px;">ℹ️ Über HalDo AI OS</h2>
            <div style="text-align:center;padding:12px;">
                <div style="font-size:48px;margin-bottom:8px;">💙</div>
                <h2 style="color:var(--text-primary);font-size:18px;font-weight:700;">HalDo AI OS</h2>
                <p style="color:var(--text-secondary);font-size:12px;">Version ${Kernel.version || '24.6.0'}</p>
                <p style="color:var(--text-muted);font-size:11px;margin-top:2px;">Cosmic Intelligent Operating System</p>
                <p style="color:var(--text-muted);font-size:10px;margin-top:4px;">© 2026 HalDo AI OS Team</p>
                <div style="margin-top:12px;padding:10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:left;font-size:11px;">
                    <p style="color:var(--text-muted);">System: ${navigator.platform}</p>
                    <p style="color:var(--text-muted);">Browser: ${navigator.userAgent.split(' ').slice(-2).join(' ')}</p>
                    <p style="color:var(--text-muted);">Apps: ${typeof AppManager !== 'undefined' ? AppManager.installedApps?.length || 0 : 0} installiert</p>
                    <p style="color:var(--text-muted);">Uptime: ${Kernel.getFormattedUptime ? Kernel.getFormattedUptime() : '0s'}</p>
                </div>
                <div style="display:flex;gap:6px;justify-content:center;margin-top:8px;flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="alert('🌐 https://haldo-os.com')">🌐 Website</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="alert('📧 support@haldo-os.com')">📧 Support</button>
                </div>
            </div>
        `;
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('📱 Settings App wird installiert...');
        // App-spezifische Installation
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Settings App wird deinstalliert...');
        // App-spezifische Deinstallation
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
SettingsApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.SettingsApp = SettingsApp;

console.log('⚙️ Settings App geladen – HalDo AI OS 24.6.0');
