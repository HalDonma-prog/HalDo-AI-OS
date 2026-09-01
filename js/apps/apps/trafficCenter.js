/**
 * HALDO AI OS 24.6.0 – TRAFFIC CENTER APP
 * Verkehrsinformationen, Blitzerwarnungen, Routenplanung und Parkplatzsuche
 * Version: 1.0.0
 */

const TrafficCenterApp = {
    // ---- APP-INFO ----
    id: 'traffic-center',
    name: 'Verkehr & Blitzer',
    icon: '🚦',
    category: 'transport',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Blitzerwarnungen, Verkehrsinfos, Routenplanung und Parkplatzsuche',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    currentMode: 'alerts', // alerts | routes | parking | traffic
    currentLocation: 'Berlin',
    destination: '',
    routeType: 'fastest', // fastest | shortest | scenic
    alerts: [],
    speedCameras: [],
    trafficInfo: [],
    parkingSpots: [],
    favorites: [],
    isLoaded: false,
    isLoading: false,
    
    // ---- MOCK-DATEN ----
    mockSpeedCameras: [
        { id: 'cam1', name: 'A100 - Kreuzberg', lat: 52.490, lng: 13.390, speedLimit: 60, direction: 'beide' },
        { id: 'cam2', name: 'B1 - Mitte', lat: 52.520, lng: 13.400, speedLimit: 50, direction: 'Ost' },
        { id: 'cam3', name: 'A115 - Zehlendorf', lat: 52.440, lng: 13.250, speedLimit: 80, direction: 'Nord' },
        { id: 'cam4', name: 'Stadtring - Wedding', lat: 52.550, lng: 13.350, speedLimit: 50, direction: 'Süd' },
        { id: 'cam5', name: 'A10 - Potsdam', lat: 52.400, lng: 13.050, speedLimit: 100, direction: 'West' }
    ],
    
    mockTrafficInfo: [
        { id: 't1', location: 'A100 - Kreuzberg', status: 'Stau', delay: 15, reason: 'Unfall' },
        { id: 't2', location: 'B1 - Mitte', status: 'Stau', delay: 10, reason: 'Baustelle' },
        { id: 't3', location: 'A115 - Zehlendorf', status: 'Frei', delay: 0, reason: '-' },
        { id: 't4', location: 'Stadtring - Wedding', status: 'Zähflüssig', delay: 5, reason: 'Pendlerverkehr' }
    ],
    
    mockParkingSpots: [
        { id: 'p1', name: 'Parkhaus Mitte', lat: 52.520, lng: 13.400, free: 12, total: 50, price: '3,00 €/h' },
        { id: 'p2', name: 'Tiefgarage Kreuzberg', lat: 52.490, lng: 13.390, free: 5, total: 30, price: '2,50 €/h' },
        { id: 'p3', name: 'Park & Ride Zehlendorf', lat: 52.440, lng: 13.250, free: 45, total: 100, price: '1,50 €/h' },
        { id: 'p4', name: 'Parkplatz Wedding', lat: 52.550, lng: 13.350, free: 8, total: 25, price: '2,00 €/h' }
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
            console.log('🚦 Traffic Center App registriert');
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
        this.currentMode = params.mode || 'alerts';
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
            this.loadData();
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
        this.alerts = Storage.get('traffic_alerts', []);
        this.favorites = Storage.get('traffic_favorites', []);
        this.speedCameras = Storage.get('traffic_cameras', this.mockSpeedCameras);
        this.trafficInfo = Storage.get('traffic_info', this.mockTrafficInfo);
        this.parkingSpots = Storage.get('traffic_parking', this.mockParkingSpots);
        this.currentLocation = Storage.get('traffic_location', 'Berlin');
        return this;
    },
    
    // ---- DATEN SPEICHERN ----
    saveData() {
        Storage.set('traffic_alerts', this.alerts);
        Storage.set('traffic_favorites', this.favorites);
        Storage.set('traffic_cameras', this.speedCameras);
        Storage.set('traffic_info', this.trafficInfo);
        Storage.set('traffic_parking', this.parkingSpots);
        Storage.set('traffic_location', this.currentLocation);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        switch(this.currentMode) {
            case 'alerts': return this.renderAlerts();
            case 'routes': return this.renderRoutes();
            case 'parking': return this.renderParking();
            case 'traffic': return this.renderTraffic();
            default: return this.renderAlerts();
        }
    },
    
    // ---- BLITZER & WARNUNGEN ----
    renderAlerts() {
        const activeAlerts = this.alerts.filter(a => a.active !== false);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn ${this.currentMode === 'alerts' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('alerts')">⚠️ Blitzer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('traffic')">🚗 Verkehr</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('routes')">🗺️ Routen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('parking')">🅿️ Parken</button>
                    <div style="flex:1;min-width:60px;"></div>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="TrafficCenterApp.addSpeedCamera()">+</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="TrafficCenterApp.refreshData()">⟳</button>
                </div>
                
                <!-- Blitzerliste -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
                        <div style="font-size:12px;font-weight:600;color:var(--text-primary);">📍 ${this.currentLocation}</div>
                        <div style="font-size:11px;color:var(--text-secondary);">${this.speedCameras.length} Blitzer in der Nähe</div>
                    </div>
                    
                    ${this.speedCameras.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Blitzer in der Nähe</p>
                        </div>
                    ` : `
                        ${this.speedCameras.map(cam => `
                            <div class="cam-item" style="
                                padding:8px 12px;
                                margin:4px 0;
                                background: var(--glass-bg, rgba(255,255,255,0.04));
                                border-radius:8px;
                                border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                            ">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div>
                                        <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${cam.name}</div>
                                        <div style="font-size:10px;color:var(--text-secondary);">${cam.speedLimit} km/h • Richtung: ${cam.direction}</div>
                                    </div>
                                    <div style="display:flex;gap:4px;align-items:center;">
                                        <span style="font-size:10px;color:${cam.speedLimit > 80 ? 'var(--danger, #FF3B30)' : 'var(--warning, #FFB800)'};">${cam.speedLimit > 80 ? '⚠️' : '📸'}</span>
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="event.stopPropagation();TrafficCenterApp.toggleFavorite('${cam.id}')">
                                            ${this.favorites.includes(cam.id) ? '⭐' : '☆'}
                                        </button>
                                    </div>
                                </div>
                                <div style="display:flex;gap:4px;margin-top:4px;">
                                    <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="TrafficCenterApp.addAlert('${cam.id}')">🔔 Warnung</button>
                                    <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="TrafficCenterApp.removeCamera('${cam.id}')">✕</button>
                                </div>
                            </div>
                        `).join('')}
                    `}
                    
                    ${activeAlerts.length > 0 ? `
                        <div style="margin-top:12px;padding:8px 12px;background:rgba(255,59,48,0.1);border-radius:8px;border:1px solid rgba(255,59,48,0.2);">
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="font-size:20px;">🔔</div>
                                <div>
                                    <div style="font-size:12px;font-weight:600;color:var(--danger, #FF3B30);">Aktive Warnungen</div>
                                    <div style="font-size:11px;color:var(--text-secondary);">${activeAlerts.length} Warnungen aktiv</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    // ---- VERKEHRSINFOS ----
    renderTraffic() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('alerts')">⚠️ Blitzer</button>
                    <button class="haldo-btn ${this.currentMode === 'traffic' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('traffic')">🚗 Verkehr</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('routes')">🗺️ Routen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('parking')">🅿️ Parken</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="TrafficCenterApp.refreshData()">⟳</button>
                </div>
                
                <!-- Verkehrsinfos -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">🚗 Aktuelle Verkehrslage</div>
                    
                    ${this.trafficInfo.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Verkehrsinfos verfügbar</p>
                        </div>
                    ` : `
                        ${this.trafficInfo.map(info => {
                            const statusColor = info.status === 'Stau' ? 'var(--danger, #FF3B30)' : 
                                               info.status === 'Zähflüssig' ? 'var(--warning, #FFB800)' : 
                                               'var(--success, #00FF88)';
                            return `
                                <div style="
                                    padding:8px 12px;
                                    margin:4px 0;
                                    background: var(--glass-bg, rgba(255,255,255,0.04));
                                    border-radius:8px;
                                    border-left: 4px solid ${statusColor};
                                ">
                                    <div style="display:flex;justify-content:space-between;align-items:center;">
                                        <div>
                                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${info.location}</div>
                                            <div style="font-size:10px;color:var(--text-secondary);">${info.reason || 'Keine Angabe'}</div>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="font-size:12px;font-weight:600;color:${statusColor};">${info.status}</div>
                                            <div style="font-size:10px;color:var(--text-muted);">${info.delay > 0 ? `+${info.delay} min` : 'Frei'}</div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    `}
                    
                    <div style="margin-top:12px;padding:8px 12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <div style="font-size:11px;color:var(--text-secondary);">💡 Tipp: Aktiviere Blitzerwarnungen für Echtzeit-Informationen</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ---- ROUTENPLANUNG ----
    renderRoutes() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('alerts')">⚠️ Blitzer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('traffic')">🚗 Verkehr</button>
                    <button class="haldo-btn ${this.currentMode === 'routes' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('routes')">🗺️ Routen</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('parking')">🅿️ Parken</button>
                </div>
                
                <!-- Routenplanung -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                        <div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap;">
                            <input id="route-start" class="haldo-input" value="${this.currentLocation}" placeholder="Start..." style="flex:1;font-size:11px;min-width:80px;">
                            <input id="route-end" class="haldo-input" value="${this.destination}" placeholder="Ziel..." style="flex:1;font-size:11px;min-width:80px;">
                        </div>
                        <div style="display:flex;gap:4px;flex-wrap:wrap;">
                            <select id="route-type" class="haldo-input" style="font-size:10px;padding:2px 6px;flex:1;min-width:80px;">
                                <option value="fastest" ${this.routeType === 'fastest' ? 'selected' : ''}>🚀 Schnellste</option>
                                <option value="shortest" ${this.routeType === 'shortest' ? 'selected' : ''}>📏 Kürzeste</option>
                                <option value="scenic" ${this.routeType === 'scenic' ? 'selected' : ''}>🌿 Landschaft</option>
                            </select>
                            <button class="haldo-btn" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.calcRoute()">🔍 Routen</button>
                        </div>
                    </div>
                    
                    <div id="route-result" style="margin-top:8px;">
                        <div style="text-align:center;padding:20px;color:var(--text-muted);">
                            <p style="font-size:12px;">Gib Start und Ziel ein, um eine Route zu berechnen</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    calcRoute() {
        const start = document.getElementById('route-start')?.value || this.currentLocation;
        const end = document.getElementById('route-end')?.value || this.destination;
        const type = document.getElementById('route-type')?.value || this.routeType;
        
        if (!start || !end) {
            alert('⚠️ Bitte Start- und Zielort eingeben.');
            return;
        }
        
        this.currentLocation = start;
        this.destination = end;
        this.routeType = type;
        this.saveData();
        
        // Simulierte Routenberechnung
        const distances = {
            'fastest': '23 km, 25 min',
            'shortest': '18 km, 35 min',
            'scenic': '28 km, 40 min'
        };
        
        const routeInfo = {
            'fastest': '🚀 Schnellste Route: Autobahn A100, wenig Verkehr',
            'shortest': '📏 Kürzeste Route: Stadtstraße B1, durch Innenstadt',
            'scenic': '🌿 Landschaftsroute: über Landstraße, schöne Ausblicke'
        };
        
        const result = document.getElementById('route-result');
        if (result) {
            result.innerHTML = `
                <div style="padding:12px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${start} → ${end}</div>
                            <div style="font-size:11px;color:var(--text-secondary);">${routeInfo[type] || routeInfo['fastest']}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:16px;font-weight:700;color:var(--text-primary);">${distances[type] || distances['fastest']}</div>
                            <div style="font-size:10px;color:var(--text-muted);">${type === 'fastest' ? '🚀' : type === 'shortest' ? '📏' : '🌿'}</div>
                        </div>
                    </div>
                    <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:2px 6px;" onclick="alert('🗺️ Kartenansicht wird geöffnet...')">🗺️ Karte</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:9px;padding:2px 6px;" onclick="alert('📱 Navigation wird gestartet...')">📱 Navigation</button>
                    </div>
                </div>
            `;
        }
        
        EventBus.emit('traffic:route-calculated', { start, end, type });
    },
    
    // ---- PARKPLATZSUCHE ----
    renderParking() {
        const totalFree = this.parkingSpots.reduce((sum, p) => sum + p.free, 0);
        const totalSpots = this.parkingSpots.reduce((sum, p) => sum + p.total, 0);
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));flex-wrap:wrap;">
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('alerts')">⚠️ Blitzer</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('traffic')">🚗 Verkehr</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('routes')">🗺️ Routen</button>
                    <button class="haldo-btn ${this.currentMode === 'parking' ? '' : 'haldo-btn-secondary'}" style="font-size:11px;padding:4px 12px;" onclick="TrafficCenterApp.setMode('parking')">🅿️ Parken</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="TrafficCenterApp.refreshData()">⟳</button>
                </div>
                
                <!-- Parkplätze -->
                <div style="flex:1;overflow-y:auto;padding:8px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px;">
                        <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:10px;color:var(--text-muted);">Frei</div>
                            <div style="font-size:18px;font-weight:700;color:var(--success, #00FF88);">${totalFree}</div>
                        </div>
                        <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:10px;color:var(--text-muted);">Gesamt</div>
                            <div style="font-size:18px;font-weight:700;color:var(--text-primary);">${totalSpots}</div>
                        </div>
                        <div style="padding:6px 10px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:8px;border:1px solid var(--glass-border, rgba(255,255,255,0.06));text-align:center;">
                            <div style="font-size:10px;color:var(--text-muted);">Auslastung</div>
                            <div style="font-size:18px;font-weight:700;color:${totalSpots > 0 && (totalFree/totalSpots) < 0.2 ? 'var(--danger, #FF3B30)' : 'var(--warning, #FFB800)'};">${Math.round((1 - totalFree/totalSpots) * 100)}%</div>
                        </div>
                    </div>
                    
                    ${this.parkingSpots.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--text-muted);">
                            <p>Keine Parkplätze verfügbar</p>
                        </div>
                    ` : `
                        ${this.parkingSpots.map(p => {
                            const fillRate = p.total > 0 ? (p.free / p.total * 100) : 0;
                            const statusColor = fillRate > 30 ? 'var(--success, #00FF88)' : 
                                               fillRate > 10 ? 'var(--warning, #FFB800)' : 
                                               'var(--danger, #FF3B30)';
                            return `
                                <div style="
                                    padding:8px 12px;
                                    margin:4px 0;
                                    background: var(--glass-bg, rgba(255,255,255,0.04));
                                    border-radius:8px;
                                    border:1px solid var(--glass-border, rgba(255,255,255,0.06));
                                ">
                                    <div style="display:flex;justify-content:space-between;align-items:center;">
                                        <div>
                                            <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${p.name}</div>
                                            <div style="font-size:10px;color:var(--text-secondary);">${p.price}</div>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="font-size:14px;font-weight:600;color:${statusColor};">${p.free} frei</div>
                                            <div style="font-size:10px;color:var(--text-muted);">von ${p.total}</div>
                                        </div>
                                    </div>
                                    <div style="margin-top:4px;display:flex;gap:4px;">
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="alert('📍 ${p.name}\nFreie Plätze: ${p.free}\nPreis: ${p.price}')">📍 Info</button>
                                        <button class="haldo-btn haldo-btn-secondary" style="font-size:8px;padding:1px 4px;" onclick="alert('🗺️ Navigation zu ${p.name} wird gestartet...')">🗺️ Navigieren</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    `}
                </div>
            </div>
        `;
    },
    
    // ---- MODUS ----
    setMode(mode) {
        this.currentMode = mode;
        this.updateView();
    },
    
    // ---- BLITZER VERWALTEN ----
    addSpeedCamera() {
        const name = prompt('📸 Name des Blitzers:');
        if (!name) return;
        const speedLimit = prompt('🚦 Geschwindigkeitsbegrenzung (km/h):', '50');
        if (!speedLimit) return;
        const direction = prompt('🧭 Richtung:', 'beide') || 'beide';
        
        this.speedCameras.push({
            id: 'cam_' + Date.now().toString(36),
            name: name,
            speedLimit: parseInt(speedLimit),
            direction: direction,
            active: true
        });
        
        this.saveData();
        this.updateView();
        EventBus.emit('traffic:camera-added', { name });
    },
    
    removeCamera(cameraId) {
        if (!confirm('Blitzer wirklich entfernen?')) return;
        this.speedCameras = this.speedCameras.filter(c => c.id !== cameraId);
        this.favorites = this.favorites.filter(id => id !== cameraId);
        this.saveData();
        this.updateView();
    },
    
    // ---- WARNUNGEN ----
    addAlert(cameraId) {
        const camera = this.speedCameras.find(c => c.id === cameraId);
        if (!camera) return;
        
        const existing = this.alerts.find(a => a.cameraId === cameraId);
        if (existing) {
            existing.active = !existing.active;
        } else {
            this.alerts.push({
                id: 'alert_' + Date.now().toString(36),
                cameraId: cameraId,
                name: camera.name,
                speedLimit: camera.speedLimit,
                active: true,
                createdAt: Date.now()
            });
        }
        
        this.saveData();
        this.updateView();
        alert(`🔔 Warnung für "${camera.name}" ${existing ? (existing.active ? 'aktiviert' : 'deaktiviert') : 'hinzugefügt'}`);
    },
    
    // ---- FAVORITEN ----
    toggleFavorite(itemId) {
        const index = this.favorites.indexOf(itemId);
        if (index === -1) {
            this.favorites.push(itemId);
        } else {
            this.favorites.splice(index, 1);
        }
        this.saveData();
        this.updateView();
    },
    
    // ---- AKTUALISIEREN ----
    refreshData() {
        // Simulierte Aktualisierung
        this.loadData();
        this.updateView();
        alert('✅ Verkehrsdaten aktualisiert');
        EventBus.emit('traffic:refreshed', { timestamp: Date.now() });
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
                    this.refreshData();
                    e.preventDefault();
                }
                if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
                    this.addSpeedCamera();
                    e.preventDefault();
                }
            });
        }
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('🚦 Traffic Center App wird installiert...');
        this.loadData();
        if (this.speedCameras.length === 0) {
            this.speedCameras = this.mockSpeedCameras;
            this.trafficInfo = this.mockTrafficInfo;
            this.parkingSpots = this.mockParkingSpots;
            this.saveData();
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Traffic Center App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
TrafficCenterApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.TrafficCenterApp = TrafficCenterApp;

console.log('🚦 Traffic Center App geladen – HalDo AI OS 24.6.0');
