/**
 * HALDO AI OS 24.6.0 – TRAVEL CENTER APP
 * Reiseplanung, Hotels, Flüge, Sehenswürdigkeiten und Packliste
 * Version: 1.0.0
 */

const TravelCenterApp = {
    // ---- APP-INFO ----
    id: 'travel-center',
    name: 'Travel Center',
    icon: '✈️',
    category: 'lifestyle',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Reiseplanung, Hotels, Flüge, Sehenswürdigkeiten und Packliste',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'dashboard', // dashboard | destinations | hotels | flights | attractions | planner | packing
    selectedDestination: null,
    selectedHotel: null,
    selectedAttraction: null,
    
    // ---- DATEN ----
    destinations: [],
    hotels: [],
    flights: [],
    attractions: [],
    trips: [],
    packingList: [],
    
    // ---- STANDARD-REISEZIELE ----
    defaultDestinations: [
        { id: 'd1', name: 'Berlin', country: 'Deutschland', icon: '🏛️', bestTime: 'Mai - September', desc: 'Hauptstadt mit Geschichte und Kultur' },
        { id: 'd2', name: 'Paris', country: 'Frankreich', icon: '🗼', bestTime: 'April - Juni', desc: 'Stadt der Liebe und Lichter' },
        { id: 'd3', name: 'Rom', country: 'Italien', icon: '🏟️', bestTime: 'April - Oktober', desc: 'Ewige Stadt mit antiken Schätzen' },
        { id: 'd4', name: 'Barcelona', country: 'Spanien', icon: '🏖️', bestTime: 'Mai - September', desc: 'Katalanische Metropole am Meer' },
        { id: 'd5', name: 'London', country: 'Großbritannien', icon: '🇬🇧', bestTime: 'Mai - September', desc: 'Weltstadt mit königlichem Flair' },
        { id: 'd6', name: 'New York', country: 'USA', icon: '🗽', bestTime: 'April - Juni', desc: 'Die Stadt, die niemals schläft' },
        { id: 'd7', name: 'Tokio', country: 'Japan', icon: '🗾', bestTime: 'März - Mai, September - November', desc: 'Metropole der Superlative' },
        { id: 'd8', name: 'Dubai', country: 'VAE', icon: '🌆', bestTime: 'November - März', desc: 'Wunder in der Wüste' }
    ],
    
    // ---- STANDARD-HOTELS ----
    defaultHotels: [
        { id: 'h1', name: 'Hotel Adlon', destination: 'Berlin', stars: 5, price: 350, rating: 4.8, desc: 'Luxushotel am Brandenburger Tor' },
        { id: 'h2', name: 'Melia Berlin', destination: 'Berlin', stars: 4, price: 180, rating: 4.4, desc: 'Modernes Hotel am Friedrichstraße' },
        { id: 'h3', name: 'Le Bristol', destination: 'Paris', stars: 5, price: 520, rating: 4.9, desc: 'Elegantes Hotel nahe Champs-Élysées' },
        { id: 'h4', name: 'Ibis Paris', destination: 'Paris', stars: 3, price: 90, rating: 4.0, desc: 'Günstiges Hotel im Zentrum' },
        { id: 'h5', name: 'Hotel Eden', destination: 'Rom', stars: 5, price: 400, rating: 4.7, desc: 'Luxuriöses Hotel mit Blick auf die Stadt' },
        { id: 'h6', name: 'Barceló', destination: 'Barcelona', stars: 4, price: 160, rating: 4.3, desc: 'Modernes Hotel am Strand' },
        { id: 'h7', name: 'The Ritz', destination: 'London', stars: 5, price: 480, rating: 4.8, desc: 'Traditionelles Luxushotel in Mayfair' },
        { id: 'h8', name: 'Marriott', destination: 'New York', stars: 4, price: 280, rating: 4.4, desc: 'Zentrales Hotel in Midtown Manhattan' }
    ],
    
    // ---- STANDARD-FLÜGE ----
    defaultFlights: [
        { id: 'f1', from: 'Berlin', to: 'Paris', price: 120, duration: '1h 45m', airline: 'Air France', date: '2024-06-15' },
        { id: 'f2', from: 'Berlin', to: 'Rom', price: 150, duration: '2h 10m', airline: 'Lufthansa', date: '2024-06-20' },
        { id: 'f3', from: 'Berlin', to: 'Barcelona', price: 180, duration: '2h 30m', airline: 'Vueling', date: '2024-07-01' },
        { id: 'f4', from: 'Berlin', to: 'London', price: 80, duration: '1h 40m', airline: 'British Airways', date: '2024-07-10' },
        { id: 'f5', from: 'Berlin', to: 'New York', price: 450, duration: '8h 30m', airline: 'Delta', date: '2024-08-01' }
    ],
    
    // ---- STANDARD-SEHENSWÜRDIGKEITEN ----
    defaultAttractions: [
        { id: 'a1', name: 'Brandenburger Tor', destination: 'Berlin', icon: '🏛️', desc: 'Wahrzeichen Berlins', rating: 4.8 },
        { id: 'a2', name: 'Berliner Mauer', destination: 'Berlin', icon: '🧱', desc: 'Historische Mauerreste', rating: 4.6 },
        { id: 'a3', name: 'Eiffelturm', destination: 'Paris', icon: '🗼', desc: 'Wahrzeichen von Paris', rating: 4.9 },
        { id: 'a4', name: 'Louvre', destination: 'Paris', icon: '🎨', desc: 'Größtes Museum der Welt', rating: 4.8 },
        { id: 'a5', name: 'Kolosseum', destination: 'Rom', icon: '🏟️', desc: 'Antikes Amphitheater', rating: 4.9 },
        { id: 'a6', name: 'Sagrada Familia', destination: 'Barcelona', icon: '⛪', desc: 'Meisterwerk von Gaudí', rating: 4.8 },
        { id: 'a7', name: 'Big Ben', destination: 'London', icon: '🕰️', desc: 'Berühmte Uhr am Parliament', rating: 4.7 },
        { id: 'a8', name: 'Times Square', destination: 'New York', icon: '🌃', desc: 'Berühmter Platz in Manhattan', rating: 4.5 }
    ],
    
    // ---- PACKLISTE ----
    defaultPacking: [
        { id: 'p1', name: 'Reisepass', checked: false, category: 'Dokumente' },
        { id: 'p2', name: 'Flugtickets', checked: false, category: 'Dokumente' },
        { id: 'p3', name: 'Handy & Ladegerät', checked: false, category: 'Elektronik' },
        { id: 'p4', name: 'Kopfhörer', checked: false, category: 'Elektronik' },
        { id: 'p5', name: 'Kleidung', checked: false, category: 'Kleidung' },
        { id: 'p6', name: 'Schuhe', checked: false, category: 'Kleidung' },
        { id: 'p7', name: 'Zahnbürste', checked: false, category: 'Pflege' },
        { id: 'p8', name: 'Sonnencreme', checked: false, category: 'Pflege' },
        { id: 'p9', name: 'Reiseapotheke', checked: false, category: 'Medizin' },
        { id: 'p10', name: 'Kamera', checked: false, category: 'Elektronik' }
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
            console.log('✈️ Travel Center App registriert');
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
        this.currentMode = params.mode || 'dashboard';
        this.isOpen = true;
        
        const content = this.render();
        this.window = WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 620,
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
        this.destinations = Storage.get('travel_destinations', this.defaultDestinations);
        this.hotels = Storage.get('travel_hotels', this.defaultHotels);
        this.flights = Storage.get('travel_flights', this.defaultFlights);
        this.attractions = Storage.get('travel_attractions', this.defaultAttractions);
        this.trips = Storage.get('travel_trips', []);
        this.packingList = Storage.get('travel_packing', this.defaultPacking);
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('travel_destinations', this.destinations);
        Storage.set('travel_hotels', this.hotels);
        Storage.set('travel_flights', this.flights);
        Storage.set('travel_attractions', this.attractions);
        Storage.set('travel_trips', this.trips);
        Storage.set('travel_packing', this.packingList);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'dashboard': return this.renderDashboard();
            case 'destinations': return this.renderDestinations();
            case 'hotels': return this.renderHotels();
            case 'flights': return this.renderFlights();
            case 'attractions': return this.renderAttractions();
            case 'planner': return this.renderPlanner();
            case 'packing': return this.renderPacking();
            default: return this.renderDashboard();
        }
    },
    
    // ---- DASHBOARD ----
    renderDashboard() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'dashboard' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('destinations')">🌍 Reiseziele</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('hotels')">🏨 Hotels</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('flights')">✈️ Flüge</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('attractions')">🏛️ Sehenswürdigkeiten</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('planner')">📅 Reiseplaner</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('packing')">🎒 Packliste</button>
                </div>
                
                <!-- Statistiken -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding:12px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🌍</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.destinations.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Reiseziele</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">🏨</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.hotels.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Hotels</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">✈️</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.flights.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Flüge</div>
                    </div>
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:24px;">📅</div>
                        <div style="font-size:20px;font-weight:700;color:var(--text-primary);">${this.trips.length}</div>
                        <div style="font-size:10px;color:var(--text-muted);">Reisen</div>
                    </div>
                </div>
                
                <!-- Reisetipp -->
                <div style="padding:0 12px 12px 12px;">
                    <div style="padding:16px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                        <div style="font-size:14px;color:var(--text-muted);">✈️ Reisetipp</div>
                        <div style="font-size:16px;font-weight:600;color:var(--text-primary);margin:4px 0;">"Die Welt ist ein Buch. Wer nicht reist, liest nur eine Seite."</div>
                        <div style="font-size:11px;color:var(--text-secondary);">— Augustinus von Hippo</div>
                        <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap;">
                            <button class="haldo-btn" style="font-size:10px;padding:3px 10px;" onclick="TravelCenterApp.setMode('destinations')">🌍 Reiseziele</button>
                            <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="TravelCenterApp.setMode('packing')">🎒 Packliste</button>
                        </div>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="display:flex;justify-content:space-between;padding:2px 8px;border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));font-size:10px;color:var(--text-muted);">
                    <span>✈️ Travel Center</span>
                    <span>🌍 Entdecke die Welt</span>
                </div>
            </div>
        `;
    },
    
    // ---- REISEZIELE ----
    renderDestinations() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn ${this.currentMode === 'destinations' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('destinations')">🌍 Reiseziele</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('hotels')">🏨 Hotels</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('flights')">✈️ Flüge</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('attractions')">🏛️ Sehenswürdigkeiten</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('planner')">📅 Reiseplaner</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('packing')">🎒 Packliste</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="TravelCenterApp.addDestination()">+</button>
                </div>
                
                <!-- Reiseziele -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${this.destinations.map(d => `
                        <div style="
                            padding:10px 12px;
                            background: ${this.selectedDestination === d.id ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                            border-radius:8px;
                            border:1px solid ${this.selectedDestination === d.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="TravelCenterApp.showDestination('${d.id}')">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:28px;">${d.icon}</div>
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${d.name}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${d.country}</div>
                                    <div style="font-size:9px;color:var(--text-muted);">Beste Reisezeit: ${d.bestTime}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- HOTELS ----
    renderHotels() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('destinations')">🌍 Reiseziele</button>
                    <button class="haldo-btn ${this.currentMode === 'hotels' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('hotels')">🏨 Hotels</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('flights')">✈️ Flüge</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('attractions')">🏛️ Sehenswürdigkeiten</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('planner')">📅 Reiseplaner</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('packing')">🎒 Packliste</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="TravelCenterApp.addHotel()">+</button>
                </div>
                
                <!-- Hotels -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.hotels.map(h => `
                        <div style="
                            padding:10px 12px;
                            margin:3px 0;
                            background: ${this.selectedHotel === h.id ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                            border-radius:8px;
                            border:1px solid ${this.selectedHotel === h.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="TravelCenterApp.showHotel('${h.id}')">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${h.name}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${h.destination} • ${'⭐'.repeat(h.stars)}</div>
                                    <div style="font-size:9px;color:var(--text-muted);">${h.desc}</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:14px;font-weight:700;color:var(--text-primary);">${h.price}€</div>
                                    <div style="font-size:10px;color:var(--text-muted);">${h.rating} ★</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- FLÜGE ----
    renderFlights() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('destinations')">🌍 Reiseziele</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('hotels')">🏨 Hotels</button>
                    <button class="haldo-btn ${this.currentMode === 'flights' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('flights')">✈️ Flüge</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('attractions')">🏛️ Sehenswürdigkeiten</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('planner')">📅 Reiseplaner</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('packing')">🎒 Packliste</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="TravelCenterApp.addFlight()">+</button>
                </div>
                
                <!-- Flüge -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.flights.map(f => `
                        <div style="
                            padding:10px 12px;
                            margin:3px 0;
                            background: var(--glass-bg, rgba(255,255,255,0.04));
                            border-radius:8px;
                            border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                        ">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${f.from} → ${f.to}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${f.airline} • ${f.duration}</div>
                                    <div style="font-size:9px;color:var(--text-muted);">📅 ${f.date}</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:14px;font-weight:700;color:var(--text-primary);">${f.price}€</div>
                                    <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();TravelCenterApp.deleteFlight('${f.id}')">✕</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- SEHENSWÜRDIGKEITEN ----
    renderAttractions() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('destinations')">🌍 Reiseziele</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('hotels')">🏨 Hotels</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('flights')">✈️ Flüge</button>
                    <button class="haldo-btn ${this.currentMode === 'attractions' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('attractions')">🏛️ Sehenswürdigkeiten</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('planner')">📅 Reiseplaner</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('packing')">🎒 Packliste</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="TravelCenterApp.addAttraction()">+</button>
                </div>
                
                <!-- Sehenswürdigkeiten -->
                <div style="flex:1;overflow-y:auto;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${this.attractions.map(a => `
                        <div style="
                            padding:10px 12px;
                            background: ${this.selectedAttraction === a.id ? 'rgba(108,60,225,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                            border-radius:8px;
                            border:1px solid ${this.selectedAttraction === a.id ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                            cursor:pointer;
                            transition: all 0.15s ease;
                        " onclick="TravelCenterApp.showAttraction('${a.id}')">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:28px;">${a.icon}</div>
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${a.name}</div>
                                    <div style="font-size:10px;color:var(--text-secondary);">${a.destination}</div>
                                    <div style="font-size:9px;color:var(--text-muted);">${a.rating} ★</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // ---- REISEPLANER ----
    renderPlanner() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('destinations')">🌍 Reiseziele</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('hotels')">🏨 Hotels</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('flights')">✈️ Flüge</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('attractions')">🏛️ Sehenswürdigkeiten</button>
                    <button class="haldo-btn ${this.currentMode === 'planner' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('planner')">📅 Reiseplaner</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('packing')">🎒 Packliste</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="TravelCenterApp.addTrip()">+</button>
                </div>
                
                <!-- Reisen -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.trips.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <div style="font-size:48px;">📅</div>
                            <p style="font-size:13px;">Keine Reisen geplant</p>
                            <button class="haldo-btn" style="font-size:12px;margin-top:8px;" onclick="TravelCenterApp.addTrip()">📅 Reise planen</button>
                        </div>
                    ` : `
                        ${this.trips.map(t => `
                            <div style="
                                padding:10px 12px;
                                margin:4px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:8px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            ">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${t.destination} • ${t.date}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">🏨 ${t.hotel || 'Kein Hotel'} • ✈️ ${t.flight || 'Kein Flug'}</div>
                                        <div style="font-size:9px;color:var(--text-muted);">${t.notes || ''}</div>
                                    </div>
                                    <div style="display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();TravelCenterApp.editTrip('${t.id}')">✏️</button>
                                        <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();TravelCenterApp.deleteTrip('${t.id}')">✕</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- PACKLISTE ----
    renderPacking() {
        const checkedCount = this.packingList.filter(p => p.checked).length;
        const totalCount = this.packingList.length;
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('dashboard')">📊 Dashboard</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('destinations')">🌍 Reiseziele</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('hotels')">🏨 Hotels</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('flights')">✈️ Flüge</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('attractions')">🏛️ Sehenswürdigkeiten</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('planner')">📅 Reiseplaner</button>
                    <button class="haldo-btn ${this.currentMode === 'packing' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="TravelCenterApp.setMode('packing')">🎒 Packliste</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <span style="font-size:11px;color:var(--text-muted);">${checkedCount}/${totalCount} ✅</span>
                    <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="TravelCenterApp.addPackingItem()">+</button>
                </div>
                
                <!-- Packliste -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    ${this.packingList.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Packliste</p>
                        </div>
                    ` : `
                        ${this.packingList.map(p => `
                            <div style="
                                padding:8px 12px;
                                margin:3px 0;
                                background: ${p.checked ? 'rgba(0,255,136,0.06)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                                border-radius:6px;
                                border:1px solid ${p.checked ? 'var(--success, #00FF88)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                                display:flex;
                                justify-content:space-between;
                                align-items:center;
                            ">
                                <div style="display:flex;gap:8px;align-items:center;">
                                    <input type="checkbox" ${p.checked ? 'checked' : ''} style="accent-color:var(--primary);" 
                                        onclick="TravelCenterApp.togglePacking('${p.id}')">
                                    <span style="font-size:12px;color:${p.checked ? 'var(--text-muted)' : 'var(--text-primary)'};${p.checked ? 'text-decoration:line-through;' : ''}">
                                        ${p.name}
                                    </span>
                                    <span style="font-size:9px;color:var(--text-muted);">${p.category}</span>
                                </div>
                                <button class="haldo-btn" style="font-size:8px;padding:1px 4px;background:var(--danger, #FF3B30);" onclick="event.stopPropagation();TravelCenterApp.deletePackingItem('${p.id}')">✕</button>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- FUNKTIONEN ----
    setMode(mode) {
        this.currentMode = mode;
        this.updateView();
    },
    
    // ---- REISEZIELE ----
    showDestination(destinationId) {
        const d = this.destinations.find(d => d.id === destinationId);
        if (!d) return;
        this.selectedDestination = destinationId;
        
        // Hotels in der Destination anzeigen
        const destHotels = this.hotels.filter(h => h.destination === d.name);
        const destAttractions = this.attractions.filter(a => a.destination === d.name);
        
        const content = `
            <div style="padding:12px;">
                <div style="display:flex;gap:8px;align-items:center;">
                    <div style="font-size:40px;">${d.icon}</div>
                    <div>
                        <h2 style="color:var(--text-primary);font-size:18px;margin:0;">${d.name}</h2>
                        <p style="color:var(--text-secondary);font-size:12px;">${d.country}</p>
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <div style="font-size:11px;color:var(--text-secondary);">📅 Beste Reisezeit: ${d.bestTime}</div>
                    <div style="font-size:11px;color:var(--text-secondary);">📝 ${d.desc}</div>
                </div>
                <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:4px;">
                    <div style="padding:6px;background:var(--glass-bg);border-radius:4px;text-align:center;">
                        <div style="font-size:10px;color:var(--text-muted);">🏨 Hotels</div>
                        <div style="font-size:16px;font-weight:700;color:var(--text-primary);">${destHotels.length}</div>
                    </div>
                    <div style="padding:6px;background:var(--glass-bg);border-radius:4px;text-align:center;">
                        <div style="font-size:10px;color:var(--text-muted);">🏛️ Sehenswürdigkeiten</div>
                        <div style="font-size:16px;font-weight:700;color:var(--text-primary);">${destAttractions.length}</div>
                    </div>
                </div>
                <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">
                    <button class="haldo-btn" style="font-size:10px;padding:3px 10px;" onclick="alert('📅 Reise zu ${d.name} planen')">📅 Planen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:3px 10px;" onclick="alert('📍 ${d.name} anzeigen')">📍 Karte</button>
                </div>
            </div>
        `;
        
        WindowManager.openWindow(
            'destination-detail',
            '🌍 ' + d.name,
            content,
            d.icon,
            400,
            380
        );
    },
    
    addDestination() {
        const name = prompt('🌍 Reiseziel-Name:');
        if (!name) return;
        const country = prompt('🌍 Land:', 'Deutschland') || 'Deutschland';
        const icon = prompt('🎨 Icon (Emoji):', '🏛️') || '🏛️';
        const bestTime = prompt('📅 Beste Reisezeit:', 'Mai - September') || 'Mai - September';
        const desc = prompt('📝 Beschreibung:') || '';
        
        this.destinations.push({
            id: 'd_' + Date.now().toString(36),
            name: name,
            country: country,
            icon: icon,
            bestTime: bestTime,
            desc: desc
        });
        this.saveData();
        this.updateView();
    },
    
    // ---- HOTELS ----
    showHotel(hotelId) {
        const h = this.hotels.find(h => h.id === hotelId);
        if (!h) return;
        this.selectedHotel = hotelId;
        alert(
            `🏨 ${h.name}\n\n` +
            `📍 ${h.destination}\n` +
            `⭐ ${h.stars} Sterne\n` +
            `💰 ${h.price}€ pro Nacht\n` +
            `📊 ${h.rating} ★\n` +
            `📝 ${h.desc}`
        );
    },
    
    addHotel() {
        const name = prompt('🏨 Hotel-Name:');
        if (!name) return;
        const destination = prompt('📍 Destination:', 'Berlin') || 'Berlin';
        const stars = parseInt(prompt('⭐ Sterne (1-5):', '4')) || 4;
        const price = parseInt(prompt('💰 Preis pro Nacht:', '150')) || 150;
        const rating = parseFloat(prompt('📊 Bewertung (0-5):', '4.5')) || 4.5;
        const desc = prompt('📝 Beschreibung:') || '';
        
        this.hotels.push({
            id: 'h_' + Date.now().toString(36),
            name: name,
            destination: destination,
            stars: stars,
            price: price,
            rating: rating,
            desc: desc
        });
        this.saveData();
        this.updateView();
    },
    
    // ---- FLÜGE ----
    addFlight() {
        const from = prompt('✈️ Abflugort:', 'Berlin') || 'Berlin';
        const to = prompt('✈️ Zielort:', 'Paris') || 'Paris';
        const price = parseInt(prompt('💰 Preis:', '120')) || 120;
        const duration = prompt('⏱️ Dauer:', '1h 30m') || '1h 30m';
        const airline = prompt('✈️ Fluggesellschaft:', 'Lufthansa') || 'Lufthansa';
        const date = prompt('📅 Datum (YYYY-MM-DD):', '2024-07-01') || '2024-07-01';
        
        this.flights.push({
            id: 'f_' + Date.now().toString(36),
            from: from,
            to: to,
            price: price,
            duration: duration,
            airline: airline,
            date: date
        });
        this.saveData();
        this.updateView();
    },
    
    deleteFlight(flightId) {
        if (!confirm('Flug wirklich löschen?')) return;
        this.flights = this.flights.filter(f => f.id !== flightId);
        this.saveData();
        this.updateView();
    },
    
    // ---- SEHENSWÜRDIGKEITEN ----
    showAttraction(attractionId) {
        const a = this.attractions.find(a => a.id === attractionId);
        if (!a) return;
        this.selectedAttraction = attractionId;
        alert(
            `🏛️ ${a.name}\n\n` +
            `📍 ${a.destination}\n` +
            `📊 ${a.rating} ★\n` +
            `📝 ${a.desc}`
        );
    },
    
    addAttraction() {
        const name = prompt('🏛️ Name der Sehenswürdigkeit:');
        if (!name) return;
        const destination = prompt('📍 Destination:', 'Berlin') || 'Berlin';
        const icon = prompt('🎨 Icon (Emoji):', '🏛️') || '🏛️';
        const rating = parseFloat(prompt('📊 Bewertung (0-5):', '4.5')) || 4.5;
        const desc = prompt('📝 Beschreibung:') || '';
        
        this.attractions.push({
            id: 'a_' + Date.now().toString(36),
            name: name,
            destination: destination,
            icon: icon,
            rating: rating,
            desc: desc
        });
        this.saveData();
        this.updateView();
    },
    
    // ---- REISEPLANER ----
    addTrip() {
        const destination = prompt('📅 Reiseziel:', 'Paris') || 'Paris';
        const date = prompt('📅 Datum:', '2024-07-01') || '2024-07-01';
        const hotel = prompt('🏨 Hotel:', '') || '';
        const flight = prompt('✈️ Flug:', '') || '';
        const notes = prompt('📝 Notizen:', '') || '';
        
        this.trips.push({
            id: 't_' + Date.now().toString(36),
            destination: destination,
            date: date,
            hotel: hotel,
            flight: flight,
            notes: notes
        });
        this.saveData();
        this.updateView();
    },
    
    editTrip(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip) return;
        
        const newNotes = prompt('📝 Notizen:', trip.notes) || trip.notes;
        trip.notes = newNotes;
        this.saveData();
        this.updateView();
    },
    
    deleteTrip(tripId) {
        if (!confirm('Reise wirklich löschen?')) return;
        this.trips = this.trips.filter(t => t.id !== tripId);
        this.saveData();
        this.updateView();
    },
    
    // ---- PACKLISTE ----
    togglePacking(itemId) {
        const item = this.packingList.find(p => p.id === itemId);
        if (item) {
            item.checked = !item.checked;
            this.saveData();
            this.updateView();
        }
    },
    
    addPackingItem() {
        const name = prompt('🎒 Packliste-Item:');
        if (!name) return;
        const category = prompt('📂 Kategorie (Dokumente, Elektronik, Kleidung, Pflege, Medizin):', 'Allgemein') || 'Allgemein';
        
        this.packingList.push({
            id: 'p_' + Date.now().toString(36),
            name: name,
            checked: false,
            category: category
        });
        this.saveData();
        this.updateView();
    },
    
    deletePackingItem(itemId) {
        if (!confirm('Item wirklich löschen?')) return;
        this.packingList = this.packingList.filter(p => p.id !== itemId);
        this.saveData();
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
        if (this.window) {
            this.window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.setMode('dashboard');
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('✈️ Travel Center App wird installiert...');
        this.loadData();
        if (this.destinations.length === 0) {
            this.destinations = this.defaultDestinations;
            this.hotels = this.defaultHotels;
            this.flights = this.defaultFlights;
            this.attractions = this.defaultAttractions;
            this.packingList = this.defaultPacking;
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Travel Center App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
TravelCenterApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.TravelCenterApp = TravelCenterApp;

console.log('✈️ Travel Center App geladen – HalDo AI OS 24.6.0');
