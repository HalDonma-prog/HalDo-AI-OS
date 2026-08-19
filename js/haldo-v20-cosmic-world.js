/* ============================================================
   HalDo AI OS 20
   Cosmic World Engine
   ------------------------------------------------------------
   Lebendiges Sonnensystem für die HalDo OS Shell.

   Funktionen:
   - Sonne
   - HalDo Logo in der Sonne
   - Erde + Mond
   - zusätzliche Planeten
   - individuelle Umlaufbahnen
   - individuelle Richtungen
   - individuelle Geschwindigkeiten
   - individuelle Rotation
   - leuchtende Sterne
   - Galaxien / Nebel
   - klickbare Sonne
   - responsive Darstellung
   - Event-System-Kompatibilität
   ============================================================ */

(function (window, document) {
    "use strict";

    const VERSION = "20.0.0-cosmic";

    const state = {
        running: false,
        paused: false,
        initialized: false,
        animationFrame: null,
        lastTime: 0,
        elapsed: 0,
        sunClicks: 0
    };

    const planets = [
        {
            id: "mercury",
            name: "Mercury",
            radius: 3,
            orbitX: 105,
            orbitY: 48,
            angle: 0.3,
            speed: 0.00055,
            direction: 1,
            rotation: 0.012,
            colorA: "#d7c7b0",
            colorB: "#8e7963",
            glow: "#d8c6ad"
        },
        {
            id: "venus",
            name: "Venus",
            radius: 5,
            orbitX: 145,
            orbitY: 67,
            angle: 1.8,
            speed: 0.00037,
            direction: -1,
            rotation: -0.008,
            colorA: "#ffe2a3",
            colorB: "#c78642",
            glow: "#ffd47b"
        },
        {
            id: "earth",
            name: "Earth",
            radius: 7,
            orbitX: 195,
            orbitY: 88,
            angle: 3.2,
            speed: 0.00027,
            direction: 1,
            rotation: 0.016,
            colorA: "#55c7ff",
            colorB: "#2566d4",
            glow: "#49bfff",
            moon: true
        },
        {
            id: "mars",
            name: "Mars",
            radius: 6,
            orbitX: 240,
            orbitY: 108,
            angle: 5.4,
            speed: 0.00021,
            direction: -1,
            rotation: 0.011,
            colorA: "#ff8064",
            colorB: "#9f301e",
            glow: "#ff664d"
        },
        {
            id: "jupiter",
            name: "Jupiter",
            radius: 15,
            orbitX: 315,
            orbitY: 145,
            angle: 0.9,
            speed: 0.00013,
            direction: 1,
            rotation: 0.023,
            colorA: "#f2d1a1",
            colorB: "#a16d4c",
            glow: "#e3ad77"
        },
        {
            id: "saturn",
            name: "Saturn",
            radius: 12,
            orbitX: 390,
            orbitY: 177,
            angle: 4.2,
            speed: 0.000095,
            direction: -1,
            rotation: 0.019,
            colorA: "#f3d99c",
            colorB: "#b38c52",
            glow: "#f4d38b",
            rings: true
        },
        {
            id: "uranus",
            name: "Uranus",
            radius: 9,
            orbitX: 460,
            orbitY: 210,
            angle: 2.2,
            speed: 0.000073,
            direction: 1,
            rotation: 0.009,
            colorA: "#a9f4ff",
            colorB: "#3f9fae",
            glow: "#8cecff"
        },
        {
            id: "neptune",
            name: "Neptune",
            radius: 10,
            orbitX: 530,
            orbitY: 245,
            angle: 5.8,
            speed: 0.000058,
            direction: -1,
            rotation: 0.014,
            colorA: "#639dff",
            colorB: "#2448a5",
            glow: "#5d8cff"
        },
        {
            id: "pluto",
            name: "Pluto",
            radius: 4,
            orbitX: 600,
            orbitY: 280,
            angle: 1.1,
            speed: 0.000037,
            direction: 1,
            rotation: 0.006,
            colorA: "#d5c1ad",
            colorB: "#776052",
            glow: "#c7a98c"
        }
    ];

    const stars = [];
    const STAR_COUNT = 220;

    let root = null;
    let scene = null;
    let starLayer = null;
    let galaxyLayer = null;
    let orbitLayer = null;
    let planetLayer = null;
    let sun = null;

    function qs(selector, parent = document) {
        return parent.querySelector(selector);
    }

    function createElement(tag, className, parent) {
        const el = document.createElement(tag);

        if (className) {
            el.className = className;
        }

        if (parent) {
            parent.appendChild(el);
        }

        return el;
    }

    function createStars() {
        stars.length = 0;

        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2.7 + 0.3,
                alpha: Math.random() * 0.8 + 0.2,
                pulse: Math.random() * 0.005 + 0.001,
                phase: Math.random() * Math.PI * 2,
                drift: (Math.random() - 0.5) * 0.002
            });
        }

        stars.forEach((star) => {
            const el = createElement("div", "haldo-cosmic-star", starLayer);

            el.style.left = `${star.x}%`;
            el.style.top = `${star.y}%`;
            el.style.width = `${star.size}px`;
            el.style.height = `${star.size}px`;
            el.style.opacity = star.alpha;
        });
    }

    function createGalaxies() {
        const galaxies = [
            {
                left: "8%",
                top: "15%",
                width: "280px",
                height: "170px",
                rotation: "-22deg"
            },
            {
                left: "72%",
                top: "12%",
                width: "340px",
                height: "200px",
                rotation: "18deg"
            },
            {
                left: "65%",
                top: "68%",
                width: "300px",
                height: "160px",
                rotation: "-14deg"
            },
            {
                left: "12%",
                top: "70%",
                width: "250px",
                height: "140px",
                rotation: "27deg"
            }
        ];

        galaxies.forEach((data, index) => {
            const galaxy = createElement(
                "div",
                `haldo-cosmic-galaxy galaxy-${index + 1}`,
                galaxyLayer
            );

            Object.assign(galaxy.style, {
                left: data.left,
                top: data.top,
                width: data.width,
                height: data.height,
                transform: `rotate(${data.rotation})`
            });
        });
    }

    function createOrbit(planet) {
        const orbit = createElement(
            "div",
            "haldo-cosmic-orbit",
            orbitLayer
        );

        orbit.dataset.planet = planet.id;

        Object.assign(orbit.style, {
            width: `${planet.orbitX * 2}px`,
            height: `${planet.orbitY * 2}px`
        });

        return orbit;
    }

    function createPlanet(planet) {
        const orbit = createOrbit(planet);

        const body = createElement(
            "button",
            "haldo-cosmic-planet",
            planetLayer
        );

        body.type = "button";
        body.dataset.planet = planet.id;
        body.setAttribute("aria-label", planet.name);

        body.style.setProperty("--planet-a", planet.colorA);
        body.style.setProperty("--planet-b", planet.colorB);
        body.style.setProperty("--planet-glow", planet.glow);
        body.style.width = `${planet.radius * 2}px`;
        body.style.height = `${planet.radius * 2}px`;

        if (planet.rings) {
            const rings = createElement(
                "span",
                "haldo-planet-rings",
                body
            );

            rings.setAttribute("aria-hidden", "true");
        }

        if (planet.moon) {
            const moonOrbit = createElement(
                "span",
                "haldo-moon-orbit",
                body
            );

            const moon = createElement(
                "span",
                "haldo-moon",
                moonOrbit
            );

            moon.setAttribute("aria-hidden", "true");
        }

        body.addEventListener("click", () => {
            emit("cosmic:planet:selected", {
                id: planet.id,
                name: planet.name
            });

            showPlanetInfo(planet);
        });

        planet._orbitElement = orbit;
        planet._bodyElement = body;
    }

    function createSun() {
        sun = createElement(
            "button",
            "haldo-cosmic-sun",
            scene
        );

        sun.type = "button";
        sun.id = "haldo-cosmic-sun";
        sun.setAttribute(
            "aria-label",
            "HalDo AI OS öffnen"
        );

        const corona = createElement(
            "span",
            "haldo-sun-corona",
            sun
        );

        const fire = createElement(
            "span",
            "haldo-sun-fire",
            sun
        );

        const logo = createElement(
            "img",
            "haldo-sun-logo",
            sun
        );

        logo.alt = "HalDo AI OS";
        logo.src =
            "assets/logo/logo.png";

        logo.onerror = function () {
            this.src = "logo.png";
        };

        const core = createElement(
            "span",
            "haldo-sun-core",
            sun
        );

        core.appendChild(logo);

        sun.addEventListener("click", handleSunClick);

        sun.addEventListener("keydown", (event) => {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                handleSunClick();
            }
        });

        void corona;
        void fire;
    }

    function handleSunClick() {
        state.sunClicks++;

        emit("haldo:sun:activated", {
            clicks: state.sunClicks,
            source: "cosmic-sun"
        });

        const commands = [
            "ai-chat",
            "home",
            "haldo-ai"
        ];

        if (
            window.HalDoAppRouter &&
            typeof window.HalDoAppRouter.open === "function"
        ) {
            window.HalDoAppRouter.open("ai-chat");
            return;
        }

        if (
            window.HalDoAppManager &&
            typeof window.HalDoAppManager.openApp === "function"
        ) {
            window.HalDoAppManager.openApp("ai-chat");
            return;
        }

        if (
            window.HalDoAppRuntime &&
            typeof window.HalDoAppRuntime.openApp === "function"
        ) {
            window.HalDoAppRuntime.openApp("ai-chat");
            return;
        }

        const menu =
            document.querySelector(
                "#haldo-app-menu, #app-menu, .haldo-app-menu"
            );

        if (menu) {
            menu.classList.add("is-open");
        }

        void commands;
    }

    function emit(eventName, detail = {}) {
        try {
            if (
                window.HalDoKernel &&
                window.HalDoKernel.events &&
                typeof window.HalDoKernel.events.emit === "function"
            ) {
                window.HalDoKernel.events.emit(
                    eventName,
                    detail
                );
            }
        } catch (error) {
            console.warn(
                "[HalDo Cosmic] Kernel event failed:",
                error
            );
        }

        try {
            document.dispatchEvent(
                new CustomEvent(
                    eventName,
                    { detail }
                )
            );
        } catch (error) {
            console.warn(
                "[HalDo Cosmic] DOM event failed:",
                error
            );
        }
    }

    function showPlanetInfo(planet) {
        const existing =
            document.querySelector(
                ".haldo-cosmic-planet-info"
            );

        if (existing) {
            existing.remove();
        }

        const panel = createElement(
            "div",
            "haldo-cosmic-planet-info",
            root
        );

        const title = createElement(
            "strong",
            null,
            panel
        );

        title.textContent = planet.name;

        const description = createElement(
            "span",
            null,
            panel
        );

        description.textContent =
            `${planet.name} • lebendige Umlaufbahn`;

        const close = createElement(
            "button",
            null,
            panel
        );

        close.type = "button";
        close.textContent = "×";

        close.addEventListener(
            "click",
            () => panel.remove()
        );

        setTimeout(() => {
            panel.classList.add("is-visible");
        }, 20);
    }

    function updateStars(time) {
        const elements =
            starLayer
                ? starLayer.children
                : [];

        stars.forEach((star, index) => {
            const element = elements[index];

            if (!element) {
                return;
            }

            const pulse =
                0.55 +
                Math.sin(
                    time * star.pulse +
                    star.phase
                ) *
                0.45;

            element.style.opacity =
                Math.max(
                    0.12,
                    Math.min(
                        1,
                        star.alpha * pulse
                    )
                );
        });
    }

    function updatePlanets(delta) {
        planets.forEach((planet) => {
            planet.angle +=
                delta *
                planet.speed *
                planet.direction;

            const x =
                Math.cos(planet.angle) *
                planet.orbitX;

            const y =
                Math.sin(planet.angle) *
                planet.orbitY;

            if (planet._bodyElement) {
                planet._bodyElement.style.transform =
                    `translate3d(${x}px, ${y}px, 0) rotate(${planet.angle * planet.rotation * 100}px)`;
            }
        });
    }

    function animationLoop(timestamp) {
        if (!state.running) {
            return;
        }

        if (!state.lastTime) {
            state.lastTime = timestamp;
        }

        const delta =
            timestamp -
            state.lastTime;

        state.lastTime = timestamp;
        state.elapsed += delta;

        if (!state.paused) {
            updateStars(timestamp);
            updatePlanets(delta);
        }

        state.animationFrame =
            requestAnimationFrame(
                animationLoop
            );
    }

    function build() {
        if (state.initialized) {
            return;
        }

        root =
            document.querySelector(
                "#haldo-cosmic-world"
            ) ||
            document.querySelector(
                ".cosmic-world"
            ) ||
            document.body;

        if (!root) {
            return;
        }

        root.classList.add(
            "haldo-cosmic-world-root"
        );

        scene = createElement(
            "div",
            "haldo-cosmic-scene",
            root
        );

        galaxyLayer = createElement(
            "div",
            "haldo-cosmic-galaxies",
            scene
        );

        starLayer = createElement(
            "div",
            "haldo-cosmic-stars",
            scene
        );

        orbitLayer = createElement(
            "div",
            "haldo-cosmic-orbits",
            scene
        );

        planetLayer = createElement(
            "div",
            "haldo-cosmic-planets",
            scene
        );

        createGalaxies();
        createStars();
        createSun();

        planets.forEach(
            createPlanet
        );

        state.initialized = true;
    }

    function start() {
        build();

        if (state.running) {
            return;
        }

        state.running = true;
        state.paused = false;
        state.lastTime = 0;

        state.animationFrame =
            requestAnimationFrame(
                animationLoop
            );

        emit(
            "cosmic:started",
            {
                version: VERSION
            }
        );
    }

    function stop() {
        state.running = false;

        if (state.animationFrame) {
            cancelAnimationFrame(
                state.animationFrame
            );
        }

        state.animationFrame = null;
    }

    function pause() {
        state.paused = true;
    }

    function resume() {
        state.paused = false;
    }

    const API = {
        version: VERSION,
        state,
        planets,
        start,
        stop,
        pause,
        resume,
        build
    };

    window.HalDoCosmicWorld = API;

    function boot() {
        start();
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            boot,
            { once: true }
        );
    } else {
        boot();
    }

})(window, document);