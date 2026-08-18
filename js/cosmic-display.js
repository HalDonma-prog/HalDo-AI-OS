/* ============================================================
   HALDO AI OS 20
   COSMIC DISPLAY ENGINE
   ------------------------------------------------------------
   Datei:
       /js/cosmic-display.js

   Version:
       20.1.0

   Aufgabe:
   - Cosmic Desktop
   - Sonne
   - Planeten
   - Erde
   - Mond
   - Sterne
   - kompaktes Seitenmenü
   - responsive Geräte
   - Touch / Mouse
   - App Launcher
   - App Display
   - App Window Layer
   - Zurück / Schließen / Minimieren
   - Verbindung zu HalDoAppManager
   - Verbindung zu HalDoOS
   ============================================================ */

"use strict";

(function (window, document) {

    /* ========================================================
       01 — FOUNDATION
       ======================================================== */

    window.HalDoOS = window.HalDoOS || {};

    const HalDoOS = window.HalDoOS;

    const VERSION = "20.1.0";
    const MODULE_ID = "cosmic-display";


    /* ========================================================
       02 — STATE
       ======================================================== */

    const state = {

        initialized: false,
        ready: false,

        menuOpen: false,

        activeAppId: null,

        stars: [],
        planets: [],

        animationFrame: null,

        reducedMotion: false,

        elements: {

            root: null,
            universe: null,
            stars: null,
            sun: null,
            planets: null,
            menu: null,
            menuButton: null,
            menuContent: null,
            appLayer: null,
            appWindow: null,
            appContent: null,
            appTitle: null

        }

    };


    /* ========================================================
       03 — HELPERS
       ======================================================== */

    function qs(selector, root = document) {
        return root.querySelector(selector);
    }


    function createElement(
        tag,
        className = "",
        parent = null
    ) {

        const element =
            document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (parent) {
            parent.appendChild(element);
        }

        return element;
    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getAppManager() {

        return (
            window.HalDoAppManager ||
            window.HalDoOSAppManager ||
            HalDoOS.appManager ||
            null
        );

    }


    function getApps() {

        const manager =
            getAppManager();

        if (
            manager &&
            typeof manager.getApps === "function"
        ) {

            try {
                return manager.getApps() || [];
            } catch (_) {}

        }

        if (
            manager &&
            typeof manager.getAll === "function"
        ) {

            try {
                return manager.getAll() || [];
            } catch (_) {}

        }

        return [];

    }


    /* ========================================================
       04 — STYLE
       ======================================================== */

    function injectStyles() {

        if (
            document.getElementById(
                "haldo-cosmic-display-style"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "haldo-cosmic-display-style";

        style.textContent = `

/* ==========================================================
   HALDO COSMIC DISPLAY
   ========================================================== */

.haldo-cosmic-root {

    position: fixed;
    inset: 0;

    width: 100vw;
    height: 100dvh;

    overflow: hidden;

    background:
        radial-gradient(
            circle at 50% 45%,
            rgba(255,255,255,.07),
            transparent 28%
        ),
        radial-gradient(
            circle at 50% 50%,
            #172653 0%,
            #070d22 38%,
            #02040d 72%,
            #000 100%
        );

    color: #fff;

    font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

    isolation: isolate;

    user-select: none;

    -webkit-user-select: none;

    -webkit-tap-highlight-color:
        transparent;
}


/* ==========================================================
   SPACE
   ========================================================== */

.haldo-cosmic-universe {

    position: absolute;

    inset: 0;

    overflow: hidden;

    pointer-events: none;
}


/* ==========================================================
   STARS
   ========================================================== */

.haldo-cosmic-stars {

    position: absolute;

    inset: 0;

    overflow: hidden;

    transform:
        translateZ(0);
}


.haldo-cosmic-star {

    position: absolute;

    border-radius: 50%;

    background: #fff;

    box-shadow:
        0 0 5px rgba(255,255,255,.9),
        0 0 12px rgba(170,210,255,.65);

    opacity: .7;

    animation:
        haldo-star-pulse
        var(--star-duration)
        ease-in-out
        infinite
        alternate;
}


@keyframes haldo-star-pulse {

    from {
        opacity: .25;
        transform: scale(.75);
    }

    to {
        opacity: 1;
        transform: scale(1.35);
    }

}


/* ==========================================================
   SUN
   ========================================================== */

.haldo-cosmic-sun {

    position: absolute;

    left: 50%;
    top: 50%;

    width: clamp(
        110px,
        18vw,
        250px
    );

    aspect-ratio: 1;

    transform:
        translate(-50%, -50%);

    border-radius: 50%;

    background:
        radial-gradient(
            circle,
            #fff9bd 0%,
            #ffe96b 22%,
            #ffb82e 55%,
            #ff6a00 78%,
            rgba(255,70,0,.1) 100%
        );

    box-shadow:

        0 0 30px #fff3a0,

        0 0 70px rgba(255,200,40,.95),

        0 0 130px rgba(255,145,20,.7),

        0 0 210px rgba(255,90,0,.45);

    animation:
        haldo-sun-glow
        3.8s
        ease-in-out
        infinite
        alternate;

    z-index: 3;
}


.haldo-cosmic-sun::before {

    content: "";

    position: absolute;

    inset: -35%;

    border-radius: 50%;

    background:
        radial-gradient(
            circle,
            transparent 40%,
            rgba(255,210,60,.16) 55%,
            rgba(255,130,0,.08) 70%,
            transparent 75%
        );

    animation:
        haldo-sun-corona
        10s
        linear
        infinite;

}


@keyframes haldo-sun-glow {

    from {

        transform:
            translate(-50%, -50%)
            scale(.97);

        filter:
            brightness(.95);

    }

    to {

        transform:
            translate(-50%, -50%)
            scale(1.04);

        filter:
            brightness(1.18);

    }

}


@keyframes haldo-sun-corona {

    to {
        transform:
            rotate(360deg);
    }

}


/* ==========================================================
   PLANET ORBITS
   ========================================================== */

.haldo-cosmic-orbit {

    position: absolute;

    left: 50%;
    top: 50%;

    border:
        1px solid
        rgba(255,255,255,.07);

    border-radius: 50%;

    transform:
        translate(-50%, -50%);

    z-index: 2;
}


.haldo-cosmic-planet-system {

    position: absolute;

    left: 50%;
    top: 50%;

    width: 100%;
    height: 100%;

    transform:
        translate(-50%, -50%);

    animation:
        var(--orbit-animation)
        var(--orbit-speed)
        linear
        infinite;
}


.haldo-cosmic-planet {

    position: absolute;

    left: 50%;
    top: 0;

    border-radius: 50%;

    transform:
        translate(-50%, -50%);

    box-shadow:
        0 0 14px
        rgba(255,255,255,.35);

}


.haldo-planet-a {

    background:
        radial-gradient(
            circle at 30% 30%,
            #fff,
            #80d8ff 20%,
            #2866c7 60%,
            #10244f 100%
        );

}


.haldo-planet-b {

    background:
        radial-gradient(
            circle at 30% 25%,
            #fff6cf,
            #f5c36b 20%,
            #b76a32 60%,
            #5a2717 100%
        );

}


.haldo-planet-c {

    background:
        radial-gradient(
            circle at 35% 25%,
            #d8fff2,
            #42c7a0 30%,
            #166e77 65%,
            #082c42 100%
        );

}


.haldo-planet-d {

    background:
        radial-gradient(
            circle at 35% 30%,
            #fff,
            #dba3ff 25%,
            #7a42c2 60%,
            #241044 100%
        );

}


.haldo-cosmic-planet::after {

    content: "";

    position: absolute;

    inset: -20%;

    border-radius: 50%;

    border:
        1px solid
        rgba(255,255,255,.2);

    opacity: .4;

}


/* ==========================================================
   EARTH
   ========================================================== */

.haldo-earth {

    background:
        radial-gradient(
            circle at 32% 28%,
            #b8ffff 0%,
            #3dc9ff 20%,
            #1662d4 55%,
            #09205b 100%
        );

    box-shadow:
        0 0 18px rgba(80,190,255,.9),
        0 0 42px rgba(30,120,255,.45);

}


.haldo-earth::before {

    content: "";

    position: absolute;

    width: 35%;
    height: 22%;

    left: 20%;
    top: 30%;

    border-radius: 50%;

    background:
        rgba(75,220,120,.75);

    filter:
        blur(2px);

    transform:
        rotate(-20deg);

}


/* ==========================================================
   MOON
   ========================================================== */

.haldo-moon {

    background:
        radial-gradient(
            circle at 35% 30%,
            #fff,
            #d9d9d9 30%,
            #7f8591 75%,
            #363944 100%
        );

    box-shadow:
        0 0 15px
        rgba(230,240,255,.55);

}


/* ==========================================================
   COMPACT MENU
   ========================================================== */

.haldo-cosmic-menu {

    position: absolute;

    top: 50%;

    left:
        max(
            10px,
            env(safe-area-inset-left)
        );

    transform:
        translateY(-50%);

    width:
        min(
            74px,
            17vw
        );

    max-height:
        calc(
            100dvh - 28px
        );

    padding: 8px;

    display: flex;

    flex-direction: column;

    align-items: center;

    gap: 7px;

    border:
        1px solid
        rgba(255,255,255,.16);

    border-radius: 22px;

    background:
        rgba(8,15,38,.66);

    backdrop-filter:
        blur(22px);

    -webkit-backdrop-filter:
        blur(22px);

    box-shadow:
        0 10px 50px
        rgba(0,0,0,.45);

    z-index: 100;

    transition:
        width .25s ease,
        background .25s ease;

}


.haldo-cosmic-menu.open {

    width:
        min(
            280px,
            76vw
        );

    align-items:
        stretch;

}


.haldo-cosmic-logo {

    width: 48px;
    height: 48px;

    flex: 0 0 auto;

    border-radius: 15px;

    overflow: hidden;

    display: flex;

    align-items: center;
    justify-content: center;

    background:
        rgba(255,255,255,.08);

    border:
        1px solid
        rgba(255,255,255,.14);

}


.haldo-cosmic-logo img {

    width: 100%;
    height: 100%;

    object-fit: contain;

}


.haldo-cosmic-menu-toggle {

    width: 48px;
    height: 42px;

    border: 0;

    border-radius: 14px;

    color: #fff;

    background:
        rgba(255,255,255,.1);

    cursor: pointer;

    font-size: 21px;

}


.haldo-cosmic-menu-content {

    display: none;

    flex-direction: column;

    gap: 6px;

    overflow-y: auto;

    max-height:
        calc(
            100dvh - 150px
        );

}


.haldo-cosmic-menu.open
.haldo-cosmic-menu-content {

    display: flex;

}


.haldo-cosmic-app-button {

    min-height: 47px;

    width: 100%;

    border: 0;

    border-radius: 14px;

    padding: 7px 9px;

    display: flex;

    align-items: center;

    gap: 10px;

    color: #fff;

    background:
        rgba(255,255,255,.075);

    cursor: pointer;

    text-align: left;

    transition:
        transform .16s ease,
        background .16s ease;

}


.haldo-cosmic-app-button:hover,
.haldo-cosmic-app-button:active {

    background:
        rgba(255,255,255,.16);

    transform:
        scale(.98);

}


.haldo-cosmic-app-icon {

    width: 34px;
    height: 34px;

    flex:
        0 0 34px;

    border-radius: 10px;

    display: flex;

    align-items: center;
    justify-content: center;

    background:
        rgba(255,255,255,.1);

    font-size: 18px;

}


.haldo-cosmic-app-name {

    min-width: 0;

    overflow: hidden;

    white-space: nowrap;

    text-overflow: ellipsis;

    font-size: 13px;

}


/* ==========================================================
   APP DISPLAY LAYER
   ========================================================== */

.haldo-cosmic-app-layer {

    position: absolute;

    inset: 0;

    z-index: 200;

    pointer-events: none;

}


.haldo-cosmic-app-layer.visible {

    pointer-events: auto;

}


.haldo-cosmic-app-window {

    position: absolute;

    left: 50%;
    top: 50%;

    width:
        min(
            900px,
            calc(100vw - 120px)
        );

    height:
        min(
            720px,
            calc(100dvh - 40px)
        );

    transform:
        translate(-50%, -50%);

    display: flex;

    flex-direction: column;

    overflow: hidden;

    border:
        1px solid
        rgba(255,255,255,.18);

    border-radius: 24px;

    background:
        rgba(7,12,30,.91);

    backdrop-filter:
        blur(24px);

    -webkit-backdrop-filter:
        blur(24px);

    box-shadow:
        0 30px 100px
        rgba(0,0,0,.6);

}


.haldo-cosmic-app-titlebar {

    min-height: 54px;

    padding:
        7px 10px 7px 16px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    border-bottom:
        1px solid
        rgba(255,255,255,.1);

    background:
        rgba(255,255,255,.045);

}


.haldo-cosmic-app-title {

    min-width: 0;

    font-size: 15px;

    font-weight: 650;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

}


.haldo-cosmic-window-actions {

    display: flex;

    gap: 5px;

}


.haldo-cosmic-window-button {

    width: 37px;
    height: 37px;

    border: 0;

    border-radius: 11px;

    color: #fff;

    background:
        rgba(255,255,255,.08);

    cursor: pointer;

}


.haldo-cosmic-window-button:hover {

    background:
        rgba(255,255,255,.17);

}


.haldo-cosmic-app-content {

    flex: 1;

    min-height: 0;

    overflow: auto;

    padding: 16px;

}


/* ==========================================================
   EMPTY APP SCREEN
   ========================================================== */

.haldo-cosmic-empty {

    min-height: 100%;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    gap: 12px;

    text-align: center;

    opacity: .9;

}


.haldo-cosmic-empty-logo {

    width: 82px;
    height: 82px;

    border-radius: 25px;

    display: flex;

    align-items: center;
    justify-content: center;

    background:
        rgba(255,255,255,.08);

    box-shadow:
        0 0 40px
        rgba(120,190,255,.2);

}


/* ==========================================================
   RESPONSIVE
   ========================================================== */

@media (max-width: 700px) {

    .haldo-cosmic-menu {

        width: 61px;

        padding: 6px;

        border-radius: 18px;

    }

    .haldo-cosmic-logo {

        width: 40px;
        height: 40px;

        border-radius: 12px;

    }

    .haldo-cosmic-menu-toggle {

        width: 40px;
        height: 38px;

    }

    .haldo-cosmic-menu.open {

        width:
            min(
                255px,
                76vw
            );

    }

    .haldo-cosmic-app-window {

        left: 50%;

        top: 50%;

        width:
            calc(
                100vw - 22px
            );

        height:
            calc(
                100dvh - 22px
            );

        border-radius: 19px;

    }

    .haldo-cosmic-app-content {

        padding: 12px;

    }

}


@media (orientation: landscape)
and (max-height: 550px) {

    .haldo-cosmic-menu {

        max-height:
            calc(
                100dvh - 10px
            );

    }

    .haldo-cosmic-app-window {

        width:
            calc(
                100vw - 100px
            );

        height:
            calc(
                100dvh - 12px
            );

    }

}


@media (prefers-reduced-motion: reduce) {

    .haldo-cosmic-root *,
    .haldo-cosmic-root *::before,
    .haldo-cosmic-root *::after {

        animation-duration:
            .001ms !important;

        animation-iteration-count:
            1 !important;

        transition-duration:
            .001ms !important;

    }

}

`;

        document.head.appendChild(style);

    }


    /* ========================================================
       05 — ROOT
       ======================================================== */

    function createRoot() {

        let root =
            qs("#haldo-cosmic-display");

        if (!root) {

            root =
                createElement(
                    "div"
                );

            root.id =
                "haldo-cosmic-display";

            document.body.appendChild(root);

        }

        root.className =
            "haldo-cosmic-root";

        state.elements.root =
            root;

        return root;

    }


    /* ========================================================
       06 — UNIVERSE
       ======================================================== */

    function createUniverse() {

        const root =
            state.elements.root;

        const universe =
            createElement(
                "div",
                "haldo-cosmic-universe",
                root
            );

        state.elements.universe =
            universe;


        const stars =
            createElement(
                "div",
                "haldo-cosmic-stars",
                universe
            );

        state.elements.stars =
            stars;


        const sun =
            createElement(
                "div",
                "haldo-cosmic-sun",
                universe
            );

        state.elements.sun =
            sun;


        const planets =
            createElement(
                "div",
                "",
                universe
            );

        planets.className =
            "haldo-cosmic-planets";

        state.elements.planets =
            planets;


        createPlanets();

    }


    /* ========================================================
       07 — STARS
       ======================================================== */

    function createStars() {

        const container =
            state.elements.stars;

        if (!container) {
            return;
        }

        const count =
            Math.min(
                170,
                Math.max(
                    70,
                    Math.floor(
                        (
                            window.innerWidth *
                            window.innerHeight
                        ) / 9500
                    )
                )
            );

        for (
            let index = 0;
            index < count;
            index++
        ) {

            const star =
                createElement(
                    "span",
                    "haldo-cosmic-star",
                    container
                );

            const size =
                1 +
                Math.random() *
                (
                    Math.random() > .88
                        ? 3.5
                        : 2
                );

            star.style.width =
                size + "px";

            star.style.height =
                size + "px";

            star.style.left =
                (
                    Math.random() * 100
                ) + "%";

            star.style.top =
                (
                    Math.random() * 100
                ) + "%";

            star.style.setProperty(
                "--star-duration",
                (
                    1.5 +
                    Math.random() * 5
                ) + "s"
            );

            star.style.animationDelay =
                (
                    Math.random() * 5
                ) + "s";

            state.stars.push(star);

        }

    }


    /* ========================================================
       08 — PLANETS
       ======================================================== */

    function createOrbit(
        size,
        duration,
        direction,
        planetClass,
        planetSize,
        distance,
        extra = {}
    ) {

        const universe =
            state.elements.universe;

        const orbit =
            createElement(
                "div",
                "haldo-cosmic-orbit",
                universe
            );

        orbit.style.width =
            size + "px";

        orbit.style.height =
            (
                size *
                (
                    extra.ellipse ||
                    .72
                )
            ) + "px";

        const system =
            createElement(
                "div",
                "haldo-cosmic-planet-system",
                orbit
            );

        system.style.setProperty(
            "--orbit-speed",
            duration + "s"
        );

        system.style.setProperty(
            "--orbit-animation",
            direction === "reverse"
                ? "haldo-orbit-reverse"
                : "haldo-orbit"
        );

        const planet =
            createElement(
                "div",
                "haldo-cosmic-planet " +
                planetClass,
                system
            );

        planet.style.width =
            planetSize + "px";

        planet.style.height =
            planetSize + "px";

        planet.style.top =
            "50%";

        planet.style.left =
            "100%";

        planet.style.transform =
            "translate(-50%, -50%)";

        if (extra.ring) {

            planet.style.boxShadow =
                "0 0 15px rgba(255,255,255,.35)," +
                "0 0 0 5px rgba(220,180,120,.15)," +
                "0 0 0 8px rgba(220,180,120,.08)";

        }

        state.planets.push({
            orbit,
            system,
            planet
        });

        return orbit;

    }


    function createPlanets() {

        const base =
            Math.min(
                window.innerWidth,
                window.innerHeight
            );

        createOrbit(
            base * .30,
            17,
            "normal",
            "haldo-planet-a",
            10,
            .30
        );

        createOrbit(
            base * .43,
            27,
            "reverse",
            "haldo-planet-b",
            16,
            .43,
            {
                ring: true
            }
        );

        createOrbit(
            base * .58,
            39,
            "normal",
            "haldo-earth",
            22,
            .58,
            {
                ellipse: .68
            }
        );

        createOrbit(
            base * .72,
            55,
            "reverse",
            "haldo-planet-c",
            13,
            .72
        );

        createOrbit(
            base * .86,
            73,
            "normal",
            "haldo-planet-d",
            18,
            .86,
            {
                ring: true,
                ellipse: .62
            }
        );

        createMoon();

    }


    function createMoon() {

        const earth =
            state.planets[2];

        if (!earth) {
            return;
        }

        const moonOrbit =
            createElement(
                "div",
                "haldo-cosmic-orbit",
                earth.system
            );

        moonOrbit.style.position =
            "absolute";

        moonOrbit.style.width =
            "58px";

        moonOrbit.style.height =
            "58px";

        moonOrbit.style.left =
            "50%";

        moonOrbit.style.top =
            "50%";

        moonOrbit.style.transform =
            "translate(-50%, -50%)";

        moonOrbit.style.border =
            "1px solid rgba(255,255,255,.12)";

        const moonSystem =
            createElement(
                "div",
                "haldo-cosmic-planet-system",
                moonOrbit
            );

        moonSystem.style.setProperty(
            "--orbit-speed",
            "5s"
        );

        moonSystem.style.setProperty(
            "--orbit-animation",
            "haldo-orbit-reverse"
        );

        const moon =
            createElement(
                "div",
                "haldo-cosmic-planet haldo-moon",
                moonSystem
            );

        moon.style.width =
            "7px";

        moon.style.height =
            "7px";

        moon.style.left =
            "100%";

        moon.style.top =
            "50%";

    }


    /* ========================================================
       09 — ORBIT ANIMATIONS
       ======================================================== */

    function ensureOrbitAnimations() {

        if (
            document.getElementById(
                "haldo-orbit-animation-style"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "haldo-orbit-animation-style";

        style.textContent = `

@keyframes haldo-orbit {

    from {
        transform:
            translate(-50%, -50%)
            rotate(0deg);
    }

    to {
        transform:
            translate(-50%, -50%)
            rotate(360deg);
    }

}

@keyframes haldo-orbit-reverse {

    from {
        transform:
            translate(-50%, -50%)
            rotate(360deg);
    }

    to {
        transform:
            translate(-50%, -50%)
            rotate(0deg);
    }

}
`;

        document.head.appendChild(style);

    }


    /* ========================================================
       10 — MENU
       ======================================================== */

    function createMenu() {

        const root =
            state.elements.root;

        const menu =
            createElement(
                "aside",
                "haldo-cosmic-menu",
                root
            );

        state.elements.menu =
            menu;


        const logo =
            createElement(
                "div",
                "haldo-cosmic-logo",
                menu
            );

        const logoImage =
            createElement(
                "img",
                "",
                logo
            );

        /*
         * Das echte HalDo-Logo verwenden.
         * Kein Roboter-Emoji.
         */

        logoImage.src =
            "assets/logo/logo.png";

        logoImage.alt =
            "HalDo AI OS";


        const toggle =
            createElement(
                "button",
                "haldo-cosmic-menu-toggle",
                menu
            );

        toggle.type =
            "button";

        toggle.innerHTML =
            "☰";

        toggle.setAttribute(
            "aria-label",
            "HalDo AI OS Menü"
        );

        toggle.addEventListener(
            "click",
            toggleMenu
        );

        state.elements.menuButton =
            toggle;


        const content =
            createElement(
                "div",
                "haldo-cosmic-menu-content",
                menu
            );

        state.elements.menuContent =
            content;


        createSystemButtons(
            content
        );

        renderApps();

    }


    function toggleMenu() {

        state.menuOpen =
            !state.menuOpen;

        if (
            state.elements.menu
        ) {

            state.elements.menu.classList.toggle(
                "open",
                state.menuOpen
            );

        }

    }


    /* ========================================================
       11 — SYSTEM BUTTONS
       ======================================================== */

    function createSystemButtons(
        container
    ) {

        addMenuButton(
            container,
            "✦",
            "HalDo AI",
            "haldo-ai"
        );

        addMenuButton(
            container,
            "⌂",
            "Desktop",
            "desktop"
        );

        addMenuButton(
            container,
            "⚙",
            "Einstellungen",
            "settings"
        );

        addMenuButton(
            container,
            "🔎",
            "App-Suche",
            "search"
        );

    }


    function addMenuButton(
        container,
        icon,
        label,
        action
    ) {

        const button =
            createElement(
                "button",
                "haldo-cosmic-app-button",
                container
            );

        button.type =
            "button";

        button.dataset.action =
            action;

        const iconElement =
            createElement(
                "span",
                "haldo-cosmic-app-icon",
                button
            );

        iconElement.textContent =
            icon;

        const name =
            createElement(
                "span",
                "haldo-cosmic-app-name",
                button
            );

        name.textContent =
            label;

        button.addEventListener(
            "click",
            () => handleMenuAction(action)
        );

    }


    /* ========================================================
       12 — APP LIST
       ======================================================== */

    function renderApps() {

        const container =
            state.elements.menuContent;

        if (!container) {
            return;
        }

        const existing =
            container.querySelectorAll(
                "[data-app-id]"
            );

        existing.forEach(
            element =>
                element.remove()
        );


        const apps =
            getApps();


        apps.forEach(app => {

            if (!app) {
                return;
            }

            if (
                app.enabled === false
            ) {
                return;
            }

            const id =
                String(
                    app.id ||
                    app.appId ||
                    ""
                ).trim();

            if (!id) {
                return;
            }

            const button =
                createElement(
                    "button",
                    "haldo-cosmic-app-button",
                    container
                );

            button.type =
                "button";

            button.dataset.appId =
                id;


            const icon =
                createElement(
                    "span",
                    "haldo-cosmic-app-icon",
                    button
                );

            icon.textContent =
                app.icon ||
                "◈";


            const name =
                createElement(
                    "span",
                    "haldo-cosmic-app-name",
                    button
                );

            name.textContent =
                app.title ||
                app.name ||
                id;


            button.addEventListener(
                "click",
                () => openApp(id)
            );

        });

    }


    /* ========================================================
       13 — MENU ACTIONS
       ======================================================== */

    async function handleMenuAction(
        action
    ) {

        switch (action) {

            case "desktop":

                closeAppWindow();

                break;


            case "haldo-ai":

                await openSpecialApp(
                    "haldo-ai"
                );

                break;


            case "settings":

                await openSpecialApp(
                    "settings"
                );

                break;


            case "search":

                openSearch();

                break;

        }

    }


    /* ========================================================
       14 — APP WINDOW
       ======================================================== */

    function createAppLayer() {

        const root =
            state.elements.root;

        const layer =
            createElement(
                "div",
                "haldo-cosmic-app-layer",
                root
            );

        state.elements.appLayer =
            layer;

        const appWindow =
            createElement(
                "section",
                "haldo-cosmic-app-window",
                layer
            );

        state.elements.appWindow =
            appWindow;


        const titlebar =
            createElement(
                "header",
                "haldo-cosmic-app-titlebar",
                appWindow
            );


        const title =
            createElement(
                "div",
                "haldo-cosmic-app-title",
                titlebar
            );

        state.elements.appTitle =
            title;


        const actions =
            createElement(
                "div",
                "haldo-cosmic-window-actions",
                titlebar
            );


        addWindowButton(
            actions,
            "—",
            "Minimieren",
            minimizeCurrentApp
        );


        addWindowButton(
            actions,
            "↩",
            "Desktop",
            closeAppWindow
        );


        addWindowButton(
            actions,
            "×",
            "Schließen",
            closeAppWindow
        );


        const content =
            createElement(
                "main",
                "haldo-cosmic-app-content",
                appWindow
            );

        state.elements.appContent =
            content;

    }


    function addWindowButton(
        container,
        text,
        label,
        handler
    ) {

        const button =
            createElement(
                "button",
                "haldo-cosmic-window-button",
                container
            );

        button.type =
            "button";

        button.textContent =
            text;

        button.title =
            label;

        button.setAttribute(
            "aria-label",
            label
        );

        button.addEventListener(
            "click",
            handler
        );

    }


    /* ========================================================
       15 — OPEN APP
       ======================================================== */

    async function openApp(
        appId
    ) {

        const manager =
            getAppManager();

        if (!manager) {

            showAppMessage(
                "App Manager",
                "Der HalDo App Manager ist noch nicht verbunden."
            );

            return null;
        }


        let app = null;

        if (
            typeof manager.getApp ===
            "function"
        ) {

            app =
                manager.getApp(appId);

        } else if (
            typeof manager.get ===
            "function"
        ) {

            app =
                manager.get(appId);

        }


        if (!app) {

            showAppMessage(
                "App nicht gefunden",
                "Die App „" +
                appId +
                "“ ist derzeit nicht registriert."
            );

            return null;

        }


        const title =
            app.title ||
            app.name ||
            app.id;


        showAppWindow(
            title
        );


        try {

            if (
                typeof manager.open ===
                "function"
            ) {

                const result =
                    await manager.open(
                        appId,
                        {
                            source:
                                "cosmic-display"
                        }
                    );


                state.activeAppId =
                    appId;


                renderAppResult(
                    app,
                    result
                );


                return result;

            }

        } catch (exception) {

            showAppMessage(
                title,
                "Beim Öffnen der App ist ein Fehler aufgetreten."
            );

            console.error(
                "[HalDo Cosmic Display]",
                exception
            );

        }

        return null;

    }


    async function openSpecialApp(
        appId
    ) {

        return openApp(appId);

    }


    /* ========================================================
       16 — APP CONTENT
       ======================================================== */

    function showAppWindow(
        title
    ) {

        if (
            state.elements.appTitle
        ) {

            state.elements.appTitle.textContent =
                title;

        }

        if (
            state.elements.appLayer
        ) {

            state.elements.appLayer.classList.add(
                "visible"
            );

        }

    }


    function renderAppResult(
        app,
        result
    ) {

        const content =
            state.elements.appContent;

        if (!content) {
            return;
        }


        /*
         * Wenn die App selbst ein DOM-Element
         * zurückgibt, wird es direkt angezeigt.
         */

        if (
            result &&
            result.element instanceof
            HTMLElement
        ) {

            content.replaceChildren(
                result.element
            );

            return;

        }


        if (
            result instanceof HTMLElement
        ) {

            content.replaceChildren(
                result
            );

            return;

        }


        /*
         * Wenn die App eine render-Funktion
         * besitzt, bekommt sie den Container.
         */

        if (
            app &&
            typeof app.render ===
            "function"
        ) {

            try {

                content.replaceChildren();

                const renderResult =
                    app.render(
                        content,
                        {
                            manager:
                                getAppManager(),
                            app
                        }
                    );

                if (
                    renderResult instanceof
                    HTMLElement
                ) {

                    content.appendChild(
                        renderResult
                    );

                }

                return;

            } catch (exception) {

                console.error(
                    "[HalDo Cosmic Display]",
                    exception
                );

            }

        }


        /*
         * Fallback:
         * App-Information wird angezeigt,
         * anstatt eine leere Fläche zu zeigen.
         */

        content.innerHTML = `

            <div class="haldo-cosmic-empty">

                <div class="haldo-cosmic-empty-logo">
                    <img
                        src="assets/logo/logo.png"
                        alt="HalDo AI OS"
                        style="
                            width:70%;
                            height:70%;
                            object-fit:contain;
                        "
                    >
                </div>

                <h2>
                    ${escapeHTML(
                        app.title ||
                        app.name ||
                        app.id
                    )}
                </h2>

                <p>
                    Die App wurde geöffnet und ist
                    mit dem HalDo App Manager verbunden.
                </p>

                <p style="opacity:.6;font-size:13px;">
                    Die eigentliche App-Oberfläche
                    wird über ihren App-Renderer geladen.
                </p>

            </div>

        `;

    }


    function showAppMessage(
        title,
        message
    ) {

        showAppWindow(title);

        const content =
            state.elements.appContent;

        if (!content) {
            return;
        }

        content.innerHTML = `

            <div class="haldo-cosmic-empty">

                <div class="haldo-cosmic-empty-logo">

                    <img
                        src="assets/logo/logo.png"
                        alt="HalDo AI OS"
                        style="
                            width:70%;
                            height:70%;
                            object-fit:contain;
                        "
                    >

                </div>

                <h2>
                    ${escapeHTML(title)}
                </h2>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>

        `;

    }


    /* ========================================================
       17 — CLOSE
       ======================================================== */

    async function closeAppWindow() {

        const activeId =
            state.activeAppId;

        const manager =
            getAppManager();

        if (
            activeId &&
            manager &&
            typeof manager.close ===
            "function"
        ) {

            try {

                await manager.close(
                    activeId,
                    {
                        source:
                            "cosmic-display"
                    }
                );

            } catch (_) {}

        }


        state.activeAppId =
            null;


        if (
            state.elements.appLayer
        ) {

            state.elements.appLayer.classList.remove(
                "visible"
            );

        }


        if (
            state.elements.appContent
        ) {

            state.elements.appContent.replaceChildren();

        }

    }


    /* ========================================================
       18 — MINIMIZE
       ======================================================== */

    async function minimizeCurrentApp() {

        const activeId =
            state.activeAppId;

        const manager =
            getAppManager();

        if (
            activeId &&
            manager &&
            typeof manager.minimize ===
            "function"
        ) {

            try {

                await manager.minimize(
                    activeId
                );

            } catch (_) {}

        }


        if (
            state.elements.appLayer
        ) {

            state.elements.appLayer.classList.remove(
                "visible"
            );

        }

    }


    /* ========================================================
       19 — SEARCH
       ======================================================== */

    function openSearch() {

        const content =
            state.elements.menuContent;

        if (!content) {
            return;
        }


        const input =
            createElement(
                "input"
            );

        input.type =
            "search";

        input.placeholder =
            "Apps suchen…";

        input.autocomplete =
            "off";

        input.style.cssText = `

            width:100%;
            box-sizing:border-box;
            border:0;
            outline:none;
            border-radius:12px;
            padding:10px 11px;
            color:#fff;
            background:rgba(255,255,255,.1);

        `;


        content.prepend(input);

        input.focus();


        input.addEventListener(
            "input",
            () => {

                const query =
                    input.value
                        .trim()
                        .toLowerCase();


                content
                    .querySelectorAll(
                        "[data-app-id]"
                    )
                    .forEach(
                        button => {

                            const text =
                                button
                                    .textContent
                                    .toLowerCase();

                            button.style.display =
                                !query ||
                                text.includes(query)
                                    ? ""
                                    : "none";

                        }
                    );

            }
        );

    }


    /* ========================================================
       20 — APP MANAGER EVENTS
       ======================================================== */

    function connectAppManager() {

        const manager =
            getAppManager();

        if (!manager) {
            return false;
        }


        if (
            typeof manager.on ===
            "function"
        ) {

            manager.on(
                "registered",
                renderApps
            );

            manager.on(
                "registry-registered",
                renderApps
            );

            manager.on(
                "registry-updated",
                renderApps
            );

            manager.on(
                "registry-removed",
                renderApps
            );

            manager.on(
                "registry-enabled",
                renderApps
            );

            manager.on(
                "registry-disabled",
                renderApps
            );

        }


        return true;

    }


    /* ========================================================
       21 — RESIZE
       ======================================================== */

    function handleResize() {

        /*
         * Die Orbitgrößen werden bewusst nicht
         * bei jedem Resize neu erzeugt.
         *
         * Dadurch bleiben laufende Animationen
         * stabil.
         */

    }


    /* ========================================================
       22 — INITIALIZE
       ======================================================== */

    function initialize() {

        if (state.initialized) {
            return api;
        }


        state.initialized =
            true;


        injectStyles();

        ensureOrbitAnimations();

        createRoot();

        createUniverse();

        createStars();

        createMenu();

        createAppLayer();

        connectAppManager();


        window.addEventListener(
            "resize",
            handleResize,
            {
                passive: true
            }
        );


        state.ready =
            true;


        HalDoOS.cosmicDisplay =
            api;


        window.HalDoCosmicDisplay =
            api;


        window.dispatchEvent(
            new CustomEvent(
                "haldo:cosmic-display-ready",
                {
                    detail: api
                }
            )
        );


        return api;

    }


    /* ========================================================
       23 — PUBLIC API
       ======================================================== */

    const api = {

        name:
            "HalDo Cosmic Display",

        version:
            VERSION,

        module:
            MODULE_ID,

        initialize,

        openApp,

        closeApp:
            closeAppWindow,

        minimizeApp:
            minimizeCurrentApp,

        toggleMenu,

        renderApps,

        getActiveAppId() {
            return state.activeAppId;
        },

        isReady() {
            return state.ready;
        },

        getState() {

            return {

                initialized:
                    state.initialized,

                ready:
                    state.ready,

                menuOpen:
                    state.menuOpen,

                activeAppId:
                    state.activeAppId,

                starCount:
                    state.stars.length,

                planetCount:
                    state.planets.length

            };

        }

    };


    /* ========================================================
       24 — EXPORT
       ======================================================== */

    window.HalDoCosmicDisplay =
        api;

    HalDoOS.cosmicDisplay =
        api;


    /* ========================================================
       25 — START
       ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }


})(window, document);