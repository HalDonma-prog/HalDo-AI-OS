// ================================================================
//  HALDO AI OS 24 – COSMIC WORLD
// ================================================================

function initCosmic() {
    var canvas = document.getElementById('cosmic');
    if (!canvas) {
        console.error('[Cosmic] Canvas nicht gefunden!');
        return;
    }
    var ctx = canvas.getContext('2d');
    var W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Sterne (300 Stück)
    var stars = [];
    for (var i = 0; i < 300; i++) {
        stars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 2.5 + 0.3,
            speed: Math.random() * 0.02 + 0.003,
            bright: Math.random() * 0.7 + 0.3,
            phase: Math.random() * Math.PI * 2,
            twinkle: Math.random() * 0.5 + 0.5
        });
    }

    // Sonne
    var sun = { x: W / 2, y: H / 2, radius: 50, glow: 150, phase: 0 };

    // 12 Planeten
    var planets = [];
    var planetData = [
        { name: 'Merkur', r: 4, color: '#b8b8b8', orbit: 50, speed: 0.035 },
        { name: 'Venus', r: 6, color: '#e8a060', orbit: 75, speed: 0.025 },
        { name: 'Erde', r: 8, color: '#4488ff', orbit: 105, speed: 0.018 },
        { name: 'Mars', r: 5, color: '#e86040', orbit: 135, speed: 0.014 },
        { name: 'Jupiter', r: 12, color: '#d4a060', orbit: 175, speed: 0.009 },
        { name: 'Saturn', r: 9, color: '#d4b880', orbit: 215, speed: 0.007 },
        { name: 'Uranus', r: 8, color: '#80d0f0', orbit: 255, speed: 0.005 },
        { name: 'Neptun', r: 7, color: '#4060f0', orbit: 295, speed: 0.004 },
        { name: 'Pluto', r: 3, color: '#c0a880', orbit: 330, speed: 0.003 },
        { name: 'HalDo-1', r: 6, color: '#f080d0', orbit: 365, speed: 0.0022 },
        { name: 'HalDo-2', r: 7, color: '#80f0a0', orbit: 400, speed: 0.0016 },
        { name: 'HalDo-3', r: 5, color: '#f0a080', orbit: 435, speed: 0.0012 }
    ];

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
            glow: pd.r * 0.5
        });
    }

    // Mond
    var moon = { x: 0, y: 0, r: 3, color: '#ccc', orbit: 18, speed: 0.09, angle: 0, ex: 0, ey: 0 };

    // Nebel
    var nebula = [];
    for (var n = 0; n < 50; n++) {
        nebula.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 80 + 20,
            a: Math.random() * 0.03 + 0.01,
            color: ['rgba(100,50,200,', 'rgba(200,50,100,', 'rgba(50,100,200,', 'rgba(200,100,50,'][
                Math.floor(Math.random() * 4)
            ]
        });
    }

    function animate() {
        var time = Date.now() / 2000;
        ctx.clearRect(0, 0, W, H);

        // Hintergrund
        var grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.9);
        grad.addColorStop(0, '#0a0a2a');
        grad.addColorStop(0.5, '#050515');
        grad.addColorStop(1, '#000005');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Nebel
        for (var nb = 0; nb < nebula.length; nb++) {
            var neb = nebula[nb];
            neb.x += Math.sin(time * 0.1 + nb) * 0.2;
            neb.y += Math.cos(time * 0.08 + nb * 0.5) * 0.2;
            if (neb.x < -100) neb.x = W + 100;
            if (neb.x > W + 100) neb.x = -100;
            if (neb.y < -100) neb.y = H + 100;
            if (neb.y > H + 100) neb.y = -100;

            var grd = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
            grd.addColorStop(0, neb.color + (neb.a * 0.8) + ')');
            grd.addColorStop(1, neb.color + '0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(neb.x, neb.y, neb.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sterne
        for (var s = 0; s < stars.length; s++) {
            var st = stars[s];
            st.y += st.speed;
            if (st.y > H) { st.y = 0; st.x = Math.random() * W; }
            var b = st.bright * (0.5 + 0.5 * Math.sin(time * st.twinkle + st.phase));
            ctx.globalAlpha = b * 0.8;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(255,255,255,0.05)';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Sonne
        sun.phase += 0.02;
        var pulse = 1 + 0.04 * Math.sin(sun.phase);
        var r = sun.radius * pulse;

        for (var g = 8; g > 0; g--) {
            var gr = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, sun.glow * g * 0.1);
            gr.addColorStop(0, 'rgba(255,220,68,' + (0.035 / g) + ')');
            gr.addColorStop(1, 'rgba(255,220,68,0)');
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, sun.glow * g * 0.1, 0, Math.PI * 2);
            ctx.fill();
        }

        var sg = ctx.createRadialGradient(sun.x - r * 0.3, sun.y - r * 0.3, 0, sun.x, sun.y, r);
        sg.addColorStop(0, '#ffeecc');
        sg.addColorStop(0.2, '#ffdd55');
        sg.addColorStop(0.5, '#ffaa22');
        sg.addColorStop(0.8, '#ff7700');
        sg.addColorStop(1, '#ff4400');
        ctx.fillStyle = sg;
        ctx.shadowColor = '#ffdd44';
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        for (var sp = 0; sp < 6; sp++) {
            var angle = sp * 1.2 + time * 0.1;
            var dist = r * (0.2 + 0.3 * Math.sin(time * 0.05 + sp));
            var sx = sun.x + Math.cos(angle) * dist;
            var sy = sun.y + Math.sin(angle) * dist;
            var sr = r * (0.08 + 0.04 * Math.sin(time * 0.1 + sp));
            ctx.fillStyle = 'rgba(200,100,30,0.15)';
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold ' + (r * 0.45) + 'px system-ui, sans-serif';
        ctx.shadowColor = 'rgba(255,255,255,0.2)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('⟡', sun.x, sun.y - r * 0.05);
        ctx.shadowBlur = 0;

        for (var pl = 0; pl < planets.length; pl++) {
            var p2 = planets[pl];
            p2.angle += p2.speed;
            var px = p2.cx + Math.cos(p2.angle) * p2.orbit;
            var py = p2.cy + Math.sin(p2.angle) * p2.orbit;

            ctx.strokeStyle = 'rgba(255,255,255,0.015)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 6]);
            ctx.beginPath();
            ctx.arc(p2.cx, p2.cy, p2.orbit, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            var pGlow = p2.glow || p2.r * 0.5;
            ctx.shadowColor = p2.color;
            ctx.shadowBlur = pGlow * 2;
            ctx.fillStyle = p2.color;
            ctx.beginPath();
            ctx.arc(px, py, p2.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.beginPath();
            ctx.arc(px - p2.r * 0.2, py - p2.r * 0.2, p2.r * 0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.font = '5px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(p2.name, px, py + p2.r + 4);

            if (p2.name === 'Erde') { moon.ex = px; moon.ey = py; }
        }

        if (moon.ex !== undefined) {
            moon.angle += moon.speed;
            moon.x = moon.ex + Math.cos(moon.angle) * moon.orbit;
            moon.y = moon.ey + Math.sin(moon.angle) * moon.orbit;

            ctx.shadowColor = '#ccc';
            ctx.shadowBlur = 4;
            ctx.fillStyle = '#ccc';
            ctx.beginPath();
            ctx.arc(moon.x, moon.y, moon.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255,255,255,0.04)';
            ctx.font = '4px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('🌙', moon.x, moon.y + moon.r + 2);
        }

        var now = new Date();
        var timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('🕐 ' + timeStr, 14, H - 14);

        ctx.fillStyle = 'rgba(255,255,255,0.015)';
        ctx.font = '8px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('HalDo v' + CONFIG.version, W - 14, H - 14);

        requestAnimationFrame(animate);
    }

    animate();

    // Interaktion
    canvas.addEventListener('click', function(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var dx = x - sun.x, dy = y - sun.y;
        if (Math.sqrt(dx * dx + dy * dy) < sun.radius * 1.8) {
            launchApp('ai');
            Notify.info('☀️ ' + (CONFIG.language === 'en' ? 'HalDo AI opened!' : CONFIG.language === 'ku' ? 'HalDo AI vebû!' : 'HalDo AI geöffnet!'));
        }
    });

    canvas.addEventListener('touchstart', function(e) {
        var t = e.touches[0];
        var rect = canvas.getBoundingClientRect();
        var x = t.clientX - rect.left;
        var y = t.clientY - rect.top;
        var dx = x - sun.x, dy = y - sun.y;
        if (Math.sqrt(dx * dx + dy * dy) < sun.radius * 2) {
            launchApp('ai');
            Notify.info('☀️ ' + (CONFIG.language === 'en' ? 'HalDo AI opened!' : CONFIG.language === 'ku' ? 'HalDo AI vebû!' : 'HalDo AI geöffnet!'));
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

    console.log('🌌 Cosmic World erfolgreich gestartet!');
}
