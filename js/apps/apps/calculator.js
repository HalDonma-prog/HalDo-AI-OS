/**
 * HALDO AI OS 24.6 – CALCULATOR APP
 */

const CalculatorApp = {
    id: 'calculator',
    name: 'Taschenrechner',
    icon: '🧮',
    display: '0',
    expression: '',
    
    open(params = {}) {
        console.log('🧮 Taschenrechner wird geöffnet...');
        const content = this.render();
        WindowManager.openWindow(
            this.id,
            this.name,
            content,
            this.icon,
            params.width || 320,
            params.height || 440
        );
    },
    
    render() {
        return `
            <div style="padding:16px;max-width:300px;margin:0 auto;">
                <div style="
                    padding:12px 16px;
                    background:rgba(0,0,0,0.2);
                    border-radius:8px;
                    margin-bottom:12px;
                    text-align:right;
                    min-height:50px;
                ">
                    <div style="font-size:14px;color:var(--text-muted);">${this.expression}</div>
                    <div id="calc-display" style="font-size:28px;font-weight:700;color:var(--text-primary);">${this.display}</div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
                    ${['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','⌫','='].map(b => `
                        <button onclick="CalculatorApp.input('${b}')" style="
                            padding:14px;
                            background:${['C','±','%','÷','×','−','+','='].includes(b) ? 'var(--primary)' : 'var(--glass-bg)'};
                            border:1px solid var(--glass-border);
                            border-radius:8px;
                            color:${['C','±','%','÷','×','−','+','='].includes(b) ? 'white' : 'var(--text-primary)'};
                            font-size:18px;
                            cursor:pointer;
                            font-family:var(--font-primary);
                            transition:all var(--transition-fast);
                        ">${b}</button>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    input(value) {
        const displayEl = document.getElementById('calc-display');
        if (!displayEl) return;
        
        let current = displayEl.textContent;
        
        switch(value) {
            case 'C':
                this.display = '0';
                this.expression = '';
                break;
            case '⌫':
                this.display = this.display.length > 1 ? this.display.slice(0, -1) : '0';
                break;
            case '±':
                this.display = this.display.startsWith('-') ? this.display.slice(1) : '-' + this.display;
                break;
            case '=':
                try {
                    const result = eval(this.expression + this.display);
                    this.expression = '';
                    this.display = String(result);
                } catch {
                    this.display = 'Error';
                }
                break;
            default:
                if ('0123456789.'.includes(value)) {
                    if (this.display === '0' && value !== '.') {
                        this.display = value;
                    } else if (value === '.' && this.display.includes('.')) {
                        break;
                    } else {
                        this.display += value;
                    }
                } else if ('+-×÷'.includes(value)) {
                    const op = value === '×' ? '*' : value === '÷' ? '/' : value;
                    this.expression += this.display + op;
                    this.display = '0';
                }
                break;
        }
        
        displayEl.textContent = this.display;
    }
};

// Registrieren
if (typeof AppRegistry !== 'undefined') {
    AppRegistry.register({
        id: 'calculator',
        name: 'Taschenrechner',
        icon: '🧮',
        category: 'Tools',
        description: 'Einfacher Taschenrechner',
        open: (params) => CalculatorApp.open(params)
    });
}

window.CalculatorApp = CalculatorApp;
