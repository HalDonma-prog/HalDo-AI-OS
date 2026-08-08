/*
========================================================

HalDo AI OS 18
Êzîdî Keyboard System

Professional Ultimate Foundation

Version:
18.0.0

Aufgaben:
- Êzîdî-Tastatur
- Eigene Êzîdî-Zeichen
- Deutsch / Kurdî / Êzîdî Umschaltung
- Virtuelle Tastatur
- Textfeld-Anbindung
- Löschen
- Leerzeichen
- Enter
- Shift
- Zeichen-Auswahl
- Vorbereitung für AI Chat
- Vorbereitung für Voice / Language System

========================================================
*/

(function (window, document) {

    "use strict";


    const HalDoEzidiKeyboard = {


        /* ==================================================
           GRUNDINFORMATIONEN
           ================================================== */

        name:
            "HalDo Êzîdî Keyboard",

        version:
            "18.0.0",

        status:
            "ready",

        initialized:
            false,

        visible:
            false,

        currentLayout:
            "ezidi",


        /* ==================================================
           TEXTFELD
           ================================================== */

        target:
            null,


        /* ==================================================
           LAYOUTS
           ================================================== */

        layouts: {


            /* ==============================================
               ÊZÎDÎ
               ============================================== */

            ezidi: [

                ["Ê", "Î", "Ş", "Ç", "Ğ", "Û", "J"],

                ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],

                ["A", "S", "D", "F", "G", "H", "J", "K", "L"],

                ["Z", "X", "C", "V", "B", "N", "M"]

            ],


            /* ==============================================
               KURDÎ
               ============================================== */

            kurdish: [

                ["Ê", "Î", "Ş", "Ç", "Ğ", "Û"],

                ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],

                ["A", "S", "D", "F", "G", "H", "J", "K", "L"],

                ["Z", "X", "C", "V", "B", "N", "M"]

            ],


            /* ==============================================
               DEUTSCH
               ============================================== */

            german: [

                ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],

                ["A", "S", "D", "F", "G", "H", "J", "K", "L"],

                ["Y", "X", "C", "V", "B", "N", "M"],

                ["Ä", "Ö", "Ü", "ß"]

            ]

        },


        /* ==================================================
           INITIALISIERUNG
           ================================================== */

        init:
            function () {


                if (
                    this.initialized
                ) {

                    return this;

                }


                this.createKeyboard();


                this.initialized =
                    true;


                this.status =
                    "running";


                console.log(
                    "HalDo Êzîdî Keyboard bereit."
                );


                return this;

            },


        /* ==================================================
           ZIEL-TEXTFELD FESTLEGEN
           ================================================== */

        setTarget:
            function (
                element
            ) {


                if (
                    typeof element ===
                    "string"
                ) {


                    element =
                        document.querySelector(
                            element
                        );

                }


                if (
                    !element
                ) {


                    console.warn(
                        "HalDo Keyboard: Ziel nicht gefunden."
                    );


                    return false;

                }


                this.target =
                    element;


                return true;

            },


        /* ==================================================
           TASTATUR ERSTELLEN
           ================================================== */

        createKeyboard:
            function () {


                let keyboard =
                    document.getElementById(
                        "haldo-ezidi-keyboard"
                    );


                if (
                    keyboard
                ) {


                    return keyboard;

                }


                keyboard =
                    document.createElement(
                        "div"
                    );


                keyboard.id =
                    "haldo-ezidi-keyboard";


                keyboard.className =
                    "haldo-keyboard hidden";


                keyboard.setAttribute(
                    "aria-label",
                    "HalDo Êzîdî Tastatur"
                );


                /*
                 * Header
                 */

                const header =
                    document.createElement(
                        "div"
                    );


                header.className =
                    "haldo-keyboard-header";


                const title =
                    document.createElement(
                        "strong"
                    );


                title.textContent =
                    "Êzîdî Keyboard";


                header.appendChild(
                    title
                );


                /*
                 * Layout-Auswahl
                 */

                const layoutSelect =
                    document.createElement(
                        "select"
                    );


                layoutSelect.id =
                    "haldo-keyboard-layout";


                layoutSelect.innerHTML = `

                    <option value="ezidi">
                        Êzîdî
                    </option>

                    <option value="kurdish">
                        Kurdî
                    </option>

                    <option value="german">
                        Deutsch
                    </option>

                `;


                layoutSelect.value =
                    this.currentLayout;


                layoutSelect.addEventListener(
                    "change",
                    function () {

                        this.setLayout(
                            layoutSelect.value
                        );

                    }.bind(this)
                );


                header.appendChild(
                    layoutSelect
                );


                keyboard.appendChild(
                    header
                );


                /*
                 * Tastenbereich
                 */

                const keys =
                    document.createElement(
                        "div"
                    );


                keys.id =
                    "haldo-keyboard-keys";


                keys.className =
                    "haldo-keyboard-keys";


                keyboard.appendChild(
                    keys
                );


                /*
                 * Sondertasten
                 */

                const controls =
                    document.createElement(
                        "div"
                    );


                controls.className =
                    "haldo-keyboard-controls";


                controls.innerHTML = `

                    <button
                        type="button"
                        data-key-action="shift"
                    >
                        ⇧
                    </button>

                    <button
                        type="button"
                        data-key-action="space"
                    >
                        Space
                    </button>

                    <button
                        type="button"
                        data-key-action="backspace"
                    >
                        ⌫
                    </button>

                    <button
                        type="button"
                        data-key-action="enter"
                    >
                        ↵
                    </button>

                `;


                controls
                    .querySelectorAll(
                        "[data-key-action]"
                    )
                    .forEach(
                        function (
                            button
                        ) {


                            button.addEventListener(
                                "click",
                                function () {


                                    this.handleAction(
                                        button.getAttribute(
                                            "data-key-action"
                                        )
                                    );


                                }.bind(this)
                            );


                        }.bind(this)
                    );


                keyboard.appendChild(
                    controls
                );


                document.body.appendChild(
                    keyboard
                );


                this.renderKeys();


                return keyboard;

            },


        /* ==================================================
           TASTEN RENDERN
           ================================================== */

        renderKeys:
            function () {


                const container =
                    document.getElementById(
                        "haldo-keyboard-keys"
                    );


                if (
                    !container
                ) {

                    return;

                }


                container.innerHTML =
                    "";


                const layout =
                    this.layouts[
                        this.currentLayout
                    ];


                if (
                    !layout
                ) {

                    return;

                }


                layout.forEach(
                    function (
                        row
                    ) {


                        const rowElement =
                            document.createElement(
                                "div"
                            );


                        rowElement.className =
                            "haldo-keyboard-row";


                        row.forEach(
                            function (
                                character
                            ) {


                                const key =
                                    document.createElement(
                                        "button"
                                    );


                                key.type =
                                    "button";


                                key.className =
                                    "haldo-key";


                                key.textContent =
                                    character;


                                key.dataset.character =
                                    character;


                                key.addEventListener(
                                    "click",
                                    function () {


                                        this.insertCharacter(
                                            character
                                        );


                                    }.bind(this)
                                );


                                rowElement.appendChild(
                                    key
                                );


                            }.bind(this)
                        );


                        container.appendChild(
                            rowElement
                        );


                    }.bind(this)
                );

            },


        /* ==================================================
           ZEICHEN EINFÜGEN
           ================================================== */

        insertCharacter:
            function (
                character
            ) {


                if (
                    !this.target
                ) {


                    console.warn(
                        "HalDo Keyboard: Kein Textfeld ausgewählt."
                    );


                    return false;

                }


                const start =
                    this.target.selectionStart;


                const end =
                    this.target.selectionEnd;


                const value =
                    this.target.value;


                this.target.value =
                    value.slice(
                        0,
                        start
                    ) +
                    character +
                    value.slice(
                        end
                    );


                const position =
                    start +
                    character.length;


                this.target.focus();


                this.target.setSelectionRange(
                    position,
                    position
                );


                this.dispatch(
                    "input",
                    {
                        character:
                            character
                    }
                );


                return true;

            },


        /* ==================================================
           SPACE
           ================================================== */

        insertSpace:
            function () {


                return this.insertCharacter(
                    " "
                );

            },


        /* ==================================================
           ENTER
           ================================================== */

        enter:
            function () {


                if (
                    !this.target
                ) {

                    return false;

                }


                const event =
                    new KeyboardEvent(
                        "keydown",
                        {
                            key:
                                "Enter",

                            code:
                                "Enter",

                            bubbles:
                                true
                        }
                    );


                this.target.dispatchEvent(
                    event
                );


                this.dispatch(
                    "enter"
                );


                return true;

            },


        /* ==================================================
           LÖSCHEN
           ================================================== */

        backspace:
            function () {


                if (
                    !this.target
                ) {

                    return false;

                }


                const start =
                    this.target.selectionStart;


                const end =
                    this.target.selectionEnd;


                if (
                    start !==
                    end
                ) {


                    this.target.setRangeText(
                        "",
                        start,
                        end,
                        "start"
                    );


                } else if (
                    start >
                    0
                ) {


                    this.target.setRangeText(
                        "",
                        start - 1,
                        start,
                        "start"
                    );


                }


                this.target.focus();


                this.dispatch(
                    "backspace"
                );


                return true;

            },


        /* ==================================================
           SHIFT
           ================================================== */

        shift:
            false,


        toggleShift:
            function () {


                this.shift =
                    !this.shift;


                const keys =
                    document.querySelectorAll(
                        ".haldo-key"
                    );


                keys.forEach(
                    function (
                        key
                    ) {


                        if (
                            this.shift
                        ) {


                            key.classList.add(
                                "shift-active"
                            );


                        } else {


                            key.classList.remove(
                                "shift-active"
                            );


                        }


                    }.bind(this)
                );


            },


        /* ==================================================
           ACTION
           ================================================== */

        handleAction:
            function (
                action
            ) {


                switch (
                    action
                ) {


                    case "shift":

                        this.toggleShift();

                        break;


                    case "space":

                        this.insertSpace();

                        break;


                    case "backspace":

                        this.backspace();

                        break;


                    case "enter":

                        this.enter();

                        break;


                }

            },


        /* ==================================================
           LAYOUT SETZEN
           ================================================== */

        setLayout:
            function (
                layout
            ) {


                if (
                    !this.layouts[
                        layout
                    ]
                ) {


                    return false;

                }


                this.currentLayout =
                    layout;


                this.renderKeys();


                this.dispatch(
                    "layout-change",
                    {
                        layout:
                            layout
                    }
                );


                return true;

            },


        /* ==================================================
           TASTATUR ÖFFNEN
           ================================================== */

        open:
            function (
                target
            ) {


                if (
                    target
                ) {


                    this.setTarget(
                        target
                    );


                }


                if (
                    !this.initialized
                ) {


                    this.init();

                }


                const keyboard =
                    document.getElementById(
                        "haldo-ezidi-keyboard"
                    );


                if (
                    !keyboard
                ) {


                    return false;

                }


                keyboard.classList.remove(
                    "hidden"
                );


                this.visible =
                    true;


                this.dispatch(
                    "open"
                );


                return true;

            },


        /* ==================================================
           TASTATUR SCHLIESSEN
           ================================================== */

        close:
            function () {


                const keyboard =
                    document.getElementById(
                        "haldo-ezidi-keyboard"
                    );


                if (
                    keyboard
                ) {


                    keyboard.classList.add(
                        "hidden"
                    );

                }


                this.visible =
                    false;


                this.dispatch(
                    "close"
                );


                return true;

            },


        /* ==================================================
           TASTATUR EIN/AUS
           ================================================== */

        toggle:
            function (
                target
            ) {


                if (
                    this.visible
                ) {


                    return this.close();

                }


                return this.open(
                    target
                );

            },


        /* ==================================================
           EVENT SYSTEM
           ================================================== */

        dispatch:
            function (
                name,
                detail
            ) {


                try {


                    window.dispatchEvent(
                        new CustomEvent(
                            "haldo-keyboard-" +
                            name,
                            {
                                detail:
                                    detail || {}
                            }
                        )
                    );


                } catch (
                    error
                ) {


                    console.warn(
                        "HalDo Keyboard Event Fehler:",
                        error
                    );


                }

            },


        /* ==================================================
           STATUS
           ================================================== */

        getStatus:
            function () {


                return {


                    name:
                        this.name,


                    version:
                        this.version,


                    status:
                        this.status,


                    layout:
                        this.currentLayout,


                    visible:
                        this.visible,


                    target:
                        Boolean(
                            this.target
                        )

                };

            }

    };


    /* ======================================================
       GLOBAL
       ====================================================== */

    window.HalDoEzidiKeyboard =
        HalDoEzidiKeyboard;


    /*
     * Kurzer Alias für einfachere Verwendung.
     */

    window.HalDoKeyboard =
        HalDoEzidiKeyboard;


    /* ======================================================
       AUTOMATISCHE INITIALISIERUNG
       ====================================================== */

    function initializeKeyboard() {


        HalDoEzidiKeyboard.init();


    }


    if (
        document.readyState ===
        "loading"
    ) {


        document.addEventListener(
            "DOMContentLoaded",
            initializeKeyboard,
            {
                once:
                    true
            }
        );


    } else {


        initializeKeyboard();


    }


})(window, document);