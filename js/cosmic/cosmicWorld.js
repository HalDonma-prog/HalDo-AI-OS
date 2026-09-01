/**
 * HALDO AI OS 24.6.0 – COSMIC WORLD
 * 3D-Universum mit NASA-Planeten, Sonne, Sternen und Interaktion
 * Version: 2.0.0
 */

const CosmicWorld = {
    // ---- KONFIGURATION ----
    quality: 'high',
    isReady: false,
    isPaused: false,
    animationId: null,
    
    // ---- THREE.JS KOMPONENTEN ----
    scene: null,
    camera: null,
    renderer: null,
    clock: null,
    
    // ---- HIMNELSKÖRPER ----
    sun: null,
    sunGlow: null,
    sunLight: null,
    planets: [],
    moons: [],
    stars: null,
    nebula: null,
    asteroids: [],
    
    // ---- PLANETENDATEN (NASA) ----
    planetData: {
        'Merkur': {
            name: 'Merkur',
            diameter: '4.879 km',
            distance: '57,9 Mio. km',
            moons: 0,
            fact: 'Kleinster Planet',
            color: 0xaaaaaa,
            size: 0.25,
            orbitDistance: 4.0,
            speed: 0.045,
            tilt: 0.03
        },
        'Venus': {
            name: 'Venus',
            diameter: '12.104 km',
            distance: '108,2 Mio. km',
            moons: 0,
            fact: 'Heißester Planet',
            color: 0xffcc88,
            size: 0.4,
            orbitDistance: 5.8,
            speed: 0.028,
            tilt: 2.64
        },
        'Erde': {
            name: 'Erde',
            diameter: '12.756 km',
            distance: '149,6 Mio. km',
            moons: 1,
            fact: 'Unser Zuhause',
            color: 0x4488ff,
            size: 0.45,
            orbitDistance: 7.6,
            speed: 0.02,
            tilt: 0.41,
            hasMoon: true
        },
        'Mars': {
            name: 'Mars',
            diameter: '6.792 km',
            distance: '227,9 Mio. km',
            moons: 2,
            fact: 'Der rote Planet',
            color: 0xff4422,
            size: 0.35,
            orbitDistance: 9.4,
            speed: 0.015,
            tilt: 0.44
        },
        'Jupiter': {
            name: 'Jupiter',
            diameter: '142.984 km',
            distance: '778,6 Mio. km',
            moons: 95,
            fact: 'Größter Planet',
            color: 0xddbb88,
            size: 1.0,
            orbitDistance: 12.0,
            speed: 0.01,
            tilt: 0.05
        },
        'Saturn': {
            name: 'Saturn',
            diameter: '120.536 km',
            distance: '1,43 Mrd. km',
            moons: 146,
            fact: 'Herr der Ringe',
            color: 0xeeddbb,
            size: 0.85,
            orbitDistance: 15.0,
            speed: 0.008,
            tilt: 0.47,
            hasRings: true
        },
        'Uranus': {
            name: 'Uranus',
            diameter: '51.118 km',
            distance: '2,87 Mrd. km',
            moons: 27,
            fact: 'Kälter Planet',
            color: 0x88ddff,
            size: 0.6,
            orbitDistance: 18.2,
            speed: 0.006,
            tilt: 1.71
        },
        'Neptun': {
            name: 'Neptun',
            diameter: '49.528 km',
            distance: '4,50 Mrd. km',
            moons: 16,
            fact: 'Stürmischster Planet',
            color: 0x3366ff,
            size: 0.55,
            orbitDistance: 21.4,
            speed: 0.005,
            tilt: 0.49
        },
        'Pluto': {
            name: 'Pluto',
            diameter: '2.377 km',
            distance: '5,91 Mrd. km',
            moons: 5,
            fact: 'Zwergplanet',
            color: 0xccbbaa,
            size: 0.15,
            orbitDistance: 24.6,
            speed: 0.004,
            tilt: 2.16
        },
        'Ceres': {
            name: 'Ceres',
            diameter: '946 km',
            distance: '414 Mio. km',
            moons: 0,
            fact: 'Zwergplanet im Asteroidengürtel',
            color: 0xaa8866,
            size: 0.12,
            orbitDistance: 27.0,
            speed: 0.0035
        },
        'Haumea': {
            name: 'Haumea',
            diameter: '1.632 km',
            distance: '6,45 Mrd. km',
            moons: 2,
            fact: 'Ei-förmiger Zwergplanet',
            color: 0x88ccaa,
            size: 0.16,
            orbitDistance: 29.4,
            speed: 0.003
        },
        'Makemake': {
            name: 'Makemake',
            diameter: '1.430 km',
            distance: '6,85 Mrd. km',
            moons: 1,
            fact: 'Zwergplanet im Kuipergürtel',
            color: 0xcc8866,
            size: 0.14,
            orbitDistance: 31.8,
            speed: 0.0025
        },
        'Eris': {
            name: 'Eris',
            diameter: '2.326 km',
            distance: '10,1 Mrd. km',
            moons: 1,
            fact: 'Größter Zwergplanet',
            color: 0x6699cc,
            size: 0.18,
            orbitDistance: 34.2,
            speed: 0.002
        }
    },
    
    // ---- INITIALISIERUNG ----
    init() {
        console.log('🌌 Cosmic World wird initialisiert...');
        
        // Container prüfen
        let container = document.getElementById('cosmic-canvas-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'cosmic-canvas-container';
            container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;cursor:pointer;';
            document.body.prepend(container);
        }
        this.container = container;
        
        // Qualität laden
        const savedQuality = Storage.get('cosmic_quality', 'high');
        this.quality = savedQuality;
        
        // THREE.JS prüfen
        if (typeof THREE === 'undefined') {
            console.warn('⚠️ Three.js wird geladen...');
            this.loadThreeJS();
            return;
        }
        
        this.setupScene();
        this.setupLighting();
        this.createSun();
        this.createPlanets();
        this.createStars();
        this.createNebula();
        this.createAsteroids();
        
        // Animation starten
        this.animate();
        this.isReady = true;
        
        // Events
        window.addEventListener('resize', () => this.onResize());
        this.container.addEventListener('click', (e) => this.onCosmicClick(e));
        
        EventBus.emit('cosmic:ready', { 
            quality: this.quality,
            planetCount: Object.keys(this.planetData).length 
        });
        
        console.log('✅ Cosmic World ready!');
        return this;
    },
    
    // ---- THREE.JS LADEN ----
    loadThreeJS() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => {
            console.log('✅ Three.js geladen!');
            this.setupScene();
            this.setupLighting();
            this.createSun();
            this.createPlanets();
            this.createStars();
            this.createNebula();
            this.createAsteroids();
            this.animate();
            this.isReady = true;
            window.addEventListener('resize', () => this.onResize());
            this.container.addEventListener('click', (e) => this.onCosmicClick(e));
            EventBus.emit('cosmic:ready');
        };
        document.head.appendChild(script);
    },
    
    // ---- SZENE AUFBAUEN ----
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        
        // Kamera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 16, 40);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);
        
        // Uhr
        this.clock = new THREE.Clock();
    },
    
    // ---- BELEUCHTUNG ----
    setupLighting() {
        // Umgebungslicht
        const ambient = new THREE.AmbientLight(0x222244, 0.4);
        this.scene.add(ambient);
        
        // Sonnenlicht (von der Sonne)
        this.sunLight = new THREE.PointLight(0xffaa33, 2.5, 150);
        this.sunLight.position.set(0, 0, 0);
        this.scene.add(this.sunLight);
        
        // Zusätzliches Licht
        const dirLight = new THREE.DirectionalLight(0x4466ff, 0.2);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);
    },
    
    // ---- SONNE ----
    createSun() {
        // Logo als Textur laden
        const logoTexture = this.loadLogoTexture();
        
        const geometry = new THREE.SphereGeometry(2.8, 64, 64);
        
        let material;
        if (logoTexture) {
            material = new THREE.MeshStandardMaterial({
                map: logoTexture,
                emissive: 0xff6600,
                emissiveIntensity: 0.4,
                roughness: 0.2,
                metalness: 0.0
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                color: 0xff8800,
                emissive: 0xff4400,
                emissiveIntensity: 1.0,
                roughness: 0.2,
                metalness: 0.0
            });
        }
        
        this.sun = new THREE.Mesh(geometry, material);
        this.sun.position.set(0, 0, 0);
        this.sun.userData.isSun = true;
        this.scene.add(this.sun);
        
        // Glow (Corona)
        const glowGeometry = new THREE.SphereGeometry(3.4, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        this.sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sunGlow.position.set(0, 0, 0);
        this.scene.add(this.sunGlow);
        
        // Äußere Corona
        const outerGeometry = new THREE.SphereGeometry(4.6, 32, 32);
        const outerMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.06,
            blending: THREE.AdditiveBlending
        });
        this.outerGlow = new THREE.Mesh(outerGeometry, outerMaterial);
        this.outerGlow.position.set(0, 0, 0);
        this.scene.add(this.outerGlow);
    },
    
    // ---- LOGO LADEN ----
    loadLogoTexture() {
        const paths = ['assets/images/logo.png', 'logo.png', 'HalDo-AI-OS/assets/images/logo.png'];
        let loadedTexture = null;
        
        for (const path of paths) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = path;
            if (img.complete && img.naturalWidth > 0) {
                try {
                    const texture = new THREE.Texture(img);
                    texture.needsUpdate = true;
                    return texture;
                } catch {
                    continue;
                }
            }
        }
        return null;
    },
    
    // ---- PLANETEN ----
    createPlanets() {
        const planetNames = ['Merkur', 'Venus', 'Erde', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptun', 'Pluto', 'Ceres', 'Haumea', 'Makemake', 'Eris'];
        
        for (const name of planetNames) {
            const data = this.planetData[name];
            if (!data) continue;
            
            const geometry = new THREE.SphereGeometry(data.size, 32, 32);
            const material = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.5,
                metalness: 0.1,
                emissive: data.color,
                emissiveIntensity: 0.02
            });
            
            const planet = new THREE.Mesh(geometry, material);
            const angle = (planetNames.indexOf(name) / planetNames.length) * Math.PI * 2 + Math.random() * 0.2;
            planet.position.x = Math.cos(angle) * data.orbitDistance;
            planet.position.z = Math.sin(angle) * data.orbitDistance;
            planet.userData = {
                name: name,
                distance: data.orbitDistance,
                speed: data.speed,
                angle: angle,
                tilt: data.tilt || 0,
                hasMoon: data.hasMoon || false,
                hasRings: data.hasRings || false
            };
            
            // Rotation
            planet.rotation.z = planet.userData.tilt || 0;
            this.scene.add(planet);
            
            // Umlaufbahn
            this.createOrbit(data.color, data.orbitDistance);
            
            // Ringe für Saturn
            if (data.hasRings) {
                this.createRings(planet);
            }
            
            // Mond für Erde
            if (data.hasMoon) {
                this.createMoon(planet);
            }
            
            this.planets.push(planet);
        }
    },
    
    // ---- UMLAUFBAHN ----
    createOrbit(color, distance) {
        const points = [];
        const segments = 80;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(theta) * distance,
                0,
                Math.sin(theta) * distance
            ));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.08
        });
        const orbit = new THREE.Line(geometry, material);
        this.scene.add(orbit);
    },
    
    // ---- MONDE ----
    createMoon(planet) {
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.9
        });
        const moon = new THREE.Mesh(geometry, material);
        moon.userData = {
            angle: 0,
            speed: 0.06,
            distance: 0.7
        };
        planet.add(moon);
        this.moons.push(moon);
    },
    
    // ---- RINGE (SATURN) ----
    createRings(planet) {
        const geometry = new THREE.RingGeometry(0.6, 0.9, 64);
        const material = new THREE.MeshBasicMaterial({
            color: 0xeeddbb,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2.5;
        planet.add(ring);
    },
    
    // ---- STERNE ----
    createStars() {
        const count = this.quality === 'high' ? 500 : 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const radius = 35 + Math.random() * 160;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.25, 0.3, 0.6 + Math.random() * 0.4);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        this.stars = new THREE.Points(geometry, new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        }));
        this.scene.add(this.stars);
    },
    
    // ---- NEBEL ----
    createNebula() {
        const count = this.quality === 'high' ? 1200 : 600;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const radius = 18 + Math.random() * 60;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.3;
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            const color = new THREE.Color().setHSL(0.65 + Math.random() * 0.25, 0.4, 0.1 + Math.random() * 0.15);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        this.nebula = new THREE.Points(geometry, new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.05,
            blending: THREE.AdditiveBlending
        }));
        this.scene.add(this.nebula);
    },
    
    // ---- ASTEROIDEN ----
    createAsteroids() {
        const count = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const distance = 10 + Math.random() * 8;
            const angle = Math.random() * Math.PI * 2;
            const height = (Math.random() - 0.5) * 2;
            
            positions[i * 3] = Math.cos(angle) * distance;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * distance;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        this.asteroids = new THREE.Points(geometry, new THREE.PointsMaterial({
            color: 0x886644,
            size: 0.05,
            transparent: true,
            opacity: 0.3
        }));
        this.scene.add(this.asteroids);
    },
    
    // ---- ANIMATION ----
    animate() {
        if (this.isPaused) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
        if (!this.scene || !this.camera || !this.renderer) return;
        
        const time = this.clock ? this.clock.getElapsedTime() : Date.now() * 0.001;
        
        // Sonne
        if (this.sun) {
            this.sun.rotation.y += 0.002;
            if (this.sunGlow) {
                const pulse = 1 + Math.sin(time * 0.6) * 0.04;
                this.sunGlow.scale.set(pulse, pulse, pulse);
                this.sunGlow.material.opacity = 0.2 + Math.sin(time * 0.5) * 0.04;
            }
            if (this.outerGlow) {
                const pulse2 = 1 + Math.sin(time * 0.3 + 1) * 0.05;
                this.outerGlow.scale.set(pulse2, pulse2, pulse2);
            }
        }
        
        // Planeten
        for (const planet of this.planets) {
            const data = planet.userData;
            data.angle += data.speed * 0.3;
            planet.position.x = Math.cos(data.angle) * data.distance;
            planet.position.z = Math.sin(data.angle) * data.distance;
            planet.rotation.y += 0.015;
            
            // Monde bewegen
            if (data.hasMoon) {
                const moons = planet.children.filter(child => child.geometry.type === 'SphereGeometry' && child !== planet);
                for (const moon of moons) {
                    const md = moon.userData;
                    md.angle += md.speed;
                    moon.position.x = Math.cos(md.angle) * md.distance;
                    moon.position.z = Math.sin(md.angle) * md.distance;
                }
            }
        }
        
        // Kamera sanft schwenken
        if (this.camera) {
            const a = time * 0.01;
            this.camera.position.x = Math.sin(a) * 6;
            this.camera.position.z = 38 + Math.sin(a * 0.7) * 3;
            this.camera.position.y = 14 + Math.sin(a * 0.5) * 1.5;
            this.camera.lookAt(0, 0, 0);
        }
        
        // Asteroiden
        if (this.asteroids) {
            this.asteroids.rotation.y += 0.0005;
        }
        
        this.renderer.render(this.scene, this.camera);
    },
    
    // ---- CLICK-ERKENNUNG ----
    onCosmicClick(e) {
        if (!this.scene || !this.camera) return;
        
        const rect = this.container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 2 - 1;
        const y = -(e.clientY - rect.top) / rect.height * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
        
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        let hitSun = false;
        let hitPlanet = null;
        
        for (const hit of intersects) {
            let obj = hit.object;
            while (obj) {
                if (obj.userData && obj.userData.isSun) {
                    hitSun = true;
                    break;
                }
                if (obj.userData && obj.userData.name) {
                    hitPlanet = obj.userData.name;
                    break;
                }
                obj = obj.parent;
            }
            if (hitSun || hitPlanet) break;
        }
        
        if (hitSun) {
            console.log('☀️ Sonne geklickt – öffne HalDo AI!');
            EventBus.emit('cosmic:sun-click', { timestamp: Date.now() });
            if (typeof AppManager !== 'undefined') {
                AppManager.openApp('haldo-ai');
            }
            return;
        }
        
        if (hitPlanet) {
            const data = this.planetData[hitPlanet];
            if (data) {
                EventBus.emit('cosmic:planet-click', { 
                    planet: hitPlanet,
                    data: data
                });
                alert(
                    `🪐 ${data.name}\n` +
                    `📏 Durchmesser: ${data.diameter}\n` +
                    `📡 Entfernung: ${data.distance}\n` +
                    `🌙 Monde: ${data.moons}\n` +
                    `✨ Besonderheit: ${data.fact}`
                );
            }
            return;
        }
    },
    
    // ---- FENSTERGRÖSSE ----
    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    
    // ---- PAUSE / FORTSETZEN ----
    togglePause() {
        this.isPaused = !this.isPaused;
        EventBus.emit('cosmic:pause-toggled', { paused: this.isPaused });
        return this.isPaused;
    },
    
    // ---- QUALITÄT ÄNDERN ----
    setQuality(quality) {
        if (quality === this.quality) return;
        this.quality = quality;
        Storage.set('cosmic_quality', quality);
        
        // Sterne neu erstellen
        this.scene.remove(this.stars);
        this.createStars();
        
        EventBus.emit('cosmic:quality-changed', { quality });
        return this;
    },
    
    // ---- ZERSTÖREN ----
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.renderer) {
            this.renderer.dispose();
            if (this.container) {
                this.container.innerHTML = '';
            }
        }
        this.isReady = false;
        EventBus.emit('cosmic:destroyed', { timestamp: Date.now() });
        console.log('🌌 Cosmic World zerstört');
    }
};

// ---- COSMIC WORLD GLOBAL VERFÜGBAR MACHEN ----
window.CosmicWorld = CosmicWorld;

// ---- AUTOMATISCH STARTEN ----
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof CosmicWorld !== 'undefined') {
            CosmicWorld.init();
        }
    }, 500);
});

console.log('🌌 Cosmic World geladen – HalDo AI OS 24.6.0');
