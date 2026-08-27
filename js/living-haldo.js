// js/living-haldo.js
// Living HalDo AI – Gesicht, Voice, Animationen

class LivingHalDo {
    constructor() {
        this.state = 'idle'; // idle, listening, thinking, speaking
        this.eyeX = 0;
        this.eyeY = 0;
        this.mouthOpen = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.breathPhase = 0;
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.speechSynth = window.speechSynthesis;
        this.recognition = null;
        this.isListening = false;
        this.onResult = null;
        
        this.init();
    }

    init() {
        // Container erstellen
        this.container = document.createElement('div');
        this.container.id = 'living-haldo-container';
        this.container.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 30px;
            width: 280px;
            height: 350px;
            z-index: 2000;
            pointer-events: auto;
            cursor: pointer;
            border-radius: 24px;
            background: radial-gradient(ellipse at 50% 80%, rgba(20,30,80,0.6), rgba(5,10,25,0.8));
            border: 1px solid rgba(100,150,255,0.2);
            box-shadow: 0 0 60px rgba(80,130,255,0.15);
            backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        `;
        
        // Canvas für das Gesicht
        this.canvas = document.createElement('canvas');
        this.canvas.width = 250;
        this.canvas.height = 280;
        this.canvas.style.cssText = `
            width: 250px;
            height: 280px;
            display: block;
        `;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Status-Text
        this.statusText = document.createElement('div');
        this.statusText.style.cssText = `
            color: rgba(255,255,255,0.5);
            font-size: 12px;
            margin-top: 4px;
            font-family: -apple-system, sans-serif;
            letter-spacing: 1px;
        `;
        this.statusText.textContent = '✦ IDLE';
        this.container.appendChild(this.statusText);
        
        // In Body einfügen
        document.body.appendChild(this.container);
        
        // Klick-Listener
        this.container.addEventListener('click', () => {
            this.toggleListen();
        });
        
        // Speech Recognition initialisieren
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'de-DE';
            this.recognition.onresult = (event) => {
                const result = event.results[event.results.length - 1];
                const text = result[0].transcript;
                if (result.isFinal) {
                    this.setState('thinking');
                    this.statusText.textContent = '✦ THINKING';
                    if (this.onResult) {
                        this.onResult(text);
                    }
                    setTimeout(() => {
                        this.setState('idle');
                        this.statusText.textContent = '✦ IDLE';
                    }, 2000);
                } else {
                    this.statusText.textContent = `✦ LISTENING: ${text}`;
                }
            };
            this.recognition.onerror = () => {
                this.isListening = false;
                this.setState('idle');
                this.statusText.textContent = '✦ IDLE';
            };
        } else {
            console.warn('Speech Recognition nicht unterstützt');
        }
        
        // Animation starten
        this.animate();
    }

    setState(state) {
        this.state = state;
        if (state === 'idle') {
            this.statusText.textContent = '✦ IDLE';
        } else if (state === 'listening') {
            this.statusText.textContent = '✦ LISTENING';
        } else if (state === 'thinking') {
            this.statusText.textContent = '✦ THINKING';
        } else if (state === 'speaking') {
            this.statusText.textContent = '✦ SPEAKING';
        }
    }

    toggleListen() {
        if (this.isListening) {
            this.recognition?.stop();
            this.isListening = false;
            this.setState('idle');
            this.statusText.textContent = '✦ IDLE';
        } else {
            try {
                this.recognition?.start();
                this.isListening = true;
                this.setState('listening');
                this.statusText.textContent = '✦ LISTENING...';
            } catch(e) {
                console.warn('Recognition start fehlgeschlagen');
            }
        }
    }

    speak(text) {
        if (!this.speechSynth) return;
        this.setState('speaking');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.onend = () => {
            this.setState('idle');
        };
        utterance.onerror = () => {
            this.setState('idle');
        };
        this.speechSynth.speak(utterance);
    }

    animate() {
        this.breathPhase += 0.03;
        const breath = Math.sin(this.breathPhase) * 0.015;
        
        // Blink-Timer
        this.blinkTimer += 0.01;
        if (this.blinkTimer > 4 + Math.random() * 2) {
            this.blinkTimer = 0;
            this.isBlinking = true;
            setTimeout(() => { this.isBlinking = false; }, 150);
        }
        
        // Augenbewegung
        if (this.state === 'idle') {
            this.eyeX = Math.sin(this.breathPhase * 0.5) * 0.08;
            this.eyeY = Math.cos(this.breathPhase * 0.7) * 0.05;
        } else if (this.state === 'listening') {
            this.eyeX = Math.sin(this.breathPhase * 0.8) * 0.15;
            this.eyeY = Math.cos(this.breathPhase * 0.6) * 0.1;
        } else if (this.state === 'thinking') {
            this.eyeX = Math.sin(this.breathPhase * 2) * 0.2;
            this.eyeY = Math.cos(this.breathPhase * 1.5) * 0.15;
        } else if (this.state === 'speaking') {
            this.mouthOpen = 0.3 + Math.sin(this.breathPhase * 4) * 0.25;
        }
        
        // Rendern
        this.render(breath);
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    render(breath) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);
        
        // Hintergrund-Glow
        const glow = ctx.createRadialGradient(w/2, h/2 - 20, 10, w/2, h/2 - 20, 150);
        glow.addColorStop(0, 'rgba(80,130,255,0.08)');
        glow.addColorStop(1, 'rgba(80,130,255,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
        
        // Kopf (Gesicht)
        const headY = 40 + breath * 10;
        const headW = 130;
        const headH = 160;
        const headX = w/2 - headW/2;
        
        // Gesichtsform (weich, menschlich)
        ctx.beginPath();
        ctx.ellipse(w/2, headY + headH/2, headW/2, headH/2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(60,50,80,0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(100,150,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Augen
        const eyeY = headY + 55;
        const eyeSpacing = 42;
        const eyeSize = 28;
        const eyeOffsetX = this.eyeX * 15;
        const eyeOffsetY = this.eyeY * 10;
        
        // Weiß der Augen
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.strokeStyle = 'rgba(100,150,255,0.2)';
        ctx.lineWidth = 1;
        
        // Linkes Auge
        const lx = w/2 - eyeSpacing/2 + eyeOffsetX;
        const ly = eyeY + eyeOffsetY;
        ctx.beginPath();
        ctx.ellipse(lx, ly, eyeSize/2, (this.isBlinking ? 2 : eyeSize/2), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Rechtes Auge
        const rx = w/2 + eyeSpacing/2 + eyeOffsetX;
        const ry = eyeY + eyeOffsetY;
        ctx.beginPath();
        ctx.ellipse(rx, ry, eyeSize/2, (this.isBlinking ? 2 : eyeSize/2), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Pupillen (nur wenn nicht blinzelnd)
        if (!this.isBlinking) {
            // Linke Pupille
            ctx.beginPath();
            ctx.arc(lx + this.eyeX * 4, ly + this.eyeY * 3, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(80,180,255,0.6)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(lx + this.eyeX * 4 + 2, ly + this.eyeY * 3 - 2, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fill();
            
            // Rechte Pupille
            ctx.beginPath();
            ctx.arc(rx + this.eyeX * 4, ry + this.eyeY * 3, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(80,180,255,0.6)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(rx + this.eyeX * 4 + 2, ry + this.eyeY * 3 - 2, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fill();
        }
        
        // Augenbrauen
        ctx.strokeStyle = 'rgba(100,150,255,0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lx - 16, ly - 22 + this.eyeY * 3);
        ctx.quadraticCurveTo(lx, ly - 28 + this.eyeY * 3, lx + 16, ly - 22 + this.eyeY * 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rx - 16, ry - 22 + this.eyeY * 3);
        ctx.quadraticCurveTo(rx, ry - 28 + this.eyeY * 3, rx + 16, ry - 22 + this.eyeY * 3);
        ctx.stroke();
        
        // Mund
        const mouthY = headY + 105 + breath * 3;
        const mouthW = 36;
        const mouthH = this.state === 'speaking' ? 12 + this.mouthOpen * 10 : 6;
        
        ctx.fillStyle = 'rgba(100,130,200,0.15)';
        ctx.beginPath();
        if (this.state === 'speaking' && this.mouthOpen > 0.3) {
            // Offener Mund (Oval)
            ctx.ellipse(w/2, mouthY + 4, mouthW/2, mouthH/2 + 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(30,20,50,0.3)';
            ctx.beginPath();
            ctx.ellipse(w/2, mouthY + 4, mouthW/3, mouthH/3 + 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Geschlossener Mund (Linie)
            ctx.strokeStyle = 'rgba(100,150,255,0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w/2 - mouthW/2, mouthY);
            ctx.quadraticCurveTo(w/2, mouthY + 3 + this.eyeY * 2, w/2 + mouthW/2, mouthY);
            ctx.stroke();
        }
        
        // Wangen (leichter Glow)
        const grad = ctx.createRadialGradient(w/2 - 60, headY + 90, 5, w/2 - 60, headY + 90, 30);
        grad.addColorStop(0, 'rgba(80,130,255,0.04)');
        grad.addColorStop(1, 'rgba(80,130,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(w/2 - 60, headY + 90, 30, 0, Math.PI * 2);
        ctx.fill();
        
        const grad2 = ctx.createRadialGradient(w/2 + 60, headY + 90, 5, w/2 + 60, headY + 90, 30);
        grad2.addColorStop(0, 'rgba(80,130,255,0.04)');
        grad2.addColorStop(1, 'rgba(80,130,255,0)');
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(w/2 + 60, headY + 90, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // HalDo-Logo über dem Kopf (klein)
        ctx.font = '16px -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(100,150,255,0.2)';
        ctx.textAlign = 'center';
        ctx.fillText('✦ HalDo', w/2, headY - 10);
        
        // Denkblase bei "thinking"
        if (this.state === 'thinking') {
            const dots = '.'.repeat(Math.floor(Date.now() / 300) % 4);
            ctx.font = '20px -apple-system, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.textAlign = 'center';
            ctx.fillText('✦' + dots, w/2 + 90, headY + 20);
        }
        
        // Listening-Indikator
        if (this.state === 'listening') {
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(w/2, headY + headH + 20, 8 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(80,180,255,${0.1 * pulse})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(w/2, headY + headH + 20, 14 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(80,180,255,${0.05 * pulse})`;
            ctx.fill();
        }
    }

    // App-Steuerung
    openApp(appId) {
        if (window.HalDo && window.HalDo.registry) {
            window.HalDo.registry.openApp(appId);
            this.speak(`Öffne ${appId}`);
        }
    }

    closeAllWindows() {
        if (window.HalDo && window.HalDo.windowManager) {
            window.HalDo.windowManager.closeAll();
            this.speak('Alle Fenster geschlossen');
        }
    }

    // Shortcut für einfache Befehle
    processCommand(text) {
        const lower = text.toLowerCase();
        if (lower.includes('öffne chat') || lower.includes('chat öffnen')) {
            this.openApp('chat');
        } else if (lower.includes('öffne rechner') || lower.includes('rechner öffnen')) {
            this.openApp('calculator');
        } else if (lower.includes('öffne notizen') || lower.includes('notizen öffnen')) {
            this.openApp('notes');
        } else if (lower.includes('öffne kalender') || lower.includes('kalender öffnen')) {
            this.openApp('calendar');
        } else if (lower.includes('öffne browser') || lower.includes('browser öffnen')) {
            this.openApp('browser');
        } else if (lower.includes('schließe alle')) {
            this.closeAllWindows();
        } else if (lower.includes('hallo') || lower.includes('hi') || lower.includes('hey')) {
            this.speak('Hallo! Wie kann ich dir helfen?');
        } else if (lower.includes('wie geht es dir')) {
            this.speak('Mir geht es hervorragend, danke! Und dir?');
        } else if (lower.includes('danke')) {
            this.speak('Gerne doch!');
        } else if (lower.includes('wer bist du')) {
            this.speak('Ich bin HalDo, dein persönlicher KI-Assistent!');
        } else {
            this.speak(`Ich habe verstanden: ${text}. Leider kann ich das noch nicht automatisch ausführen.`);
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Global verfügbar machen
window.LivingHalDo = LivingHalDo;

// Automatisch starten
document.addEventListener('DOMContentLoaded', function() {
    // Kurze Verzögerung, damit andere Systeme laden können
    setTimeout(() => {
        const haldo = new LivingHalDo();
        window.HalDoLiving = haldo;
        console.log('✨ Living HalDo AI ist aktiv!');
        
        // Callback für Sprachbefehle
        haldo.onResult = (text) => {
            haldo.processCommand(text);
        };
    }, 1000);
});
