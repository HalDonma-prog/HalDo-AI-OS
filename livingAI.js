/**
 * HALDO AI OS 24.6.0 – LIVING AI ENGINE (V2.0.0)
 * Lebendiger Avatar mit Gesicht, Körper, Emotionen und Sprach-Integration
 */

const LivingAI = {
    // ---- KONFIGURATION ----
    width: 300,
    height: 400,
    isReady: false,
    isVisible: false,
    container: null,
    canvas: null,
    ctx: null,

    // ---- ZUSTAND ----
    emotion: 'idle', // idle | waking | listening | thinking | speaking | happy | concerned | excited | sleeping
    isSpeaking: false,
    isListening: false,
    isThinking: false,
    eyeState: 'open',
    handWave: 0,
    breathPhase: 0,
    blinkTimer: 0,
    headAngle: { x: 0, y: 0 },
    bodyAngle: 0,

    // ---- EMOTIONEN (PROFESSIONELL) ----
    emotions: {
        idle: {
            label: '💙 Bereit',
            eyeWidth: 1.0,
            eyeHeight: 1.0,
            mouthType: 'neutral',
            browY: 0,
            blush: 0.05,
            hand: 'rest',
            headTilt: 0,
            lightIntensity: 1.0
        },
        waking: {
            label: '☀️ Erwache',
            eyeWidth: 1.1,
            eyeHeight: 1.1,
            mouthType: 'neutral',
            browY: -2,
            blush: 0.1,
            hand: 'rest',
            headTilt: 2,
            lightIntensity: 1.5
        },
        listening: {
            label: '🎧 Zuhörend',
            eyeWidth: 1.0,
            eyeHeight: 1.0,
            mouthType: 'listening',
            browY: 2,
            blush: 0.05,
            hand: 'ear',
            headTilt: -3,
            lightIntensity: 1.2
        },
        thinking: {
            label: '🧠 Denkend',
            eyeWidth: 0.85,
            eyeHeight: 0.85,
            mouthType: 'thinking',
            browY: -6,
            blush: 0,
            hand: 'chin',
            headTilt: 5,
            lightIntensity: 0.8
        },
        speaking: {
            label: '🗣️ Sprechend',
            eyeWidth: 0.95,
            eyeHeight: 0.95,
            mouthType: 'speaking',
            browY: 0,
            blush: 0.1,
            hand: 'gesture',
            headTilt: 0,
            lightIntensity: 1.3
        },
        happy: {
            label: '😊 Glücklich',
            eyeWidth: 0.9,
            eyeHeight: 0.85,
            mouthType: 'smile',
            browY: -4,
            blush: 0.2,
            hand: 'wave',
            headTilt: -2,
            lightIntensity: 1.6
        },
        concerned: {
            label: '🧐 Besorgt',
            eyeWidth: 0.9,
            eyeHeight: 0.9,
            mouthType: 'concerned',
            browY: 4,
            blush: 0,
            hand: 'rest',
            headTilt: 3,
            lightIntensity: 0.9
        },
        excited: {
            label: '⚡ Aufgeregt',
            eyeWidth: 1.2,
            eyeHeight: 1.2,
            mouthType: 'excited',
            browY: -6,
            blush: 0.15,
            hand: 'wave',
            headTilt: -4,
            lightIntensity: 2.0
        },
        sleeping: {
            label: '🌙 Ruhend',
            eyeWidth: 0.5,
            eyeHeight: 0.1,
            mouthType: 'neutral',
            browY: 0,
            blush: 0,
            hand: 'rest',
            headTilt: 8,
            lightIntensity: 0.3
        }
    },

    // ---- INITIALISIERUNG ----
    init(containerId = 'living-ai-container') {
        console.log('👤 Living AI wird initialisiert (v2.0.0)...');

        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn('⚠️ Living AI Container nicht gefunden – erstelle...');
            this.container = document.createElement('div');
            this.container.id = containerId;
            this.container.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                pointer-events: none;
            `;
            // In die Cosmic World einfügen
            const cosmicContainer = document.getElementById('cosmic-canvas-container');
            if (cosmicContainer) {
                cosmicContainer.style.position = 'relative';
                cosmicContainer.appendChild(this.container);
            } else {
                document.body.appendChild(this.container);
            }
        }

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.cssText = `
            width: 100%;
            height: 100%;
            max-width: ${this.width}px;
            max-height: ${this.height}px;
            border-radius: 50%;
            pointer-events: none;
            mix-blend-mode: screen;
        `;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Event-Listener für AI-Status
        this.setupEventListeners();

        // Animation starten
        this.isReady = true;
        this.isVisible = true;
        this.animate();

        EventBus.emit('living-ai:ready', { version: '2.0.0' });
        console.log('✅ Living AI v2.0.0 ready!');
        return this;
    },

    // ---- EVENT LISTENER ----
    setupEventListeners() {
        // AI Core Events
        EventBus.on('ai:processing', (processing) => {
            this.isThinking = processing;
            this.emotion = processing ? 'thinking' : 'idle';
        });

        EventBus.on('ai:response', (data) => {
            if (data && data.content) {
                this.speak(data.content);
                this.emotion = 'happy';
                setTimeout(() => {
                    if (!this.isSpeaking && !this.isThinking) {
                        this.emotion = 'idle';
                    }
                }, 2000);
            }
        });

        EventBus.on('voice:speaking', (speaking) => {
            this.isSpeaking = speaking;
            this.emotion = speaking ? 'speaking' : 'idle';
        });

        EventBus.on('voice:listening', (listening) => {
            this.isListening = listening;
            this.emotion = listening ? 'listening' : 'idle';
        });

        EventBus.on('voice:final', (data) => {
            if (data && data.text) {
                this.emotion = 'thinking';
                setTimeout(() => {
                    if (!this.isSpeaking && !this.isThinking) {
                        this.emotion = 'idle';
                    }
                }, 1000);
            }
        });

        EventBus.on('system:ready', () => {
            this.wakeUp();
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

        // Kopf leicht bewegen
        this.headAngle.x = Math.sin(this.breathPhase * 0.5) * 2;
        this.headAngle.y = Math.sin(this.breathPhase * 0.3) * 1.5;

        this.draw();
    },

    // ---- ZEICHNEN (PROFESSIONELL) ----
    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.clearRect(0, 0, w, h);

        // ---- LICHTKREIS (Hintergrund) ----
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 180);
        const emotionData = this.emotions[this.emotion] || this.emotions.idle;
        const intensity = emotionData.lightIntensity || 1.0;

        grad.addColorStop(0, `rgba(108, 60, 225, ${0.2 * intensity})`);
        grad.addColorStop(0.3, `rgba(0, 212, 255, ${0.1 * intensity})`);
        grad.addColorStop(0.7, 'rgba(10, 10, 30, 0.3)');
        grad.addColorStop(1, 'rgba(5, 5, 15, 0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // ---- KÖRPER (SCHULTERN) ----
        const bodyY = h * 0.75;
        const bodyW = w * 0.6;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;

        // Schultern
        ctx.beginPath();
        ctx.ellipse(w / 2 + Math.sin(this.bodyAngle) * 3, bodyY, bodyW / 2, 40, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#2a1a3a';
        ctx.fill();

        // Hals
        ctx.fillStyle = '#3a2a1a';
        ctx.shadowBlur = 10;
        ctx.fillRect(w / 2 - 15, h * 0.55, 30, 40);
        ctx.shadowBlur = 0;

        // ---- KOPF ----
        const headX = w / 2 + this.headAngle.x;
        const headY = h * 0.45 + this.headAngle.y;
        const headR = 70;

        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(headX, headY, headR, 0, Math.PI * 2);
        ctx.fillStyle = '#e8c9a0';
        ctx.fill();
        ctx.shadowBlur = 0;

        // ---- WANGEN (BLUSH) ----
        if (emotionData.blush > 0) {
            ctx.globalAlpha = emotionData.blush;
            ctx.fillStyle = '#ff6b8a';
            ctx.beginPath();
            ctx.arc(headX - 45, headY + 15, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(headX + 45, headY + 15, 18, 0, Math.PI * 2);
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
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0,0,0,0.1)';

        ctx.beginPath();
        ctx.ellipse(headX - eyeSpacing, eyeY, eyeR * eyeW, isClosed ? 2 : eyeR * eyeH, 0, 0, Math.PI * 2);
        ctx.fill();

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
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
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

            ctx.beginPath();
            ctx.moveTo(headX - eyeSpacing - 12, browYBase + browYOffset);
            ctx.quadraticCurveTo(headX - eyeSpacing, browYBase - 6 + browYOffset * 0.5, headX - eyeSpacing + 12, browYBase +
                2 + browYOffset * 0.3);
            ctx.stroke();

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
                ctx.strokeStyle = '#cc4466';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(mouthX, mouthY + 6, mouthW / 3, 0.1, Math.PI - 0.1);
                ctx.stroke();
                break;
            case 'concerned':
                ctx.strokeStyle = '#cc4466';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(mouthX, mouthY + 10, mouthW / 2.5, 0.2, Math.PI - 0.2);
                ctx.stroke();
                break;
            case 'excited':
                ctx.fillStyle = '#aa3355';
                ctx.beginPath();
                ctx.ellipse(mouthX, mouthY + 2, mouthW / 2, mouthH * 0.9, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#552233';
                ctx.beginPath();
                ctx.ellipse(mouthX, mouthY + 2, mouthW / 3, mouthH * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'listening':
                ctx.fillStyle = '#aa3355';
                ctx.beginPath();
                ctx.ellipse(mouthX, mouthY + 2, mouthW / 2.8, mouthH / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            default:
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
                ctx.font = '28px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#e8c9a0';
                ctx.fillText('✋', headX + 55, headY + 50);
                break;
            case 'ear':
                ctx.font = '28px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#e8c9a0';
                ctx.fillText('✋', headX + 65, headY - 10);
                break;
            case 'gesture':
                const gestureY = headY + 20 + Math.sin(Date.now() * 0.004) * 10;
                ctx.font = '28px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#e8c9a0';
                ctx.fillText('✋', headX + 70, gestureY);
                break;
        }

        // ---- STATUS-ANZEIGE ----
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

        // ---- EMOTION-LABEL ----
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(emotionData.label || 'Idle', w / 2, h - 8);

        // ---- NAMENS-TAG ----
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('💙 HalDo AI', 10, h - 8);
    },

    // ---- SPRECHEN ----
    speak(text) {
        this.isSpeaking = true;
        this.emotion = 'speaking';

        const duration = Math.min(text.length * 20, 3000);
        setTimeout(() => {
            this.isSpeaking = false;
            if (!this.isThinking && !this.isListening) {
                this.emotion = 'idle';
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
        EventBus.emit('living-ai:wave');
    },

    // ---- ERWACHEN ----
    wakeUp() {
        this.emotion = 'waking';
        setTimeout(() => {
            this.emotion = 'idle';
            EventBus.emit('living-ai:awake');
        }, 2000);
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

    // ---- ZERSTÖREN ----
    destroy() {
        this.isReady = false;
        this.isVisible = false;
        if (this.container) {
            this.container.innerHTML = '';
        }
        EventBus.emit('living-ai:destroyed');
        console.log('👤 Living AI zerstört');
    }
};

// ---- GLOBAL VERFÜGBAR MACHEN ----
window.LivingAI = LivingAI;

console.log('👤 Living AI Engine v2.0.0 geladen');
