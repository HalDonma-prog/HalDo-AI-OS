/**
 * HALDO AI OS 24.6 – CALENDAR APP
 */

const CalendarApp = {
    id: 'calendar',
    name: 'Kalender',
    icon: '📅',
    currentDate: new Date(),
    
    open(params = {}) {
        console.log('📅 Kalender wird geöffnet...');
        const content = this.render();
        WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 500,
            params.height || 450
        );
    },
    
    render() {
        const now = this.currentDate;
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date().getDate();
        const todayMonth = new Date().getMonth();
        const todayYear = new Date().getFullYear();
        
        const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
        const dayNames = ['Mo','Di','Mi','Do','Fr','Sa','So'];
        
        // Korrigiere firstDay (0 = Sonntag → 0 = Montag)
        let firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
        
        let daysHtml = '';
        for (let i = 0; i < 42; i++) {
            const day = i - firstDayIndex + 1;
            const isToday = day === today && month === todayMonth && year === todayYear;
            const isCurrentMonth = day > 0 && day <= daysInMonth;
            
            daysHtml += `
                <div style="
                    text-align:center;
                    padding:8px;
                    border-radius:8px;
                    ${isToday ? 'background:var(--primary);color:white;' : ''}
                    ${!isCurrentMonth ? 'color:var(--text-muted);' : ''}
                    transition:all var(--transition-fast);
                ">
                    ${isCurrentMonth ? day : ''}
                </div>
            `;
        }
        
        return `
            <div style="padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <button onclick="CalendarApp.prevMonth()" style="
                        padding:6px 14px;
                        background:var(--glass-bg);
                        border:1px solid var(--glass-border);
                        border-radius:6px;
                        color:var(--text-secondary);
                        cursor:pointer;
                    ">◀</button>
                    <h2 style="font-size:18px;font-weight:600;">${monthNames[month]} ${year}</h2>
                    <button onclick="CalendarApp.nextMonth()" style="
                        padding:6px 14px;
                        background:var(--glass-bg);
                        border:1px solid var(--glass-border);
                        border-radius:6px;
                        color:var(--text-secondary);
                        cursor:pointer;
                    ">▶</button>
                </div>
                <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px;">
                    ${dayNames.map(d => `<div style="text-align:center;color:var(--text-muted);font-size:12px;padding:4px;">${d}</div>`).join('')}
                </div>
                <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">
                    ${daysHtml}
                </div>
            </div>
        `;
    },
    
    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.updateWindow();
    },
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.updateWindow();
    },
    
    updateWindow() {
        const windows = WindowManager?.windows || [];
        const calWindow = windows.find(w => w.appId === 'calendar');
        if (calWindow) {
            const body = calWindow.element.querySelector('.window-body');
            if (body) {
                body.innerHTML = this.render();
            }
        }
    }
};

// Registrieren
if (typeof AppRegistry !== 'undefined') {
    AppRegistry.register({
        id: 'calendar',
        name: 'Kalender',
        icon: '📅',
        category: 'Tools',
        description: 'Monatskalender',
        open: (params) => CalendarApp.open(params)
    });
}

window.CalendarApp = CalendarApp;
