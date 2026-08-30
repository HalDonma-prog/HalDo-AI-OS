// ================================================================
//  HALDO COSMIC ENHANCED — Erweiterte Weltraum-Animation
//  TEIL 19/30
// ================================================================

var HalDoCosmicEnhanced = {
    init: function() {
        var canvas = document.getElementById('cosmic');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var W, H;

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        // ===== STERNE (2000) =====
        var stars = [];
        for (var i = 0; i < 2000; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 2.5 + 0.3,
                speed: Math.random() * 0.03 + 0.005,
                bright: Math.random() * 0.8 + 0.2,
                phase: Math.random() * Math.PI * 2,
                color: 'hsl(' + (200 + Math.random() * 60) + ', 80%, ' + (60 + Math.random() * 40) + '%)'
            });
        }

        // ===== GALAXIEN (8) =====
        var galaxies = [];
        for (var g = 0; g < 8; g++) {
            var gx = Math.random() * W;
            var gy = Math.random() * H;
            var gSize = 60 + Math.random() * 180;
            var angle = Math.random() * Math.PI * 2;
            var points = [];
            for (var i = 0; i < 500; i++) {
                var t = Math.random() * Math.PI * 4;
                var r = Math.random() * gSize * 0.6;
                var px = gx + Math.cos(t + angle) * r * (1 + t * 0.08);
                var py = gy + Math.sin(t + angle) * r * (1 + t * 0.08);
                points.push({
                    x: px,
                    y: py,
                    r: Math.random() * 2 + 0.5,
                    bright: Math.random() * 0.5 + 0.2,
                    hue: 200 + Math.random() * 80
                });
            }
            galaxies.push({
                x: gx,
                y: gy,
                size: gSize,
                angle: angle,
                points: points,
                rotationSpeed: (Math.random() - 0.5) * 0.002
            });
        }

        // ===== SONNE (mit Logo) =====
        var sun = {
            x: W / 2,
            y: H / 2,
            radius: 55,
            glow: 200,
            phase: 0,
            pulseSpeed: 0.008,
            flares: 16
        };

        // ===== 12 PLANETEN (mit Orbits) =====
        var planetData = [
            { name: 'Merkur', r: 8, color: '#aaaaaa', orbit: 80, speed: 0.03, role: 'second' },
            { name: 'Venus', r: 12, color: '#ffaa44', orbit: 120, speed: 0.022, role: 'minute' },
            { name: 'Erde', r: 14, color: '#4488ff', orbit: 170, speed: 0.015, role: 'hour' },
            { name: 'Mars', r: 10, color: '#ff6644', orbit: 220, speed: 0.012 },
            { name: 'Jupiter', r: 26, color: '#ddaa77', orbit: 280, speed: 0.008 },
            { name: 'Saturn', r: 20, color: '#ddcc88', orbit: 350, speed: 0.006 },
            { name: 'Uranus', r: 16, color: '#88ddff', orbit: 420, speed: 0.0045 },
            { name: 'Neptun', r: 15, color: '#4466ff', orbit: 490, speed: 0.0035 },
            { name: 'Pluto', r: 6, color: '#ccbb99', orbit: 560, speed: 0.0025 },
            { name: 'HalDo-1', r: 11, color: '#ff88dd', orbit: 620, speed: 0.0018 },
            { name: 'HalDo-2', r: 13, color: '#88ffaa', orbit: 680, speed: 0.0012 },
            { name: 'HalDo-3', r: 9, color: '#ffaa88', orbit: 740, speed: 0.0008 }
        ];

        var planets = [];
        for (var p = 0; p < planetData.length; p++) {
            var pd = planetData[p];
            planets.push({
                name: pd.name,
                r: pd.r,
                color: pd.color,
                orbit: pd.orbit,
                speed: pd.speed,
                angle: Math.random() * Math.PI * 2,
                cx: W / 2,
                cy: H / 2,
                role: pd.role || 'normal',
                trail: []
            });
        }

        // ===== MOND =====
        var moon = {
            x: 0,
            y: 0,
            r: 6,
            color: '#cccccc',
            orbit: 30,
            speed: 0.08,
            angle: 0,
            ex: 0,
            ey: 0
        };

        // ===== STERNSCHNUPPEN =====
        var shootingStars = [];
        function createShootingStar() {
            shootingStars.push({
                x: Math.random() * W,
                y: Math.random() * H * 0.5,
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * 4 + 2,
                life: 1,
                maxLife: 0.5 + Math.random() * 0.5,
                trail: []
            });
        }

        // Alle 30-60 Sekunden eine Sternschnuppe
        setInterval(function() {
            if (Math.random() > 0.3) {
                createShootingStar();
            }
        }, 30000 + Math.random() * 30000);

        // ===== ANIMATION =====
        function animate() {
            var time = Date.now() / 2000;
            var now = new Date();
            var seconds = now.getSeconds();
            var minutes = now.getMinutes();
            var hours = now.getHours() % 12;

            ctx.clearRect(0, 0, W, H);

            // === HINTERGRUND ===
            var bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.9);
            var hue1 = 220 + 20 * Math.sin(time * 0.1);
            var hue2 = 240 + 30 * Math.sin(time * 0.07 + 1);
            bgGrad.addColorStop(0, 'hsl(' + hue1 + ', 70%, 12%)');
            bgGrad.addColorStop(0.5, 'hsl(' + hue2 + ', 60%, 8%)');
            bgGrad.addColorStop(1, '#000005');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, W, H);

            // === GALAXIEN ===
            for (var gi = 0; gi < galaxies.length; gi++) {
                var g2 = galaxies[gi];
                g2.angle += g2.rotationSpeed;
                for (var pi = 0; pi < g2.points.length; pi++) {
                    var p2 = g2.points[pi];
                    var rotX = p2.x - g2.x;
                    var rotY = p2.y - g2.y;
                    var cosA = Math.cos(g2.angle);
                    var sinA = Math.sin(g2.angle);
                    var rx = g2.x + rotX * cosA - rotY * sinA;
                    var ry = g2.y + rotX * sinA + rotY * cosA;
                    ctx.fillStyle = 'hsla(' + p2.hue + ', 70%, 60%, ' + (p2.bright * 0.2) + ')';
                    ctx.beginPath();
                    ctx.arc(rx, ry, p2.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // === PLANETEN-TRAILS ===
            for (var pt = 0; pt < planets.length; pt++) {
                var pTrail = planets[pt];
                if (pTrail.trail) {
                    for (var ti = 0; ti < pTrail.trail.length; ti++) {
                        var t2 = pTrail.trail[ti];
                        ctx.fillStyle = 'rgba(255,255,255,' + (t2.life * 0.04) + ')';
                        ctx.beginPath();
                        ctx.arc(t2.x, t2.y, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            // === SONNE ===
            sun.phase += sun.pulseSpeed;
            var pulse = 1 + 0.06 * Math.sin(sun.phase);
            var radius = sun.radius * pulse;

            // Sonnen-Glow
            for (var g = 10; g > 0; g--) {
                var grad = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, sun.glow * g * 0.12);
                var alpha = 0.05 / g;
                grad.addColorStop(0, 'rgba(255, 220, 68, ' + alpha + ')');
                grad.addColorStop(1, 'rgba(255, 220, 68, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(sun.x, sun.y, sun.glow * g * 0.12, 0, Math.PI * 2);
                ctx.fill();
            }

            // Sonnenkörper
            var sunGrad = ctx.createRadialGradient(
                sun.x - radius * 0.3, sun.y - radius * 0.3, 0,
                sun.x, sun.y, radius
            );
            sunGrad.addColorStop(0, '#ffeeaa');
            sunGrad.addColorStop(0.3, '#ffdd44');
            sunGrad.addColorStop(0.6, '#ffaa00');
            sunGrad.addColorStop(0.85, '#ff6600');
            sunGrad.addColorStop(1, '#ff3300');
            ctx.fillStyle = sunGrad;
            ctx.shadowColor = '#ffdd44';
            ctx.shadowBlur = 40;
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // HalDo Logo in der Sonne
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold ' + (radius * 0.5) + 'px system-ui, sans-serif';
            ctx.shadowColor = 'rgba(255,255,255,0.5)';
            ctx.shadowBlur = 30;
            ctx.fillStyle = '#ffffff';
            ctx.fillText('⟡', sun.x, sun.y - radius * 0.05);
            ctx.shadowBlur = 0;
            ctx.font = (radius * 0.12) + 'px system-ui, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillText('HalDo', sun.x, sun.y + radius * 0.5);

            // Sonnenstrahlen
            for (var fl = 0; fl < sun.flares; fl++) {
                var fAngle = fl * (Math.PI / (sun.flares / 2)) + sun.phase * 0.3;
                var len = radius * (1.5 + 0.5 * Math.sin(sun.phase * 0.7 + fl * 0.5));
                ctx.strokeStyle = 'rgba(255, 220, 68, ' + (0.05 + 0.04 * Math.sin(sun.phase + fl)) + ')';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(sun.x + Math.cos(fAngle) * radius * 0.7, sun.y + Math.sin(fAngle) * radius * 0.7);
                ctx.lineTo(sun.x + Math.cos(fAngle) * len, sun.y + Math.sin(fAngle) * len);
                ctx.stroke();
            }

            // Sonnenflecken
            for (var sf = 0; sf < 8; sf++) {
                var spotAngle = sf * 1.1 + sun.phase * 0.4;
                var spotR = radius * (0.2 + 0.15 * Math.sin(sun.phase * 0.6 + sf));
                var spotX = sun.x + Math.cos(spotAngle) * radius * 0.45;
                var spotY = sun.y + Math.sin(spotAngle) * radius * 0.45;
                ctx.fillStyle = 'rgba(180, 80, 20, ' + (0.15 + 0.1 * Math.sin(sun.phase + sf)) + ')';
                ctx.beginPath();
                ctx.arc(spotX, spotY, spotR, 0, Math.PI * 2);
                ctx.fill();
            }

            // === PLANETEN ===
            for (var pp = 0; pp < planets.length; pp++) {
                var pl = planets[pp];

                // Uhrzeit-Rotation
                if (pl.role === 'second') {
                    pl.angle = (seconds / 60) * Math.PI * 2;
                } else if (pl.role === 'minute') {
                    pl.angle = (minutes / 60) * Math.PI * 2 + (seconds / 60) * (Math.PI * 2 / 60);
                } else if (pl.role === 'hour') {
                    pl.angle = (hours / 12) * Math.PI * 2 + (minutes / 60) * (Math.PI * 2 / 12);
                } else {
                    pl.angle += pl.speed;
                }

                var px = pl.cx + Math.cos(pl.angle) * pl.orbit;
                var py = pl.cy + Math.sin(pl.angle) * pl.orbit;

                // Trail für normale Planeten
                if (pl.role === 'normal') {
                    if (!pl.trail) pl.trail = [];
                    pl.trail.push({ x: px, y: py, life: 1 });
                    if (pl.trail.length > 30) pl.trail.shift();
                    for (var ti2 = 0; ti2 < pl.trail.length; ti2++) {
                        pl.trail[ti2].life *= 0.98;
                    }
                }

                // Orbit
                ctx.strokeStyle = 'rgba(255,255,255,0.015)';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 6]);
                ctx.beginPath();
                ctx.arc(pl.cx, pl.cy, pl.orbit, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                // Planet-Glow
                var pGlow = ctx.createRadialGradient(px, py, 0, px, py, pl.r * 2.5);
                pGlow.addColorStop(0, pl.color + '30');
                pGlow.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = pGlow;
                ctx.beginPath();
                ctx.arc(px, py, pl.r * 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Planet
                ctx.shadowColor = pl.color;
                ctx.shadowBlur = 15;
                ctx.fillStyle = pl.color;
                ctx.beginPath();
                ctx.arc(px, py, pl.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Saturn-Ring
                if (pl.name === 'Saturn') {
                    ctx.strokeStyle = 'rgba(200, 180, 150, 0.3)';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.ellipse(px, py, pl.r * 1.8, pl.r * 0.5, 0.3, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.strokeStyle = 'rgba(200, 180, 150, 0.15)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.ellipse(px, py, pl.r * 2.2, pl.r * 0.7, -0.2, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Planeten-Name
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.font = '8px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(pl.name, px, py + pl.r + 4);

                // Rolle anzeigen
                if (pl.role === 'second') {
                    ctx.fillStyle = 'rgba(255,200,100,0.3)';
                    ctx.font = '6px sans-serif';
                    ctx.fillText('⏱ Sekunde', px, py + pl.r + 18);
                } else if (pl.role === 'minute') {
                    ctx.fillStyle = 'rgba(100,200,255,0.3)';
                    ctx.font = '6px sans-serif';
                    ctx.fillText('⏱ Minute', px, py + pl.r + 18);
                } else if (pl.role === 'hour') {
                    ctx.fillStyle = 'rgba(255,100,100,0.3)';
                    ctx.font = '6px sans-serif';
                    ctx.fillText('⏱ Stunde', px, py + pl.r + 18);
                }

                // Erde speichern für Mond
                if (pl.name === 'Erde') {
                    moon.ex = px;
                    moon.ey = py;
                }
            }

            // === MOND ===
            if (moon.ex !== undefined) {
                moon.angle += moon.speed;
                moon.x = moon.ex + Math.cos(moon.angle) * moon.orbit;
                moon.y = moon.ey + Math.sin(moon.angle) * moon.orbit;

                // Mond-Glow
                var mGlow = ctx.createRadialGradient(moon.x, moon.y, 0, moon.x, moon.y, moon.r * 2.5);
                mGlow.addColorStop(0, 'rgba(200,200,200,0.15)');
                mGlow.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = mGlow;
                ctx.beginPath();
                ctx.arc(moon.x, moon.y, moon.r * 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Mond
                ctx.shadowColor = '#cccccc';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#cccccc';
                ctx.beginPath();
                ctx.arc(moon.x, moon.y, moon.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Mond-Krater
                ctx.fillStyle = 'rgba(150,150,150,0.3)';
                ctx.beginPath();
                ctx.arc(moon.x - 2, moon.y - 2, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(moon.x + 3, moon.y + 1, 1, 0, Math.PI * 2);
                ctx.fill();

                // Mond-Name
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.font = '6px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText('🌙 Mond', moon.x, moon.y + moon.r + 2);
            }

            // === STERNE ===
            var time2 = Date.now() / 3000;
            for (var st = 0; st < stars.length; st++) {
                var s2 = stars[st];
                s2.y += s2.speed;
                if (s2.y > H) { s2.y = 0;
                    s2.x = Math.random() * W; }
                var bright = s2.bright * (0.6 + 0.4 * Math.sin(time2 * 2 + s2.phase));
                ctx.globalAlpha = bright;
                ctx.fillStyle = s2.color;
                ctx.beginPath();
                ctx.arc(s2.x, s2.y, s2.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // === STERNSCHNUPPEN ===
            for (var ss = shootingStars.length - 1; ss >= 0; ss--) {
                var ss2 = shootingStars[ss];
                ss2.x += ss2.vx;
                ss2.y += ss2.vy;
                ss2.life -= 0.008;
                if (ss2.life <= 0 || ss2.x > W || ss2.y > H) {
                    shootingStars.splice(ss, 1);
                    continue;
                }
                // Trail
                ctx.fillStyle = 'rgba(255,255,255,' + (ss2.life * 0.3) + ')';
                ctx.beginPath();
                ctx.arc(ss2.x, ss2.y, 2, 0, Math.PI * 2);
                ctx.fill();
                // Schweif
                ctx.strokeStyle = 'rgba(255,255,255,' + (ss2.life * 0.15) + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(ss2.x, ss2.y);
                ctx.lineTo(ss2.x - ss2.vx * 10, ss2.y - ss2.vy * 10);
                ctx.stroke();
            }

            // === UHRZEIT ANZEIGE ===
            var hh = String(now.getHours()).padStart(2, '0');
            var mm = String(now.getMinutes()).padStart(2, '0');
            var ss3 = String(now.getSeconds()).padStart(2, '0');
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText('🕐 ' + hh + ':' + mm + ':' + ss3, 16, H - 60);

            // Legende
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.font = '8px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText('⏱ Sekunde · ⏱ Minute · ⏱ Stunde · 🌙 Mond · ☀️ Klicke die Sonne für HalDo AI', 16, H - 40);

            requestAnimationFrame(animate);
        }

        animate();

        // ===== SONNE KLICKBAR (AI öffnen) =====
        canvas.addEventListener('click', function(e) {
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var dx = x - sun.x,
                dy = y - sun.y;
            if (Math.sqrt(dx * dx + dy * dy) < sun.radius * 1.5) {
                if (window.HalDoWindow) {
                    window.HalDoWindow.launch('ai');
                    if (window.HalDoNotify) window.HalDoNotify('☀️ HalDo AI geöffnet!');
                }
            }
        });

        canvas.addEventListener('touchstart', function(e) {
            var t = e.touches[0];
            var rect = canvas.getBoundingClientRect();
            var x = t.clientX - rect.left;
            var y = t.clientY - rect.top;
            var dx = x - sun.x,
                dy = y - sun.y;
            if (Math.sqrt(dx * dx + dy * dy) < sun.radius * 2) {
                if (window.HalDoWindow) {
                    window.HalDoWindow.launch('ai');
                    if (window.HalDoNotify) window.HalDoNotify('☀️ HalDo AI geöffnet!');
                }
            }
        }, { passive: true });

        // ===== RESIZE =====
        window.addEventListener('resize', function() {
            for (var rp = 0; rp < planets.length; rp++) {
                planets[rp].cx = W / 2;
                planets[rp].cy = H / 2;
            }
            sun.x = W / 2;
            sun.y = H / 2;
        });

        console.log('[Cosmic] Erweiterte Weltraum-Animation gestartet');
    }
};
