// ================================================================
//  HALDO COSMIC WORLD
//  TEIL 7/30
// ================================================================

var HalDoCosmic = {
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

        // Sterne
        var stars = [];
        for (var i = 0; i < 400; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.02 + 0.005,
                bright: Math.random() * 0.6 + 0.4,
                phase: Math.random() * Math.PI * 2
            });
        }

        // Sonne
        var sun = { x: W / 2, y: H / 2, radius: 50, glow: 150, phase: 0 };

        // Planeten
        var planetData = [
            { name: 'Merkur', r: 6, color: '#aaa', orbit: 70, speed: 0.03 },
            { name: 'Venus', r: 10, color: '#fa4', orbit: 100, speed: 0.022 },
            { name: 'Erde', r: 12, color: '#48f', orbit: 140, speed: 0.015 },
            { name: 'Mars', r: 8, color: '#f64', orbit: 180, speed: 0.012 },
            { name: 'Jupiter', r: 20, color: '#da7', orbit: 230, speed: 0.008 },
            { name: 'Saturn', r: 16, color: '#dc8', orbit: 280, speed: 0.006 },
            { name: 'Uranus', r: 13, color: '#8df', orbit: 330, speed: 0.0045 },
            { name: 'Neptun', r: 12, color: '#46f', orbit: 380, speed: 0.0035 },
            { name: 'Pluto', r: 5, color: '#cb9', orbit: 420, speed: 0.0025 },
            { name: 'HalDo-1', r: 9, color: '#f8d', orbit: 460, speed: 0.0018 },
            { name: 'HalDo-2', r: 11, color: '#8fa', orbit: 500, speed: 0.0012 },
            { name: 'HalDo-3', r: 7, color: '#fa8', orbit: 540, speed: 0.0008 }
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
                cy: H / 2
            });
        }

        var moon = { x: 0, y: 0, r: 5, color: '#ccc', orbit: 25, speed: 0.08, angle: 0, ex: 0, ey: 0 };

        function animate() {
            var time = Date.now() / 2000;
            ctx.clearRect(0, 0, W, H);

            // Hintergrund
            var grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
            grad.addColorStop(0, '#0a0a2a');
            grad.addColorStop(0.6, '#050515');
            grad.addColorStop(1, '#000005');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // Sterne
            for (var s = 0; s < stars.length; s++) {
                var st = stars[s];
                st.y += st.speed;
                if (st.y > H) { st.y = 0;
                    st.x = Math.random() * W; }
                var b = st.bright * (0.6 + 0.4 * Math.sin(time + st.phase));
                ctx.globalAlpha = b;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // Sonne
            sun.phase += 0.02;
            var pulse = 1 + 0.05 * Math.sin(sun.phase);
            var r = sun.radius * pulse;

            for (var g = 6; g > 0; g--) {
                var gr = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, sun.glow * g * 0.15);
                gr.addColorStop(0, 'rgba(255,220,68,' + (0.05 / g) + ')');
                gr.addColorStop(1, 'rgba(255,220,68,0)');
                ctx.fillStyle = gr;
                ctx.beginPath();
                ctx.arc(sun.x, sun.y, sun.glow * g * 0.15, 0, Math.PI * 2);
                ctx.fill();
            }

            var sg = ctx.createRadialGradient(sun.x - r * 0.3, sun.y - r * 0.3, 0, sun.x, sun.y, r);
            sg.addColorStop(0, '#ffeeaa');
            sg.addColorStop(0.4, '#ffdd44');
            sg.addColorStop(0.8, '#ff8800');
            sg.addColorStop(1, '#ff4400');
            ctx.fillStyle = sg;
            ctx.shadowColor = '#ffdd44';
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // HalDo Logo in Sonne
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold ' + (r * 0.5) + 'px system-ui, sans-serif';
            ctx.shadowColor = 'rgba(255,255,255,0.5)';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffffff';
            ctx.fillText('⟡', sun.x, sun.y - r * 0.05);
            ctx.shadowBlur = 0;

            // Planeten
            for (var pl = 0; pl < planets.length; pl++) {
                var p2 = planets[pl];
                p2.angle += p2.speed;
                var px = p2.cx + Math.cos(p2.angle) * p2.orbit;
                var py = p2.cy + Math.sin(p2.angle) * p2.orbit;

                ctx.strokeStyle = 'rgba(255,255,255,0.02)';
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 4]);
                ctx.beginPath();
                ctx.arc(p2.cx, p2.cy, p2.orbit, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.shadowColor = p2.color;
                ctx.shadowBlur = 10;
                ctx.fillStyle = p2.color;
                ctx.beginPath();
                ctx.arc(px, py, p2.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.font = '6px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(p2.name, px, py + p2.r + 3);

                if (p2.name === 'Erde') { moon.ex = px;
                    moon.ey = py; }
            }

            // Mond
            if (moon.ex !== undefined) {
                moon.angle += moon.speed;
                moon.x = moon.ex + Math.cos(moon.angle) * moon.orbit;
                moon.y = moon.ey + Math.sin(moon.angle) * moon.orbit;

                ctx.shadowColor = '#ccc';
                ctx.shadowBlur = 8;
                ctx.fillStyle = '#ccc';
                ctx.beginPath();
                ctx.arc(moon.x, moon.y, moon.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.font = '5px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText('🌙', moon.x, moon.y + moon.r + 2);
            }

            // Uhrzeit
            var now = new Date();
            var hh = String(now.getHours()).padStart(2, '0');
            var mm = String(now.getMinutes()).padStart(2, '0');
            var ss = String(now.getSeconds()).padStart(2, '0');
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.font = '11px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText('🕐 ' + hh + ':' + mm + ':' + ss, 12, H - 60);

            requestAnimationFrame(animate);
        }

        animate();

        // Sonne klickbar
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

        window.addEventListener('resize', function() {
            for (var rp = 0; rp < planets.length; rp++) {
                planets[rp].cx = W / 2;
                planets[rp].cy = H / 2;
            }
            sun.x = W / 2;
            sun.y = H / 2;
        });
    }
};
