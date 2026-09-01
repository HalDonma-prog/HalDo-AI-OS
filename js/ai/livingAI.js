/**
 * HALDO AI OS 24.6.0 – LIVING AI
 * Lebendiger Avatar mit Gesicht, Emotionen, Händen und Interaktion
 * Version: 1.0.0
 */

const LivingAI = {
    // ---- KONFIGURATION ----
    width: 300,
    height: 350,
    isReady: false,
    isVisible: false,
    
    // ---- ZUSTAND ----
    emotion: 'neutral', // neutral | happy | thinking | speaking | listening | sad | surprised
    isSpeaking: false,
    isThinking: false,
    isListening: false,
    eyeState: 'open', // open | closed | winking
    handWave: 0,
    breathPhase: 0,
    blinkTimer: 0,
    
    // ---- DOM ----
    canvas: null,
    ctx: null,
    container: null,
    
    // ---- EMOTIONEN ----
    emotions: {
        neutral: {
            label: '😐 Neutral',
            eyeWidth: 1.0,
            eyeHeight: 1.0,
            mouthType: 'neutral',
            browY: 0,
            blush: 0,
            hand: 'rest'
        },
        happy: {
            label: '😊 Glücklich',
            eyeWidth: 0.9,
            eyeHeight: 0.9,
            mouthType: 'smile',
            browY: -2,
            blush: 0.15,
            hand: 'wave'
        },
        thinking: {
            label: '🤔 Denkend',
            eyeWidth: 0.8,
            eyeHeight: 0.8,
            mouthType: 'thinking',
            browY: -6,
            blush: 0,
            hand: 'chin'
        },
        speaking: {
            label: '🗣️ Sprechend',
            eyeWidth: 0.95,
            eyeHeight: 0.95,
            mouthType: 'speaking',
            browY: 0,
            blush: 0.1,
            hand: 'gesture'
        },
        listening: {
            label: '🎧 Zuhörend',
            eyeWidth: 1.0,
            eyeHeight: 1.0,
            mouthType: 'listening',
            browY: 2,
            blush: 0.05,
            hand: 'ear'
        },
        sad: {
            label: '😢 Traurig',
            eyeWidth: 0.8,
            eyeHeight: 0.7,
            mouthType: 'sad',
            browY: 4,
            blush: 0,
            hand: 'rest'
        },
        surprised: {
            label: '😮 Überrascht',
            eyeWidth: 1.3,
            eyeHeight: 1.3,
            mouthType: 'surprised',
            browY: -4,
            blush: 0.1,
            hand: 'cheek'
        }
    },
    
    // ---- INITIALISIERUNG ----
    init(containerId = 'living-ai-container') {
        console.log('👤 Living AI wird initialisiert...');
        
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn('⚠️ Living AI Container nicht gefunden – erstelle...');
            this.container = document.createElement('div');
            this.container.id = containerId;
            this.container.style.cssText = `
                width: 100%;
                height: 100%;
                min-height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: radial-gradient(ellipse at center, rgba(10,10,30,0.8), rgba(0,0,0,0.9));
                border-radius: var(--radius, 10px);
            `;
            // Container in den aktuellen Fenster-Body einfügen
            const body = document.querySelector('.window-body');
            if (body) {
                body.appendChild(this.container);
            } else {
                document.body.appendChild(this.container);
            }
        }
        
        // Canvas erstellen
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.cssText = `
            width: 100%;
            height: 100%;
            max-width: ${this.width}px;
            max-height: ${this.height}px;
            border-radius: var(--radius, 10px);
        `;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Event-Listener
        this.setupEventListeners();
        
        // Animation starten
        this.animate();
        this.isReady = true;
        this.isVisible = true;
        
        EventBus.emit('living-ai:ready', { 
            width: this.width, 
            height: this.height,
            emotion: this.emotion 
        });
        
        console.log('✅ Living AI ready!');
        return this;
    },
    
    // ---- EVENT LISTENER ----
    setupEventListeners() {
        // AI Events
        EventBus.on('ai:processing', (data) => {
            this.isThinking = data === true;
            this.emotion = this.isThinking ? 'thinking' : 'neutral';
            if (this.isThinking) {
                this.speak('...');
            }
        });
        
        EventBus.on('ai:response', (data) => {
            if (data && data.content) {
                this.speak(data.content);
                this.emotion = 'happy';
                setTimeout(() => {
                    if (!this.isSpeaking) {
                        this.emotion = 'neutral';
                    }
                }, 1000);
            }
        });
        
        EventBus.on('voice:speaking', (speaking) => {
            this.isSpeaking = speaking;
            if (speaking) {
                this.emotion = 'speaking';
            } else if (!this.isThinking) {
                this.emotion = 'neutral';
            }
        });
        
        EventBus.on('voice:listening', (listening) => {
            this.isListening = listening;
            this.emotion = listening ? 'listening' : this.isThinking ? 'thinking' : 'neutral';
        });
        
        EventBus.on('ai:error', () => {
            this.emotion = 'sad';
            setTimeout(() => {
                if (!this.isSpeaking && !this.isThinking) {
                    this.emotion = 'neutral';
                }
            }, 2000);
        });
        
        // Klick auf Avatar
        this.container.addEventListener('click', () => {
            this.wave();
            EventBus.emit('living-ai:clicked', { emotion: this.emotion });
        });
    },
    
    // ---- ANIMATION ----
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Atmung
        this.breathPhase += 0.02;
        
        // Blinzeln
        this.blinkTimer += 0.01;
        if (this.blinkTimer > 3 + Math.random() * 2) {
            this.eyeState = 'closed';
            setTimeout(() => {
                this.eyeState = 'open';
                this.blinkTimer = 0;
            }, 150);
        }
        
        // Hand-Welle automatisch bei happy
        if (this.emotion === 'happy' && Math.random() < 0.01) {
            this.handWave = 2;
            setTimeout(() => {
                this.handWave = Math.max(0, this.handWave - 1);
            }, 500);
        }
        
        this.draw();
    },
    
    // ---- ZEICHNEN ----
    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        
        // Canvas leeren
        ctx.clearRect(0, 0, w, h);
        
        // Hintergrund
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 180);
        grad.addColorStop(0, 'rgba(20, 10, 40, 0.7)');
        grad.addColorStop(1, 'rgba(5, 5, 15, 0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        
        // Schatten
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;
        
        // Hals
        const neckX = w / 2;
        const neckY = h - 30;
        ctx.fillStyle = '#3a2a1a';
        ctx.shadowBlur = 5;
        ctx.fillRect(neckX - 20, neckY, 40, 30);
        ctx.shadowBlur = 0;
        
        // Kopf
        const headX = w / 2;
        const headY = h / 2 - 10;
        const headR = 70;
        
        // Kopf-Basis
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(headX, headY, headR, 0, Math.PI * 2);
        ctx.fillStyle = '#e8c9a0';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Wangen (bei happy)
        const emotionData = this.emotions[this.emotion] || this.emotions.neutral;
        if (emotionData.blush > 0) {
            ctx.globalAlpha = emotionData.blush;
            ctx.fillStyle = '#ff6b8a';
            ctx.beginPath();
            ctx.arc(headX - 42, headY + 15, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(headX + 42, headY + 15, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // ---- AUGEN ----
        const eyeY = headY - 10;
        const eyeSpacing = 28;
        const eyeR = 14;
        const eyeW = emotionData.eyeWidth || 1;
        const eyeH = emotionData.eyeHeight || 1;
        const isClosed = this.eyeState === 'closed';
        
        // Weiß
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 3;
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        
        // Linkes Auge
        ctx.beginPath();
        ctx.ellipse(headX - eyeSpacing, eyeY, eyeR * eyeW, isClosed ? 2 : eyeR * eyeH, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Rechtes Auge
        ctx.beginPath();
        ctx.ellipse(headX + eyeSpacing, eyeY, eyeR * eyeW, isClosed ? 2 : eyeR * eyeH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        if (!isClosed) {
            // Pupillen
            ctx.fillStyle = '#2a1a0a';
            const pupilSize = 5;
            ctx.beginPath();
            ctx.arc(headX - eyeSpacing + 3, eyeY + 1, pupilSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(headX + eyeSpacing + 3, eyeY + 1, pupilSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Glanz
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath();
            ctx.arc(headX - eyeSpacing + 5, eyeY - 4, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(headX + eyeSpacing + 5, eyeY - 4, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Augenbrauen
            ctx.strokeStyle = '#3a2a1a';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            const browYOffset = emotionData.browY || 0;
            const browYBase = eyeY - 22;
            
            // Linke Augenbraue
            ctx.beginPath();
            ctx.moveTo(headX - eyeSpacing - 12, browYBase + browYOffset);
            ctx.quadraticCurveTo(headX - eyeSpacing, browYBase - 6 + browYOffset * 0.5, headX - eyeSpacing + 12, browYBase +
                2 + browYOffset * 0.3);
            ctx.stroke();
            
            // Rechte Augenbraue
            ctx.beginPath();
            ctx.moveTo(headX + eyeSpacing - 12, browYBase + 2 + browYOffset * 0.3);
            ctx.quadraticCurveTo(headX + eyeSpacing, browYBase - 6 + browYOffset * 0.5, headX + eyeSpacing + 12, browYBase +
                browYOffset);
            ctx.stroke();
        }
        
        // ---- NASE ----
        ctx.strokeStyle = '#c4a080';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(headX, headY + 6);
        ctx.quadraticCurveTo(headX + 8, headY + 16, headX, headY + 22);
        ctx.quadraticCurveTo(headX - 8, headY + 16, headX, headY + 6);
        ctx.stroke();
        
        // Nasenflügel
        ctx.fillStyle = '#c4a080';
        ctx.beginPath();
        ctx.arc(headX - 6, headY + 14, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headX + 6, headY + 14, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // ---- MUND ----
        const mouthX = headX;
        const mouthY = headY + 42;
        const mouthW = 32;
        const mouthH = 12;
        const mouthType = emotionData.mouthType || 'neutral';
        
        ctx.shadowBlur = 0;
        
        switch (mouthType) {
            case 'speaking':
                // Sprechender Mund (animiert)
                const breath = Math.sin(this.breathPhase * 2) * 0.3 + 0.5;
                ctx.fillStyle = '#aa3355';
                ctx.beginPath();
                ctx.ellipse(mouthX, mouthY + 4, mouthW / 2 * (0.6 + breath * 0.4), mouthH / 2 * (0.4 + breath * 0.6), 0, 0,
                    Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#552233';
                ctx.beginPath();
                ctx.ellipse(mouthX, mouthY + 4, mouthW / 4 * (0.4 + breath * 0.4), mouthH / 3 * (0.2 + breath * 0.5), 0, 0,
                    Math.PI * 2);
                ctx.fill();
                break;
                
            case 'smile':
                // Lächeln
                ctx.strokeStyle = '#cc4466';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(mouthX, mouthY - 2, mouthW / 2, 0.1, Math.PI - 0.1);
                ctx.stroke();
                ctx.fillStyle = '#cc4466';
                ctx.beginPath();
                ctx.arc(mouthX, mouthY + 8, mouthW / 2.6, 0, Math.PI);
                ctx.fill();
                break;
                
            case 'thinking':
                // Nachdenklicher Mund
                ctx.strokeStyle = '#cc4466';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(mouthX, mouthY + 6, mouthW / 3, 0.1, Math.PI - 0.1);
                ctx.stroke();
                break;
                
            case 'sad':
                // Trauriger Mund
                ctx.strokeStyle = '#cc4466';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(mouthX, mouthY + 14, mouthW / 2, Math.PI + 0.2, Math.PI * 2 - 0.2);
                ctx.stroke();
                break;
                
            case 'surprised':
                // Überrascht (offen)
                ctx.fillStyle = '#552233';
                ctx.beginPath();
                ctx.ellipse(mouthX, mouthY + 2, mouthW / 2, mouthH * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#aa3355';
                ctx.beginPath();
                ctx.ellipse(mouthX, mouthY + 2, mouthW / 2.8, mouthH * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'listening':
                // Zuhörend (leicht geöffnet)
                ctx.fillStyle = '#aa3355';
                ctx.beginPath();
                ctx.ellipse(mouthX, mouthY + 2, mouthW / 2.8, mouthH / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            default:
                // Neutraler Mund
                ctx.fillStyle = '#cc4466';
                ctx.beginPath();
                ctx.ellipse(mouthX, mouthY + 2, mouthW / 2.4, mouthH / 2.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#aa3355';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(mouthX, mouthY + 2, mouthW / 3.4, mouthH / 3.5, 0, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
        
        // ---- HÄNDE ----
        const handType = emotionData.hand || 'rest';
        
        switch (handType) {
            case 'wave':
                if (this.handWave > 0) {
                    const waveX = headX + 80 + Math.sin(Date.now() * 0.008) * 8;
                    const waveY = headY - 30 + Math.sin(Date.now() * 0.012) * 6;
                    ctx.font = '32px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#e8c9a0';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(0,0,0,0.2)';
                    ctx.fillText('✋', waveX, waveY);
                    ctx.shadowBlur = 0;
                }
                break;
                
            case 'chin':
                // Hand am Kinn (denkend)
                ctx.font = '28px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#e8c9a0';
                ctx.fillText('✋', headX + 55, headY + 50);
                break;
                
            case 'cheek':
                // Hand an der Wange (überrascht)
                ctx.font = '28px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#e8c9a0';
                ctx.fillText('✋', headX + 50, headY + 30);
                break;
                
            case 'ear':
                // Hand am Ohr (zuhörend)
                ctx.font = '28px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#e8c9a0';
                ctx.fillText('✋', headX + 65, headY - 10);
                break;
                
            case 'gesture':
                // Sprechende Hand
                const gestureY = headY + 20 + Math.sin(Date.now() * 0.004) * 10;
                ctx.font = '28px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#e8c9a0';
                ctx.fillText('✋', headX + 70, gestureY);
                break;
        }
        
        // ---- STATUS ANZEIGE ----
        const status = this.isSpeaking ? '🔊' :
                      this.isThinking ? '🧠' :
                      this.isListening ? '🎧' : '●';
        ctx.fillStyle = this.isSpeaking ? '#00ff88' :
                       this.isThinking ? '#6666ff' :
                       this.isListening ? '#ffaa00' : '#00ff88';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'right';
        ctx.shadowBlur = 0;
        ctx.fillText(status, w - 10, 18);
        
        // ---- EMOTION LABEL ----
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(emotionData.label || 'Neutral', w / 2, h - 8);
        
        // ---- NAMENS-TAG ----
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('💙 HalDo', 10, h - 8);
    },
    
    // ---- SPRECHEN ----
    speak(text) {
        this.isSpeaking = true;
        this.emotion = 'speaking';
        
        // Mund-Animation für die Dauer des Textes
        const duration = Math.min(text.length * 20, 3000);
        setTimeout(() => {
            this.isSpeaking = false;
            if (!this.isThinking && !this.isListening) {
                this.emotion = 'neutral';
            }
        }, duration);
        
        EventBus.emit('living-ai:speaking', { text, duration });
    },
    
    // ---- WELLE ----
    wave() {
        this.handWave = 2;
        setTimeout(() => {
            this.handWave = Math.max(0, this.handWave - 1);
        }, 500);
        EventBus.emit('living-ai:wave', { timestamp: Date.now() });
    },
    
    // ---- EMOTION SETZEN ----
    setEmotion(emotion) {
        if (this.emotions[emotion]) {
            this.emotion = emotion;
            EventBus.emit('living-ai:emotion-changed', { emotion });
        }
    },
    
    // ---- SICHTBARKEIT ----
    show() {
        this.isVisible = true;
        this.container.style.display = 'flex';
        EventBus.emit('living-ai:shown');
    },
    
    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
        EventBus.emit('living-ai:hidden');
    },
    
    // ---- TOGGLE ----
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    },
    
    // ---- GRÖSSE ÄNDERN ----
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.maxWidth = width + 'px';
        this.canvas.style.maxHeight = height + 'px';
        EventBus.emit('living-ai:resized', { width, height });
    },
    
    // ---- ZERSTÖREN ----
    destroy() {
        this.isReady = false;
        this.isVisible = false;
        if (this.container) {
            this.container.innerHTML = '';
        }
        EventBus.emit('living-ai:destroyed', { timestamp: Date.now() });
        console.log('👤 Living AI zerstört');
    }
};

// ---- LIVING AI GLOBAL VERFÜGBAR MACHEN ----
window.LivingAI = LivingAI;

console.log('👤 Living AI geladen – HalDo AI OS 24.6.0');
