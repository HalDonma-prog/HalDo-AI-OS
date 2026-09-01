/**
 * HALDO AI OS 24.6.0 – CALENDAR APP
 * Professionelle Terminverwaltung mit Monats-, Wochen- und Tagesansicht
 * Version: 1.0.0
 */

const CalendarApp = {
    // ---- APP-INFO ----
    id: 'calendar',
    name: 'Kalender',
    icon: '📅',
    category: 'tools',
    version: '1.0.0',
    author: 'HalDo Team',
    description: 'Termine verwalten, Erinnerungen setzen und den Überblick behalten',
    
    // ---- ZUSTAND ----
    isOpen: false,
    window: null,
    view: 'month', // month | week | day
    currentDate: new Date(),
    selectedDate: null,
    events: [],
    selectedEvent: null,
    editingEvent: null,
    
    // ---- KATEGORIEN ----
    categories: [
        { id: 'personal', label: '👤 Persönlich', color: '#6C3CE1' },
        { id: 'work', label: '💼 Arbeit', color: '#00D4FF' },
        { id: 'study', label: '📚 Studium', color: '#FF6B9D' },
        { id: 'health', label: '💚 Gesundheit', color: '#00FF88' },
        { id: 'family', label: '👪 Familie', color: '#FFB800' },
        { id: 'other', label: '📌 Sonstiges', color: '#888888' }
    ],
    
    // ---- MONATSNAMEN ----
    monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    shortMonthNames: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    shortDayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    
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
            console.log('📅 Calendar App registriert');
        }
        return this;
    },
    
    // ---- ÖFFNEN ----
    open(params = {}) {
        if (this.isOpen && this.window) {
            WindowManager.bringToFront(this.window);
            return this.window;
        }
        
        this.loadEvents();
        if (params.date) {
            this.currentDate = new Date(params.date);
        }
        if (params.view) {
            this.view = params.view;
        }
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
    
    // ---- TERMINE LADEN ----
    loadEvents() {
        this.events = Storage.get('calendar_events', []);
        return this.events;
    },
    
    // ---- TERMINE SPEICHERN ----
    saveEvents() {
        Storage.set('calendar_events', this.events);
        return this;
    },
    
    // ---- RENDER ----
    render() {
        const date = this.currentDate;
        const year = date.getFullYear();
        const month = date.getMonth();
        
        switch(this.view) {
            case 'month': return this.renderMonthView(year, month);
            case 'week': return this.renderWeekView(year, month);
            case 'day': return this.renderDayView(year, month);
            default: return this.renderMonthView(year, month);
        }
    },
    
    // ---- MONATSANSICHT ----
    renderMonthView(year, month) {
        const monthName = this.monthNames[month];
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();
        const selectedDate = this.selectedDate ? this.selectedDate.getDate() : null;
        const selectedMonth = this.selectedDate ? this.selectedDate.getMonth() : null;
        const selectedYear = this.selectedDate ? this.selectedDate.getFullYear() : null;
        
        // Events für diesen Monat
        const monthEvents = this.events.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
        
        // Kalender-Tage
        let daysHtml = '';
        const totalCells = 42; // 6 Wochen
        const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Montag als erster Tag
        
        for (let i = 0; i < totalCells; i++) {
            const dayNum = i - startOffset + 1;
            const isValid = dayNum > 0 && dayNum <= daysInMonth;
            const isToday = isValid && dayNum === todayDate && month === todayMonth && year === todayYear;
            const isSelected = isValid && dayNum === selectedDate && month === selectedMonth && year === selectedYear;
            
            // Events für diesen Tag
            const dayEvents = monthEvents.filter(e => {
                const d = new Date(e.date);
                return d.getDate() === dayNum;
            });
            
            daysHtml += `
                <div class="calendar-day" data-day="${dayNum}" style="
                    padding:4px;
                    border-radius:4px;
                    min-height:50px;
                    background: ${isSelected ? 'var(--primary, #6C3CE1)' : isToday ? 'rgba(108,60,225,0.2)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                    border: 1px solid ${isSelected ? 'var(--primary, #6C3CE1)' : isToday ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                    cursor: ${isValid ? 'pointer' : 'default'};
                    opacity: ${isValid ? 1 : 0.3};
                    transition: all 0.15s ease;
                    display:flex;
                    flex-direction:column;
                " onclick="${isValid ? `CalendarApp.selectDay(${dayNum})` : ''}">
                    <div style="font-size:12px;font-weight:${isToday ? '700' : '400'};color:${isSelected ? 'white' : isToday ? 'var(--text-primary)' : 'var(--text-secondary)'};">
                        ${isValid ? dayNum : ''}
                        ${isToday ? ' ●' : ''}
                    </div>
                    <div style="flex:1;overflow:hidden;margin-top:2px;">
                        ${dayEvents.slice(0, 3).map(e => `
                            <div style="
                                font-size:8px;
                                padding:1px 3px;
                                background: ${this.getCategoryColor(e.category) || '#6C3CE1'};
                                border-radius:3px;
                                color:white;
                                margin:1px 0;
                                overflow:hidden;
                                text-overflow:ellipsis;
                                white-space:nowrap;
                            ">${e.title}</div>
                        `).join('')}
                        ${dayEvents.length > 3 ? `<div style="font-size:7px;color:var(--text-muted);">+${dayEvents.length - 3} mehr</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <div style="display:flex;gap:4px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.navigateMonth(-1)">◀</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.navigateMonth(1)">▶</button>
                    </div>
                    <div style="font-size:14px;font-weight:600;color:var(--text-primary);">
                        ${monthName} ${year}
                    </div>
                    <div style="display:flex;gap:4px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.setView('week')">Woche</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.setView('day')">Tag</button>
                        <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.createEvent()">+</button>
                    </div>
                </div>
                
                <!-- Wochentage -->
                <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;padding:4px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    ${this.shortDayNames.map(d => `
                        <div style="text-align:center;font-size:10px;color:var(--text-muted);padding:2px;">${d}</div>
                    `).join('')}
                </div>
                
                <!-- Kalender -->
                <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;padding:4px;flex:1;overflow-y:auto;">
                    ${daysHtml}
                </div>
                
                <!-- Terminliste (aktueller Tag) -->
                <div style="border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));padding:4px;max-height:120px;overflow-y:auto;">
                    ${this.renderEventList()}
                </div>
            </div>
        `;
    },
    
    // ---- WOCHENANSICHT ----
    renderWeekView(year, month) {
        const today = new Date();
        const currentDate = this.currentDate;
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Montag
        
        let daysHtml = '';
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dayNum = date.getDate();
            const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
            const isSelected = this.selectedDate && date.getDate() === this.selectedDate.getDate() && date.getMonth() === this.selectedDate.getMonth() && date.getFullYear() === this.selectedDate.getFullYear();
            
            // Events für diesen Tag
            const dayEvents = this.events.filter(e => {
                const d = new Date(e.date);
                return d.getDate() === dayNum && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
            });
            
            daysHtml += `
                <div class="week-day" data-date="${date.toISOString()}" style="
                    padding:4px;
                    border-radius:4px;
                    min-height:80px;
                    background: ${isSelected ? 'var(--primary, #6C3CE1)' : isToday ? 'rgba(108,60,225,0.2)' : 'var(--glass-bg, rgba(255,255,255,0.04))'};
                    border: 1px solid ${isSelected ? 'var(--primary, #6C3CE1)' : isToday ? 'var(--primary, #6C3CE1)' : 'var(--glass-border, rgba(255,255,255,0.06))'};
                    cursor:pointer;
                    transition: all 0.15s ease;
                    flex:1;
                " onclick="CalendarApp.selectDate(new Date('${date.toISOString()}'))">
                    <div style="font-size:11px;font-weight:${isToday ? '700' : '400'};color:${isSelected ? 'white' : isToday ? 'var(--text-primary)' : 'var(--text-secondary)'};">
                        ${this.shortDayNames[date.getDay()]} ${dayNum}
                        ${isToday ? ' ●' : ''}
                    </div>
                    <div style="margin-top:2px;">
                        ${dayEvents.map(e => `
                            <div style="
                                font-size:8px;
                                padding:1px 3px;
                                background: ${this.getCategoryColor(e.category) || '#6C3CE1'};
                                border-radius:3px;
                                color:white;
                                margin:1px 0;
                                overflow:hidden;
                                text-overflow:ellipsis;
                                white-space:nowrap;
                            ">${e.title}</div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <div style="display:flex;gap:4px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.navigateWeek(-1)">◀</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.navigateWeek(1)">▶</button>
                    </div>
                    <div style="font-size:14px;font-weight:600;color:var(--text-primary);">
                        ${this.monthNames[startOfWeek.getMonth()]} ${startOfWeek.getFullYear()} (Woche ${this.getWeekNumber(startOfWeek)})
                    </div>
                    <div style="display:flex;gap:4px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.setView('month')">Monat</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.setView('day')">Tag</button>
                        <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.createEvent()">+</button>
                    </div>
                </div>
                
                <!-- Tage -->
                <div style="display:flex;gap:2px;padding:4px;flex:1;overflow-y:auto;">
                    ${daysHtml}
                </div>
                
                <!-- Terminliste -->
                <div style="border-top:1px solid var(--glass-border, rgba(255,255,255,0.06));padding:4px;max-height:100px;overflow-y:auto;">
                    ${this.renderEventList()}
                </div>
            </div>
        `;
    },
    
    // ---- TAGESANSICHT ----
    renderDayView(year, month) {
        const date = this.selectedDate || this.currentDate;
        const day = date.getDate();
        const monthName = this.monthNames[date.getMonth()];
        const yearNum = date.getFullYear();
        const dayName = this.dayNames[date.getDay()];
        const isToday = date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
        
        // Events für diesen Tag
        const dayEvents = this.events.filter(e => {
            const d = new Date(e.date);
            return d.getDate() === day && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        });
        
        // Stunden
        let hoursHtml = '';
        for (let h = 0; h < 24; h++) {
            const hourEvents = dayEvents.filter(e => {
                const hour = parseInt(e.time?.split(':')[0] || 0);
                return hour === h;
            });
            
            hoursHtml += `
                <div style="display:flex;gap:4px;padding:2px 4px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.03));min-height:30px;">
                    <div style="font-size:10px;color:var(--text-muted);width:40px;flex-shrink:0;">${String(h).padStart(2, '0')}:00</div>
                    <div style="flex:1;">
                        ${hourEvents.map(e => `
                            <div style="
                                padding:2px 8px;
                                background: ${this.getCategoryColor(e.category) || '#6C3CE1'};
                                border-radius:4px;
                                color:white;
                                font-size:11px;
                                margin:1px 0;
                                cursor:pointer;
                            " onclick="CalendarApp.selectEvent('${e.id}')">
                                ${e.title} ${e.time ? '• ' + e.time : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Kopf -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:1px solid var(--glass-border, rgba(255,255,255,0.06));">
                    <div style="display:flex;gap:4px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.navigateDay(-1)">◀</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.navigateDay(1)">▶</button>
                    </div>
                    <div style="font-size:14px;font-weight:600;color:var(--text-primary);">
                        ${dayName}, ${day}. ${monthName} ${yearNum} ${isToday ? '●' : ''}
                    </div>
                    <div style="display:flex;gap:4px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.setView('month')">Monat</button>
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.setView('week')">Woche</button>
                        <button class="haldo-btn" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.createEvent()">+</button>
                    </div>
                </div>
                
                <!-- Stunden -->
                <div style="flex:1;overflow-y:auto;padding:4px;">
                    ${hoursHtml}
                </div>
            </div>
        `;
    },
    
    // ---- TERMINLISTE ----
    renderEventList() {
        const date = this.selectedDate || this.currentDate;
        const dayEvents = this.events.filter(e => {
            const d = new Date(e.date);
            return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        });
        
        if (dayEvents.length === 0) {
            return `
                <div style="text-align:center;padding:8px;color:var(--text-muted);font-size:11px;">
                    Keine Termine für diesen Tag
                </div>
            `;
        }
        
        return dayEvents.map(e => `
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                padding:4px 8px;
                background: var(--glass-bg, rgba(255,255,255,0.04));
                border-radius:4px;
                margin:2px 0;
                border-left: 3px solid ${this.getCategoryColor(e.category) || '#6C3CE1'};
                cursor:pointer;
            " onclick="CalendarApp.selectEvent('${e.id}')">
                <div>
                    <div style="font-size:12px;color:var(--text-primary);">${e.title}</div>
                    <div style="font-size:10px;color:var(--text-muted);">${e.time || 'Ganztägig'} • ${this.getCategoryLabel(e.category)}</div>
                </div>
                <div style="display:flex;gap:4px;">
                    ${e.repeat !== 'none' ? `<span style="font-size:10px;color:var(--text-muted);">🔄</span>` : ''}
                    ${e.reminder ? `<span style="font-size:10px;color:var(--text-muted);">🔔</span>` : ''}
                </div>
            </div>
        `).join('');
    },
    
    // ---- EVENT AUSWÄHLEN ----
    selectEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;
        
        this.selectedEvent = event;
        this.editingEvent = event;
        this.showEventDetail(event);
    },
    
    // ---- EVENT DETAIL ANZEIGEN ----
    showEventDetail(event) {
        if (!event) return;
        
        const detailHtml = `
            <div style="display:flex;flex-direction:column;gap:8px;padding:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <h3 style="color:var(--text-primary);font-size:14px;margin:0;">${event.title}</h3>
                    <div style="display:flex;gap:4px;">
                        <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.editEvent('${event.id}')">✏️</button>
                        <button class="haldo-btn" style="font-size:10px;padding:2px 8px;background:var(--danger, #FF3B30);" onclick="CalendarApp.deleteEvent('${event.id}')">🗑️</button>
                    </div>
                </div>
                <div style="font-size:12px;color:var(--text-secondary);">
                    <div>📅 ${new Date(event.date).toLocaleDateString('de')}</div>
                    ${event.time ? `<div>🕐 ${event.time}</div>` : ''}
                    ${event.category ? `<div>🏷️ ${this.getCategoryLabel(event.category)}</div>` : ''}
                </div>
                ${event.description ? `<div style="font-size:12px;color:var(--text-secondary);padding:6px;background:var(--glass-bg, rgba(255,255,255,0.04));border-radius:4px;">${event.description}</div>` : ''}
                <div style="font-size:11px;color:var(--text-muted);">
                    ${event.repeat && event.repeat !== 'none' ? `🔄 Wiederholung: ${event.repeat}` : ''}
                    ${event.reminder ? ` 🔔 Erinnerung: ${event.reminder}` : ''}
                </div>
                <button class="haldo-btn haldo-btn-secondary" style="font-size:10px;padding:2px 8px;" onclick="CalendarApp.closeDetail()">Schließen</button>
            </div>
        `;
        
        // In die Terminliste einfügen
        const listContainer = document.querySelector('#calendar-detail-area');
        if (listContainer) {
            listContainer.innerHTML = detailHtml;
        } else {
            // Detail-Bereich erstellen
            const container = this.window?.querySelector('.window-body');
            if (container) {
                const detailArea = document.createElement('div');
                detailArea.id = 'calendar-detail-area';
                detailArea.style.cssText = 'padding:8px;';
                container.appendChild(detailArea);
                detailArea.innerHTML = detailHtml;
            }
        }
    },
    
    closeDetail() {
        const detailArea = document.getElementById('calendar-detail-area');
        if (detailArea) {
            detailArea.innerHTML = '';
        }
        this.selectedEvent = null;
        this.editingEvent = null;
        this.updateView();
    },
    
    // ---- EVENT ERSTELLEN ----
    createEvent(date = null) {
        const targetDate = date || this.selectedDate || this.currentDate;
        const event = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
            title: '',
            description: '',
            date: targetDate.toISOString().split('T')[0],
            time: '',
            category: 'personal',
            repeat: 'none',
            reminder: null,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.editingEvent = event;
        this.showEventForm(event);
    },
    
    // ---- EVENT FORMULAR ----
    showEventForm(event) {
        const isNew = !event.id || !this.events.find(e => e.id === event.id);
        
        const formHtml = `
            <div style="display:flex;flex-direction:column;gap:6px;padding:8px;">
                <h3 style="color:var(--text-primary);font-size:14px;margin:0;">${isNew ? 'Neuer Termin' : 'Termin bearbeiten'}</h3>
                
                <input id="event-title-input" class="haldo-input" value="${event.title || ''}" placeholder="Titel..." style="font-size:12px;">
                
                <input id="event-date-input" class="haldo-input" type="date" value="${event.date}" style="font-size:12px;">
                
                <input id="event-time-input" class="haldo-input" type="time" value="${event.time || ''}" style="font-size:12px;">
                
                <textarea id="event-desc-input" class="haldo-input" placeholder="Beschreibung..." style="font-size:12px;min-height:60px;resize:vertical;">${event.description || ''}</textarea>
                
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    <select id="event-category-select" class="haldo-input" style="font-size:11px;flex:1;min-width:80px;">
                        ${this.categories.map(c => `
                            <option value="${c.id}" ${c.id === event.category ? 'selected' : ''}>${c.label}</option>
                        `).join('')}
                    </select>
                    
                    <select id="event-repeat-select" class="haldo-input" style="font-size:11px;flex:1;min-width:80px;">
                        <option value="none" ${event.repeat === 'none' ? 'selected' : ''}>Keine Wiederholung</option>
                        <option value="daily" ${event.repeat === 'daily' ? 'selected' : ''}>Täglich</option>
                        <option value="weekly" ${event.repeat === 'weekly' ? 'selected' : ''}>Wöchentlich</option>
                        <option value="monthly" ${event.repeat === 'monthly' ? 'selected' : ''}>Monatlich</option>
                        <option value="yearly" ${event.repeat === 'yearly' ? 'selected' : ''}>Jährlich</option>
                    </select>
                </div>
                
                <div style="display:flex;gap:4px;align-items:center;">
                    <input id="event-reminder-input" type="checkbox" ${event.reminder ? 'checked' : ''}>
                    <label style="font-size:11px;color:var(--text-secondary);">Erinnerung</label>
                    <select id="event-reminder-time" class="haldo-input" style="font-size:10px;padding:2px 6px;width:100px;">
                        <option value="5">5 Min. vorher</option>
                        <option value="15" selected>15 Min. vorher</option>
                        <option value="30">30 Min. vorher</option>
                        <option value="60">1 Std. vorher</option>
                    </select>
                </div>
                
                <div style="display:flex;gap:4px;margin-top:4px;">
                    <button class="haldo-btn" style="font-size:11px;" onclick="CalendarApp.saveEvent()">💾 Speichern</button>
                    <button class="haldo-btn haldo-btn-secondary" style="font-size:11px;" onclick="CalendarApp.closeForm()">Abbrechen</button>
                    ${!isNew ? `<button class="haldo-btn" style="font-size:11px;background:var(--danger, #FF3B30);" onclick="CalendarApp.deleteEvent('${event.id}')">🗑️ Löschen</button>` : ''}
                </div>
            </div>
        `;
        
        // Formular anzeigen
        const container = this.window?.querySelector('.window-body');
        if (container) {
            const formArea = document.createElement('div');
            formArea.id = 'calendar-form-area';
            formArea.innerHTML = formHtml;
            
            // Vorheriges Formular entfernen
            const oldForm = document.getElementById('calendar-form-area');
            if (oldForm) oldForm.remove();
            
            // Vor Detail entfernen
            const detailArea = document.getElementById('calendar-detail-area');
            if (detailArea) detailArea.innerHTML = '';
            
            container.appendChild(formArea);
        }
    },
    
    // ---- EVENT SPEICHERN ----
    saveEvent() {
        const title = document.getElementById('event-title-input')?.value?.trim();
        if (!title) {
            alert('⚠️ Bitte einen Titel eingeben.');
            return;
        }
        
        const event = this.editingEvent || {};
        event.title = title;
        event.date = document.getElementById('event-date-input')?.value || event.date;
        event.time = document.getElementById('event-time-input')?.value || '';
        event.description = document.getElementById('event-desc-input')?.value || '';
        event.category = document.getElementById('event-category-select')?.value || 'personal';
        event.repeat = document.getElementById('event-repeat-select')?.value || 'none';
        event.reminder = document.getElementById('event-reminder-input')?.checked ? 
            parseInt(document.getElementById('event-reminder-time')?.value || 15) : null;
        event.updatedAt = Date.now();
        
        if (!event.id) {
            // Neuer Termin
            event.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
            event.createdAt = Date.now();
            this.events.push(event);
        } else {
            // Bestehenden Termin aktualisieren
            const index = this.events.findIndex(e => e.id === event.id);
            if (index !== -1) {
                this.events[index] = event;
            }
        }
        
        this.saveEvents();
        this.editingEvent = null;
        this.selectedEvent = event;
        this.updateView();
        
        EventBus.emit('calendar:event-saved', { eventId: event.id });
        this.closeForm();
        this.showEventDetail(event);
    },
    
    closeForm() {
        const formArea = document.getElementById('calendar-form-area');
        if (formArea) formArea.remove();
        this.editingEvent = null;
    },
    
    // ---- EVENT BEARBEITEN ----
    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;
        this.editingEvent = { ...event };
        this.showEventForm(this.editingEvent);
    },
    
    // ---- EVENT LÖSCHEN ----
    deleteEvent(eventId) {
        if (!confirm('Termin wirklich löschen?')) return;
        
        this.events = this.events.filter(e => e.id !== eventId);
        this.saveEvents();
        this.selectedEvent = null;
        this.editingEvent = null;
        this.updateView();
        
        const detailArea = document.getElementById('calendar-detail-area');
        if (detailArea) detailArea.innerHTML = '';
        
        EventBus.emit('calendar:event-deleted', { eventId });
    },
    
    // ---- TAG AUSWÄHLEN ----
    selectDay(day) {
        const date = new Date(this.currentDate);
        date.setDate(day);
        this.selectedDate = date;
        this.updateView();
    },
    
    selectDate(date) {
        this.selectedDate = new Date(date);
        this.updateView();
    },
    
    // ---- NAVIGATION ----
    navigateMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.selectedDate = null;
        this.updateView();
    },
    
    navigateWeek(delta) {
        this.currentDate.setDate(this.currentDate.getDate() + delta * 7);
        this.selectedDate = null;
        this.updateView();
    },
    
    navigateDay(delta) {
        this.currentDate.setDate(this.currentDate.getDate() + delta);
        this.selectedDate = this.currentDate;
        this.updateView();
    },
    
    // ---- VIEW WECHSELN ----
    setView(view) {
        this.view = view;
        this.updateView();
    },
    
    // ---- VIEW AKTUALISIEREN ----
    updateView() {
        const container = this.window?.querySelector('.window-body');
        if (container) {
            // Formular und Detail entfernen
            const formArea = document.getElementById('calendar-form-area');
            if (formArea) formArea.remove();
            const detailArea = document.getElementById('calendar-detail-area');
            if (detailArea) detailArea.remove();
            
            container.innerHTML = this.render();
            this.attachEvents();
        }
    },
    
    // ---- EVENT BINDING ----
    attachEvents() {
        // Keine zusätzlichen Events nötig
    },
    
    // ---- HELPER ----
    getCategoryLabel(categoryId) {
        const cat = this.categories.find(c => c.id === categoryId);
        return cat ? cat.label : '📌 Sonstiges';
    },
    
    getCategoryColor(categoryId) {
        const cat = this.categories.find(c => c.id === categoryId);
        return cat ? cat.color : '#888888';
    },
    
    getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    },
    
    // ---- INSTALLATION ----
    install() {
        console.log('📅 Calendar App wird installiert...');
        const existing = Storage.get('calendar_events', []);
        if (existing.length === 0) {
            const today = new Date();
            const sampleEvents = [
                {
                    id: 'sample1',
                    title: 'HalDo AI OS Launch',
                    description: 'Offizieller Launch von HalDo AI OS 24.6.0',
                    date: today.toISOString().split('T')[0],
                    time: '10:00',
                    category: 'work',
                    repeat: 'none',
                    reminder: 30,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },
                {
                    id: 'sample2',
                    title: 'Team Meeting',
                    description: 'Wöchentliches Team-Meeting',
                    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split('T')[0],
                    time: '14:00',
                    category: 'work',
                    repeat: 'weekly',
                    reminder: 15,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }
            ];
            Storage.set('calendar_events', sampleEvents);
        }
        return true;
    },
    
    uninstall() {
        console.log('🗑️ Calendar App wird deinstalliert...');
        return true;
    },
    
    // ---- VERSION ----
    getVersion() {
        return this.version;
    }
};

// ---- APP REGISTRIEREN ----
CalendarApp.register();

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.CalendarApp = CalendarApp;

console.log('📅 Calendar App geladen – HalDo AI OS 24.6.0');
