/**
 * HALDO AI OS 24.6 – COSMIC WORLD (ULTIMATE)
 * 12 Planeten, Erde+Mond, 365 Sterne, Sonne mit Logo, Zeit-Planeten
 */

const CosmicWorld = {
    scene: null,
    camera: null,
    renderer: null,
    isReady: false,
    animationId: null,
    planetData: [],
    starField: null,
    clock: null,
    sunMesh: null,
    logoTexture: null,

    init() {
        console.log('🌌 Cosmic World ULTIMATE wird initialisiert...');

        // Container prüfen / erstellen
        let container = document.getElementById('cosmic-canvas-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'cosmic-canvas-container';
            container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;cursor:pointer;';
            document.body.prepend(container);
        }
        this.container = container;

        // ---- Logo laden ----
        this.loadLogo();

        // ---- Three.js prüfen ----
        if (typeof THREE === 'undefined') {
            console.warn('⚠️ Three.js wird geladen...');
            this.loadThreeJS();
            return;
        }

        this.setupScene();
        this.animate();
        this.isReady = true;
        window.addEventListener('resize', () => this.onResize());

        // ---- Klick auf Sonne ----
        this.container.addEventListener('click', (e) => this.onSunClick(e));

        console.log('✅ Cosmic World ULTIMATE ready!');
        return this;
    },

    loadLogo() {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = 'assets/images/logo.png';
        img.onload = () => {
            console.log('✅ Logo geladen!');
            this.logoTexture = new THREE.Texture(img);
            if (this.sunMesh) {
                this.sunMesh.material.map = this.logoTexture;
                this.sunMesh.material.needsUpdate = true;
            }
        };
        img.onerror = () => {
            console.warn('⚠️ Logo nicht gefunden – verwende Standard-Sonne');
        };
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

        // ---- Himmelsfarbe (sanfter Verlauf) ----
        this.scene.background = new THREE.Color(0x0a0a1a);

        // ---- Kamera ----
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 20, 50);
        this.camera.lookAt(0, 0, 0);

        // ---- Renderer ----
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        // ---- Beleuchtung ----
        this.setupLighting();

        // ---- Sonne mit Logo ----
        this.createSun();

        // ---- 12 Planeten (mit Zeit-Funktion) ----
        this.createPlanets();

        // ---- 365 Sterne ----
        this.createStars(365);

        // ---- Nebel ----
        this.createNebula();

        // ---- Uhr starten ----
        this.clock = new THREE.Clock();

        console.log('🌌 Setup abgeschlossen!');
    },

    setupLighting() {
        const ambient = new THREE.AmbientLight(0x222244, 0.6);
        this.scene.add(ambient);

        const sunLight = new THREE.PointLight(0xffaa33, 3, 150);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);

        const dirLight = new THREE.DirectionalLight(0x4466ff, 0.3);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);
    },

    // ============================================================
    //  SONNE MIT LOGO
    // ============================================================
    createSun() {
        const geo = new THREE.SphereGeometry(3.5, 64, 64);
        
        // Material mit Logo oder Standard
        let mat;
        if (this.logoTexture) {
            mat = new THREE.MeshStandardMaterial({
                map: this.logoTexture,
                emissive: 0xff6600,
                emissiveIntensity: 0.3,
                roughness: 0.2,
                metalness: 0.0
            });
        } else {
            mat = new THREE.MeshStandardMaterial({
                color: 0xff8800,
                emissive: 0xff4400,
                emissiveIntensity: 1.0,
                roughness: 0.2,
                metalness: 0.0
            });
        }
        
        const sun = new THREE.Mesh(geo, mat);
        sun.position.set(0, 0, 0);
        sun.userData.isSun = true;
        this.scene.add(sun);
        this.sunMesh = sun;

        // ---- Glow (Corona) ----
        const glowGeo = new THREE.SphereGeometry(4.2, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.set(0, 0, 0);
        this.scene.add(glow);
        this.sunGlow = glow;

        // ---- Äußere Corona (Strahlend) ----
        const outerGlowGeo = new THREE.SphereGeometry(5.5, 32, 32);
        const outerGlowMat = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending
        });
        const outerGlow = new THREE.Mesh(outerGlowGeo, outerGlowMat);
        outerGlow.position.set(0, 0, 0);
        this.scene.add(outerGlow);
        this.outerGlow = outerGlow;
    },

    // ============================================================
    //  12 PLANETEN + ERDE + MOND + ZEIT-PLANETEN
    // ============================================================
    createPlanets() {
        const planets = [
            // Zeit-Planeten (Sekunde, Minute, Stunde)
            { name: 'Merkur', size: 0.3, distance: 5.0, color: 0xaaaaaa, speed: 0.04, moons: 0, type: 'second' },
            { name: 'Venus', size: 0.5, distance: 7.0, color: 0xffcc88, speed: 0.025, moons: 0, type: 'minute' },
            { name: 'Erde', size: 0.55, distance: 9.5, color: 0x4488ff, speed: 0.018, moons: 1, type: 'hour' },
            
            // Weitere Planeten
            { name: 'Mars', size: 0.45, distance: 12.0, color: 0xff4422, speed: 0.014, moons: 0 },
            { name: 'Jupiter', size: 1.3, distance: 15.0, color: 0xddbb88, speed: 0.009, moons: 0 },
            { name: 'Saturn', size: 1.1, distance: 18.5, color: 0xeeddbb, speed: 0.007, moons: 0 },
            { name: 'Uranus', size: 0.8, distance: 22.0, color: 0x88ddff, speed: 0.005, moons: 0 },
            { name: 'Neptun', size: 0.75, distance: 25.5, color: 0x3366ff, speed: 0.004, moons: 0 },
            { name: 'Pluto', size: 0.2, distance: 29.0, color: 0xccbbaa, speed: 0.003, moons: 0 },
            
            // HalDo-Planeten (kosmisch)
            { name: 'HalDo-1', size: 0.4, distance: 33.0, color: 0x8B5CF6, speed: 0.0025, moons: 0 },
            { name: 'HalDo-2', size: 0.35, distance: 37.0, color: 0x00D4FF, speed: 0.002, moons: 0 },
            { name: 'HalDo-3', size: 0.3, distance: 41.0, color: 0xFF6B9D, speed: 0.0015, moons: 0 }
        ];

        this.planetData = [];

        planets.forEach((data, index) => {
            const geo = new THREE.SphereGeometry(data.size, 32, 32);
            const mat = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.5,
                metalness: 0.1,
                emissive: data.color,
                emissiveIntensity: 0.05
            });
            const mesh = new THREE.Mesh(geo, mat);

            const angle = (index / planets.length) * Math.PI * 2 + Math.random() * 0.3;
            mesh.position.x = Math.cos(angle) * data.distance;
            mesh.position.z = Math.sin(angle) * data.distance;
            mesh.userData = {
                distance: data.distance,
                speed: data.speed,
                angle: angle,
                name: data.name,
                moons: data.moons,
                type: data.type || 'normal'
            };
            this.scene.add(mesh);

            // Umlaufbahn (schöne leuchtende Ringe)
            const orbitPoints = [];
            const segments = 80;
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                orbitPoints.push(new THREE.Vector3(
                    Math.cos(theta) * data.distance,
                    0,
                    Math.sin(theta) * data.distance
                ));
            }
            const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMat = new THREE.LineBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.15
            });
            const orbit = new THREE.Line(orbitGeo, orbitMat);
            this.scene.add(orbit);

            // ---- ERDE + MOND ----
            if (data.name === 'Erde') {
                const moonGeo = new THREE.SphereGeometry(0.15, 16, 16);
                const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 });
                const moon = new THREE.Mesh(moonGeo, moonMat);
                moon.userData = { angle: 0, speed: 0.06, distance: 1.2 };
                mesh.add(moon);
                this.moon = moon;
            }

            this.planetData.push({
                mesh,
                distance: data.distance,
                speed: data.speed,
                angle: angle,
                name: data.name,
                type: data.type || 'normal'
            });
        });
    },

    // ============================================================
    //  365 STERNE (funkelnd)
    // ============================================================
    createStars(count = 365) {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const radius = 40 + Math.random() * 180;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.25, 0.3, 0.6 + Math.random() * 0.4);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = 0.15 + Math.random() * 0.6;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.35,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        });

        this.starField = new THREE.Points(geo, mat);
        this.scene.add(this.starField);
    },

    // ============================================================
    //  NEBEL (für schöne Himmelsfarben)
    // ============================================================
    createNebula() {
        const count = 2000;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const radius = 20 + Math.random() * 80;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.3;
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const hue = 0.65 + Math.random() * 0.25;
            const color = new THREE.Color().setHSL(hue, 0.6, 0.15 + Math.random() * 0.25);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });

        const nebula = new THREE.Points(geo, mat);
        this.scene.add(nebula);
        this.nebula = nebula;
    },

    // ============================================================
    //  ANIMATION (ALLES DREHT SICH)
    // ============================================================
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (!this.scene || !this.camera || !this.renderer) return;

        const time = this.clock ? this.clock.getElapsedTime() : Date.now() * 0.001;

        // ---- Sonne dreht sich & pulsiert ----
        if (this.sunMesh) {
            this.sunMesh.rotation.y += 0.002;
            this.sunMesh.rotation.x = Math.sin(time * 0.1) * 0.05;
            
            if (this.sunGlow) {
                const pulse = 1 + Math.sin(time * 0.6) * 0.04;
                this.sunGlow.scale.set(pulse, pulse, pulse);
                this.sunGlow.material.opacity = 0.2 + Math.sin(time * 0.5) * 0.05;
            }
            if (this.outerGlow) {
                const pulse2 = 1 + Math.sin(time * 0.3 + 1) * 0.06;
                this.outerGlow.scale.set(pulse2, pulse2, pulse2);
            }
        }

        // ---- Planeten bewegen ----
        if (this.planetData) {
            this.planetData.forEach(data => {
                // Zeit-Planeten: Sekunde, Minute, Stunde
                let speedFactor = 1;
                if (data.type === 'second') speedFactor = 2.0;
                else if (data.type === 'minute') speedFactor = 1.0;
                else if (data.type === 'hour') speedFactor = 0.5;
                
                data.angle += data.speed * speedFactor * 0.5;
                data.mesh.position.x = Math.cos(data.angle) * data.distance;
                data.mesh.position.z = Math.sin(data.angle) * data.distance;
                data.mesh.rotation.y += 0.02;
                data.mesh.rotation.x = Math.sin(time * 0.2 + data.distance) * 0.03;

                // ---- Erde + Mond ----
                if (data.name === 'Erde' && this.moon) {
                    const moonData = this.moon.userData;
                    moonData.angle += moonData.speed;
                    this.moon.position.x = Math.cos(moonData.angle) * moonData.distance;
                    this.moon.position.z = Math.sin(moonData.angle) * moonData.distance;
                    this.moon.rotation.y += 0.03;
                }
            });
        }

        // ---- Sterne funkeln ----
        if (this.starField) {
            const sizes = this.starField.geometry.attributes.size;
            if (sizes) {
                for (let i = 0; i < sizes.count; i++) {
                    const flicker = 0.3 + Math.sin(time * (0.5 + i * 0.01)) * 0.3;
                    sizes.array[i] = 0.15 + flicker * 0.5;
                }
                sizes.needsUpdate = true;
            }
        }

        // ---- Kamera sanft schwenken ----
        if (this.camera) {
            const camAngle = time * 0.015;
            this.camera.position.x = Math.sin(camAngle) * 8;
            this.camera.position.z = 48 + Math.sin(camAngle * 0.7) * 4;
            this.camera.position.y = 18 + Math.sin(camAngle * 0.5) * 2;
            this.camera.lookAt(0, 0, 0);
        }

        this.renderer.render(this.scene, this.camera);
    },

    // ============================================================
    //  SONNE ANKLICKEN → HALDO AI ÖFFNET SICH
    // ============================================================
    onSunClick(event) {
        // Prüfen, ob auf die Sonne geklickt wurde
        const rect = this.container.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width * 2 - 1;
        const y = -(event.clientY - rect.top) / rect.height * 2 + 1;

        // Raycaster für Klick-Erkennung
        if (!this.scene || !this.camera) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(x, y);
        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(this.scene.children, true);
        let hitSun = false;

        for (let hit of intersects) {
            let obj = hit.object;
            while (obj) {
                if (obj.userData && obj.userData.isSun) {
                    hitSun = true;
                    break;
                }
                obj = obj.parent;
            }
            if (hitSun) break;
        }

        if (hitSun) {
            console.log('☀️ Sonne geklickt – öffne HalDo AI!');
            // HalDo AI öffnen
            if (typeof AppManager !== 'undefined') {
                AppManager.openApp('haldo-ai');
            } else {
                // Fallback: AI Chat öffnen
                if (typeof AIChatApp !== 'undefined') {
                    AIChatApp.open();
                } else {
                    alert('🌌 HalDo AI wird geladen...');
                }
            }
        }
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
    }, 500);
});

window.CosmicWorld = CosmicWorld;
console.log('🌌 Cosmic World ULTIMATE geladen!');
