/* ============================================================
   HalDo AI OS 20
   HALDO COSMIC ENGINE
   ------------------------------------------------------------
   Version: 20.0.0
   Purpose:
   - Cosmic Main Menu background
   - Stars
   - Nebula atmosphere
   - Light particles
   - HalDo solar glow
   - Logo presence
   - Planet orbit foundation
   - Performance modes
   - Reduced motion
   - ON / OFF control
   ============================================================ */

(function (window, document) {
    "use strict";

    const VERSION = "20.0.0";

    class HalDoCosmicEngine {
        constructor(options = {}) {
            this.version = VERSION;

            this.options = {
                container: options.container || null,
                logoSrc: options.logoSrc || "assets/logo/logo.png",

                enabled: options.enabled !== false,

                mode: options.mode || "full",

                reducedMotion: options.reducedMotion === true,

                stars: options.stars !== false,
                particles: options.particles !== false,
                planets: options.planets !== false,
                backgroundLogo: options.backgroundLogo !== false,

                starCount: Number.isFinite(options.starCount)
                    ? options.starCount
                    : 180,

                particleCount: Number.isFinite(options.particleCount)
                    ? options.particleCount
                    : 45,

                planetCount: Number.isFinite(options.planetCount)
                    ? options.planetCount
                    : 5,

                animationSpeed: Number.isFinite(options.animationSpeed)
                    ? options.animationSpeed
                    : 1,

                ...options
            };

            this.state = {
                initialized: false,
                running: false,
                paused: false,
                mode: this.options.mode,
                enabled: this.options.enabled,
                reducedMotion: this.options.reducedMotion
            };

            this.elements = {
                root: null,
                sky: null,
                nebula: null,
                stars: null,
                particles: null,
                solar: null,
                backgroundLogo: null,
                logo: null,
                orbitLayer: null,
                planets: null
            };

            this.stars = [];
            this.particles = [];
            this.planets = [];

            this.animationFrame = null;
            this.lastFrame = 0;

            this.boundResize = this.handleResize.bind(this);
            this.boundVisibility = this.handleVisibility.bind(this);

            this.eventListeners = new Map();
        }

        /* --------------------------------------------------------
           INITIALIZATION
        -------------------------------------------------------- */

        init() {
            if (this.state.initialized) {
                return this;
            }

            const container = this.resolveContainer();

            if (!container) {
                console.warn(
                    "[HalDo Cosmic] Container konnte nicht gefunden werden."
                );

                return this;
            }

            this.elements.root = container;

            this.injectStyles();
            this.createStructure();

            this.applyMode();
            this.applyEnabledState();

            window.addEventListener("resize", this.boundResize);
            document.addEventListener(
                "visibilitychange",
                this.boundVisibility
            );

            this.state.initialized = true;

            this.emit("cosmic:initialized", {
                version: this.version
            });

            if (this.state.enabled) {
                this.start();
            }

            return this;
        }

        resolveContainer() {
            if (this.options.container instanceof HTMLElement) {
                return this.options.container;
            }

            if (typeof this.options.container === "string") {
                return document.querySelector(this.options.container);
            }

            return (
                document.querySelector("[data-haldo-cosmic]") ||
                document.querySelector("#haldo-cosmic-root") ||
                document.querySelector("#main-menu") ||
                document.body
            );
        }

        /* --------------------------------------------------------
           STRUCTURE
        -------------------------------------------------------- */

        createStructure() {
            const root = document.createElement("div");

            root.className = "haldo-cosmic-engine";
            root.setAttribute("aria-hidden", "true");

            root.innerHTML = `
                <div class="haldo-cosmic-sky"></div>

                <div class="haldo-cosmic-nebula"></div>

                <div class="haldo-cosmic-stars"></div>

                <div class="haldo-cosmic-particles"></div>

                <div class="haldo-cosmic-background-logo"></div>

                <div class="haldo-cosmic-solar">
                    <div class="haldo-cosmic-solar-core"></div>
                    <div class="haldo-cosmic-solar-halo"></div>
                    <div class="haldo-cosmic-solar-rays"></div>
                </div>

                <div class="haldo-cosmic-orbits"></div>

                <div class="haldo-cosmic-logo">
                    <img
                        src="${this.escapeAttribute(this.options.logoSrc)}"
                        alt="HalDo"
                        draggable="false"
                    >
                </div>
            `;

            root.style.position = "absolute";
            root.style.inset = "0";
            root.style.pointerEvents = "none";
            root.style.overflow = "hidden";
            root.style.zIndex = "0";

            this.elements.root.prepend(root);

            this.elements.sky =
                root.querySelector(".haldo-cosmic-sky");

            this.elements.nebula =
                root.querySelector(".haldo-cosmic-nebula");

            this.elements.stars =
                root.querySelector(".haldo-cosmic-stars");

            this.elements.particles =
                root.querySelector(".haldo-cosmic-particles");

            this.elements.backgroundLogo =
                root.querySelector(".haldo-cosmic-background-logo");

            this.elements.solar =
                root.querySelector(".haldo-cosmic-solar");

            this.elements.orbitLayer =
                root.querySelector(".haldo-cosmic-orbits");

            this.elements.logo =
                root.querySelector(".haldo-cosmic-logo");

            this.createStars();
            this.createParticles();
            this.createPlanets();
        }

        /* --------------------------------------------------------
           STARS
        -------------------------------------------------------- */

        createStars() {
            if (!this.options.stars || !this.elements.stars) {
                return;
            }

            this.elements.stars.innerHTML = "";
            this.stars = [];

            let count = this.options.starCount;

            if (this.options.mode === "balanced") {
                count = Math.round(count * 0.65);
            }

            if (this.options.mode === "minimal") {
                count = Math.round(count * 0.3);
            }

            if (this.state.reducedMotion) {
                count = Math.round(count * 0.5);
            }

            for (let i = 0; i < count; i++) {
                const star = document.createElement("span");

                const size =
                    Math.random() < 0.88
                        ? 1 + Math.random() * 2
                        : 2 + Math.random() * 3;

                const opacity =
                    0.35 + Math.random() * 0.65;

                star.className =
                    Math.random() < 0.1
                        ? "haldo-cosmic-star haldo-cosmic-star-bright"
                        : "haldo-cosmic-star";

                star.style.left =
                    `${Math.random() * 100}%`;

                star.style.top =
                    `${Math.random() * 100}%`;

                star.style.width =
                    `${size}px`;

                star.style.height =
                    `${size}px`;

                star.style.opacity =
                    opacity.toFixed(2);

                star.style.animationDelay =
                    `${Math.random() * 8}s`;

                star.style.animationDuration =
                    `${4 + Math.random() * 7}s`;

                this.elements.stars.appendChild(star);

                this.stars.push(star);
            }
        }

        /* --------------------------------------------------------
           LIGHT PARTICLES
        -------------------------------------------------------- */

        createParticles() {
            if (!this.options.particles || !this.elements.particles) {
                return;
            }

            this.elements.particles.innerHTML = "";
            this.particles = [];

            let count = this.options.particleCount;

            if (this.options.mode === "balanced") {
                count = Math.round(count * 0.65);
            }

            if (this.options.mode === "minimal") {
                count = Math.round(count * 0.25);
            }

            if (this.state.reducedMotion) {
                count = Math.round(count * 0.35);
            }

            for (let i = 0; i < count; i++) {
                const particle = document.createElement("span");

                particle.className =
                    "haldo-cosmic-particle";

                particle.style.left =
                    `${Math.random() * 100}%`;

                particle.style.top =
                    `${Math.random() * 100}%`;

                particle.style.animationDelay =
                    `${Math.random() * 10}s`;

                particle.style.animationDuration =
                    `${8 + Math.random() * 14}s`;

                this.elements.particles.appendChild(particle);

                this.particles.push(particle);
            }
        }

        /* --------------------------------------------------------
           PLANETS
        -------------------------------------------------------- */

        createPlanets() {
            if (!this.options.planets || !this.elements.orbitLayer) {
                return;
            }

            this.elements.orbitLayer.innerHTML = "";
            this.planets = [];

            let count = this.options.planetCount;

            if (this.options.mode === "balanced") {
                count = Math.min(count, 4);
            }

            if (this.options.mode === "minimal") {
                count = Math.min(count, 2);
            }

            for (let i = 0; i < count; i++) {
                const orbit = document.createElement("div");
                const planet = document.createElement("div");

                const orbitSize =
                    220 + i * 95;

                const planetSize =
                    Math.max(10, 24 - i * 2);

                orbit.className =
                    "haldo-cosmic-orbit";

                planet.className =
                    "haldo-cosmic-planet";

                orbit.style.width =
                    `${orbitSize}px`;

                orbit.style.height =
                    `${orbitSize}px`;

                planet.style.width =
                    `${planetSize}px`;

                planet.style.height =
                    `${planetSize}px`;

                const duration =
                    18 + i * 9;

                orbit.style.animationDuration =
                    `${duration}s`;

                orbit.style.animationDelay =
                    `${-(Math.random() * duration)}s`;

                planet.style.animationDuration =
                    `${5 + i * 1.5}s`;

                planet.style.animationDelay =
                    `${-(Math.random() * 5)}s`;

                orbit.appendChild(planet);
                this.elements.orbitLayer.appendChild(orbit);

                this.planets.push({
                    orbit,
                    planet
                });
            }
        }

        /* --------------------------------------------------------
           MODES
        -------------------------------------------------------- */

        setMode(mode) {
            const allowed = [
                "full",
                "balanced",
                "minimal",
                "off"
            ];

            if (!allowed.includes(mode)) {
                mode = "full";
            }

            this.state.mode = mode;
            this.options.mode = mode;

            this.applyMode();

            this.emit("cosmic:mode-changed", {
                mode
            });

            return this;
        }

        applyMode() {
            if (!this.elements.root) {
                return;
            }

            this.elements.root.dataset.mode =
                this.state.mode;

            if (this.state.mode === "off") {
                this.elements.root.classList.add(
                    "haldo-cosmic-disabled"
                );

                return;
            }

            this.elements.root.classList.remove(
                "haldo-cosmic-disabled"
            );

            if (this.state.initialized) {
                this.createStars();
                this.createParticles();
                this.createPlanets();
            }
        }

        setEnabled(enabled) {
            this.state.enabled = Boolean(enabled);

            this.applyEnabledState();

            this.emit("cosmic:enabled-changed", {
                enabled: this.state.enabled
            });

            return this;
        }

        applyEnabledState() {
            if (!this.elements.root) {
                return;
            }

            this.elements.root.classList.toggle(
                "haldo-cosmic-disabled",
                !this.state.enabled ||
                this.state.mode === "off"
            );
        }

        setReducedMotion(enabled) {
            this.state.reducedMotion =
                Boolean(enabled);

            if (this.elements.root) {
                this.elements.root.classList.toggle(
                    "haldo-cosmic-reduced-motion",
                    this.state.reducedMotion
                );
            }

            this.createStars();
            this.createParticles();

            this.emit("cosmic:reduced-motion-changed", {
                enabled: this.state.reducedMotion
            });

            return this;
        }

        /* --------------------------------------------------------
           START / STOP
        -------------------------------------------------------- */

        start() {
            if (!this.state.initialized) {
                this.init();
                return this;
            }

            if (!this.state.enabled ||
                this.state.mode === "off") {
                return this;
            }

            if (this.state.running) {
                return this;
            }

            this.state.running = true;
            this.state.paused = false;

            this.elements.root.classList.add(
                "haldo-cosmic-running"
            );

            this.emit("cosmic:started");

            return this;
        }

        stop() {
            if (!this.state.running) {
                return this;
            }

            this.state.running = false;
            this.state.paused = false;

            if (this.elements.root) {
                this.elements.root.classList.remove(
                    "haldo-cosmic-running"
                );
            }

            this.emit("cosmic:stopped");

            return this;
        }

        pause() {
            if (!this.state.running) {
                return this;
            }

            this.state.paused = true;

            if (this.elements.root) {
                this.elements.root.classList.add(
                    "haldo-cosmic-paused"
                );
            }

            this.emit("cosmic:paused");

            return this;
        }

        resume() {
            if (!this.state.running) {
                return this.start();
            }

            this.state.paused = false;

            if (this.elements.root) {
                this.elements.root.classList.remove(
                    "haldo-cosmic-paused"
                );
            }

            this.emit("cosmic:resumed");

            return this;
        }

        /* --------------------------------------------------------
           VISIBILITY / PERFORMANCE
        -------------------------------------------------------- */

        handleVisibility() {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        }

        handleResize() {
            this.emit("cosmic:resize", {
                width: window.innerWidth,
                height: window.innerHeight
            });
        }

        /* --------------------------------------------------------
           CUSTOM EVENTS
        -------------------------------------------------------- */

        on(eventName, callback) {
            if (typeof callback !== "function") {
                return this;
            }

            if (!this.eventListeners.has(eventName)) {
                this.eventListeners.set(
                    eventName,
                    new Set()
                );
            }

            this.eventListeners
                .get(eventName)
                .add(callback);

            return this;
        }

        off(eventName, callback) {
            const listeners =
                this.eventListeners.get(eventName);

            if (!listeners) {
                return this;
            }

            listeners.delete(callback);

            if (listeners.size === 0) {
                this.eventListeners.delete(eventName);
            }

            return this;
        }

        emit(eventName, detail = {}) {
            const listeners =
                this.eventListeners.get(eventName);

            if (listeners) {
                listeners.forEach(callback => {
                    try {
                        callback(detail);
                    } catch (error) {
                        console.error(
                            `[HalDo Cosmic] Event error: ${eventName}`,
                            error
                        );
                    }
                });
            }

            try {
                window.dispatchEvent(
                    new CustomEvent(
                        `haldo:${eventName}`,
                        {
                            detail
                        }
                    )
                );
            } catch (error) {
                console.warn(
                    "[HalDo Cosmic] CustomEvent konnte nicht gesendet werden.",
                    error
                );
            }

            return this;
        }

        /* --------------------------------------------------------
           CSS
        -------------------------------------------------------- */

        injectStyles() {
            if (document.getElementById(
                "haldo-cosmic-engine-style"
            )) {
                return;
            }

            const style =
                document.createElement("style");

            style.id =
                "haldo-cosmic-engine-style";

            style.textContent = `
                .haldo-cosmic-engine {
                    --haldo-cosmic-speed: 1;
                    isolation: isolate;
                    background:
                        radial-gradient(
                            circle at 50% 48%,
                            rgba(255, 244, 210, 0.16) 0%,
                            rgba(80, 120, 255, 0.10) 18%,
                            rgba(30, 20, 90, 0.20) 42%,
                            rgba(4, 7, 30, 0.65) 72%,
                            rgba(1, 2, 12, 0.92) 100%
                        );
                    transition:
                        opacity 700ms ease,
                        filter 700ms ease;
                }

                .haldo-cosmic-sky,
                .haldo-cosmic-nebula,
                .haldo-cosmic-stars,
                .haldo-cosmic-particles,
                .haldo-cosmic-background-logo,
                .haldo-cosmic-solar,
                .haldo-cosmic-orbits,
                .haldo-cosmic-logo {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .haldo-cosmic-sky {
                    z-index: 0;
                    background:
                        radial-gradient(
                            ellipse at 25% 30%,
                            rgba(55, 110, 255, 0.22),
                            transparent 34%
                        ),
                        radial-gradient(
                            ellipse at 75% 25%,
                            rgba(150, 80, 255, 0.18),
                            transparent 32%
                        ),
                        radial-gradient(
                            ellipse at 50% 75%,
                            rgba(20, 210, 210, 0.10),
                            transparent 38%
                        );
                    animation:
                        haldoCosmicSkyDrift
                        30s ease-in-out infinite alternate;
                }

                .haldo-cosmic-nebula {
                    z-index: 1;
                    opacity: 0.8;
                    background:
                        radial-gradient(
                            ellipse at 35% 55%,
                            rgba(90, 70, 255, 0.16),
                            transparent 40%
                        ),
                        radial-gradient(
                            ellipse at 68% 58%,
                            rgba(0, 220, 220, 0.12),
                            transparent 38%
                        );
                    filter: blur(45px);
                    animation:
                        haldoCosmicNebula
                        42s ease-in-out infinite alternate;
                }

                .haldo-cosmic-stars {
                    z-index: 2;
                }

                .haldo-cosmic-star {
                    position: absolute;
                    display: block;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.95);
                    box-shadow:
                        0 0 4px rgba(255,255,255,0.8),
                        0 0 10px rgba(160,210,255,0.45);
                    animation:
                        haldoCosmicTwinkle
                        6s ease-in-out infinite;
                }

                .haldo-cosmic-star-bright {
                    box-shadow:
                        0 0 6px rgba(255,255,255,1),
                        0 0 18px rgba(150,210,255,0.85),
                        0 0 32px rgba(100,150,255,0.35);
                }

                .haldo-cosmic-particles {
                    z-index: 3;
                }

                .haldo-cosmic-particle {
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.7);
                    box-shadow:
                        0 0 8px rgba(180,220,255,0.9);
                    animation:
                        haldoCosmicParticle
                        12s linear infinite;
                }

                .haldo-cosmic-background-logo {
                    z-index: 4;
                    opacity: 0.035;
                    background:
                        url("assets/logo/logo.png")
                        center / min(65vw, 700px)
                        no-repeat;
                    filter: blur(1px);
                    transform: scale(1.08);
                    animation:
                        haldoCosmicBackgroundLogo
                        12s ease-in-out infinite;
                }

                .haldo-cosmic-solar {
                    z-index: 5;
                    display: grid;
                    place-items: center;
                }

                .haldo-cosmic-solar-core {
                    width: min(34vw, 380px);
                    height: min(34vw, 380px);
                    border-radius: 50%;
                    background:
                        radial-gradient(
                            circle,
                            rgba(255,255,255,0.18),
                            rgba(255,220,120,0.08) 28%,
                            transparent 70%
                        );
                    filter: blur(10px);
                    animation:
                        haldoSolarPulse
                        6s ease-in-out infinite;
                }

                .haldo-cosmic-solar-halo {
                    position: absolute;
                    width: min(58vw, 680px);
                    height: min(58vw, 680px);
                    border-radius: 50%;
                    background:
                        radial-gradient(
                            circle,
                            transparent 42%,
                            rgba(255,220,140,0.06) 53%,
                            rgba(120,180,255,0.03) 65%,
                            transparent 72%
                        );
                    filter: blur(10px);
                }

                .haldo-cosmic-logo {
                    z-index: 8;
                    display: grid;
                    place-items: center;
                }

                .haldo-cosmic-logo img {
                    width: min(28vw, 300px);
                    height: auto;
                    max-height: 38vh;
                    object-fit: contain;
                    filter:
                        drop-shadow(
                            0 0 10px rgba(255,255,255,0.55)
                        )
                        drop-shadow(
                            0 0 30px rgba(120,190,255,0.45)
                        );
                    animation:
                        haldoLogoBreathing
                        5s ease-in-out infinite;
                    user-select: none;
                }

                .haldo-cosmic-orbits {
                    z-index: 7;
                    display: grid;
                    place-items: center;
                }

                .haldo-cosmic-orbit {
                    position: absolute;
                    border: 1px solid rgba(190,220,255,0.12);
                    border-radius: 50%;
                    transform-origin: center;
                    animation:
                        haldoPlanetOrbit
                        25s linear infinite;
                }

                .haldo-cosmic-planet {
                    position: absolute;
                    left: 50%;
                    top: 0;
                    transform:
                        translate(-50%, -50%);
                    border-radius: 50%;
                    background:
                        radial-gradient(
                            circle at 35% 30%,
                            rgba(255,255,255,0.9),
                            rgba(120,170,255,0.65) 28%,
                            rgba(50,70,150,0.75) 70%,
                            rgba(10,15,55,0.95) 100%
                        );
                    box-shadow:
                        0 0 12px rgba(150,200,255,0.55);
                }

                .haldo-cosmic-disabled {
                    opacity: 0 !important;
                    visibility: hidden !important;
                }

                .haldo-cosmic-paused *,
                .haldo-cosmic-reduced-motion * {
                    animation-play-state: paused !important;
                }

                .haldo-cosmic-reduced-motion .haldo-cosmic-logo img {
                    animation: none;
                }

                @keyframes haldoCosmicTwinkle {
                    0%, 100% {
                        opacity: 0.35;
                        transform: scale(0.85);
                    }

                    50% {
                        opacity: 1;
                        transform: scale(1.15);
                    }
                }

                @keyframes haldoCosmicParticle {
                    0% {
                        transform:
                            translate3d(0, 12px, 0);
                        opacity: 0;
                    }

                    15% {
                        opacity: 0.7;
                    }

                    85% {
                        opacity: 0.5;
                    }

                    100% {
                        transform:
                            translate3d(
                                20px,
                                -45px,
                                0
                            );
                        opacity: 0;
                    }
                }

                @keyframes haldoCosmicSkyDrift {
                    from {
                        transform: scale(1);
                    }

                    to {
                        transform: scale(1.06);
                    }
                }

                @keyframes haldoCosmicNebula {
                    from {
                        transform:
                            translate3d(-1%, 0, 0)
                            scale(1);
                    }

                    to {
                        transform:
                            translate3d(1%, -1%, 0)
                            scale(1.06);
                    }
                }

                @keyframes haldoCosmicBackgroundLogo {
                    0%, 100% {
                        opacity: 0.025;
                        transform: scale(1.08);
                    }

                    50% {
                        opacity: 0.045;
                        transform: scale(1.12);
                    }
                }

                @keyframes haldoSolarPulse {
                    0%, 100% {
                        transform: scale(0.94);
                        opacity: 0.7;
                    }

                    50% {
                        transform: scale(1.06);
                        opacity: 1;
                    }
                }

                @keyframes haldoLogoBreathing {
                    0%, 100% {
                        transform:
                            translateY(0)
                            scale(0.985);
                    }

                    50% {
                        transform:
                            translateY(-3px)
                            scale(1.015);
                    }
                }

                @keyframes haldoPlanetOrbit {
                    from {
                        transform:
                            rotate(0deg);
                    }

                    to {
                        transform:
                            rotate(360deg);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .haldo-cosmic-engine *,
                    .haldo-cosmic-engine {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                    }
                }
            `;

            document.head.appendChild(style);
        }

        /* --------------------------------------------------------
           UTILITY
        -------------------------------------------------------- */

        escapeAttribute(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        }

        destroy() {
            this.stop();

            window.removeEventListener(
                "resize",
                this.boundResize
            );

            document.removeEventListener(
                "visibilitychange",
                this.boundVisibility
            );

            if (this.elements.root) {
                const engine =
                    this.elements.root.querySelector(
                        ".haldo-cosmic-engine"
                    );

                if (engine) {
                    engine.remove();
                }
            }

            this.eventListeners.clear();

            this.elements = {
                root: null,
                sky: null,
                nebula: null,
                stars: null,
                particles: null,
                solar: null,
                backgroundLogo: null,
                logo: null,
                orbitLayer: null,
                planets: null
            };

            this.state.initialized = false;
            this.state.running = false;

            this.emit("cosmic:destroyed");
        }
    }

    /* ============================================================
       GLOBAL HALDO API
       ============================================================ */

    window.HalDoCosmicEngine =
        HalDoCosmicEngine;

    /*
     * Nur erstellen, wenn noch keine Instanz vorhanden ist.
     * Dadurch wird eine bestehende HalDo-Instanz nicht überschrieben.
     */

    if (!window.HalDoCosmic) {
        window.HalDoCosmic =
            new HalDoCosmicEngine({
                logoSrc: "assets/logo/logo.png",
                mode: "full",
                enabled: true
            });
    }

    /*
     * Automatischer Start nach DOM-Aufbau.
     */

    const bootCosmic = () => {
        try {
            if (window.HalDoCosmic) {
                window.HalDoCosmic.init();
            }
        } catch (error) {
            console.error(
                "[HalDo Cosmic] Initialisierung fehlgeschlagen:",
                error
            );
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            bootCosmic,
            { once: true }
        );
    } else {
        bootCosmic();
    }

})(window, document);