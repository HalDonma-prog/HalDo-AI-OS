/*
 * ============================================================
 * HalDo AI OS 20
 * Cosmic World
 * ============================================================
 *
 * Datei:
 *   js/haldo-v20-cosmic-world.js
 *
 * Zweck:
 *   Sichtbare lebendige Cosmic World für HalDo AI OS 20.
 *
 * Enthält:
 *   - Sonne
 *   - Erde
 *   - Mond
 *   - Merkur
 *   - Venus
 *   - Mars
 *   - Jupiter
 *   - Saturn + Ringe
 *   - Uranus
 *   - Neptun
 *   - Sterne
 *   - HalDo AI Zentral-Avatar
 *   - Orbit-Animationen
 *   - Touch / Pointer Interaktion
 *   - Event-Bus Integration
 *
 * Bestehende Systeme werden nicht ersetzt.
 * ============================================================
 */

(function (window, document) {

    "use strict";


    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    const state = {

        ready: false,

        running: false,

        root: null,

        canvas: null,

        context: null,

        animationFrame: null,

        width: 0,

        height: 0,

        dpr: 1,

        time: 0,

        lastTime: 0,

        pointer: {

            x: 0,

            y: 0,

            active: false
        },

        selectedPlanet: null,

        planets: [],

        stars: [],

        aiPulse: 0,

        cosmicEnergy: 0
    };


    const CosmicWorld = {

        name:
            "HalDo V20 Cosmic World",

        version:
            "20.0.0",

        ready:
            false
    };


    /* ========================================================
       PLANETS
    ======================================================== */

    const PLANET_DEFINITIONS = [

        {
            id:
                "mercury",

            name:
                "Merkur",

            orbit:
                0.105,

            radius:
                0.014,

            speed:
                1.55,

            color:
                "#aaa8a0",

            glow:
                "#d7d2c8"
        },

        {
            id:
                "venus",

            name:
                "Venus",

            orbit:
                0.155,

            radius:
                0.021,

            speed:
                1.15,

            color:
                "#d8a96a",

            glow:
                "#f4d39a"
        },

        {
            id:
                "earth",

            name:
                "Erde",

            orbit:
                0.215,

            radius:
                0.024,

            speed:
                0.90,

            color:
                "#4d91d8",

            glow:
                "#7fc9ff",

            earth:
                true
        },

        {
            id:
                "mars",

            name:
                "Mars",

            orbit:
                0.285,

            radius:
                0.018,

            speed:
                0.72,

            color:
                "#b85b43",

            glow:
                "#ed8b65"
        },

        {
            id:
                "jupiter",

            name:
                "Jupiter",

            orbit:
                0.395,

            radius:
                0.055,

            speed:
                0.39,

            color:
                "#c49b79",

            glow:
                "#e5c4a3",

            gas:
                true
        },

        {
            id:
                "saturn",

            name:
                "Saturn",

            orbit:
                0.515,

            radius:
                0.047,

            speed:
                0.30,

            color:
                "#d8c18b",

            glow:
                "#f1dfae",

            rings:
                true,

            gas:
                true
        },

        {
            id:
                "uranus",

            name:
                "Uranus",

            orbit:
                0.635,

            radius:
                0.034,

            speed:
                0.22,

            color:
                "#7ac8d4",

            glow:
                "#b2f2fa"
        },

        {
            id:
                "neptune",

            name:
                "Neptun",

            orbit:
                0.755,

            radius:
                0.032,

            speed:
                0.17,

            color:
                "#426cc4",

            glow:
                "#789cff"
        }

    ];


    /* ========================================================
       HELPERS
    ======================================================== */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );
    }


    function random(
        min,
        max
    ) {

        return (
            Math.random() *
            (
                max -
                min
            )
        ) +
        min;
    }


    function distance(
        x1,
        y1,
        x2,
        y2
    ) {

        const dx =
            x1 - x2;

        const dy =
            y1 - y2;

        return Math.sqrt(
            dx * dx +
            dy * dy
        );
    }


    function emit(
        name,
        data
    ) {

        const bus =
            window.HalDoAppEvents;


        if (
            bus &&
            typeof bus.emit ===
            "function"
        ) {

            try {

                bus.emit(
                    name,
                    data,
                    {
                        source:
                            "cosmic-world"
                    }
                );

            } catch (error) {

                console.warn(
                    "[HalDo Cosmic World]",
                    error
                );
            }
        }


        const bridge =
            window.HalDoV20;


        if (
            bridge &&
            typeof bridge.emit ===
            "function"
        ) {

            try {

                bridge.emit(
                    name,
                    data
                );

            } catch (error) {

                /*
                 * Defensive.
                 */
            }
        }
    }


    /* ========================================================
       ROOT
    ======================================================== */

    function createRoot() {

        if (
            state.root &&
            document.body.contains(
                state.root
            )
        ) {

            return state.root;
        }


        const root =
            document.createElement(
                "section"
            );


        root.id =
            "haldo-v20-cosmic-world";


        root.className =
            "haldo-v20-cosmic-world";


        root.setAttribute(
            "aria-label",
            "HalDo Cosmic World"
        );


        root.innerHTML = [

            '<div class="haldo-cosmic-background"></div>',

            '<canvas class="haldo-cosmic-canvas"></canvas>',

            '<div class="haldo-cosmic-vignette"></div>',

            '<div class="haldo-cosmic-ai">',

                '<div class="haldo-cosmic-ai-ring"></div>',

                '<div class="haldo-cosmic-ai-glow"></div>',

                '<img ',
                    'class="haldo-cosmic-ai-logo" ',
                    'src="assets/logo/logo.png" ',
                    'alt="HalDo AI" ',
                    'draggable="false"',
                '>',

                '<div class="haldo-cosmic-ai-name">',
                    'HalDo AI',
                '</div>',

            '</div>',

            '<div class="haldo-cosmic-info" aria-live="polite">',

                '<strong class="haldo-cosmic-info-name">',
                    'HalDo Cosmic World',
                '</strong>',

                '<span class="haldo-cosmic-info-text">',
                    'Unser lebendiges Sonnensystem',
                '</span>',

            '</div>'

        ].join("");


        document.body.appendChild(
            root
        );


        state.root =
            root;


        state.canvas =
            root.querySelector(
                ".haldo-cosmic-canvas"
            );


        state.context =
            state.canvas.getContext(
                "2d"
            );


        return root;
    }


    /* ========================================================
       STYLE
    ======================================================== */

    function installStyles() {

        if (
            document.getElementById(
                "haldo-v20-cosmic-world-style"
            )
        ) {

            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "haldo-v20-cosmic-world-style";


        style.textContent = `

            #haldo-v20-cosmic-world {

                position:
                    fixed;

                inset:
                    0;

                z-index:
                    0;

                overflow:
                    hidden;

                background:
                    #02030b;

                isolation:
                    isolate;

                font-family:
                    system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif;

                user-select:
                    none;

                touch-action:
                    none;
            }


            #haldo-v20-cosmic-world
            .haldo-cosmic-background {

                position:
                    absolute;

                inset:
                    0;

                background:

                    radial-gradient(
                        circle at 50% 50%,
                        rgba(255,170,55,.15),
                        transparent 15%
                    ),

                    radial-gradient(
                        circle at 22% 30%,
                        rgba(80,120,255,.09),
                        transparent 28%
                    ),

                    radial-gradient(
                        circle at 78% 65%,
                        rgba(160,80,255,.08),
                        transparent 32%
                    ),

                    #02030b;
            }


            #haldo-v20-cosmic-world
            .haldo-cosmic-canvas {

                position:
                    absolute;

                inset:
                    0;

                width:
                    100%;

                height:
                    100%;

                display:
                    block;
            }


            #haldo-v20-cosmic-world
            .haldo-cosmic-vignette {

                position:
                    absolute;

                inset:
                    0;

                pointer-events:
                    none;

                background:
                    radial-gradient(
                        circle,
                        transparent 45%,
                        rgba(0,0,0,.40) 100%
                    );
            }


            #haldo-v20-cosmic-world
            .haldo-cosmic-ai {

                position:
                    absolute;

                left:
                    50%;

                top:
                    50%;

                width:
                    180px;

                height:
                    180px;

                transform:
                    translate(-50%, -50%);

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                pointer-events:
                    none;

                z-index:
                    5;
            }


            #haldo-v20-cosmic-world
            .haldo-cosmic-ai-ring {

                position:
                    absolute;

                inset:
                    0;

                border-radius:
                    50%;

                border:
                    1px solid
                    rgba(255,220,130,.34);

                box-shadow:
                    0 0 30px
                    rgba(255,190,70,.22),

                    inset 0 0 30px
                    rgba(255,210,110,.12);

                animation:
                    haldo-ai-ring
                    8s
                    linear
                    infinite;
            }


            #haldo-v20-cosmic-world
            .haldo-cosmic-ai-glow {

                position:
                    absolute;

                width:
                    135px;

                height:
                    135px;

                border-radius:
                    50%;

                background:
                    radial-gradient(
                        circle,
                        rgba(255,230,150,.35),
                        rgba(255,170,50,.12) 42%,
                        transparent 72%
                    );

                filter:
                    blur(8px);

                animation:
                    haldo-ai-breathe
                    3.8s
                    ease-in-out
                    infinite;
            }


            #haldo-v20-cosmic-world
            .haldo-cosmic-ai-logo {

                position:
                    relative;

                width:
                    92px;

                height:
                    92px;

                object-fit:
                    contain;

                filter:
                    drop-shadow(
                        0 0 18px
                        rgba(255,235,160,.75)
                    );

                animation:
                    haldo-ai-float
                    4s
                    ease-in-out
                    infinite;
            }


            #haldo-v20-cosmic-world
            .haldo-cosmic-ai-name {

                position:
                    absolute;

                top:
                    calc(100% + 12px);

                padding:
                    5px 12px;

                border-radius:
                    999px;

                background:
                    rgba(4,7,18,.60);

                border:
                    1px solid
                    rgba(255,255,255,.12);

                color:
                    rgba(255,248,220,.92);

                font-size:
                    12px;

                letter-spacing:
                    .08em;

                backdrop-filter:
                    blur(10px);
            }


            #haldo-v20-cosmic-world
            .haldo-cosmic-info {

                position:
                    absolute;

                left:
                    20px;

                bottom:
                    20px;

                z-index:
                    10;

                display:
                    flex;

                flex-direction:
                    column;

                gap:
                    4px;

                max-width:
                    300px;

                padding:
                    12px 16px;

                border-radius:
                    16px;

                background:
                    rgba(4,7,18,.58);

                border:
                    1px solid
                    rgba(255,255,255,.10);

                box-shadow:
                    0 10px 40px
                    rgba(0,0,0,.25);

                backdrop-filter:
                    blur(14px);

                color:
                    white;

                pointer-events:
                    none;
            }


            #haldo-v20-cosmic-world
            .haldo-cosmic-info-name {

                font-size:
                    14px;
            }


            #haldo-v20-cosmic-world
            .haldo-cosmic-info-text {

                font-size:
                    11px;

                opacity:
                    .68;
            }


            @keyframes haldo-ai-ring {

                from {
                    transform:
                        rotate(0deg);
                }

                to {
                    transform:
                        rotate(360deg);
                }
            }


            @keyframes haldo-ai-breathe {

                0%, 100% {
                    transform:
                        scale(.92);
                    opacity:
                        .72;
                }

                50% {
                    transform:
                        scale(1.08);
                    opacity:
                        1;
                }
            }


            @keyframes haldo-ai-float {

                0%, 100% {
                    transform:
                        translateY(0);
                }

                50% {
                    transform:
                        translateY(-5px);
                }
            }


            @media (
                max-width: 700px
            ) {

                #haldo-v20-cosmic-world
                .haldo-cosmic-ai {

                    width:
                        130px;

                    height:
                        130px;
                }


                #haldo-v20-cosmic-world
                .haldo-cosmic-ai-logo {

                    width:
                        68px;

                    height:
                        68px;
                }


                #haldo-v20-cosmic-world
                .haldo-cosmic-info {

                    left:
                        12px;

                    bottom:
                        12px;
                }
            }

        `;


        document.head.appendChild(
            style
        );
    }


    /* ========================================================
       STARS
    ======================================================== */

    function createStars() {

        state.stars =
            [];


        const count =
            Math.min(
                900,
                Math.max(
                    300,
                    Math.floor(
                        (
                            window.innerWidth *
                            window.innerHeight
                        ) /
                        1400
                    )
                )
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            state.stars.push({

                x:
                    Math.random(),

                y:
                    Math.random(),

                radius:
                    random(
                        0.25,
                        1.45
                    ),

                alpha:
                    random(
                        0.18,
                        0.95
                    ),

                twinkle:
                    random(
                        0.5,
                        2.8
                    ),

                phase:
                    random(
                        0,
                        Math.PI * 2
                    )
            });
        }
    }


    /* ========================================================
       PLANET STATE
    ======================================================== */

    function createPlanets() {

        state.planets =
            PLANET_DEFINITIONS.map(
                function (
                    definition,
                    index
                ) {

                    return {

                        ...definition,

                        angle:
                            (
                                index *
                                1.87
                            ) +
                            random(
                                0,
                                .8
                            ),

                        rotation:
                            random(
                                0,
                                Math.PI * 2
                            ),

                        moonAngle:
                            random(
                                0,
                                Math.PI * 2
                            )
                    };

                }
            );
    }


    /* ========================================================
       RESIZE
    ======================================================== */

    function resize() {

        if (
            !state.canvas ||
            !state.context
        ) {

            return;
        }


        const rect =
            state.root.getBoundingClientRect();


        state.width =
            rect.width;


        state.height =
            rect.height;


        state.dpr =
            Math.min(
                window.devicePixelRatio ||
                1,
                2
            );


        state.canvas.width =
            Math.floor(
                state.width *
                state.dpr
            );


        state.canvas.height =
            Math.floor(
                state.height *
                state.dpr
            );


        state.canvas.style.width =
            state.width +
            "px";


        state.canvas.style.height =
            state.height +
            "px";


        state.context.setTransform(
            state.dpr,
            0,
            0,
            state.dpr,
            0,
            0
        );
    }


    /* ========================================================
       ORBIT SCALE
    ======================================================== */

    function getOrbitScale() {

        const shortest =
            Math.min(
                state.width,
                state.height
            );


        return shortest * .48;
    }


    /* ========================================================
       DRAW STARS
    ======================================================== */

    function drawStars() {

        const ctx =
            state.context;


        for (
            let i = 0;
            i < state.stars.length;
            i++
        ) {

            const star =
                state.stars[i];


            const pulse =
                (
                    Math.sin(
                        state.time *
                        star.twinkle +
                        star.phase
                    ) +
                    1
                ) *
                .5;


            const alpha =
                star.alpha *
                (
                    .58 +
                    pulse *
                    .42
                );


            ctx.beginPath();


            ctx.arc(
                star.x *
                    state.width,

                star.y *
                    state.height,

                star.radius,

                0,

                Math.PI * 2
            );


            ctx.fillStyle =
                "rgba(255,255,255," +
                alpha +
                ")";


            ctx.fill();
        }
    }


    /* ========================================================
       DRAW ORBIT
    ======================================================== */

    function drawOrbit(
        radius
    ) {

        const ctx =
            state.context;


        const cx =
            state.width / 2;


        const cy =
            state.height / 2;


        ctx.beginPath();


        ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            "rgba(255,255,255,.075)";


        ctx.lineWidth =
            1;


        ctx.stroke();
    }


    /* ========================================================
       DRAW SUN
    ======================================================== */

    function drawSun() {

        const ctx =
            state.context;


        const cx =
            state.width / 2;


        const cy =
            state.height / 2;


        const base =
            Math.min(
                state.width,
                state.height
            );


        const radius =
            clamp(
                base * .075,
                38,
                76
            );


        const pulse =
            1 +
            Math.sin(
                state.time *
                1.4
            ) *
            .035;


        const r =
            radius *
            pulse;


        const glow =
            ctx.createRadialGradient(
                cx,
                cy,
                r * .35,
                cx,
                cy,
                r * 3.6
            );


        glow.addColorStop(
            0,
            "rgba(255,242,180,.50)"
        );


        glow.addColorStop(
            .24,
            "rgba(255,190,65,.25)"
        );


        glow.addColorStop(
            1,
            "rgba(255,150,20,0)"
        );


        ctx.beginPath();


        ctx.arc(
            cx,
            cy,
            r * 3.6,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            glow;


        ctx.fill();


        const gradient =
            ctx.createRadialGradient(
                cx - r * .3,
                cy - r * .35,
                r * .08,
                cx,
                cy,
                r
            );


        gradient.addColorStop(
            0,
            "#fff9d1"
        );


        gradient.addColorStop(
            .28,
            "#ffd66d"
        );


        gradient.addColorStop(
            .72,
            "#ff9e28"
        );


        gradient.addColorStop(
            1,
            "#e86616"
        );


        ctx.beginPath();


        ctx.arc(
            cx,
            cy,
            r,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            gradient;


        ctx.fill();


        /*
         * Solar surface.
         */

        for (
            let i = 0;
            i < 9;
            i++
        ) {

            const angle =
                state.time *
                (.15 + i * .013) +
                i * 2.2;


            const x =
                cx +
                Math.cos(angle) *
                r *
                random(
                    .15,
                    .72
                );


            const y =
                cy +
                Math.sin(angle) *
                r *
                random(
                    .15,
                    .72
                );


            ctx.beginPath();


            ctx.arc(
                x,
                y,
                random(
                    1,
                    3
                ),
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "rgba(255,245,180,.28)";


            ctx.fill();
        }
    }


    /* ========================================================
       DRAW PLANET
    ======================================================== */

    function drawPlanet(
        planet
    ) {

        const ctx =
            state.context;


        const cx =
            state.width / 2;


        const cy =
            state.height / 2;


        const orbitScale =
            getOrbitScale();


        const orbitRadius =
            orbitScale *
            planet.orbit;


        const x =
            cx +
            Math.cos(
                planet.angle
            ) *
            orbitRadius;


        const y =
            cy +
            Math.sin(
                planet.angle
            ) *
            orbitRadius;


        const base =
            Math.min(
                state.width,
                state.height
            );


        const radius =
            Math.max(
                3,
                base *
                planet.radius
            );


        planet.x =
            x;


        planet.y =
            y;


        planet.renderRadius =
            radius;


        /*
         * Planet glow.
         */

        const glow =
            ctx.createRadialGradient(
                x,
                y,
                radius * .3,
                x,
                y,
                radius * 3
            );


        glow.addColorStop(
            0,
            planet.glow
        );


        glow.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            radius * 2.8,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            glow;


        ctx.globalAlpha =
            .16;


        ctx.fill();


        ctx.globalAlpha =
            1;


        /*
         * Body.
         */

        const body =
            ctx.createRadialGradient(
                x - radius * .35,
                y - radius * .4,
                radius * .08,
                x,
                y,
                radius
            );


        body.addColorStop(
            0,
            "#ffffff"
        );


        body.addColorStop(
            .13,
            planet.glow
        );


        body.addColorStop(
            .55,
            planet.color
        );


        body.addColorStop(
            1,
            "#111827"
        );


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            body;


        ctx.fill();


        /*
         * Earth continents + atmosphere.
         */

        if (
            planet.earth
        ) {

            ctx.save();


            ctx.beginPath();


            ctx.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );


            ctx.clip();


            for (
                let i = 0;
                i < 5;
                i++
            ) {

                const px =
                    x +
                    Math.sin(
                        i * 5.3
                    ) *
                    radius *
                    .48;


                const py =
                    y +
                    Math.cos(
                        i * 3.7
                    ) *
                    radius *
                    .42;


                ctx.beginPath();


                ctx.ellipse(
                    px,
                    py,
                    radius *
                        random(
                            .16,
                            .34
                        ),
                    radius *
                        random(
                            .08,
                            .20
                        ),
                    i,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    "rgba(70,165,82,.82)";


                ctx.fill();
            }


            ctx.restore();


            ctx.beginPath();


            ctx.arc(
                x,
                y,
                radius * 1.18,
                0,
                Math.PI * 2
            );


            ctx.strokeStyle =
                "rgba(110,210,255,.42)";


            ctx.lineWidth =
                Math.max(
                    .7,
                    radius * .07
                );


            ctx.stroke();
        }


        /*
         * Jupiter bands.
         */

        if (
            planet.id ===
            "jupiter"
        ) {

            ctx.save();


            ctx.beginPath();


            ctx.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );


            ctx.clip();


            for (
                let i = -3;
                i <= 3;
                i++
            ) {

                ctx.fillStyle =
                    i % 2 === 0
                        ? "rgba(112,73,48,.24)"
                        : "rgba(255,230,190,.20)";


                ctx.fillRect(
                    x - radius,
                    y + i * radius * .24,
                    radius * 2,
                    radius * .10
                );
            }


            ctx.restore();
        }


        /*
         * Saturn rings.
         */

        if (
            planet.rings
        ) {

            ctx.save();


            ctx.translate(
                x,
                y
            );


            ctx.rotate(
                -.28
            );


            ctx.scale(
                1,
                .34
            );


            ctx.beginPath();


            ctx.ellipse(
                0,
                0,
                radius * 2.0,
                radius * 2.0,
                0,
                0,
                Math.PI * 2
            );


            ctx.strokeStyle =
                "rgba(231,214,169,.72)";


            ctx.lineWidth =
                Math.max(
                    2,
                    radius * .15
                );


            ctx.stroke();


            ctx.beginPath();


            ctx.ellipse(
                0,
                0,
                radius * 1.48,
                radius * 1.48,
                0,
                0,
                Math.PI * 2
            );


            ctx.strokeStyle =
                "rgba(130,108,72,.55)";


            ctx.lineWidth =
                Math.max(
                    1,
                    radius * .07
                );


            ctx.stroke();


            ctx.restore();
        }


        /*
         * Moon around Earth.
         */

        if (
            planet.earth
        ) {

            const moonOrbit =
                radius * 2.1;


            const moonX =
                x +
                Math.cos(
                    planet.moonAngle
                ) *
                moonOrbit;


            const moonY =
                y +
                Math.sin(
                    planet.moonAngle
                ) *
                moonOrbit *
                .72;


            ctx.beginPath();


            ctx.arc(
                moonX,
                moonY,
                Math.max(
                    2,
                    radius * .28
                ),
                0,
                Math.PI * 2
            );


            const moonGradient =
                ctx.createRadialGradient(
                    moonX - 1,
                    moonY - 1,
                    1,
                    moonX,
                    moonY,
                    radius * .28
                );


            moonGradient.addColorStop(
                0,
                "#f5f5ef"
            );


            moonGradient.addColorStop(
                1,
                "#66666b"
            );


            ctx.fillStyle =
                moonGradient;


            ctx.fill();
        }
    }


    /* ========================================================
       DRAW
    ======================================================== */

    function draw() {

        if (
            !state.context
        ) {

            return;
        }


        const ctx =
            state.context;


        ctx.clearRect(
            0,
            0,
            state.width,
            state.height
        );


        drawStars();


        const orbitScale =
            getOrbitScale();


        for (
            let i = 0;
            i < state.planets.length;
            i++
        ) {

            drawOrbit(
                orbitScale *
                state.planets[i].orbit
            );
        }


        drawSun();


        /*
         * Draw distant planets first,
         * closer planets afterwards.
         */

        const sorted =
            state.planets
                .slice()
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            a.orbit -
                            b.orbit
                        );

                    }
                );


        for (
            let i = 0;
            i < sorted.length;
            i++
        ) {

            drawPlanet(
                sorted[i]
            );
        }


        /*
         * Pointer highlight.
         */

        if (
            state.pointer.active
        ) {

            for (
                let i = 0;
                i < state.planets.length;
                i++
            ) {

                const planet =
                    state.planets[i];


                if (
                    distance(
                        state.pointer.x,
                        state.pointer.y,
                        planet.x,
                        planet.y
                    ) <
                    planet.renderRadius *
                    2
                ) {

                    ctx.beginPath();


                    ctx.arc(
                        planet.x,
                        planet.y,
                        planet.renderRadius *
                        1.65,
                        0,
                        Math.PI * 2
                    );


                    ctx.strokeStyle =
                        "rgba(255,255,255,.65)";


                    ctx.lineWidth =
                        1;


                    ctx.stroke();

                    break;
                }
            }
        }
    }


    /* ========================================================
       UPDATE
    ======================================================== */

    function update(
        delta
    ) {

        const seconds =
            Math.min(
                delta / 1000,
                .05
            );


        state.time +=
            seconds;


        for (
            let i = 0;
            i < state.planets.length;
            i++
        ) {

            const planet =
                state.planets[i];


            planet.angle +=
                seconds *
                planet.speed *
                .08;


            planet.moonAngle +=
                seconds *
                1.8;
        }


        state.aiPulse =
            (
                Math.sin(
                    state.time *
                    1.4
                ) +
                1
            ) *
            .5;
    }


    /* ========================================================
       LOOP
    ======================================================== */

    function loop(
        timestamp
    ) {

        if (
            !state.running
        ) {

            return;
        }


        if (
            !state.lastTime
        ) {

            state.lastTime =
                timestamp;
        }


        const delta =
            timestamp -
            state.lastTime;


        state.lastTime =
            timestamp;


        update(
            delta
        );


        draw();


        state.animationFrame =
            window.requestAnimationFrame(
                loop
            );
    }


    /* ========================================================
       POINTER
    ======================================================== */

    function updatePointer(
        event
    ) {

        if (
            !state.root
        ) {

            return;
        }


        const rect =
            state.root.getBoundingClientRect();


        state.pointer.x =
            event.clientX -
            rect.left;


        state.pointer.y =
            event.clientY -
            rect.top;


        state.pointer.active =
            true;
    }


    function pointerLeave() {

        state.pointer.active =
            false;
    }


    function pointerSelect() {

        if (
            !state.pointer.active
        ) {

            return;
        }


        for (
            let i = 0;
            i < state.planets.length;
            i++
        ) {

            const planet =
                state.planets[i];


            if (
                distance(
                    state.pointer.x,
                    state.pointer.y,
                    planet.x,
                    planet.y
                ) <
                planet.renderRadius *
                2.2
            ) {

                state.selectedPlanet =
                    planet;


                emit(
                    "cosmic:planet-selected",
                    {

                        planet:
                            planet.id,

                        name:
                            planet.name,

                        position: {

                            x:
                                planet.x,

                            y:
                                planet.y
                        }
                    }
                );


                const nameElement =
                    state.root.querySelector(
                        ".haldo-cosmic-info-name"
                    );


                const textElement =
                    state.root.querySelector(
                        ".haldo-cosmic-info-text"
                    );


                if (
                    nameElement
                ) {

                    nameElement.textContent =
                        planet.name;
                }


                if (
                    textElement
                ) {

                    textElement.textContent =
                        "Planet im HalDo Sonnensystem";
                }


                return;
            }
        }
    }


    /* ========================================================
       EVENTS
    ======================================================== */

    function bindEvents() {

        if (
            !state.root
        ) {

            return;
        }


        state.root.addEventListener(
            "pointermove",
            updatePointer
        );


        state.root.addEventListener(
            "pointerleave",
            pointerLeave
        );


        state.root.addEventListener(
            "pointerdown",
            pointerSelect
        );


        window.addEventListener(
            "resize",
            resize
        );


        /*
         * AI Event.
         */

        const bus =
            window.HalDoAppEvents;


        if (
            bus &&
            typeof bus.on ===
            "function"
        ) {

            bus.on(
                "ai:message",
                function () {

                    state.aiPulse =
                        1;

                }
            );


            bus.on(
                "ai:response",
                function () {

                    state.aiPulse =
                        1;

                }
            );
        }
    }


    /* ========================================================
       START
    ======================================================== */

    CosmicWorld.start =
        function () {

            if (
                state.running
            ) {

                return true;
            }


            state.running =
                true;


            state.lastTime =
                0;


            state.animationFrame =
                window.requestAnimationFrame(
                    loop
                );


            emit(
                "cosmic:started",
                {
                    version:
                        CosmicWorld.version
                }
            );


            return true;
        };


    /* ========================================================
       STOP
    ======================================================== */

    CosmicWorld.stop =
        function () {

            state.running =
                false;


            if (
                state.animationFrame
            ) {

                window.cancelAnimationFrame(
                    state.animationFrame
                );
            }


            state.animationFrame =
                null;
        };


    /* ========================================================
       SHOW / HIDE
    ======================================================== */

    CosmicWorld.show =
        function () {

            if (
                state.root
            ) {

                state.root.style.display =
                    "block";
            }


            CosmicWorld.start();
        };


    CosmicWorld.hide =
        function () {

            if (
                state.root
            ) {

                state.root.style.display =
                    "none";
            }
        };


    /* ========================================================
       SELECT PLANET
    ======================================================== */

    CosmicWorld.selectPlanet =
        function (
            planetId
        ) {

            const planet =
                state.planets.find(
                    function (
                        item
                    ) {

                        return (
                            item.id ===
                            planetId
                        );
                    }
                );


            if (
                !planet
            ) {

                return false;
            }


            state.selectedPlanet =
                planet;


            emit(
                "cosmic:planet-selected",
                {

                    planet:
                        planet.id,

                    name:
                        planet.name
                }
            );


            return true;
        };


    /* ========================================================
       STATUS
    ======================================================== */

    CosmicWorld.getStatus =
        function () {

            return {

                name:
                    CosmicWorld.name,

                version:
                    CosmicWorld.version,

                ready:
                    CosmicWorld.ready,

                running:
                    state.running,

                planets:
                    state.planets.map(
                        function (
                            planet
                        ) {

                            return planet.id;

                        }
                    ),

                stars:
                    state.stars.length,

                selectedPlanet:
                    state.selectedPlanet
                        ? state.selectedPlanet.id
                        : null,

                timestamp:
                    Date.now()
            };
        };


    /* ========================================================
       INIT
    ======================================================== */

    CosmicWorld.init =
        function () {

            if (
                CosmicWorld.ready
            ) {

                return CosmicWorld;
            }


            installStyles();


            createRoot();


            createStars();


            createPlanets();


            resize();


            bindEvents();


            CosmicWorld.ready =
                true;


            CosmicWorld.start();


            /*
             * Global APIs.
             */

            window.HalDoCosmicWorld =
                CosmicWorld;


            window.HalDoV20CosmicWorld =
                CosmicWorld;


            HalDoOS.cosmicWorld =
                CosmicWorld;


            V20.cosmicWorld =
                CosmicWorld;


            emit(
                "cosmic:ready",
                CosmicWorld.getStatus()
            );


            console.log(
                "[HalDo AI OS 20]",
                "Cosmic World bereit."
            );


            return CosmicWorld;
        };


    /* ========================================================
       BOOT
    ======================================================== */

    function boot() {

        try {

            CosmicWorld.init();

        } catch (error) {

            console.error(
                "[HalDo AI OS 20]",
                "Cosmic World Fehler:",
                error
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
