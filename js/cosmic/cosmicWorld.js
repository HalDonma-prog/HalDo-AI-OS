/**
 * HALDO AI OS 24.6 – COSMIC WORLD (ÜBERARBEITET)
 * 12 Planeten, Erde mit Mond, Umlaufbahnen, Animation
 */

const CosmicWorld = {
    scene: null,
    camera: null,
    renderer: null,
    isReady: false,
    animationId: null,
    planetData: [],
    starField: null,

    init() {
        console.log('🌌 Cosmic World wird initialisiert...');

        // Container prüfen / erstellen
        let container = document.getElementById('cosmic-canvas-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'cosmic-canvas-container';
            container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;';
            document.body.prepend(container);
        }
        this.container = container;

        // Three.js laden falls nötig
        if (typeof THREE === 'undefined') {
            console.warn('⚠️ Three.js wird geladen...');
            this.loadThreeJS();
            return;
        }

        this.setupScene();
        this.animate();
        this.isReady = true;
        window.addEventListener('resize', () => this.onResize());

        console.log('✅ Cosmic World ready – 12 Planeten + Erde + Mond!');
        return this;
    },

    loadThreeJS() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => {
            console.log('✅ Three.js geladen!');
            this.setupScene();
            this.animate();
            this.isReady = true;
        };
        document.head.appendChild(script);
    },

    setupScene() {
        this.scene = new THREE.Scene();

        // Kamera
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 20, 45);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        this.setupLighting();
        this.createSun();
        this.createPlanets(); // ← 12 Planeten + Erde + Mond
        this.createStars(1200);
        this.createNebula();

        console.log('🌌 Setup abgeschlossen!');
    },

    setupLighting() {
        const ambient = new THREE.AmbientLight(0x222244, 0.6);
        this.scene.add(ambient);

        const sunLight = new THREE.PointLight(0xffaa33, 2.5, 120);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);

        const dirLight = new THREE.DirectionalLight(0x4466ff, 0.3);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);
    },

    // ===== SONNE =====
    createSun() {
        const geo = new THREE.SphereGeometry(3.2, 64, 64);
        const mat = new THREE.MeshStandardMaterial({
            color: 0xff8800,
            emissive: 0xff4400,
            emissiveIntensity: 1.2,
            roughness: 0.2,
            metalness: 0.0
        });
        const sun = new THREE.Mesh(geo, mat);
        sun.position.set(0, 0, 0);
        this.scene.add(sun);

        // Glow
        const glowGeo = new THREE.SphereGeometry(4.0, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.set(0, 0, 0);
        this.scene.add(glow);

        this.sun = sun;
        this.sunGlow = glow;
    },

    // ===== PLANETEN (12 + ERDE + MOND) =====
    createPlanets() {
        const planets = [
            { name: 'Merkur', size: 0.3, distance: 4.5, color: 0xaaaaaa, speed: 0.022, moons: 0 },
            { name: 'Venus', size: 0.5, distance: 6.5, color: 0xffcc88, speed: 0.018, moons: 0 },
            { name: 'Erde', size: 0.55, distance: 8.5, color: 0x4488ff, speed: 0.015, moons: 1 }, // ← Erde mit Mond
            { name: 'Mars', size: 0.45, distance: 10.5, color: 0xff4422, speed: 0.013, moons: 0 },
            { name: 'Jupiter', size: 1.3, distance: 13.5, color: 0xddbb88, speed: 0.009, moons: 0 },
            { name: 'Saturn', size: 1.1, distance: 16.5, color: 0xeeddbb, speed: 0.007, moons: 0 },
            { name: 'Uranus', size: 0.8, distance: 19.5, color: 0x88ddff, speed: 0.005, moons: 0 },
            { name: 'Neptun', size: 0.75, distance: 22.5, color: 0x3366ff, speed: 0.004, moons: 0 },
            { name: 'Pluto', size: 0.2, distance: 25.5, color: 0xccbbaa, speed: 0.003, moons: 0 },
            { name: 'HalDo-1', size: 0.4, distance: 28.5, color: 0x8B5CF6, speed: 0.0025, moons: 0 },
            { name: 'HalDo-2', size: 0.35, distance: 31.5, color: 0x00D4FF, speed: 0.002, moons: 0 },
            { name: 'HalDo-3', size: 0.3, distance: 34.5, color: 0xFF6B9D, speed: 0.0015, moons: 0 }
        ];

        this.planetData = [];

        planets.forEach((data, index) => {
            const geo = new THREE.SphereGeometry(data.size, 32, 32);
            const mat = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.5,
                metalness: 0.1
            });
            const mesh = new THREE.Mesh(geo, mat);

            const angle = (index / planets.length) * Math.PI * 2 + Math.random() * 0.5;
            mesh.position.x = Math.cos(angle) * data.distance;
            mesh.position.z = Math.sin(angle) * data.distance;
            mesh.userData = {
                distance: data.distance,
                speed: data.speed,
                angle: angle,
                name: data.name,
                moons: data.moons
            };
            this.scene.add(mesh);

            // Umlaufbahn (Ring)
            const orbitPoints = [];
            for (let i = 0; i <= 64; i++) {
                const theta = (i / 64) * Math.PI * 2;
                orbitPoints.push(new THREE.Vector3(
                    Math.cos(theta) * data.distance,
                    0,
                    Math.sin(theta) * data.distance
                ));
            }
            const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMat = new THREE.LineBasicMaterial({
                color: 0x444466,
                transparent: true,
                opacity: 0.25
            });
            const orbit = new THREE.Line(orbitGeo, orbitMat);
            this.scene.add(orbit);

            // ----- ERDE + MOND -----
            if (data.name === 'Erde') {
                const moonGeo = new THREE.SphereGeometry(0.15, 16, 16);
                const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
                const moon = new THREE.Mesh(moonGeo, moonMat);
                moon.userData = { angle: 0, speed: 0.04, distance: 1.0 };
                mesh.add(moon);
                this.moon = moon; // Für Animation speichern
            }

            this.planetData.push({
                mesh,
                distance: data.distance,
                speed: data.speed,
                angle: angle,
                name: data.name
            });
        });
    },

    // ===== STERNE =====
    createStars(count = 1200) {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const radius = 50 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.3, 0.5 + Math.random() * 0.5);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = 0.1 + Math.random() * 0.5;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.35,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        this.starField = new THREE.Points(geo, mat);
        this.scene.add(this.starField);
    },

    // ===== NEBEL =====
    createNebula() {
        const count = 2500;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const radius = 15 + Math.random() * 70;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.3;
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const color = new THREE.Color().setHSL(0.7 + Math.random() * 0.2, 0.5, 0.15 + Math.random() * 0.25);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.7,
            vertexColors: true,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending
        });

        const nebula = new THREE.Points(geo, mat);
        this.scene.add(nebula);
        this.nebula = nebula;
    },

    // ===== ANIMATION =====
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (!this.scene || !this.camera || !this.renderer) return;

        // Sonne drehen & pulsieren
        if (this.sun) {
            this.sun.rotation.y += 0.003;
            if (this.sunGlow) {
                this.sunGlow.rotation.x += 0.001;
                this.sunGlow.rotation.y += 0.002;
                const pulse = 1 + Math.sin(Date.now() * 0.0008) * 0.03;
                this.sunGlow.scale.set(pulse, pulse, pulse);
            }
        }

        // Planeten bewegen
        if (this.planetData) {
            this.planetData.forEach(data => {
                data.angle += data.speed * 0.6;
                data.mesh.position.x = Math.cos(data.angle) * data.distance;
                data.mesh.position.z = Math.sin(data.angle) * data.distance;
                data.mesh.rotation.y += 0.015;

                // Erde → Mond bewegen
                if (data.name === 'Erde' && this.moon) {
                    const moonData = this.moon.userData;
                    moonData.angle += moonData.speed;
                    this.moon.position.x = Math.cos(moonData.angle) * moonData.distance;
                    this.moon.position.z = Math.sin(moonData.angle) * moonData.distance;
                }
            });
        }

        // Kamera langsam schwenken (für Lebendigkeit)
        if (this.camera) {
            const time = Date.now() * 0.00005;
            this.camera.position.x = Math.sin(time) * 5;
            this.camera.position.z = 45 + Math.sin(time * 0.7) * 3;
            this.camera.lookAt(0, 0, 0);
        }

        this.renderer.render(this.scene, this.camera);
    },

    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.renderer) {
            this.renderer.dispose();
            if (this.container) this.container.innerHTML = '';
        }
        this.isReady = false;
        console.log('🌌 Cosmic World zerstört');
    }
};

// ---- AUTOSTART ----
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof CosmicWorld !== 'undefined') {
            CosmicWorld.init();
        }
    }, 400);
});

window.CosmicWorld = CosmicWorld;
console.log('🌌 Cosmic World geladen – 12 Planeten + Erde mit Mond!');
