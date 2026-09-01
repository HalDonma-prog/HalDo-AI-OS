/**
 * HALDO AI OS 24.6.0 – WEATHER APP
 * Professionelle Wetter-App mit aktuellen Daten, Vorhersage und Standort
 * Version: 1.0.0
 */

const WeatherApp = {
    // ---- APP-INFO ----
    id: 'weather',
    name: 'Wetter',
    icon: '🌦️',
    category: 'tools',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Aktuelle Wetterdaten und Vorhersage für jeden Standort',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentWeather: null,
    forecast: [],
    hourly: [],
    location: 'Berlin',
    units: 'metric', // metric | imperial
    isLoaded: false,
    isLoading: false,
    error: null,
    
    // ---- API-KONFIGURATION ----
    apiKey: '',
    apiUrl: 'https://api.openweathermap.org/data/2.5',
    useMockData: true, // Falls kein API-Key vorhanden ist
    
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
            console.log('🌦️ Weather App registriert');
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
            this.fetchWeather();
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
        this.apiKey = Storage.get('openweather_api_key', '');
        this.location = Storage.get('weather_location', 'Berlin');
        this.units = Storage.get('weather_units', 'metric');
        this.useMockData = !this.apiKey;
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('weather_location', this.location);
        Storage.set('weather_units', this.units);
        if (this.apiKey) {
            Storage.set('openweather_api_key', this.apiKey);
        }
        return this;
    },
    
    // ---- RENDER ----
    render() {
        if (this.isLoading) {
            return this.renderLoading();
        }
        if (this.error) {
            return this.renderError();
        }
        if (!this.currentWeather) {
            return this.renderLoading();
        }
        return this.renderWeather();
    },
    
    // ---- LOADING ----
    renderLoading() {
        return `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:20px;">
                <div style="font-size:48px;">🌤️</div>
                <div style="font-size:18px;font-weight:600;color:var(--text-primary);">Wetter wird geladen...</div>
                <div style="width:40px;height:40px;border:3px solid var(--glass-border, rgba(255,255,255,0.06));border-top-color:var(--primary, #6C3CE1);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
                <p style="font-size:12px;color:var(--text-muted);">${this.location}</p>
            </div>
        `;
    },
    
    // ---- ERROR ----
    renderError() {
        return `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:20px;text-align:center;">
                <div style="font-size:48px;">⚠️</div>
                <div style="font-size:18px;font-weight:600;color:var(--text-primary);">Fehler beim Laden</div>
                <p style="font-size:12px;color:var(--text-secondary);">${this.error}</p>
                <button class="haldo-btn" style="font-size:12px;padding:6px 16px;" onclick="WeatherApp.retry()">🔄 Erneut versuchen</button>
                <div style="margin-top:8px;font-size:11px;color:var(--text-muted);">
                    <p>💡 Tipp: Trage deinen OpenWeather API Key in den Settings ein</p>
                    <p style="font-size:10px;">Settings → AI & Memory → OpenWeather API Key</p>
                </div>
            </div>
        `;
    },
    
    // ---- WETTER ANSICHT ----
    renderWeather() {
        const w = this.currentWeather;
        const temp = this.getTemp(w.main.temp);
        const feelsLike = this.getTemp(w.main.feels_like);
        const tempMin = this.getTemp(w.main.temp_min);
        const tempMax = this.getTemp(w.main.temp_max);
        const windSpeed = this.getWindSpeed(w.wind.speed);
        const icon = this.getWeatherIcon(w.weather[0].icon);
        const description = w.weather[0].description;
        const condition = w.weather[0].main;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;align-items:center;">
                    <div style="flex:1;min-width:80px;display:flex;gap:4px;">
                        <input id="weather-location-input" class="haldo-input" value="${this.location}" placeholder="Standort..." style="flex:1;font-size:11px;" 
                            onkeydown="if(event.key==='Enter')WeatherApp.changeLocation(this.value)">
                        <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="WeatherApp.changeLocation(document.getElementById('weather-location-input').value)">🔍</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="WeatherApp.getCurrentLocation()">📍</button>
                    </div>
                    <div style="display:flex;gap:4px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="WeatherApp.toggleUnits()">${this.units === 'metric' ? '°C' : '°F'}</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="WeatherApp.refresh()">⟳</button>
                    </div>
                </div>
                
                <!-- Wetter -->
                <div style="flex:1;overflow-y:auto;padding:12px;">
                    <!-- Aktuelles Wetter -->
                    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:12px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <div style="flex:1;min-width:120px;text-align:center;">
                            <div style="font-size:56px;">${icon}</div>
                            <div style="font-size:32px;font-weight:700;color:var(--text-primary);">${temp}°</div>
                            <div style="font-size:14px;color:var(--text-secondary);">${description}</div>
                        </div>
                        <div style="flex:1;min-width:120px;display:grid;grid-template-columns:1fr 1fr;gap:4px;">
                            <div style="padding:4px 8px;text-align:center;">
                                <div style="font-size:10px;color:var(--text-muted);">Gefühlt</div>
                                <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${feelsLike}°</div>
                            </div>
                            <div style="padding:4px 8px;text-align:center;">
                                <div style="font-size:10px;color:var(--text-muted);">Min/Max</div>
                                <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${tempMin}°/${tempMax}°</div>
                            </div>
                            <div style="padding:4px 8px;text-align:center;">
                                <div style="font-size:10px;color:var(--text-muted);">💨 Wind</div>
                                <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${windSpeed}</div>
                            </div>
                            <div style="padding:4px 8px;text-align:center;">
                                <div style="font-size:10px;color:var(--text-muted);">💧 Luftfeuchtigkeit</div>
                                <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${w.main.humidity}%</div>
                            </div>
                            <div style="padding:4px 8px;text-align:center;">
                                <div style="font-size:10px;color:var(--text-muted);">☀️ UV-Index</div>
                                <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${w.uvi || '—'}</div>
                            </div>
                            <div style="padding:4px 8px;text-align:center;">
                                <div style="font-size:10px;color:var(--text-muted);">👁️ Sicht</div>
                                <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${this.getVisibility(w.visibility)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Stündliche Vorhersage -->
                    ${this.hourly.length > 0 ? `
                        <div style="margin-top:12px;">
                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:6px;">⏰ Stündlich</div>
                            <div style="display:flex;gap:4px;overflow-x:auto;padding:4px 0;scrollbar-width:thin;">
                                ${this.hourly.slice(0, 12).map(h => {
                                    const hTemp = this.getTemp(h.temp);
                                    const hIcon = this.getWeatherIcon(h.weather[0].icon);
                                    const hTime = new Date(h.dt * 1000).toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' });
                                    return `
                                        <div style="flex:0 0 70px;text-align:center;padding:6px 4px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                                            <div style="font-size:10px;color:var(--text-muted);">${hTime}</div>
                                            <div style="font-size:20px;">${hIcon}</div>
                                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${hTemp}°</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- 7-Tage-Vorhersage -->
                    ${this.forecast.length > 0 ? `
                        <div style="margin-top:12px;">
                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:6px;">📅 7-Tage-Vorhersage</div>
                            <div style="display:flex;flex-direction:column;gap:2px;">
                                ${this.forecast.map(f => {
                                    const fTemp = this.getTemp(f.temp.day);
                                    const fIcon = this.getWeatherIcon(f.weather[0].icon);
                                    const fDay = new Date(f.dt * 1000).toLocaleDateString('de', { weekday: 'short', day: 'numeric', month: 'short' });
                                    const fDesc = f.weather[0].description;
                                    return `
                                        <div style="display:grid;grid-template-columns:80px 40px 1fr 60px 60px;gap:4px;padding:6px 8px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:6px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));align-items:center;">
                                            <div style="font-size:11px;color:var(--text-secondary);">${fDay}</div>
                                            <div style="font-size:20px;">${fIcon}</div>
                                            <div style="font-size:11px;color:var(--text-secondary);">${fDesc}</div>
                                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);text-align:center;">${this.getTemp(f.temp.min)}°</div>
                                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);text-align:center;">${fTemp}°</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Wetterwarnungen -->
                    ${w.alerts && w.alerts.length > 0 ? `
                        <div style="margin-top:12px;padding:8px 12px;background:rgba(255,184,0,0.1);border-radius:8px;border:1px solid rgba(255,184,0,0.2);">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:20px;">⚠️</div>
                                <div>
                                    <div style="font-size:12px;font-weight:600;color:var(--warning, #FFB800);">Wetterwarnung</div>
                                    <div style="font-size:11px;color:var(--text-secondary);">${w.alerts[0].description || 'Wetterwarnung aktiv'}</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:9px;color:var(--text-muted);">
                    <span>🌍 ${this.location}</span>
                    <span>🔄 ${new Date().toLocaleString('de')}</span>
                </div>
            </div>
        `;
    },
    
    // ---- WETTER ABRUFEN ----
    async fetchWeather() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.error = null;
        this.updateView();
        
        try {
            if (this.useMockData) {
                // Mock-Daten verwenden
                await this.loadMockData();
            } else {
                // Echte API
                await this.loadRealData();
            }
            this.isLoaded = true;
            this.isLoading = false;
            this.updateView();
            EventBus.emit('weather:updated', { location: this.location });
        } catch (error) {
            console.error('❌ Wetter-Fehler:', error);
            this.error = error.message || 'Fehler beim Laden der Wetterdaten';
            this.isLoading = false;
            this.updateView();
        }
    },
    
    // ---- ECHTE API ----
    async loadRealData() {
        if (!this.apiKey) {
            throw new Error('Kein API-Key vorhanden. Bitte in den Settings eintragen.');
        }
        
        // Aktuelles Wetter
        const currentRes = await fetch(
            `${this.apiUrl}/weather?q=${encodeURIComponent(this.location)}&appid=${this.apiKey}&units=${this.units}&lang=de`
        );
        if (!currentRes.ok) {
            throw new Error(`API-Fehler: ${currentRes.status} ${currentRes.statusText}`);
        }
        this.currentWeather = await currentRes.json();
        
        // 7-Tage-Vorhersage
        const forecastRes = await fetch(
            `${this.apiUrl}/forecast/daily?q=${encodeURIComponent(this.location)}&appid=${this.apiKey}&units=${this.units}&lang=de&cnt=7`
        );
        if (forecastRes.ok) {
            const forecastData = await forecastRes.json();
            this.forecast = forecastData.list || [];
        }
        
        // Stündliche Vorhersage (aus 3-Stunden-Intervallen)
        const hourlyRes = await fetch(
            `${this.apiUrl}/forecast?q=${encodeURIComponent(this.location)}&appid=${this.apiKey}&units=${this.units}&lang=de&cnt=12`
        );
        if (hourlyRes.ok) {
            const hourlyData = await hourlyRes.json();
            this.hourly = hourlyData.list || [];
        }
        
        this.saveData();
    },
    
    // ---- MOCK-DATEN ----
    async loadMockData() {
        // Simuliere Netzwerklatenz
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const conditions = [
            { main: 'Clear', description: 'Klarer Himmel', icon: '01d' },
            { main: 'Clouds', description: 'Bewölkt', icon: '03d' },
            { main: 'Rain', description: 'Regen', icon: '10d' },
            { main: 'Snow', description: 'Schnee', icon: '13d' },
            { main: 'Thunderstorm', description: 'Gewitter', icon: '11d' },
            { main: 'Mist', description: 'Nebel', icon: '50d' }
        ];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        const tempBase = Math.random() * 30 - 5;
        
        this.currentWeather = {
            main: {
                temp: tempBase,
                feels_like: tempBase + (Math.random() - 0.5) * 3,
                temp_min: tempBase - 2 - Math.random() * 3,
                temp_max: tempBase + 2 + Math.random() * 3,
                humidity: 40 + Math.floor(Math.random() * 50),
                pressure: 1000 + Math.floor(Math.random() * 30)
            },
            wind: {
                speed: 1 + Math.random() * 15,
                deg: Math.floor(Math.random() * 360)
            },
            weather: [condition],
            visibility: 5000 + Math.floor(Math.random() * 15000),
            uvi: Math.floor(Math.random() * 10),
            clouds: { all: Math.floor(Math.random() * 100) },
            alerts: Math.random() > 0.8 ? [{ description: 'Starkregen erwartet' }] : []
        };
        
        // 7-Tage-Vorhersage
        this.forecast = [];
        for (let i = 0; i < 7; i++) {
            const dayCond = conditions[Math.floor(Math.random() * conditions.length)];
            const dayTemp = tempBase + (Math.random() - 0.5) * 10;
            this.forecast.push({
                dt: Date.now() / 1000 + i * 86400,
                temp: {
                    day: dayTemp,
                    min: dayTemp - 2 - Math.random() * 3,
                    max: dayTemp + 2 + Math.random() * 3
                },
                weather: [dayCond]
            });
        }
        
        // Stündliche Vorhersage
        this.hourly = [];
        for (let i = 0; i < 12; i++) {
            const hourCond = conditions[Math.floor(Math.random() * conditions.length)];
            this.hourly.push({
                dt: Date.now() / 1000 + i * 3600,
                temp: tempBase + (Math.random() - 0.5) * 8,
                weather: [hourCond]
            });
        }
    },
    
    // ---- STANDORT ÄNDERN ----
    changeLocation(location) {
        const newLocation = location.trim();
        if (!newLocation) return;
        if (newLocation === this.location) {
            this.refresh();
            return;
        }
        this.location = newLocation;
        this.saveData();
        this.fetchWeather();
    },
    
    getCurrentLocation() {
        if (!navigator.geolocation) {
            alert('⚠️ Geolokalisierung wird von Ihrem Browser nicht unterstützt.');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Reverse-Geocoding für Standortnamen
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await response.json();
                    const location = data.address?.city || data.address?.town || data.address?.village || 'Unbekannt';
                    this.location = location;
                    this.saveData();
                    this.fetchWeather();
                } catch (error) {
                    console.warn('⚠️ Reverse-Geocoding fehlgeschlagen:', error);
                    this.location = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
                    this.saveData();
                    this.fetchWeather();
                }
            },
            (error) => {
                alert(`⚠️ Standort konnte nicht ermittelt werden: ${error.message}`);
            }
        );
    },
    
    // ---- EINHEITEN UMSCHALTEN ----
    toggleUnits() {
        this.units = this.units === 'metric' ? 'imperial' : 'metric';
        this.saveData();
        this.fetchWeather();
    },
    
    // ---- AKTUALISIEREN ----
    refresh() {
        this.fetchWeather();
    },
    
    retry() {
        this.fetchWeather();
    },
    
    // ---- HELPER ----
    getTemp(temp) {
        if (temp === undefined || temp === null) return '—';
        return Math.round(temp);
    },
    
    getWindSpeed(speed) {
        if (speed === undefined || speed === null) return '—';
        if (this.units === 'metric') {
            return `${Math.round(speed)} km/h`;
        }
        return `${Math.round(speed)} mph`;
    },
    
    getVisibility(visibility) {
        if (!visibility) return '—';
        if (visibility > 1000) {
            return `${(visibility / 1000).toFixed(1)} km`;
        }
        return `${visibility} m`;
    },
    
    getWeatherIcon(icon) {
        const icons = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return icons[icon] || '🌤️';
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
                if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                    this.refresh();
                    e.preventDefault();
                }
                if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
                    this.toggleUnits();
                    e.preventDefault();
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🌦️ Weather App wird installiert...');
        this.loadData();
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Weather App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
WeatherApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.WeatherApp = WeatherApp;

console.log('🌦️ Weather App geladen – HalDo AI OS 24.6.0');
