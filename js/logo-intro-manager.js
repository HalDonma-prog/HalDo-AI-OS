// ============================================================
// HALDO AI OS 18
// LOGO INTRO MANAGER
// PART 87
// Professional Ultimate Foundation
// ============================================================

(function (window, document) {

    "use strict";

    if (
        window.HalDoLogoIntroManager &&
        window.HalDoLogoIntroManager.__haldoAI18
    ) {
        return;
    }

    window.HalDoOS =
        window.HalDoOS || {};

    // ========================================================
    // CONFIGURATION
    // ========================================================

    const CONFIG = {

        name:
            "HalDo Logo Intro Manager",

        version:
            "18.0.0",

        mode:
            "Solar Galaxy",

        enabled:
            true,

        autoStart:
            true,

        duration:
            7200,

        logoPath:
            "logo.png",

        alternateLogoPath:
            "assets/logo/logo.png",

        solarSystem:
            true,

        stars:
            true,

        planets:
            true,

        galaxy:
            true,

        sunlight:
            true,

        sound:
            true,

        voice:
            true,

        skipOnRepeat:
            false

    };

    // ========================================================
    // STATE
    // ========================================================

    const state = {

        initialized:
            false,

        running:
            false,

        completed:
            false,

        skipped:
            false,

        startTime:
            null,

        endTime:
            null,

        container:
            null,

        logo:
            null,

        solarLayer:
            null,

        galaxyLayer:
            null,

        starsLayer:
            null,

        planetsLayer:
            null,

        sunlightLayer:
            null,

        animationFrame:
            null,

        timers:
            [],

        introId:
            null

    };

    // ========================================================
    // EVENTS
    // ========================================================

    const listeners =
        new Map();

    function on(
        event,
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {
            return () => {};
        }

        if (
            !listeners.has(
                event
            )
        ) {

            listeners.set(
                event,
                new Set()
            );

        }

        listeners
            .get(event)
            .add(callback);

        return () =>
            off(
                event,
                callback
            );

    }

    function off(
        event,
        callback
    ) {

        const set =
            listeners.get(
                event
            );

        if (!set) {
            return;
        }

        set.delete(
            callback
        );

    }

    function emit(
        event,
        detail = {}
    ) {

        const set =
            listeners.get(
                event
            );

        if (set) {

            for (
                const callback of set
            ) {

                try {

                    callback(
                        detail
                    );

                } catch (error) {

                    console.error(
                        "[HalDoLogoIntro]",
                        error
                    );

                }

            }

        }

        try {

            document.dispatchEvent(
                new CustomEvent(
                    `haldo:logo-intro:${event}`,
                    {
                        detail
                    }
                )
            );

        } catch (error) {}

    }

    // ========================================================
    // UTILITY
    // ========================================================

    function createId(
        prefix = "intro"
    ) {

        return (
            prefix +
            "-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );

    }

    function createElement(
        tag,
        className,
        parent
    ) {

        const element =
            document.createElement(
                tag
            );

        if (className) {

            element.className =
                className;

        }

        if (parent) {

            parent.appendChild(
                element
            );

        }

        return element;

    }

    // ========================================================
    // STYLE
    // ========================================================

    function injectStyles() {

        if (
            document.getElementById(
                "haldo-logo-intro-style"
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "haldo-logo-intro-style";

        style.textContent = `

        /* ================================================
           HALDO SOLAR GALAXY INTRO
        ================================================= */

        .haldo-logo-intro {

            position: fixed;

            inset: 0;

            width: 100vw;
            height: 100vh;

            overflow: hidden;

            z-index: 999999;

            display: flex;

            align-items: center;

            justify-content: center;

            background:
                radial-gradient(
                    circle at center,
                    rgba(255, 205, 80, 0.18),
                    rgba(8, 12, 32, 0.92) 42%,
                    rgba(1, 3, 12, 1) 100%
                );

            opacity: 0;

            pointer-events: auto;

            transition:
                opacity 900ms ease;

            isolation: isolate;

        }

        .haldo-logo-intro.is-visible {

            opacity: 1;

        }

        .haldo-logo-intro.is-leaving {

            opacity: 0;

            pointer-events: none;

        }

        .haldo-intro-galaxy {

            position: absolute;

            inset: -20%;

            z-index: 0;

            background:

                radial-gradient(
                    ellipse at center,
                    rgba(255, 210, 90, 0.08),
                    transparent 42%
                ),

                radial-gradient(
                    ellipse at 30% 40%,
                    rgba(120, 160, 255, 0.09),
                    transparent 38%
                ),

                radial-gradient(
                    ellipse at 70% 65%,
                    rgba(180, 100, 255, 0.08),
                    transparent 35%
                );

            animation:
                haldoGalaxyDrift 24s
                ease-in-out infinite alternate;

        }

        .haldo-intro-stars {

            position: absolute;

            inset: 0;

            z-index: 1;

            overflow: hidden;

        }

        .haldo-intro-star {

            position: absolute;

            width: 2px;
            height: 2px;

            border-radius: 50%;

            background:
                rgba(255,255,255,0.92);

            box-shadow:
                0 0 6px
                rgba(255,255,255,0.75);

            animation:
                haldoStarPulse
                var(--star-duration)
                ease-in-out infinite;

            animation-delay:
                var(--star-delay);

        }

        .haldo-intro-solar-system {

            position: absolute;

            inset: 0;

            z-index: 2;

            pointer-events: none;

        }

        .haldo-intro-sun {

            position: absolute;

            width: min(
                25vw,
                260px
            );

            height: min(
                25vw,
                260px
            );

            min-width: 130px;
            min-height: 130px;

            left: 50%;
            top: 50%;

            transform:
                translate(
                    -50%,
                    -50%
                );

            border-radius: 50%;

            background:

                radial-gradient(
                    circle at 38% 35%,
                    #fff9c9 0%,
                    #fff0a0 18%,
                    #ffd34f 42%,
                    #ff9d24 70%,
                    rgba(255,110,20,0.1) 100%
                );

            box-shadow:

                0 0 30px
                rgba(255,220,90,0.95),

                0 0 80px
                rgba(255,180,45,0.72),

                0 0 150px
                rgba(255,145,20,0.42);

            animation:
                haldoSunPulse
                4s
                ease-in-out infinite;

            opacity: 0.62;

        }

        .haldo-intro-sun-rays {

            position: absolute;

            width: 48vw;
            height: 48vw;

            min-width: 300px;
            min-height: 300px;

            max-width: 680px;
            max-height: 680px;

            left: 50%;
            top: 50%;

            transform:
                translate(
                    -50%,
                    -50%
                );

            border-radius: 50%;

            background:

                repeating-conic-gradient(
                    from 0deg,
                    rgba(255,220,100,0.00)
                        0deg 7deg,
                    rgba(255,220,100,0.22)
                        7deg 9deg,
                    rgba(255,220,100,0.00)
                        9deg 18deg
                );

            filter:
                blur(2px);

            opacity: 0.5;

            animation:
                haldoSunRays
                30s
                linear infinite;

        }

        .haldo-intro-orbit {

            position: absolute;

            left: 50%;
            top: 50%;

            width:
                var(--orbit-size);

            height:
                var(--orbit-height);

            border:
                1px solid
                rgba(255,225,145,0.25);

            border-radius: 50%;

            transform:
                translate(
                    -50%,
                    -50%
                )
                rotate(
                    var(--orbit-angle)
                );

            animation:
                haldoOrbitRotate
                var(--orbit-speed)
                linear infinite;

        }

        .haldo-intro-planet {

            position: absolute;

            width:
                var(--planet-size);

            height:
                var(--planet-size);

            border-radius: 50%;

            top: 50%;

            left: 0;

            transform:
                translate(
                    -50%,
                    -50%
                );

            background:
                radial-gradient(
                    circle at 35% 30%,
                    var(--planet-light),
                    var(--planet-main) 55%,
                    var(--planet-dark) 100%
                );

            box-shadow:
                0 0 14px
                var(--planet-glow);

        }

        .haldo-intro-logo-stage {

            position: absolute;

            left: 50%;
            top: 50%;

            width:
                min(52vw, 430px);

            height:
                min(52vw, 430px);

            transform:
                translate(
                    -50%,
                    -50%
                );

            z-index: 10;

            display: flex;

            align-items: center;

            justify-content: center;

        }

        .haldo-intro-logo-aura {

            position: absolute;

            width: 92%;
            height: 92%;

            border-radius: 50%;

            background:
                radial-gradient(
                    circle,
                    rgba(255,240,170,0.25),
                    rgba(255,185,45,0.13)
                        35%,
                    transparent
                        70%
                );

            filter:
                blur(12px);

            animation:
                haldoLogoAura
                3s
                ease-in-out infinite;

        }

        .haldo-intro-logo-orbit {

            position: absolute;

            width: 112%;
            height: 112%;

            border:
                2px solid
                rgba(255,225,130,0.25);

            border-left-color:
                rgba(255,255,255,0.75);

            border-radius: 50%;

            transform:
                rotateX(65deg);

            animation:
                haldoLogoOrbit
                9s
                linear infinite;

            box-shadow:
                0 0 18px
                rgba(255,220,100,0.28);

        }

        .haldo-intro-logo {

            position: relative;

            width: 76%;
            height: 76%;

            object-fit: contain;

            border-radius: 50%;

            z-index: 3;

            display: block;

            filter:

                drop-shadow(
                    0 0 8px
                    rgba(255,255,255,0.75)
                )

                drop-shadow(
                    0 0 24px
                    rgba(255,190,50,0.65)
                )

                drop-shadow(
                    0 0 60px
                    rgba(255,155,20,0.35)
                );

            animation:
                haldoLogoLiving
                5s
                ease-in-out infinite;

            transform-origin:
                center center;

        }

        .haldo-intro-message {

            position: absolute;

            left: 50%;

            bottom:
                max(7vh, 45px);

            transform:
                translateX(-50%);

            width:
                min(90vw, 700px);

            text-align:
                center;

            z-index: 30;

            font-family:
                system-ui,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

            color:
                rgba(255,255,255,0.96);

            text-shadow:
                0 0 14px
                rgba(255,220,120,0.7),

                0 0 32px
                rgba(255,160,30,0.35);

            opacity: 0;

            transform:
                translate(
                    -50%,
                    15px
                );

            transition:
                opacity 900ms ease,
                transform 900ms ease;

        }

        .haldo-intro-message.is-visible {

            opacity: 1;

            transform:
                translate(
                    -50%,
                    0
                );

        }

        .haldo-intro-title {

            font-size:
                clamp(
                    22px,
                    4vw,
                    38px
                );

            font-weight:
                700;

            letter-spacing:
                0.04em;

            margin-bottom:
                10px;

        }

        .haldo-intro-subtitle {

            font-size:
                clamp(
                    14px,
                    2.5vw,
                    20px
                );

            opacity:
                0.86;

        }

        @keyframes haldoSunPulse {

            0%, 100% {

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    scale(0.96);

                opacity:
                    0.52;

            }

            50% {

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    scale(1.05);

                opacity:
                    0.72;

            }

        }

        @keyframes haldoSunRays {

            from {

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    rotate(0deg);

            }

            to {

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    rotate(360deg);

            }

        }

        @keyframes haldoGalaxyDrift {

            from {

                transform:
                    scale(1)
                    rotate(0deg);

            }

            to {

                transform:
                    scale(1.08)
                    rotate(3deg);

            }

        }

        @keyframes haldoStarPulse {

            0%, 100% {

                opacity:
                    0.25;

                transform:
                    scale(0.7);

            }

            50% {

                opacity:
                    1;

                transform:
                    scale(1.45);

            }

        }

        @keyframes haldoOrbitRotate {

            from {

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    rotate(
                        var(--orbit-angle)
                    );

            }

            to {

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    rotate(
                        calc(
                            var(--orbit-angle)
                            + 360deg
                        )
                    );

            }

        }

        @keyframes haldoLogoAura {

            0%, 100% {

                opacity:
                    0.65;

                transform:
                    scale(0.94);

            }

            50% {

                opacity:
                    1;

                transform:
                    scale(1.06);

            }

        }

        @keyframes haldoLogoOrbit {

            from {

                transform:
                    rotateX(65deg)
                    rotateZ(0deg);

            }

            to {

                transform:
                    rotateX(65deg)
                    rotateZ(360deg);

            }

        }

        @keyframes haldoLogoLiving {

            0%, 100% {

                transform:
                    rotate(0deg)
                    scale(0.98);

            }

            25% {

                transform:
                    rotate(1deg)
                    scale(1.015);

            }

            50% {

                transform:
                    rotate(0deg)
                    scale(1.035);

            }

            75% {

                transform:
                    rotate(-1deg)
                    scale(1.015);

            }

        }

        @media (
            prefers-reduced-motion: reduce
        ) {

            .haldo-logo-intro *,
            .haldo-logo-intro {

                animation-duration:
                    0.001ms !important;

                animation-iteration-count:
                    1 !important;

                transition-duration:
                    0.001ms !important;

            }

        }

        `;

        document.head.appendChild(
            style
        );

    }

    // ========================================================
    // CONTAINER
    // ========================================================

    function createContainer() {

        if (
            state.container &&
            document.body.contains(
                state.container
            )
        ) {

            return state.container;

        }

        const container =
            createElement(
                "div",
                "haldo-logo-intro",
                document.body
            );

        container.id =
            "haldo-logo-intro";

        container.setAttribute(
            "aria-label",
            "HalDo AI OS Start"
        );

        container.setAttribute(
            "role",
            "presentation"
        );

        state.container =
            container;

        return container;

    }

    // ========================================================
    // GALAXY
    // ========================================================

    function createGalaxy() {

        const galaxy =
            createElement(
                "div",
                "haldo-intro-galaxy",
                state.container
            );

        state.galaxyLayer =
            galaxy;

    }

    // ========================================================
    // STARS
    // ========================================================

    function createStars(
        count = 90
    ) {

        if (
            !CONFIG.stars
        ) {
            return;
        }

        const layer =
            createElement(
                "div",
                "haldo-intro-stars",
                state.container
            );

        state.starsLayer =
            layer;

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const star =
                createElement(
                    "span",
                    "haldo-intro-star",
                    layer
                );

            star.style.left =
                `${Math.random() * 100}%`;

            star.style.top =
                `${Math.random() * 100}%`;

            const size =
                Math.random() *
                    2.5 +
                1;

            star.style.width =
                `${size}px`;

            star.style.height =
                `${size}px`;

            star.style.setProperty(
                "--star-duration",
                `${2 + Math.random() * 5}s`
            );

            star.style.setProperty(
                "--star-delay",
                `${Math.random() * 5}s`
            );

        }

    }

    // ========================================================
    // SOLAR SYSTEM
    // ========================================================

    function createSolarSystem() {

        if (
            !CONFIG.solarSystem
        ) {
            return;
        }

        const layer =
            createElement(
                "div",
                "haldo-intro-solar-system",
                state.container
            );

        state.solarLayer =
            layer;

        if (
            CONFIG.sunlight
        ) {

            const rays =
                createElement(
                    "div",
                    "haldo-intro-sun-rays",
                    layer
                );

            state.sunlightLayer =
                rays;

        }

        const sun =
            createElement(
                "div",
                "haldo-intro-sun",
                layer
            );

        // -----------------------------------------------
        // ORBIT 1
        // -----------------------------------------------

        createOrbit(
            layer,
            "32vw",
            "14vw",
            "12deg",
            "18s",
            "#9fe7ff",
            "#4c9dcc",
            "#153b66",
            "rgba(80,180,255,0.6)",
            "10px"
        );

        // -----------------------------------------------
        // ORBIT 2
        // -----------------------------------------------

        createOrbit(
            layer,
            "46vw",
            "20vw",
            "-22deg",
            "27s",
            "#ffd98a",
            "#c47b35",
            "#5b3218",
            "rgba(255,180,80,0.6)",
            "14px"
        );

        // -----------------------------------------------
        // ORBIT 3
        // -----------------------------------------------

        createOrbit(
            layer,
            "62vw",
            "28vw",
            "35deg",
            "38s",
            "#d6b6ff",
            "#8d58c7",
            "#39205c",
            "rgba(190,120,255,0.6)",
            "18px"
        );

        void sun;

    }

    function createOrbit(
        parent,
        size,
        height,
        angle,
        speed,
        light,
        main,
        dark,
        glow,
        planetSize
    ) {

        const orbit =
            createElement(
                "div",
                "haldo-intro-orbit",
                parent
            );

        orbit.style.setProperty(
            "--orbit-size",
            size
        );

        orbit.style.setProperty(
            "--orbit-height",
            height
        );

        orbit.style.setProperty(
            "--orbit-angle",
            angle
        );

        orbit.style.setProperty(
            "--orbit-speed",
            speed
        );

        const planet =
            createElement(
                "div",
                "haldo-intro-planet",
                orbit
            );

        planet.style.setProperty(
            "--planet-size",
            planetSize
        );

        planet.style.setProperty(
            "--planet-light",
            light
        );

        planet.style.setProperty(
            "--planet-main",
            main
        );

        planet.style.setProperty(
            "--planet-dark",
            dark
        );

        planet.style.setProperty(
            "--planet-glow",
            glow
        );

    }

    // ========================================================
    // LOGO
    // ========================================================

    function resolveLogoPath() {

        const candidates = [

            CONFIG.logoPath,

            CONFIG.alternateLogoPath

        ];

        /*
         * Das erste vorhandene Bild wird über
         * die Browser-Ladeprüfung gewählt.
         */

        return candidates;

    }

    function createLogo() {

        const stage =
            createElement(
                "div",
                "haldo-intro-logo-stage",
                state.container
            );

        const aura =
            createElement(
                "div",
                "haldo-intro-logo-aura",
                stage
            );

        const orbit =
            createElement(
                "div",
                "haldo-intro-logo-orbit",
                stage
            );

        const logo =
            createElement(
                "img",
                "haldo-intro-logo",
                stage
            );

        logo.alt =
            "HalDo AI OS Logo";

        const paths =
            resolveLogoPath();

        let current =
            0;

        function tryNext() {

            if (
                current >=
                paths.length
            ) {

                console.warn(
                    "[HalDoLogoIntro] " +
                    "Kein Logo gefunden."
                );

                return;

            }

            logo.src =
                paths[
                    current
                ];

            current++;

        }

        logo.addEventListener(
            "error",
            tryNext
        );

        tryNext();

        state.logo =
            logo;

        void aura;
        void orbit;

    }

    // ========================================================
    // MESSAGE
    // ========================================================

    function createMessage() {

        const wrapper =
            createElement(
                "div",
                "haldo-intro-message",
                state.container
            );

        const title =
            createElement(
                "div",
                "haldo-intro-title",
                wrapper
            );

        title.textContent =
            "HalDo AI OS";

        const subtitle =
            createElement(
                "div",
                "haldo-intro-subtitle",
                wrapper
            );

        subtitle.textContent =
            "Willkommen bei HalDo AI.";

        state.message =
            wrapper;

    }

    // ========================================================
    // BUILD
    // ========================================================

    function build() {

        if (
            !document.body
        ) {
            return false;
        }

        injectStyles();

        createContainer();

        /*
         * Alte Inhalte entfernen, falls die Intro
         * erneut gestartet wird.
         */

        state.container.innerHTML =
            "";

        createGalaxy();

        createStars(
            110
        );

        createSolarSystem();

        createLogo();

        createMessage();

        return true;

    }

    // ========================================================
    // SHOW MESSAGE
    // ========================================================

    function showMessage(
        title,
        subtitle
    ) {

        if (
            !state.message
        ) {
            return;
        }

        const titleElement =
            state.message.querySelector(
                ".haldo-intro-title"
            );

        const subtitleElement =
            state.message.querySelector(
                ".haldo-intro-subtitle"
            );

        if (
            titleElement
        ) {

            titleElement.textContent =
                title ||
                "HalDo AI OS";

        }

        if (
            subtitleElement
        ) {

            subtitleElement.textContent =
                subtitle ||
                "Willkommen bei HalDo AI.";

        }

        state.message.classList.add(
            "is-visible"
        );

    }

    // ========================================================
    // HIDE MESSAGE
    // ========================================================

    function hideMessage() {

        if (
            state.message
        ) {

            state.message.classList.remove(
                "is-visible"
            );

        }

    }

    // ========================================================
    // START
    // ========================================================

    async function start(
        options = {}
    ) {

        if (
            state.running
        ) {

            return {

                ok:
                    true,

                alreadyRunning:
                    true

            };

        }

        if (
            !CONFIG.enabled &&
            options.force !==
                true
        ) {

            return {

                ok:
                    true,

                skipped:
                    true

            };

        }

        if (
            !build()
        ) {

            return {

                ok:
                    false,

                error:
                    "DOM_UNAVAILABLE"

            };

        }

        state.running =
            true;

        state.completed =
            false;

        state.skipped =
            false;

        state.startTime =
            Date.now();

        state.introId =
            createId();

        emit(
            "start",
            {
                introId:
                    state.introId
            }
        );

        /*
         * Sichtbar machen.
         */

        requestAnimationFrame(
            () => {

                if (
                    state.container
                ) {

                    state.container.classList.add(
                        "is-visible"
                    );

                }

            }
        );

        /*
         * Begrüßung zeitversetzt.
         */

        const messageTimer =
            window.setTimeout(
                () => {

                    showMessage(
                        options.title ||
                            "HalDo AI OS",

                        options.subtitle ||
                            "Willkommen. Schön, dass du da bist."
                    );

                    emit(
                        "greeting",
                        {
                            title:
                                options.title ||
                                "HalDo AI OS",

                            subtitle:
                                options.subtitle ||
                                "Willkommen. Schön, dass du da bist."
                        }
                    );

                },
                options.messageDelay ||
                    1900
            );

        state.timers.push(
            messageTimer
        );

        /*
         * Automatisches Ende.
         */

        const duration =
            Number(
                options.duration ||
                CONFIG.duration
            );

        const endTimer =
            window.setTimeout(
                () => {

                    finish();

                },
                duration
            );

        state.timers.push(
            endTimer
        );

        return {

            ok:
                true,

            introId:
                state.introId,

            duration

        };

    }

    // ========================================================
    // FINISH
    // ========================================================

    function finish() {

        if (
            !state.running
        ) {
            return;
        }

        state.running =
            false;

        state.completed =
            true;

        state.endTime =
            Date.now();

        if (
            state.container
        ) {

            state.container.classList.add(
                "is-leaving"
            );

        }

        emit(
            "finish",
            {

                introId:
                    state.introId,

                duration:
                    state.endTime -
                    state.startTime

            }
        );

        const removeTimer =
            window.setTimeout(
                () => {

                    remove();

                },
                1000
            );

        state.timers.push(
            removeTimer
        );

    }

    // ========================================================
    // SKIP
    // ========================================================

    function skip() {

        if (
            !state.running
        ) {
            return false;
        }

        state.skipped =
            true;

        emit(
            "skip",
            {
                introId:
                    state.introId
            }
        );

        finish();

        return true;

    }

    // ========================================================
    // REMOVE
    // ========================================================

    function remove() {

        for (
            const timer of state.timers
        ) {

            try {

                window.clearTimeout(
                    timer
                );

            } catch (error) {}

        }

        state.timers =
            [];

        if (
            state.animationFrame
        ) {

            cancelAnimationFrame(
                state.animationFrame
            );

            state.animationFrame =
                null;

        }

        if (
            state.container &&
            state.container.parentNode
        ) {

            state.container.parentNode.removeChild(
                state.container
            );

        }

        state.container =
            null;

        state.logo =
            null;

        state.message =
            null;

        state.solarLayer =
            null;

        state.galaxyLayer =
            null;

        state.starsLayer =
            null;

        state.planetsLayer =
            null;

        state.sunlightLayer =
            null;

    }

    // ========================================================
    // DESTROY
    // ========================================================

    function destroy() {

        if (
            state.running
        ) {

            finish();

        }

        remove();

        state.initialized =
            false;

    }

    // ========================================================
    // STATUS
    // ========================================================

    function getStatus() {

        return {

            name:
                CONFIG.name,

            version:
                CONFIG.version,

            mode:
                CONFIG.mode,

            enabled:
                CONFIG.enabled,

            initialized:
                state.initialized,

            running:
                state.running,

            completed:
                state.completed,

            skipped:
                state.skipped,

            startTime:
                state.startTime,

            endTime:
                state.endTime,

            introId:
                state.introId

        };

    }

    // ========================================================
    // INITIALIZE
    // ========================================================

    function initialize() {

        if (
            state.initialized
        ) {

            return getStatus();

        }

        state.initialized =
            true;

        /*
         * Skip-Taste.
         */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    !state.running
                ) {
                    return;
                }

                if (
                    event.key ===
                    "Escape"
                ) {

                    skip();

                }

            }
        );

        /*
         * Global API.
         */

        const kernel =
            window.HalDoKernel ||
            window.HalDoOS?.kernel ||
            null;

        if (
            kernel &&
            typeof kernel.registerModule ===
            "function"
        ) {

            try {

                kernel.registerModule(
                    "logo-intro-manager",
                    api
                );

            } catch (error) {}

        }

        emit(
            "initialized",
            getStatus()
        );

        return getStatus();

    }

    // ========================================================
    // PUBLIC API
    // ========================================================

    const api = {

        __haldoAI18:
            true,

        config:
            CONFIG,

        state,

        initialize,

        start,

        finish,

        skip,

        remove,

        destroy,

        showMessage,

        hideMessage,

        getStatus,

        on,

        off,

        emit

    };

    // ========================================================
    // GLOBAL REGISTRATION
    // ========================================================

    window.HalDoLogoIntroManager =
        api;

    window.HalDoOS.logoIntro =
        api;

    // ========================================================
    // BOOT
    // ========================================================

    function boot() {

        initialize();

        if (
            CONFIG.autoStart
        ) {

            /*
             * Der Start wird bewusst leicht verzögert,
             * damit Kernel / System zuerst ihre
             * Initialisierung beginnen können.
             */

            window.setTimeout(
                () => {

                    /*
                     * Nur starten, wenn kein anderer
                     * Intro-Manager bereits aktiv ist.
                     */

                    if (
                        !state.running
                    ) {

                        start();

                    }

                },
                120
            );

        }

    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once:
                    true
            }
        );

    } else {

        boot();

    }

})(window, document);

// ============================================================
// END OF PART 87
// ============================================================