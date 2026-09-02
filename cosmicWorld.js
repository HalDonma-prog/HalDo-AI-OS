/**
 * HALDO AI OS 24.6.0 – COSMIC WORLD (V2.0.0)
 * Sonne als AI-Knoten mit Avatar-Integration
 */

const CosmicWorld = {
    // ... (bestehende Konfiguration) ...

    // ---- SONNE MIT AVATAR-INTEGRATION ----
    createSun() {
        // Sonne erstellen
        const geo = new THREE.SphereGeometry(3.2, 64, 64);
        let mat;
        if (this.logoTexture) {
            mat = new THREE.MeshStandardMaterial({
                map: this.logoTexture,
                emissive: 0xff6600,
                emissiveIntensity: 0.4,
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
        this.sunMesh = new THREE.Mesh(geo, mat);
        this.sunMesh.position.set(0, 0, 0);
        this.sunMesh.userData.isSun = true;
        this.scene.add(this.sunMesh);

        // Glow
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(3.8, 32, 32),
            new THREE.MeshBasicMaterial({
                color: 0xff6600,
                transparent: true,
                opacity: 0.25,
                blending: THREE.AdditiveBlending
            })
        );
        glow.position.set(0, 0, 0);
        this.scene.add(glow);
        this.sunGlow = glow;

        // Äußere Corona
        const outer = new THREE.Mesh(
            new THREE.SphereGeometry(5.2, 32, 32),
            new THREE.MeshBasicMaterial({
                color: 0xff4400,
                transparent: true,
                opacity: 0.08,
                blending: THREE.AdditiveBlending
            })
        );
        outer.position.set(0, 0, 0);
        this.scene.add(outer);
        this.outerGlow = outer;

        // ---- LIVING AI AVATAR ÜBER DER SONNE ----
        // Container für Living AI erstellen
        const avatarContainer = document.createElement('div');
        avatarContainer.id = 'living-ai-container';
        avatarContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 200px;
            z-index: 10;
            pointer-events: none;
        `;
        this.container.appendChild(avatarContainer);

        // Living AI initialisieren
        setTimeout(() => {
            if (typeof LivingAI !== 'undefined') {
                LivingAI.init('living-ai-container');
                // Auf System-Start warten
                EventBus.on('system:ready', () => {
                    LivingAI.wakeUp();
                });
            }
        }, 500);
    },

    // ... (restlicher Code) ...
};
