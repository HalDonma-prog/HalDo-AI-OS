/**
 * HALDO AI OS 24.6.0 – UPDATE CENTER (KURZVERSION)
 */
const UpdateCenter = {
    currentVersion: Kernel.version || '24.6.0',
    isOpen: false,
    window: null,

    register() {
        AppRegistry.register({
            id: 'update-center',
            name: 'Update Center',
            icon: '🔄',
            category: 'system',
            version: '1.0.0',
            author: 'HalDo Team',
            description: 'System-Updates und Versionierung',
            open: (params) => this.open(params),
            close: () => this.close()
        });
        return this;
    },

    open(params = {}) {
        if (this.isOpen && this.window) { WindowManager.bringToFront(this.window); return this.window; }
        this.isOpen = true;
        const content = this.render();
        this.window = WindowManager.openWindow('update-center', 'Update Center', content, '🔄', params.width || 520,
            params.height || 400);
        if (this.window) this.attachEvents();
        EventBus.emit('app:opened', { appId: 'update-center' });
        return this.window;
    },

    close() {
        if (this.window) { WindowManager.closeWindow(this.window);
            this.isOpen = false;
            this.window = null; }
        EventBus.emit('app:closed', { appId: 'update-center' });
        return this;
    },

    render() {
        const updates = [
            { version: '24.7.0', type: 'major', date: '2024-07-01', changes: ['Music Studio Pro (v2.0.0)',
                    'Video Studio Pro (v2.0.0)', 'AI Video Generator Pro (v2.0.0)'] },
            { version: '24.6.1', type: 'minor', date: '2024-06-15', changes: ['Bugfix: Fenster-Manager Stabilität',
                    'Bugfix: AI Memory Speicherung', 'Neue Sprachen: Russisch, Italienisch'] }
        ];
        return `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;padding:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="font-size:14px;font-weight:700;color:var(--text-primary);">🔄 Update Center</div>
                    <span style="font-size:11px;color:var(--text-muted);">v${this.currentVersion}</span>
                </div>
                <div style="padding:8px;background:var(--glass-bg);border-radius:8px;border:1px solid var(--glass-border);">
                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);">✅ System ist aktuell</div>
                    <div style="font-size:10px;color:var(--text-secondary);">Version ${this.currentVersion}</div>
                </div>
                <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-top:4px;">📝 Changelog</div>
                ${updates.map(u => `
                    <div style="padding:6px 10px;background:var(--glass-bg);border-radius:6px;border:1px solid var(--glass-border);">
                        <div style="display:flex;justify-content:space-between;font-size:11px;">
                            <span style="font-weight:600;color:var(--text-primary);">v${u.version}</span>
                            <span style="color:var(--text-muted);">${u.date}</span>
                            <span style="color:${u.type === 'major' ? 'var(--gold)' : 'var(--text-muted)'};">${u.type}</span>
                        </div>
                        <div style="font-size:9px;color:var(--text-secondary);">${u.changes.map(c => `• ${c}`).join(' ')}</div>
                    </div>
                `).join('')}
                <button class="haldo-btn" style="font-size:11px;margin-top:4px;" onclick="alert('🔄 Nach Updates suchen...')">🔍 Nach Updates suchen</button>
            </div>
        `;
    },

    attachEvents() {
        if (this.window) {
            this.window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
        }
    }
};
window.UpdateCenter = UpdateCenter;
