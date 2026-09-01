/**
 * HALDO AI OS 24.6 – LIVING AI
 * Avatar mit Gesicht, Emotionen, Animationen
 */

const LivingAI = {
    avatar: null,
    currentEmotion: 'neutral',
    isSpeaking: false,
    isListening: false,
    isThinking: false,

    // Canvas-Komponenten
    canvas: null,
    ctx: null,
    width: 300,
    height: 400,

    // Gesichts-Komponenten
    face: {
        head: { x: 150, y: 180, radius: 80 },
        eyeLeft: { x: 120, y: 160, radius: 12 },
        eyeRight: { x: 180, y: 160, radius: 12 },
        pupilLeft: { x: 0, y: 0, radius: 5 },
        pupilRight: { x: 0, y: 0, radius: 5 },
        eyebrowLeft: { x1: 105, y1: 140, x2: 135, y2: 135 },
        eyebrowRight: { x1: 165, y1: 135, x2: 195, y2: 140 },
        mouth: { x: 150, y: 210, width: 40, height: 12, type: 'neutral' },
        nose: { x: 150, y: 185, size: 8 },
        blushLeft: { x: 100, y: 195, radius: 15 },
        blushRight: { x: 200, y: 195, radius: 15 }
    },

    emotionStates: {
        neutral: {
            eyeWidth: 1,
            mouthWidth: 1,
            mouthHeight: 0.4,
            blushAlpha: 0,
            eyebrowAngle: 0,
            label: '😐 Neutral'
        },
        happy: {
            eyeWidth: 0.8,
            mouthWidth: 1.2,
            mouthHeight: 0.6,
            blushAlpha: 0.3,
            eyebrowAngle: 0.1,
            label: '😊 Glücklich'
        },
        thinking: {
            eyeWidth: 0.6,
            mouthWidth: 0.6,
            mouthHeight: 0.2,
            blushAlpha: 0,
            eyebrowAngle: -0.2,
            label: '🤔 Denkend'
        },
        speaking: {
            eyeWidth: 0.9,
            mouthWidth: 1.4,
            mouthHeight: 0.7,
            blushAlpha: 0.1,
            eyebrowAngle: 0.05,
            label: '🗣️ Sprechend'
        },
        surprised: {
            eyeWidth: 1.3,
            mouthWidth: 1.1,
            mouthHeight: 0.9,
            blushAlpha: 0.1,
            eyebrowAngle: 0.3,
            label: '😮 Überrascht'
        },
        sad: {
            eyeWidth: 0.7,
            mouthWidth: 0.7,
            mouthHeight: -0.3,
            blushAlpha: 0,
            eyebrowAngle: 0.3,
            label: '😢 Traurig'
        }
    },

    // ---- INIT ----

    init(containerId = 'living-ai-container') {
        console.log('👤 Living AI wird initialisiert...');

        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('⚠️ Container für Living AI nicht gefunden');
            return false;
        }

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Emotion auf neutral setzen
        this.setEmotion('neutral');

        // Animation starten
        this.animate();

        // Events
        EventBus.on('ai:processing', (processing) => {
            if (processing) {
                this.setEmotion('thinking');
            } else {
                this.setEmotion('neutral');
            }
        });

        EventBus.on('voice:speaking', (speaking) => {
            if (speaking) {
                this.setEmotion('speaking');
            } else {
                this.setEmotion('neutral');
            }
        });

        EventBus.on('voice:listening', (listening) => {
            this.isListening = listening;
            if (listening) {
                this.setEmotion('thinking');
            }
        });

        console.log('✅ Living AI ready');
        return this;
    },

    // ---- EMOTION ----

    setEmotion(emotion) {
        if (!this.emotionStates[emotion]) {
            emotion = 'neutral';
        }
        this.currentEmotion = emotion;
        this.emotionTarget = this.emotionStates[emotion];
        // Sofort zeichnen
        this.draw();
        EventBus.emit('ai:emotion-changed', { emotion });
    },

    // ---- ANIMATION ----

    animate() {
        // Mund-Animation beim Sprechen
        if (this.currentEmotion === 'speaking' || this.isSpeaking) {
            const breath = Math.sin(Date.now() * 0.008) * 0.15 + 0.5;
            this.face.mouth.height = 8 + breath * 8;
        }

        // Blinzeln
        if (Math.random() < 0.005) {
            this.eyeState = 'closed';
            setTimeout(() => { this.eyeState = 'open'; }, 150);
        }

        // Sanftes Atmen
        const breathe = Math.sin(Date.now() * 0.001) * 2;
        this.face.head.radius = 80 + breathe;

        this.draw();
        requestAnimationFrame(() => this.animate());
    },

    // ---- DRAW ----

    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Canvas leeren
        ctx.clearRect(0, 0, w, h);

        // Hintergrund (mit sanftem Verlauf)
        const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 200);
        gradient.addColorStop(0, 'rgba(20, 10, 40, 0.8)');
        gradient.addColorStop(1, 'rgba(10, 5, 20, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Kopf (Hals)
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(w / 2 - 25, h - 40, 50, 40);

        // Kopf (rund)
        const head = this.face.head;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;

        // Hautfarbe
        const skinColor = '#e8c9a0';
        ctx.beginPath();
        ctx.arc(head.x, head.y, head.radius, 0, Math.PI * 2);
        ctx.fillStyle = skinColor;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Wangen-Rot
        if (this.emotionTarget?.blushAlpha > 0) {
            const blush = this.face.blushLeft;
            ctx.globalAlpha = this.emotionTarget.blushAlpha;
            ctx.beginPath();
            ctx.arc(blush.x, blush.y, blush.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ff6b8a';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.face.blushRight.x, this.face.blushRight.y, blush.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Augen
        this.drawEyes(ctx);

        // Augenbrauen
        this.drawEyebrows(ctx);

        // Nase
        this.drawNose(ctx);

        // Mund
        this.drawMouth(ctx);

        // Emotion-Label
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.emotionTarget?.label || 'Neutral', w / 2, h - 10);

        // Status
        const status = this.isSpeaking ? '🔊' : this.isListening ? '🎤' : this.isThinking ? '🧠' : '●';
        ctx.fillStyle = this.isSpeaking ? '#00ff88' : this.isListening ? '#ffaa00' : this.isThinking ? '#6666ff' : '#00ff88';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(status, w - 10, 20);
    },

    drawEyes(ctx) {
        const eyeL = this.face.eyeLeft;
        const eyeR = this.face.eyeRight;
        const isClosed = this.eyeState === 'closed';

        // Weiß
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0,0,0,0.1)';

        const eyeWidth = this.emotionTarget?.eyeWidth || 1;

        // Linkes Auge
        ctx.beginPath();
        ctx.ellipse(eyeL.x, eyeL.y, eyeL.radius * eyeWidth, isClosed ? 2 : eyeL.radius, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rechtes Auge
        ctx.beginPath();
        ctx.ellipse(eyeR.x, eyeR.y, eyeR.radius * eyeWidth, isClosed ? 2 : eyeR.radius, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        if (!isClosed) {
            // Pupillen
            ctx.fillStyle = '#2a1a0a';
            const pupilL = this.face.pupilLeft;
            const pupilR = this.face.pupilRight;
            ctx.beginPath();
            ctx.arc(eyeL.x + pupilL.x, eyeL.y + pupilL.y, pupilL.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eyeR.x + pupilR.x, eyeR.y + pupilR.y, pupilR.radius, 0, Math.PI * 2);
            ctx.fill();

            // Glanz (Lichtreflex)
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(eyeL.x + 4, eyeL.y - 4, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eyeR.x + 4, eyeR.y - 4, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawEyebrows(ctx) {
        const ebL = this.face.eyebrowLeft;
        const ebR = this.face.eyebrowRight;
        const angle = this.emotionTarget?.eyebrowAngle || 0;

        ctx.strokeStyle = '#3a2a1a';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // Linke Augenbraue
        ctx.beginPath();
        ctx.moveTo(ebL.x1, ebL.y1 - angle * 10);
        ctx.quadraticCurveTo((ebL.x1 + ebL.x2) / 2, ebL.y1 - 8 - angle * 15, ebL.x2, ebL.y2 + angle * 5);
        ctx.stroke();

        // Rechte Augenbraue
        ctx.beginPath();
        ctx.moveTo(ebR.x1, ebR.y1 + angle * 10);
        ctx.quadraticCurveTo((ebR.x1 + ebR.x2) / 2, ebR.y1 - 8 + angle * 15, ebR.x2, ebR.y2 - angle * 5);
        ctx.stroke();
    },

    drawNose(ctx) {
        const nose = this.face.nose;
        ctx.strokeStyle = '#c4a080';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(nose.x, nose.y - nose.size);
        ctx.quadraticCurveTo(nose.x + nose.size / 2, nose.y + nose.size / 2, nose.x, nose.y + nose.size);
        ctx.quadraticCurveTo(nose.x - nose.size / 2, nose.y + nose.size / 2, nose.x, nose.y - nose.size);
        ctx.stroke();

        // Nasenflügel
        ctx.beginPath();
        ctx.arc(nose.x - 6, nose.y + 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#c4a080';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nose.x + 6, nose.y + 2, 4, 0, Math.PI * 2);
        ctx.fill();
    },

    drawMouth(ctx) {
        const mouth = this.face.mouth;
        const isHappy = this.currentEmotion === 'happy';
        const isSad = this.currentEmotion === 'sad';
        const isSurprised = this.currentEmotion === 'surprised';

        const mw = mouth.width * (this.emotionTarget?.mouthWidth || 1);
        const mh = mouth.height * (this.emotionTarget?.mouthHeight || 0.4);

        ctx.fillStyle = '#cc4466';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(200,60,80,0.3)';

        if (isHappy) {
            // Lächeln
            ctx.beginPath();
            ctx.arc(mouth.x, mouth.y - 5, mw / 2, 0.1, Math.PI - 0.1);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#cc4466';
            ctx.stroke();
            // Unterlippe
            ctx.beginPath();
            ctx.arc(mouth.x, mouth.y + 5, mw / 2.5, 0, Math.PI);
            ctx.fill();
        } else if (isSad) {
            // Traurig
            ctx.beginPath();
            ctx.arc(mouth.x, mouth.y + 15, mw / 2, Math.PI + 0.2, Math.PI * 2 - 0.2);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#cc4466';
            ctx.stroke();
        } else if (isSurprised) {
            // Überrascht (offen)
            ctx.beginPath();
            ctx.ellipse(mouth.x, mouth.y, mw / 2, mh / 2 + 6, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#552233';
            ctx.fill();
            ctx.fillStyle = '#cc4466';
            ctx.beginPath();
            ctx.ellipse(mouth.x, mouth.y, mw / 2.5, mh / 2 + 3, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Neutral / Sprechend
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.ellipse(mouth.x, mouth.y, mw / 2, Math.max(mh / 2, 3), 0, 0, Math.PI * 2);
            ctx.fillStyle = '#cc4466';
            ctx.fill();

            // Lippenlinie
            ctx.strokeStyle = '#aa3355';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(mouth.x, mouth.y, mw / 2.5, Math.max(mh / 2, 2), 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
    },

    // ---- PUBLIC METHODS ----

    speak(text) {
        this.isSpeaking = true;
        this.setEmotion('speaking');
        // Text in der UI anzeigen
        EventBus.emit('ai:speaking', { text });

        // Nach Ende wieder neutral
        const duration = Math.min(text.length * 30, 3000);
        setTimeout(() => {
            this.isSpeaking = false;
            this.setEmotion('neutral');
        }, duration);
    },

    listen() {
        this.isListening = true;
        this.setEmotion('thinking');
        EventBus.emit('ai:listening', true);

        // Nach 5 Sekunden automatisch stoppen
        setTimeout(() => {
            this.isListening = false;
            this.setEmotion('neutral');
            EventBus.emit('ai:listening', false);
        }, 5000);
    },

    think() {
        this.isThinking = true;
        this.setEmotion('thinking');
        EventBus.emit('ai:thinking', true);

        setTimeout(() => {
            this.isThinking = false;
            this.setEmotion('neutral');
            EventBus.emit('ai:thinking', false);
        }, 2000);
    },

    getEmotion() {
        return this.currentEmotion;
    },

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        // Positionen skalieren
        const scaleX = width / 300;
        const scaleY = height / 400;
        // TODO: Alle Positionen skalieren
        this.draw();
    }
};

window.LivingAI = LivingAI;
