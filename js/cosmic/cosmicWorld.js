/**
 * HALDO AI OS 24.6.0 – COSMIC WORLD (KURZVERSION)
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
    container: null,

    planetInfo: {
        'Merkur': { name: 'Merkur', diameter: '4.879 km', distance: '57,9 Mio. km', moons: 0, fact: 'Kleinster Planet' },
        'Venus': { name: 'Venus', diameter: '12.104 km', distance: '108,2 Mio. km', moons: 0, fact: 'Heißester Planet' },
        'Erde': { name: 'Erde', diameter: '12.756 km', distance: '149,6 Mio. km', moons: 1, fact: 'Unser Zuhause' },
        'Mars': { name: 'Mars', diameter: '6.792 km', distance: '227,9 Mio. km', moons: 2, fact: 'Der rote Planet' },
        'Jupiter': { name: 'Jupiter', diameter: '142.984 km', distance: '778,6 Mio. km', moons: 95,
        fact: 'Größter Planet' },
        'Saturn': { name: 'Saturn', diameter: '120.536 km', distance: '1,43 Mrd. km', moons: 146,
        fact: 'Herr der Ringe' },
        'Uranus': { name: 'Uranus', diameter: '51.118 km', distance: '2,87 Mrd. km', moons: 27, fact: 'Kälter Planet' },
        'Neptun': { name: 'Neptun', diameter: '49.528 km', distance: '4,50 Mrd. km', moons: 16,
        fact: 'Stürmischster Planet' },
        'Pluto': { name: 'Pluto', diameter: '2.377 km', distance: '5,91 Mrd. km', moons: 5, fact: 'Zwergplanet' },
        'Ceres': { name: 'Ceres', diameter: '946 km', distance: '414 Mio. km', moons: 0,
        fact: 'Zwergplanet im Asteroidengürtel' },
        'Haumea': { name: 'Haumea', diameter: '1.632 km', distance: '6,45 Mrd. km', moons: 2,
        fact: 'Ei-förmiger Zwergplanet' },
        'Makemake': { name: 'Makemake', diameter: '1.430 km', distance: '6,85 Mrd. km', moons: 1,
        fact: 'Zwergplanet im Kuipergürtel' },
        'Eris': { name: 'Eris', diameter: '2.326 km', distance: '10,1 Mrd. km', moons: 1, fact: 'Größter Zwergplanet' }
    },

    init() {
        console.log('🌌 Cosmic World wird initialisiert...');
        let container = document.getElementById('cosmic-canvas-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'cosmic-canvas-container';
            container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;cursor:pointer;';
            document.body.prepend(container);
        }
        this.container = container;

        this.loadLogo();
        if (typeof THREE === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => { this.setupScene();
                this.animate();
                this.isReady = true; };
            document.head.appendChild(script);
            return;
        }
        this.setupScene();
        this.animate();
        this.isReady = true;
        window.addEventListener('resize', () => this.onResize());
        this.container.addEventListener('click', (e) => this.onCosmicClick(e));
        console.log('✅ Cosmic World ready!');
        return this;
    },

    loadLogo() {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const paths = ['assets/images/logo.png', 'logo.png', 'HalDo-AI-OS/assets/images/logo.png'];
        let currentPath = 0;
        const tryLoad = () => {
            if (currentPath >= paths.length) { console.warn('⚠️ Logo nicht gefunden'); return; }
            img.src = paths[currentPath];
        };
        img.onload = () => {
            console.log('✅ Logo geladen!');
            this.logoTexture = new THREE.Texture(img);
            if (this.sunMesh) {
                this.sunMesh.material.map = this.logoTexture;
                this.sunMesh.material.needsUpdate = true;
            }
        };
        img.onerror = () => { currentPath++;
            tryLoad(); };
        tryLoad();
    },

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 16, 40);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(0x222244, 0.5));
        const sunLight = new THREE.PointLight(0xffaa33, 2.5, 150);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
        const dirLight = new THREE.DirectionalLight(0x4466ff, 0.2);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);

        this.createSun();
        this.createPlanets();
        this.createStars(300);
        this.createNebula();
        this.clock = new THREE.Clock();

        // Living AI Container in der Sonne
        const avatarContainer = document.createElement('div');
        avatarContainer.id = 'living-ai-container';
        avatarContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 150px;
            height: 150px;
            z-index: 10;
            pointer-events: none;
            border-radius: 50%;
            overflow: hidden;
            background: radial-gradient(circle, rgba(108,60,225,0.15), transparent 70%);
            display: none;
        `;
        this.container.appendChild(avatarContainer);
        setTimeout(() => {
            if (typeof LivingAI !== 'undefined') {
                LivingAI.init('living-ai-container');
            }
        }, 600);
    },

    createSun() {
        const geo = new THREE.SphereGeometry(2.8, 64, 64);
        let mat = this.logoTexture ? new THREE.MeshStandardMaterial({
            map: this.logoTexture,
            emissive: 0xff6600,
            emissiveIntensity: 0.4,
            roughness: 0.2,
            metalness: 0.0
        }) : new THREE.MeshStandardMaterial({
            color: 0xff8800,
            emissive: 0xff4400,
            emissiveIntensity: 1.0,
            roughness: 0.2,
            metalness: 0.0
        });
        this.sunMesh = new THREE.Mesh(geo, mat);
        this.sunMesh.position.set(0, 0, 0);
        this.sunMesh.userData.isSun = true;
        this.scene.add(this.sunMesh);

        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(3.4, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.2, blending: THREE
                    .AdditiveBlending })
        );
        glow.position.set(0, 0, 0);
        this.scene.add(glow);
        this.sunGlow = glow;

        const outer = new THREE.Mesh(
            new THREE.SphereGeometry(4.6, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.06, blending: THREE
                    .AdditiveBlending })
        );
        outer.position.set(0, 0, 0);
        this.scene.add(outer);
        this.outerGlow = outer;
    },

    createPlanets() {
        const planets = [
            { name: 'Merkur', size: 0.22, distance: 4.0, color: 0xaaaaaa, speed: 0.04 },
            { name: 'Venus', size: 0.38, distance: 5.8, color: 0xffcc88, speed: 0.025 },
            { name: 'Erde', size: 0.42, distance: 7.6, color: 0x4488ff, speed: 0.018, hasMoon: true },
            { name: 'Mars', size: 0.34, distance: 9.4, color: 0xff4422, speed: 0.014 },
            { name: 'Jupiter', size: 1.0, distance: 12.0, color: 0xddbb88, speed: 0.009 },
            { name: 'Saturn', size: 0.85, distance: 15.0, color: 0xeeddbb, speed: 0.007 },
            { name: 'Uranus', size: 0.6, distance: 18.2, color: 0x88ddff, speed: 0.005 },
            { name: 'Neptun', size: 0.55, distance: 21.4, color: 0x3366ff, speed: 0.004 },
            { name: 'Pluto', size: 0.15, distance: 24.6, color: 0xccbbaa, speed: 0.003 },
            { name: 'Ceres', size: 0.12, distance: 27.0, color: 0xaa8866, speed: 0.0025 },
            { name: 'Haumea', size: 0.16, distance: 29.4, color: 0x88ccaa, speed: 0.002 },
            { name: 'Makemake', size: 0.14, distance: 31.8, color: 0xcc8866, speed: 0.0018 },
            { name: 'Eris', size: 0.18, distance: 34.2, color: 0x6699cc, speed: 0.0015 }
        ];

        this.planetData = [];
        planets.forEach((data, idx) => {
            const geo = new THREE.SphereGeometry(data.size, 32, 32);
            const mat = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.5, metalness: 0.1,
                emissive: data.color, emissiveIntensity: 0.02 });
            const mesh = new THREE.Mesh(geo, mat);
            const angle = (idx / planets.length) * Math.PI * 2 + Math.random() * 0.2;
            mesh.position.x = Math.cos(angle) * data.distance;
            mesh.position.z = Math.sin(angle) * data.distance;
            mesh.userData = { distance: data.distance, speed: data.speed, angle: angle, name: data.name,
                hasMoon: data.hasMoon || false };
            this.scene.add(mesh);

            const pts = [];
            for (let i = 0; i <= 80; i++) {
                const t = (i / 80) * Math.PI * 2;
                pts.push(new THREE.Vector3(Math.cos(t) * data.distance, 0, Math.sin(t) * data.distance));
            }
            const orbit = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color: data.color, transparent: true, opacity: 0.08 })
            );
            this.scene.add(orbit);

            if (data.hasMoon) {
                const moon = new THREE.Mesh(
                    new THREE.SphereGeometry(0.1, 16, 16),
                    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 })
                );
                moon.userData = { angle: 0, speed: 0.06, distance: 0.7 };
                mesh.add(moon);
                this.moon = moon;
            }
            this.planetData.push({ mesh, distance: data.distance, speed: data.speed, angle: angle, name: data.name,
                hasMoon: data.hasMoon || false });
        });
    },

    createStars(count = 300) {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 35 + Math.random() * 160,
                t = Math.random() * Math.PI * 2,
                p = Math.acos(2 * Math.random() - 1);
            pos[i * 3] = r * Math.sin(p) * Math.cos(t);
            pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
            pos[i * 3 + 2] = r * Math.cos(p);
            const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.25, 0.3, 0.6 + Math.random() * 0.4);
            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        this.starField = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.2, vertexColors: true,
            transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
        this.scene.add(this.starField);
    },

    createNebula() {
        const count = 800;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 18 + Math.random() * 60,
                t = Math.random() * Math.PI * 2,
                p = Math.acos(2 * Math.random() - 1);
            pos[i * 3] = r * Math.sin(p) * Math.cos(t);
            pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t) * 0.3;
            pos[i * 3 + 2] = r * Math.cos(p);
            const c = new THREE.Color().setHSL(0.65 + Math.random() * 0.25, 0.4, 0.1 + Math.random() * 0.15);
            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        this.nebula = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true,
            opacity: 0.05, blending: THREE.AdditiveBlending }));
        this.scene.add(this.nebula);
    },

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        if (!this.scene || !this.camera || !this.renderer) return;
        const time = this.clock ? this.clock.getElapsedTime() : Date.now() * 0.001;

        if (this.sunMesh) {
            this.sunMesh.rotation.y += 0.002;
            if (this.sunGlow) {
                const p = 1 + Math.sin(time * 0.6) * 0.04;
                this.sunGlow.scale.set(p, p, p);
                this.sunGlow.material.opacity = 0.2 + Math.sin(time * 0.5) * 0.04;
            }
            if (this.outerGlow) {
                const p2 = 1 + Math.sin(time * 0.3 + 1) * 0.05;
                this.outerGlow.scale.set(p2, p2, p2);
            }
        }

        if (this.planetData) {
            this.planetData.forEach(data => {
                data.angle += data.speed * 0.3;
                data.mesh.position.x = Math.cos(data.angle) * data.distance;
                data.mesh.position.z = Math.sin(data.angle) * data.distance;
                data.mesh.rotation.y += 0.015;
                if (data.hasMoon && this.moon) {
                    const md = this.moon.userData;
                    md.angle += md.speed;
                    this.moon.position.x = Math.cos(md.angle) * md.distance;
                    this.moon.position.z = Math.sin(md.angle) * md.distance;
                }
            });
        }

        if (this.starField) {
            const sz = this.starField.geometry.attributes.size;
            if (sz) {
                for (let i = 0; i < sz.count; i++) {
                    sz.array[i] = 0.12 + (0.25 + Math.sin(time * (0.5 + i * 0.007)) * 0.25) * 0.3;
                }
                sz.needsUpdate = true;
            }
        }

        if (this.camera) {
            const a = time * 0.01;
            this.camera.position.x = Math.sin(a) * 6;
            this.camera.position.z = 38 + Math.sin(a * 0.7) * 3;
            this.camera.position.y = 14 + Math.sin(a * 0.5) * 1.5;
            this.camera.lookAt(0, 0, 0);
        }

        this.renderer.render(this.scene, this.camera);
    },

    onCosmicClick(e) {
        if (!this.scene || !this.camera) return;
        const rect = this.container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 2 - 1;
        const y = -(e.clientY - rect.top) / rect.height * 2 + 1;
        const ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2(x, y), this.camera);
        const hits = ray.intersectObjects(this.scene.children, true);

        let hitSun = false,
            hitPlanet = null;
        for (let h of hits) {
            let obj = h.object;
            while (obj) {
                if (obj.userData && obj.userData.isSun) { hitSun = true; break; }
                if (obj.userData && obj.userData.name) { hitPlanet = obj.userData.name; break; }
                obj = obj.parent;
            }
            if (hitSun || hitPlanet) break;
        }

        if (hitSun) {
            console.log('☀️ Sonne geklickt – öffne HalDo AI!');
            AppManager.openApp('haldo-ai');
            return;
        }

        if (hitPlanet) {
            const info = this.planetInfo[hitPlanet];
            if (info) {
                alert(
                    `🪐 ${info.name}\n📏 Durchmesser: ${info.diameter}\n📡 Entfernung: ${info.distance}\n🌙 Monde: ${info.moons}\n✨ Besonderheit: ${info.fact}`
                    );
            } else {
                alert(`🪐 ${hitPlanet}\nEine faszinierende Welt im HalDo-Universum!`);
            }
            return;
        }
    },

    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
};
window.CosmicWorld = CosmicWorld;
