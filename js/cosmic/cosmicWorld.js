/**
 * HALDO AI OS 24.6 – COSMIC WORLD
 * 3D-Universum mit Three.js
 */

const CosmicWorld = {
    scene: null,
    camera: null,
    renderer: null,
    quality: 'ultra',
    resolution: '1920x1080',
    isReady: false,
    animationId: null,

    init() {
        console.log('🌌 Cosmic World wird initialisiert...');

        // Qualität aus Storage laden
        const savedQuality = Storage.get('cosmic_quality', 'ultra');
        if (savedQuality) this.quality = savedQuality;

        const container = document.getElementById('cosmic-canvas-container');
        if (!container) {
            console.warn('⚠️ Cosmic Container nicht gefunden');
            return false;
        }

        // Three.js Setup
        this.scene = new THREE.Scene();

        // Kamera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 20, 40);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.quality !== 'low',
            alpha: false
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality === 'ultra' ? 2 : 1.5));
        this.renderer.shadowMap.enabled = this.quality !== 'low';
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        container.appendChild(this.renderer.domElement);

        // Beleuchtung
        this.setupLighting();

        // Sonne
        this.createSun();

        // Planeten
        this.createPlanets();

        // Sterne
        this.createStars();

        // Nebel
        this.createNebula();

        // Events
        window.addEventListener('resize', () => this.onResize());

        // Animation starten
        this.animate();

        this.isReady = true;
        console.log('✅ Cosmic World ready');
        return true;
    },

    setupLighting() {
        // Ambient
        const ambient = new THREE.AmbientLight(0x222244, 0.5);
        this.scene.add(ambient);

        // Sonnenlicht (von der Sonne)
        const sunLight = new THREE.PointLight(0xffaa33, 2, 100);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);

        // Zusätzliches Licht
        const dirLight = new THREE.DirectionalLight(0x4466ff, 0.3);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);
    },

    createSun() {
        const geometry = new THREE.SphereGeometry(3, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff8800,
            emissive: 0xff4400,
            emissiveIntensity: 0.8,
            roughness: 0.3,
            metalness: 0.1
        });
        const sun = new THREE.Mesh(geometry, material);
        sun.position.set(0, 0, 0);
        this.scene.add(sun);

        // Corona (Glow)
        const glowGeometry = new THREE.SphereGeometry(3.8, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0, 0, 0);
        this.scene.add(glow);

        // Sonne speichern
        this.sun = sun;
        this.sunGlow = glow;
    },

    createPlanets() {
        const planets = [
            { name: 'Merkur', size: 0.4, distance: 5, color: 0xaaaaaa, speed: 0.015 },
            { name: 'Venus', size: 0.6, distance: 7, color: 0xffcc88, speed: 0.012 },
            { name: 'Erde', size: 0.65, distance: 9.5, color: 0x4488ff, speed: 0.01 },
            { name: 'Mars', size: 0.5, distance: 12, color: 0xff4422, speed: 0.008 },
            { name: 'Jupiter', size: 1.4, distance: 15, color: 0xddbb88, speed: 0.006 },
            { name: 'Saturn', size: 1.2, distance: 18.5, color: 0xeeddbb, speed: 0.005 },
            { name: 'Uranus', size: 0.9, distance: 22, color: 0x88ddff, speed: 0.004 },
            { name: 'Neptun', size: 0.85, distance: 25.5, color: 0x3366ff, speed: 0.003 },
            { name: 'Pluto', size: 0.2, distance: 29, color: 0xccbbaa, speed: 0.002 },
        ];

        this.planetData = [];

        planets.forEach((data, index) => {
            const geometry = new THREE.SphereGeometry(data.size, 32, 32);
            const material = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.6,
                metalness: 0.2
            });
            const mesh = new THREE.Mesh(geometry, material);

            // Zufällige Startposition
            const angle = (index / planets.length) * Math.PI * 2;
            mesh.position.x = Math.cos(angle) * data.distance;
            mesh.position.z = Math.sin(angle) * data.distance;

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
                opacity: 0.3
            });
            const orbit = new THREE.Line(orbitGeo, orbitMat);
            this.scene.add(orbit);

            // Mond für Erde
            if (data.name === 'Erde') {
                const moonGeo = new THREE.SphereGeometry(0.15, 16, 16);
                const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
                const moon = new THREE.Mesh(moonGeo, moonMat);
                moon.position.set(1.2, 0.3, 0);
                mesh.add(moon);
            }

            this.planetData.push({
                mesh,
                distance: data.distance,
                speed: data.speed,
                angle: angle
            });
        });
    },

    createStars() {
        const starCount = this.quality === 'ultra' ? 800 : this.quality === 'high' ? 500 : 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const radius = 50 + Math.random() * 150;
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

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
        this.stars = stars;
    },

    createNebula() {
        // Einfache Nebel-Partikel
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const radius = 20 + Math.random() * 60;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.4;
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const color = new THREE.Color().setHSL(0.7 + Math.random() * 0.2, 0.5, 0.2 + Math.random() * 0.3);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });

        const nebula = new THREE.Points(geometry, material);
        this.scene.add(nebula);
        this.nebula = nebula;
    },

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Sonne rotieren
        if (this.sun) {
            this.sun.rotation.y += 0.002;
            if (this.sunGlow) {
                this.sunGlow.rotation.x += 0.001;
                this.sunGlow.rotation.y += 0.001;
                this.sunGlow.scale.setScalar(1 + Math.sin(Date.now() * 0.001) * 0.02);
            }
        }

        // Planeten bewegen
        this.planetData.forEach(data => {
            data.angle += data.speed;
            data.mesh.position.x = Math.cos(data.angle) * data.distance;
            data.mesh.position.z = Math.sin(data.angle) * data.distance;
            data.mesh.rotation.y += 0.01;
        });

        // Kamera langsam schwenken
        if (this.camera) {
            // Leichte Bewegung
        }

        this.renderer.render(this.scene, this.camera);
    },

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    setQuality(quality) {
        this.quality = quality;
        Storage.set('cosmic_quality', quality);
        // Rebuild stars
        this.scene.remove(this.stars);
        this.createStars();
        console.log(`🌌 Qualität auf ${quality} gesetzt`);
    },

    toggleAutoRotate() {
        // TODO: Implementieren
    },

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
            const container = document.getElementById('cosmic-canvas-container');
            if (container) {
                container.innerHTML = '';
            }
        }
        this.isReady = false;
        console.log('🌌 Cosmic World zerstört');
    }
};

window.CosmicWorld = CosmicWorld;
