/* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 1 / 16
   ========================================================= */

"use strict";

(function (window, document) {

    /*
     * HalDo App Router
     * -------------------------------------------------------
     * Zentraler Routing-Kern für HalDo AI OS 20.
     *
     * Dieser Router ist so aufgebaut, dass vorhandene Systeme
     * wie Kernel, System, App-Manager, App-Registry und
     * Window-Manager weiterverwendet werden können.
     *
     * TEIL 1 enthält:
     * - globale HalDo-Verbindungen
     * - Router-Konfiguration
     * - zentralen State
     * - sichere Hilfsfunktionen
     * - Event-System
     * - Fehlerverwaltung
     * - Query-Verarbeitung
     * - Route-Normalisierung
     */

    const HalDo =
        window.HalDo ||
        (window.HalDo = {});

    const HalDoOS =
        window.HalDoOS ||
        (window.HalDoOS = {});


    /* =====================================================
       ROUTER KONSTANTEN
       ===================================================== */

    const ROUTER_NAME =
        "HalDoAppRouter";

    const ROUTER_VERSION =
        "20.0.0";

    const DEFAULT_ROUTE =
        "/desktop";

    const NOT_FOUND_ROUTE =
        "/not-found";

    const MAX_HISTORY =
        100;


    /* =====================================================
       ZENTRALER ROUTER STATE
       ===================================================== */

    const state = {

        initialized:
            false,

        ready:
            false,

        destroyed:
            false,

        navigating:
            false,

        navigationId:
            0,

        navigationCount:
            0,

        errorCount:
            0,

        currentRoute:
            null,

        previousRoute:
            null,

        currentPath:
            null,

        previousPath:
            null,

        currentApp:
            null,

        previousApp:
            null,

        currentParams:
            {},

        currentQuery:
            {},

        currentHash:
            "",

        history:
            [],

        historyIndex:
            -1,

        maxHistory:
            MAX_HISTORY,

        routes:
            new Map(),

        aliases:
            new Map(),

        guards:
            [],

        middleware:
            [],

        listeners:
            new Map(),

        pendingNavigation:
            null,

        notFoundRoute:
            NOT_FOUND_ROUTE,

        fallbackRoute:
            DEFAULT_ROUTE,

        basePath:
            "",

        mode:
            "history",

        hashPrefix:
            "#",

        initializedAt:
            null,

        lastNavigationAt:
            null,

        lastError:
            null

    };


    /* =====================================================
       ÖFFENTLICHE ROUTER API
       ===================================================== */

    let api = null;


    /* =====================================================
       SICHERE STRING-FUNKTION
       ===================================================== */

    function toStringSafe(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        return String(
            value
        );

    }


    /* =====================================================
       OBJEKT-PRÜFUNG
       ===================================================== */

    function isObject(
        value
    ) {

        return Boolean(
            value &&
            typeof value ===
                "object" &&
            !Array.isArray(
                value
            )
        );

    }


    /* =====================================================
       FUNKTIONS-PRÜFUNG
       ===================================================== */

    function isFunction(
        value
    ) {

        return (
            typeof value ===
            "function"
        );

    }


    /* =====================================================
       SICHERE DATEN-KOPIE
       ===================================================== */

    function cloneData(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        if (
            typeof structuredClone ===
            "function"
        ) {

            try {

                return structuredClone(
                    value
                );

            }
            catch (
                error
            ) {

                /*
                 * Fallback folgt unten.
                 */

            }

        }


        if (
            typeof value ===
            "object"
        ) {

            try {

                return JSON.parse(
                    JSON.stringify(
                        value
                    )
                );

            }
            catch (
                error
            ) {

                return value;

            }

        }


        return value;

    }


    /* =====================================================
       ROUTE NORMALISIERUNG
       ===================================================== */

    function normalizePath(
        path
    ) {

        let normalized =
            toStringSafe(
                path
            ).trim();


        /*
         * Leere Route wird zur Root-Route.
         */

        if (
            !normalized
        ) {

            return "/";

        }


        /*
         * Hash-Routing-Präfix entfernen.
         */

        normalized =
            normalized.replace(
                /^#+/,
                ""
            );


        /*
         * Query und Hash nicht als Teil
         * des eigentlichen Pfades behandeln.
         */

        const queryIndex =
            normalized.indexOf(
                "?"
            );

        const hashIndex =
            normalized.indexOf(
                "#"
            );


        let cutIndex =
            -1;


        if (
            queryIndex !==
            -1
        ) {

            cutIndex =
                queryIndex;

        }


        if (
            hashIndex !==
            -1 &&
            (
                cutIndex === -1 ||
                hashIndex < cutIndex
            )
        ) {

            cutIndex =
                hashIndex;

        }


        if (
            cutIndex !== -1
        ) {

            normalized =
                normalized.slice(
                    0,
                    cutIndex
                );

        }


        /*
         * Führende Slashes vereinheitlichen.
         */

        normalized =
            normalized.replace(
                /^\/+/,
                "/"
            );


        /*
         * Doppelte Slashes entfernen.
         */

        normalized =
            normalized.replace(
                /\/{2,}/g,
                "/"
            );


        /*
         * Trailing Slash entfernen,
         * außer bei Root.
         */

        if (
            normalized.length >
            1
        ) {

            normalized =
                normalized.replace(
                    /\/+$/,
                    ""
                );

        }


        /*
         * Jede normale Route beginnt mit "/".
         */

        if (
            normalized.charAt(
                0
            ) !== "/"
        ) {

            normalized =
                "/" +
                normalized;

        }


        return normalized;

    }


    /* =====================================================
       ROUTE KEY
       ===================================================== */

    function routeKey(
        path
    ) {

        return normalizePath(
            path
        ).toLowerCase();

    }


    /* =====================================================
       BASE-PATH NORMALISIERUNG
       ===================================================== */

    function normalizeBasePath(
        path
    ) {

        let base =
            toStringSafe(
                path
            ).trim();


        if (
            !base ||
            base === "/"
        ) {

            return "";

        }


        base =
            base.replace(
                /^\/+/,
                "/"
            );


        base =
            base.replace(
                /\/+$/,
                ""
            );


        if (
            base.charAt(
                0
            ) !== "/"
        ) {

            base =
                "/" +
                base;

        }


        return base;

    }


    /* =====================================================
       QUERY PARSER
       ===================================================== */

    function parseQuery(
        query
    ) {

        const result =
            {};


        let source =
            toStringSafe(
                query
            );


        source =
            source.replace(
                /^\?/,
                ""
            );


        if (
            !source
        ) {

            return result;

        }


        let parameters;


        try {

            parameters =
                new URLSearchParams(
                    source
                );

        }
        catch (
            error
        ) {

            return result;

        }


        parameters.forEach(
            function (
                value,
                key
            ) {

                /*
                 * Mehrere identische Query-Parameter
                 * werden als Array erhalten.
                 */

                if (
                    Object.prototype.hasOwnProperty.call(
                        result,
                        key
                    )
                ) {

                    if (
                        Array.isArray(
                            result[key]
                        )
                    ) {

                        result[key].push(
                            value
                        );

                    }
                    else {

                        result[key] =
                            [
                                result[key],
                                value
                            ];

                    }

                }
                else {

                    result[key] =
                        value;

                }

            }
        );


        return result;

    }


    /* =====================================================
       QUERY SERIALIZER
       ===================================================== */

    function serializeQuery(
        query
    ) {

        if (
            !isObject(
                query
            )
        ) {

            return "";

        }


        const parameters =
            new URLSearchParams();


        Object.keys(
            query
        ).forEach(
            function (
                key
            ) {

                const value =
                    query[key];


                if (
                    value ===
                        undefined ||
                    value ===
                        null
                ) {

                    return;

                }


                if (
                    Array.isArray(
                        value
                    )
                ) {

                    value.forEach(
                        function (
                            item
                        ) {

                            if (
                                item ===
                                    undefined ||
                                item ===
                                    null
                            ) {

                                return;

                            }


                            parameters.append(
                                key,
                                toStringSafe(
                                    item
                                )
                            );

                        }
                    );


                    return;

                }


                parameters.set(
                    key,
                    toStringSafe(
                        value
                    )
                );

            }
        );


        const serialized =
            parameters.toString();


        return serialized
            ? "?" + serialized
            : "";

    }


    /* =====================================================
       HASH NORMALISIERUNG
       ===================================================== */

    function normalizeHash(
        hash
    ) {

        return toStringSafe(
            hash
        )
        .replace(
            /^#+/,
            ""
        );

    }


    /* =====================================================
       ROUTE URL ERSTELLEN
       ===================================================== */

    function buildUrl(
        path,
        query,
        hash
    ) {

        const normalized =
            normalizePath(
                path
            );


        const queryString =
            serializeQuery(
                query
            );


        const hashValue =
            normalizeHash(
                hash
            );


        return (
            normalized +
            queryString +
            (
                hashValue
                    ? "#" +
                      hashValue
                    : ""
            )
        );

    }


    /* =====================================================
       CURRENT LOCATION LESEN
       ===================================================== */

    function getLocation() {

        let pathname =
            window.location.pathname ||
            "/";


        const search =
            window.location.search ||
            "";


        const hash =
            window.location.hash ||
            "";


        const base =
            state.basePath;


        if (
            base &&
            pathname.indexOf(
                base
            ) === 0
        ) {

            pathname =
                pathname.slice(
                    base.length
                );

        }


        if (
            !pathname
        ) {

            pathname =
                "/";

        }


        return {

            path:
                normalizePath(
                    pathname
                ),

            query:
                parseQuery(
                    search
                ),

            hash:
                normalizeHash(
                    hash
                )

        };

    }


    /* =====================================================
       EVENT LISTENER SET
       ===================================================== */

    function getListenerSet(
        eventName
    ) {

        if (
            !state.listeners.has(
                eventName
            )
        ) {

            state.listeners.set(
                eventName,
                new Set()
            );

        }


        return state.listeners.get(
            eventName
        );

    }


    /* =====================================================
       ROUTER EVENT EMITTER
       ===================================================== */

    function emit(
        eventName,
        detail
    ) {

        const data =
            detail || {};


        const listeners =
            state.listeners.get(
                eventName
            );


        if (
            listeners
        ) {

            Array.from(
                listeners
            ).forEach(
                function (
                    listener
                ) {

                    try {

                        listener(
                            data
                        );

                    }
                    catch (
                        error
                    ) {

                        handleError(
                            error,
                            {
                                phase:
                                    "listener",

                                event:
                                    eventName
                            }
                        );

                    }

                }
            );

        }


        /*
         * Wildcard-Listener.
         */

        const wildcard =
            state.listeners.get(
                "*"
            );


        if (
            wildcard
        ) {

            Array.from(
                wildcard
            ).forEach(
                function (
                    listener
                ) {

                    try {

                        listener(
                            data,
                            eventName
                        );

                    }
                    catch (
                        error
                    ) {

                        handleError(
                            error,
                            {
                                phase:
                                    "wildcard-listener",

                                event:
                                    eventName
                            }
                        );

                    }

                }
            );

        }


        /*
         * DOM-Event Bridge.
         */

        try {

            document.dispatchEvent(
                new CustomEvent(
                    "haldo:router:" +
                    eventName,
                    {
                        detail:
                            data
                    }
                )
            );

        }
        catch (
            error
        ) {

            console.warn(
                "[HalDo App Router]",
                "DOM event failed:",
                error
            );

        }


        /*
         * HalDo Event-Bus Bridge.
         */

        if (
            isFunction(
                HalDo.emit
            )
        ) {

            try {

                HalDo.emit(
                    "router:" +
                    eventName,
                    data
                );

            }
            catch (
                error
            ) {

                console.warn(
                    "[HalDo App Router]",
                    "HalDo event failed:",
                    error
                );

            }

        }


        return data;

    }


    /* =====================================================
       ROUTER FEHLERBEHANDLUNG
       ===================================================== */

    function handleError(
        error,
        context
    ) {

        state.errorCount +=
            1;


        state.lastError =
            {

                error,

                context:
                    context || {},

                timestamp:
                    Date.now()

            };


        console.error(
            "[HalDo App Router]",
            error,
            context || {}
        );


        /*
         * Fehler niemals erneut als Router-Fehler
         * innerhalb des Error-Handlers werfen.
         */

        try {

            emit(
                "error",
                state.lastError
            );

        }
        catch (
            emitError
        ) {

            console.error(
                "[HalDo App Router]",
                "Error event failed:",
                emitError
            );

        }


        return state.lastError;

    }


    /* =====================================================
       ROUTER LISTENER REGISTRIEREN
       ===================================================== */

    function on(
        eventName,
        listener
    ) {

        if (
            !eventName ||
            !isFunction(
                listener
            )
        ) {

            return function () {};

        }


        const listeners =
            getListenerSet(
                eventName
            );


        listeners.add(
            listener
        );


        return function unsubscribe() {

            off(
                eventName,
                listener
            );

        };

    }


    /* =====================================================
       ROUTER LISTENER ENTFERNEN
       ===================================================== */

    function off(
        eventName,
        listener
    ) {

        const listeners =
            state.listeners.get(
                eventName
            );


        if (
            !listeners
        ) {

            return false;

        }


        const removed =
            listeners.delete(
                listener
            );


        if (
            listeners.size ===
            0
        ) {

            state.listeners.delete(
                eventName
            );

        }


        return removed;

    }


    /* =====================================================
       EVENT EINMALIG AUSFÜHREN
       ===================================================== */

    function once(
        eventName,
        listener
    ) {

        if (
            !isFunction(
                listener
            )
        ) {

            return function () {};

        }


        let unsubscribe =
            null;


        const wrapped =
            function (
                detail
            ) {

                if (
                    unsubscribe
                ) {

                    unsubscribe();

                }


                listener(
                    detail
                );

            };


        unsubscribe =
            on(
                eventName,
                wrapped
            );


        return unsubscribe;

    }


    /* =====================================================
       ROUTER STATUS
       ===================================================== */

    function getState() {

        return {

            initialized:
                state.initialized,

            ready:
                state.ready,

            destroyed:
                state.destroyed,

            navigating:
                state.navigating,

            navigationId:
                state.navigationId,

            navigationCount:
                state.navigationCount,

            errorCount:
                state.errorCount,

            currentRoute:
                cloneData(
                    state.currentRoute
                ),

            previousRoute:
                cloneData(
                    state.previousRoute
                ),

            currentPath:
                state.currentPath,

            previousPath:
                state.previousPath,

            currentApp:
                state.currentApp,

            previousApp:
                state.previousApp,

            currentParams:
                cloneData(
                    state.currentParams
                ),

            currentQuery:
                cloneData(
                    state.currentQuery
                ),

            currentHash:
                state.currentHash,

            historyLength:
                state.history.length,

            historyIndex:
                state.historyIndex,

            basePath:
                state.basePath,

            mode:
                state.mode,

            initializedAt:
                state.initializedAt,

            lastNavigationAt:
                state.lastNavigationAt

        };

    }


    /* =====================================================
       PUBLIC API GRUNDLAGE
       ===================================================== */

    api = {

        name:
            ROUTER_NAME,

        version:
            ROUTER_VERSION,

        state,

        on,

        off,

        once,

        emit,

        getState,

        normalizePath,

        parseQuery,

        serializeQuery,

        buildUrl,

        getLocation

    };


/* =========================================================
   ENDE TEIL 1 / 16
   ========================================================= */
 /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 2 / 16
   ========================================================= */

    /* =====================================================
       ROUTE PARAMETER EXTRAHIEREN
       ===================================================== */

    function extractRouteParams(
        pattern,
        path
    ) {

        const params =
            {};

        const normalizedPattern =
            normalizePath(
                pattern
            );

        const normalizedPath =
            normalizePath(
                path
            );

        const patternParts =
            normalizedPattern
                .split("/")
                .filter(
                    Boolean
                );

        const pathParts =
            normalizedPath
                .split("/")
                .filter(
                    Boolean
                );


        /*
         * Wildcard-Routen können zusätzliche
         * Pfadbestandteile aufnehmen.
         */

        const hasWildcard =
            patternParts.some(
                part =>
                    part === "*" ||
                    part.startsWith(
                        "*"
                    )
            );


        if (
            !hasWildcard &&
            patternParts.length !==
                pathParts.length
        ) {

            return null;

        }


        if (
            hasWildcard &&
            pathParts.length <
                patternParts.length - 1
        ) {

            return null;

        }


        for (
            let index = 0;
            index < patternParts.length;
            index += 1
        ) {

            const patternPart =
                patternParts[index];


            /*
             * Einfacher Wildcard.
             */

            if (
                patternPart ===
                "*"
            ) {

                params.wildcard =
                    pathParts
                        .slice(
                            index
                        )
                        .map(
                            value => {

                                try {

                                    return decodeURIComponent(
                                        value
                                    );

                                }
                                catch (
                                    error
                                ) {

                                    return value;

                                }

                            }
                        )
                        .join(
                            "/"
                        );

                return params;

            }


            /*
             * Benannter Wildcard-Parameter.
             *
             * Beispiel:
             * /files/:path*
             */

            if (
                patternPart.startsWith(
                    ":"
                ) &&
                patternPart.endsWith(
                    "*"
                )
            ) {

                const name =
                    patternPart
                        .slice(
                            1,
                            -1
                        );


                params[name] =
                    pathParts
                        .slice(
                            index
                        )
                        .map(
                            value => {

                                try {

                                    return decodeURIComponent(
                                        value
                                    );

                                }
                                catch (
                                    error
                                ) {

                                    return value;

                                }

                            }
                        )
                        .join(
                            "/"
                        );


                return params;

            }


            const pathPart =
                pathParts[index];


            if (
                pathPart ===
                undefined
            ) {

                return null;

            }


            /*
             * Dynamischer Parameter.
             *
             * Beispiel:
             * /apps/:appId
             */

            if (
                patternPart.charAt(
                    0
                ) === ":"
            ) {

                let parameterName =
                    patternPart.slice(
                        1
                    );


                let optional =
                    false;


                if (
                    parameterName.endsWith(
                        "?"
                    )
                ) {

                    optional =
                        true;

                    parameterName =
                        parameterName.slice(
                            0,
                            -1
                        );

                }


                /*
                 * Unterstützte optionale /
                 * einfache Parameter-Syntax.
                 */

                if (
                    parameterName
                ) {

                    try {

                        params[
                            parameterName
                        ] =
                            decodeURIComponent(
                                pathPart
                            );

                    }
                    catch (
                        error
                    ) {

                        params[
                            parameterName
                        ] =
                            pathPart;

                    }

                }


                continue;

            }


            /*
             * Optionales statisches Segment.
             */

            if (
                patternPart.endsWith(
                    "?"
                )
            ) {

                const optionalPart =
                    patternPart.slice(
                        0,
                        -1
                    );


                if (
                    optionalPart ===
                    pathPart
                ) {

                    continue;

                }


                if (
                    index >=
                    pathParts.length
                ) {

                    continue;

                }


                return null;

            }


            /*
             * Normales statisches Segment.
             */

            if (
                patternPart.toLowerCase() !==
                pathPart.toLowerCase()
            ) {

                return null;

            }

        }


        return params;

    }


    /* =====================================================
       ROUTE PATTERN ERKENNEN
       ===================================================== */

    function isDynamicRoute(
        path
    ) {

        const normalized =
            normalizePath(
                path
            );


        return (
            normalized.indexOf(
                "/:"
            ) !== -1 ||
            normalized.indexOf(
                "/*"
            ) !== -1
        );

    }


    /* =====================================================
       ROUTE RECORD ERSTELLEN
       ===================================================== */

    function createRouteRecord(
        definition
    ) {

        const source =
            isObject(
                definition
            )
                ? definition
                : {
                    path:
                        definition
                };


        const path =
            normalizePath(
                source.path ||
                source.route ||
                source.url ||
                source.id ||
                "/"
            );


        const id =
            toStringSafe(
                source.id ||
                source.name ||
                path
                    .replace(
                        /^\//,
                        ""
                    )
                    .replace(
                        /[^a-zA-Z0-9_-]+/g,
                        "-"
                    ) ||
                "route"
            );


        const record = {

            id,

            path,

            key:
                routeKey(
                    path
                ),

            name:
                source.name ||
                id,

            title:
                source.title ||
                source.name ||
                id,

            description:
                source.description ||
                "",

            appId:
                source.appId ||
                source.app ||
                null,

            module:
                source.module ||
                null,

            component:
                source.component ||
                null,

            template:
                source.template ||
                null,

            handler:
                isFunction(
                    source.handler
                )
                    ? source.handler
                    : null,

            enter:
                isFunction(
                    source.enter
                )
                    ? source.enter
                    : null,

            leave:
                isFunction(
                    source.leave
                )
                    ? source.leave
                    : null,

            beforeEnter:
                isFunction(
                    source.beforeEnter
                )
                    ? source.beforeEnter
                    : null,

            afterEnter:
                isFunction(
                    source.afterEnter
                )
                    ? source.afterEnter
                    : null,

            beforeLeave:
                isFunction(
                    source.beforeLeave
                )
                    ? source.beforeLeave
                    : null,

            afterLeave:
                isFunction(
                    source.afterLeave
                )
                    ? source.afterLeave
                    : null,

            meta:
                cloneData(
                    source.meta ||
                    {}
                ),

            params:
                Array.isArray(
                    source.params
                )
                    ? [
                        ...source.params
                    ]
                    : [],

            aliases:
                Array.isArray(
                    source.aliases
                )
                    ? [
                        ...source.aliases
                    ]
                    : [],

            guards:
                Array.isArray(
                    source.guards
                )
                    ? [
                        ...source.guards
                    ]
                    : [],

            middleware:
                Array.isArray(
                    source.middleware
                )
                    ? [
                        ...source.middleware
                    ]
                    : [],

            query:
                source.query !==
                false,

            requiresAuth:
                Boolean(
                    source.requiresAuth
                ),

            protected:
                Boolean(
                    source.protected
                ),

            cache:
                source.cache !==
                false,

            reload:
                Boolean(
                    source.reload
                ),

            enabled:
                source.enabled !==
                false,

            exact:
                source.exact !==
                false,

            dynamic:
                isDynamicRoute(
                    path
                ),

            priority:
                Number.isFinite(
                    source.priority
                )
                    ? source.priority
                    : 0,

            createdAt:
                Date.now(),

            source:
                source

        };


        return record;

    }


    /* =====================================================
       ROUTE REGISTRIEREN
       ===================================================== */

    function registerRoute(
        definition
    ) {

        const route =
            createRouteRecord(
                definition
            );


        if (
            !route.path
        ) {

            throw new Error(
                "Route benötigt einen gültigen Pfad."
            );

        }


        const existing =
            state.routes.get(
                route.key
            );


        /*
         * Bestehende Route wird kontrolliert
         * aktualisiert statt blind dupliziert.
         */

        if (
            existing
        ) {

            const merged =
                {
                    ...existing,
                    ...route,

                    meta:
                        {
                            ...(
                                existing.meta ||
                                {}
                            ),

                            ...(
                                route.meta ||
                                {}
                            )
                        }

                };


            state.routes.set(
                route.key,
                merged
            );


            /*
             * Aliase der aktualisierten Route
             * erneut anbinden.
             */

            merged.aliases.forEach(
                alias => {

                    registerAlias(
                        alias,
                        merged.path
                    );

                }
            );


            emit(
                "route-updated",
                {
                    route:
                        cloneData(
                            merged
                        ),

                    previous:
                        cloneData(
                            existing
                        )
                }
            );


            return merged;

        }


        state.routes.set(
            route.key,
            route
        );


        route.aliases.forEach(
            alias => {

                registerAlias(
                    alias,
                    route.path
                );

            }
        );


        emit(
            "route-registered",
            {
                route:
                    cloneData(
                        route
                    )
            }
        );


        return route;

    }


    /* =====================================================
       MEHRERE ROUTEN REGISTRIEREN
       ===================================================== */

    function registerRoutes(
        definitions
    ) {

        if (
            !Array.isArray(
                definitions
            )
        ) {

            return [];

        }


        const registered =
            [];


        definitions.forEach(
            definition => {

                try {

                    registered.push(
                        registerRoute(
                            definition
                        )
                    );

                }
                catch (
                    error
                ) {

                    handleError(
                        error,
                        {
                            phase:
                                "register-routes",

                            definition
                        }
                    );

                }

            }
        );


        return registered;

    }


    /* =====================================================
       ROUTE ENTFERNEN
       ===================================================== */

    function unregisterRoute(
        pathOrId
    ) {

        const value =
            toStringSafe(
                pathOrId
            );


        let route =
            state.routes.get(
                routeKey(
                    value
                )
            );


        if (
            !route
        ) {

            route =
                Array.from(
                    state.routes.values()
                )
                .find(
                    item =>
                        item.id ===
                        value ||
                        item.name ===
                        value
                );

        }


        if (
            !route
        ) {

            return false;

        }


        state.routes.delete(
            route.key
        );


        /*
         * Zugehörige Aliase entfernen.
         */

        Array.from(
            state.aliases.entries()
        )
        .forEach(
            function (
                entry
            ) {

                const alias =
                    entry[0];

                const target =
                    entry[1];


                if (
                    target ===
                    route.path
                ) {

                    state.aliases.delete(
                        alias
                    );

                }

            }
        );


        emit(
            "route-unregistered",
            {
                route:
                    cloneData(
                        route
                    )
            }
        );


        return true;

    }


    /* =====================================================
       ROUTE ABRUFEN
       ===================================================== */

    function getRoute(
        pathOrId
    ) {

        const value =
            toStringSafe(
                pathOrId
            );


        const direct =
            state.routes.get(
                routeKey(
                    value
                )
            );


        if (
            direct
        ) {

            return direct;

        }


        const normalized =
            normalizePath(
                value
            );


        const aliased =
            state.aliases.get(
                routeKey(
                    normalized
                )
            );


        if (
            aliased
        ) {

            const target =
                state.routes.get(
                    routeKey(
                        aliased
                    )
                );


            if (
                target
            ) {

                return target;

            }

        }


        return Array.from(
            state.routes.values()
        )
        .find(
            route =>
                route.id ===
                    value ||
                route.name ===
                    value
        ) || null;

    }


    /* =====================================================
       ROUTEN ABRUFEN
       ===================================================== */

    function getRoutes() {

        return Array.from(
            state.routes.values()
        )
        .sort(
            function (
                first,
                second
            ) {

                if (
                    first.priority !==
                    second.priority
                ) {

                    return (
                        second.priority -
                        first.priority
                    );

                }


                return (
                    first.path.length -
                    second.path.length
                );

            }
        )
        .map(
            route =>
                cloneData(
                    route
                )
        );

    }


    /* =====================================================
       ROUTE ALIAS REGISTRIEREN
       ===================================================== */

    function registerAlias(
        alias,
        target
    ) {

        const aliasPath =
            normalizePath(
                alias
            );


        const targetPath =
            normalizePath(
                target
            );


        if (
            aliasPath ===
            targetPath
        ) {

            return false;

        }


        state.aliases.set(
            routeKey(
                aliasPath
            ),
            targetPath
        );


        emit(
            "alias-registered",
            {
                alias:
                    aliasPath,

                target:
                    targetPath
            }
        );


        return true;

    }


    /* =====================================================
       ROUTE ALIAS ENTFERNEN
       ===================================================== */

    function unregisterAlias(
        alias
    ) {

        const key =
            routeKey(
                alias
            );


        if (
            !state.aliases.has(
                key
            )
        ) {

            return false;

        }


        const target =
            state.aliases.get(
                key
            );


        state.aliases.delete(
            key
        );


        emit(
            "alias-unregistered",
            {
                alias:
                    key,

                target
            }
        );


        return true;

    }


    /* =====================================================
       ALIAS AUFLÖSEN
       ===================================================== */

    function resolveAlias(
        path
    ) {

        const normalized =
            normalizePath(
                path
            );


        const target =
            state.aliases.get(
                routeKey(
                    normalized
                )
            );


        return target
            ? normalizePath(
                target
            )
            : normalized;

    }


    /* =====================================================
       ROUTE MATCHING
       ===================================================== */

    function matchRoute(
        path
    ) {

        const normalized =
            resolveAlias(
                path
            );


        /*
         * Zuerst exakter Treffer.
         */

        const exact =
            state.routes.get(
                routeKey(
                    normalized
                )
            );


        if (
            exact &&
            exact.enabled
        ) {

            return {

                route:
                    exact,

                params:
                    {},

                path:
                    normalized,

                exact:
                    true

            };

        }


        /*
         * Danach dynamische Routen.
         */

        const candidates =
            Array.from(
                state.routes.values()
            )
            .filter(
                route =>
                    route.enabled &&
                    route.dynamic
            )
            .sort(
                function (
                    first,
                    second
                ) {

                    if (
                        first.priority !==
                        second.priority
                    ) {

                        return (
                            second.priority -
                            first.priority
                        );

                    }


                    return (
                        second.path.length -
                        first.path.length
                    );

                }
            );


        for (
            const route of candidates
        ) {

            const params =
                extractRouteParams(
                    route.path,
                    normalized
                );


            if (
                params !== null
            ) {

                return {

                    route,

                    params,

                    path:
                        normalized,

                    exact:
                        false

                };

            }

        }


        return null;

    }


    /* =====================================================
       ROUTE EXISTIERT?
       ===================================================== */

    function hasRoute(
        pathOrId
    ) {

        return Boolean(
            getRoute(
                pathOrId
            )
        );

    }


    /* =====================================================
       ROUTER API ERWEITERN
       ===================================================== */

    api.registerRoute =
        registerRoute;

    api.registerRoutes =
        registerRoutes;

    api.unregisterRoute =
        unregisterRoute;

    api.getRoute =
        getRoute;

    api.getRoutes =
        getRoutes;

    api.registerAlias =
        registerAlias;

    api.unregisterAlias =
        unregisterAlias;

    api.resolveAlias =
        resolveAlias;

    api.matchRoute =
        matchRoute;

    api.hasRoute =
        hasRoute;


/* =========================================================
   ENDE TEIL 2 / 16
   ========================================================= */
 /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 3 / 16
   ========================================================= */

    /* =====================================================
       HISTORY-EINTRAG ERSTELLEN
       ===================================================== */

    function createHistoryEntry(
        path,
        params,
        query,
        hash,
        route,
        navigationOptions
    ) {

        return {

            id:
                ++state.navigationId,

            path:
                normalizePath(
                    path
                ),

            params:
                cloneData(
                    params ||
                    {}
                ),

            query:
                cloneData(
                    query ||
                    {}
                ),

            hash:
                normalizeHash(
                    hash
                ),

            route:
                route
                    ? route.id
                    : null,

            appId:
                route
                    ? route.appId
                    : null,

            title:
                route
                    ? route.title
                    : "",

            timestamp:
                Date.now(),

            options:
                cloneData(
                    navigationOptions ||
                    {}
                )

        };

    }


    /* =====================================================
       HISTORY-EINTRAG HINZUFÜGEN
       ===================================================== */

    function pushHistoryEntry(
        entry,
        replace
    ) {

        if (
            !entry
        ) {

            return false;

        }


        /*
         * Replace überschreibt den aktuellen
         * History-Eintrag.
         */

        if (
            replace &&
            state.historyIndex >=
                0
        ) {

            state.history[
                state.historyIndex
            ] =
                entry;


            emit(
                "history-replaced",
                {
                    entry:
                        cloneData(
                            entry
                        ),

                    index:
                        state.historyIndex
                }
            );


            return true;

        }


        /*
         * Wenn nach Back() wieder eine neue Route
         * geöffnet wird, wird der Vorwärtszweig entfernt.
         */

        if (
            state.historyIndex <
            state.history.length - 1
        ) {

            state.history =
                state.history.slice(
                    0,
                    state.historyIndex +
                        1
                );

        }


        state.history.push(
            entry
        );


        /*
         * History-Limit einhalten.
         */

        if (
            state.history.length >
            state.maxHistory
        ) {

            const removeCount =
                state.history.length -
                state.maxHistory;


            state.history.splice(
                0,
                removeCount
            );

        }


        state.historyIndex =
            state.history.length -
            1;


        emit(
            "history-pushed",
            {
                entry:
                    cloneData(
                        entry
                    ),

                index:
                    state.historyIndex
            }
        );


        return true;

    }


    /* =====================================================
       HISTORY-INDEX SYNCHRONISIEREN
       ===================================================== */

    function synchronizeHistoryIndex(
        entry
    ) {

        if (
            !entry
        ) {

            return -1;

        }


        const index =
            state.history.findIndex(
                item =>
                    item.id ===
                    entry.id
            );


        if (
            index !== -1
        ) {

            state.historyIndex =
                index;

            return index;

        }


        return -1;

    }


    /* =====================================================
       HISTORY ABRUFEN
       ===================================================== */

    function getHistory() {

        return state.history.map(
            entry =>
                cloneData(
                    entry
                )
        );

    }


    /* =====================================================
       AKTUELLEN HISTORY-EINTRAG
       ===================================================== */

    function getCurrentHistoryEntry() {

        if (
            state.historyIndex <
                0 ||
            state.historyIndex >=
                state.history.length
        ) {

            return null;

        }


        return cloneData(
            state.history[
                state.historyIndex
            ]
        );

    }


    /* =====================================================
       BACK MÖGLICH?
       ===================================================== */

    function canGoBack() {

        return (
            state.historyIndex >
            0
        );

    }


    /* =====================================================
       FORWARD MÖGLICH?
       ===================================================== */

    function canGoForward() {

        return (
            state.historyIndex <
            state.history.length - 1
        );

    }


    /* =====================================================
       HISTORY LEEREN
       ===================================================== */

    function clearHistory() {

        state.history =
            [];

        state.historyIndex =
            -1;


        emit(
            "history-cleared",
            {
                timestamp:
                    Date.now()
            }
        );


        return true;

    }


    /* =====================================================
       HISTORY-LIMIT SETZEN
       ===================================================== */

    function setHistoryLimit(
        limit
    ) {

        let value =
            Number(
                limit
            );


        if (
            !Number.isFinite(
                value
            )
        ) {

            value =
                MAX_HISTORY;

        }


        value =
            Math.max(
                1,
                Math.floor(
                    value
                )
            );


        state.maxHistory =
            value;


        if (
            state.history.length >
            value
        ) {

            const removeCount =
                state.history.length -
                value;


            state.history.splice(
                0,
                removeCount
            );


            state.historyIndex =
                Math.max(
                    0,
                    state.historyIndex -
                    removeCount
                );

        }


        emit(
            "history-limit-changed",
            {
                limit:
                    value
            }
        );


        return value;

    }


    /* =====================================================
       BROWSER HISTORY URL ERSTELLEN
       ===================================================== */

    function createBrowserUrl(
        path,
        query,
        hash
    ) {

        const normalizedPath =
            normalizePath(
                path
            );


        const fullPath =
            (
                state.basePath ||
                ""
            ) +
            (
                normalizedPath ===
                "/"
                    ? ""
                    : normalizedPath
            );


        const queryString =
            serializeQuery(
                query
            );


        const hashValue =
            normalizeHash(
                hash
            );


        return (
            fullPath ||
            "/"
        ) +
        queryString +
        (
            hashValue
                ? "#" +
                  hashValue
                : ""
        );

    }


    /* =====================================================
       BROWSER HISTORY PUSH
       ===================================================== */

    function pushBrowserState(
        entry,
        replace
    ) {

        if (
            state.mode ===
            "hash"
        ) {

            return pushHashState(
                entry,
                replace
            );

        }


        if (
            !window.history
        ) {

            return false;

        }


        const url =
            createBrowserUrl(
                entry.path,
                entry.query,
                entry.hash
            );


        const stateData =
            {

                __haldoRouter:
                    true,

                router:
                    ROUTER_NAME,

                version:
                    ROUTER_VERSION,

                entry:
                    cloneData(
                        entry
                    )

            };


        try {

            if (
                replace
            ) {

                window.history.replaceState(
                    stateData,
                    entry.title ||
                    "",
                    url
                );

            }
            else {

                window.history.pushState(
                    stateData,
                    entry.title ||
                    "",
                    url
                );

            }


            return true;

        }
        catch (
            error
        ) {

            handleError(
                error,
                {
                    phase:
                        "browser-history",

                    action:
                        replace
                            ? "replace"
                            : "push",

                    url
                }
            );


            return false;

        }

    }


    /* =====================================================
       HASH HISTORY PUSH
       ===================================================== */

    function pushHashState(
        entry,
        replace
    ) {

        const queryString =
            serializeQuery(
                entry.query
            );


        const path =
            normalizePath(
                entry.path
            );


        const hash =
            (
                state.hashPrefix ||
                "#"
            ) +
            path +
            queryString +
            (
                entry.hash
                    ? "#" +
                      normalizeHash(
                          entry.hash
                      )
                    : ""
            );


        try {

            if (
                replace &&
                window.location.replace
            ) {

                const base =
                    window.location.href
                        .split(
                            "#"
                        )[0];


                window.location.replace(
                    base +
                    hash
                );

            }
            else {

                window.location.hash =
                    hash.replace(
                        /^#/,
                        ""
                    );

            }


            return true;

        }
        catch (
            error
        ) {

            handleError(
                error,
                {
                    phase:
                        "hash-history",

                    action:
                        replace
                            ? "replace"
                            : "push",

                    hash
                }
            );


            return false;

        }

    }


    /* =====================================================
       BROWSER HISTORY STATE PRÜFEN
       ===================================================== */

    function isRouterHistoryState(
        historyState
    ) {

        return Boolean(
            historyState &&
            historyState.__haldoRouter ===
                true
        );

    }


    /* =====================================================
       HISTORY POP EVENT
       ===================================================== */

    function handlePopState(
        event
    ) {

        if (
            state.destroyed
        ) {

            return;

        }


        const location =
            getLocation();


        const matched =
            matchRoute(
                location.path
            );


        const browserState =
            event &&
            event.state;


        emit(
            "browser-navigation",
            {

                location:
                    cloneData(
                        location
                    ),

                state:
                    cloneData(
                        browserState
                    ),

                matched:
                    matched
                        ? cloneData(
                            {
                                id:
                                    matched.route.id,

                                path:
                                    matched.route.path,

                                params:
                                    matched.params
                            }
                        )
                        : null

            }
        );


        /*
         * Browser navigation wird intern
         * synchronisiert, ohne einen neuen
         * Browser-History-Eintrag zu erzeugen.
         */

        navigate(
            location.path,
            {

                query:
                    location.query,

                hash:
                    location.hash,

                history:
                    false,

                source:
                    "browser",

                replace:
                    true,

                fromPopState:
                    true,

                browserState

            }
        )
        .catch(
            error => {

                handleError(
                    error,
                    {
                        phase:
                            "popstate-navigation"
                    }
                );

            }
        );

    }


    /* =====================================================
       HASH CHANGE EVENT
       ===================================================== */

    function handleHashChange() {

        if (
            state.destroyed
        ) {

            return;

        }


        if (
            state.mode !==
            "hash"
        ) {

            return;

        }


        const location =
            getHashLocation();


        if (
            !location
        ) {

            return;

        }


        navigate(
            location.path,
            {

                query:
                    location.query,

                hash:
                    location.hash,

                history:
                    false,

                source:
                    "hash",

                replace:
                    true,

                fromHashChange:
                    true

            }
        )
        .catch(
            error => {

                handleError(
                    error,
                    {
                        phase:
                            "hashchange-navigation"
                    }
                );

            }
        );

    }


    /* =====================================================
       HASH LOCATION LESEN
       ===================================================== */

    function getHashLocation() {

        const rawHash =
            normalizeHash(
                window.location.hash
            );


        if (
            !rawHash
        ) {

            return {

                path:
                    DEFAULT_ROUTE,

                query:
                    {},

                hash:
                    ""

            };

        }


        let source =
            rawHash;


        /*
         * Unterstützt:
         *
         * #/desktop
         * #/apps/settings
         * #/chat?mode=ai
         */

        if (
            source.charAt(
                0
            ) !== "/"
        ) {

            source =
                "/" +
                source;

        }


        let path =
            source;


        let query =
            {};


        let innerHash =
            "";


        const queryIndex =
            source.indexOf(
                "?"
            );


        const innerHashIndex =
            source.indexOf(
                "#"
            );


        if (
            queryIndex !== -1
        ) {

            path =
                source.slice(
                    0,
                    queryIndex
                );


            let querySource =
                source.slice(
                    queryIndex + 1
                );


            if (
                innerHashIndex !== -1 &&
                innerHashIndex >
                    queryIndex
            ) {

                querySource =
                    source.slice(
                        queryIndex + 1,
                        innerHashIndex
                    );

                innerHash =
                    source.slice(
                        innerHashIndex + 1
                    );

            }


            query =
                parseQuery(
                    querySource
                );

        }
        else if (
            innerHashIndex !== -1
        ) {

            path =
                source.slice(
                    0,
                    innerHashIndex
                );

            innerHash =
                source.slice(
                    innerHashIndex + 1
                );

        }


        return {

            path:
                normalizePath(
                    path
                ),

            query,

            hash:
                normalizeHash(
                    innerHash
                )

        };

    }


    /* =====================================================
       HISTORY API AN API ANBINDEN
       ===================================================== */

    api.createHistoryEntry =
        createHistoryEntry;

    api.pushHistoryEntry =
        pushHistoryEntry;

    api.getHistory =
        getHistory;

    api.getCurrentHistoryEntry =
        getCurrentHistoryEntry;

    api.canGoBack =
        canGoBack;

    api.canGoForward =
        canGoForward;

    api.clearHistory =
        clearHistory;

    api.setHistoryLimit =
        setHistoryLimit;

    api.isRouterHistoryState =
        isRouterHistoryState;

    api.getHashLocation =
        getHashLocation;


/* =========================================================
   ENDE TEIL 3 / 16
   ========================================================= */
 /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 4 / 16
   ========================================================= */

    /* =====================================================
       ROUTER GUARDS
       ===================================================== */

    function addGuard(
        guard,
        options
    ) {

        if (
            !isFunction(
                guard
            )
        ) {

            throw new TypeError(
                "Router Guard muss eine Funktion sein."
            );

        }


        const config =
            isObject(
                options
            )
                ? options
                : {};


        const record = {

            id:
                config.id ||
                (
                    "guard-" +
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(
                            36
                        )
                        .slice(
                            2,
                            8
                        )
                ),

            handler:
                guard,

            priority:
                Number.isFinite(
                    config.priority
                )
                    ? config.priority
                    : 0,

            enabled:
                config.enabled !==
                false,

            name:
                config.name ||
                guard.name ||
                "anonymous",

            createdAt:
                Date.now()

        };


        state.guards.push(
            record
        );


        state.guards.sort(
            function (
                first,
                second
            ) {

                return (
                    second.priority -
                    first.priority
                );

            }
        );


        emit(
            "guard-added",
            {
                guard:
                    {
                        id:
                            record.id,

                        name:
                            record.name,

                        priority:
                            record.priority,

                        enabled:
                            record.enabled
                    }
            }
        );


        return record;

    }


    /* =====================================================
       ROUTER GUARD ENTFERNEN
       ===================================================== */

    function removeGuard(
        guardOrId
    ) {

        let index =
            -1;


        if (
            isFunction(
                guardOrId
            )
        ) {

            index =
                state.guards.findIndex(
                    item =>
                        item.handler ===
                        guardOrId
                );

        }
        else {

            const id =
                toStringSafe(
                    guardOrId
                );


            index =
                state.guards.findIndex(
                    item =>
                        item.id ===
                        id
                );

        }


        if (
            index ===
            -1
        ) {

            return false;

        }


        const removed =
            state.guards.splice(
                index,
                1
            )[0];


        emit(
            "guard-removed",
            {
                guard:
                    {
                        id:
                            removed.id,

                        name:
                            removed.name
                    }
            }
        );


        return true;

    }


    /* =====================================================
       GUARDS ABRUFEN
       ===================================================== */

    function getGuards() {

        return state.guards.map(
            guard => {

                return {

                    id:
                        guard.id,

                    name:
                        guard.name,

                    priority:
                        guard.priority,

                    enabled:
                        guard.enabled,

                    createdAt:
                        guard.createdAt

                };

            }
        );

    }


    /* =====================================================
       GUARD AKTIVIEREN / DEAKTIVIEREN
       ===================================================== */

    function setGuardEnabled(
        guardOrId,
        enabled
    ) {

        const id =
            isFunction(
                guardOrId
            )
                ? null
                : toStringSafe(
                    guardOrId
                );


        const guard =
            state.guards.find(
                item =>
                    (
                        id &&
                        item.id ===
                        id
                    ) ||
                    (
                        isFunction(
                            guardOrId
                        ) &&
                        item.handler ===
                        guardOrId
                    )
            );


        if (
            !guard
        ) {

            return false;

        }


        guard.enabled =
            enabled !==
            false;


        emit(
            "guard-state-changed",
            {
                id:
                    guard.id,

                enabled:
                    guard.enabled
            }
        );


        return true;

    }


    /* =====================================================
       MIDDLEWARE REGISTRIEREN
       ===================================================== */

    function addMiddleware(
        middleware,
        options
    ) {

        if (
            !isFunction(
                middleware
            )
        ) {

            throw new TypeError(
                "Router Middleware muss eine Funktion sein."
            );

        }


        const config =
            isObject(
                options
            )
                ? options
                : {};


        const record = {

            id:
                config.id ||
                (
                    "middleware-" +
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(
                            36
                        )
                        .slice(
                            2,
                            8
                        )
                ),

            handler:
                middleware,

            priority:
                Number.isFinite(
                    config.priority
                )
                    ? config.priority
                    : 0,

            enabled:
                config.enabled !==
                false,

            name:
                config.name ||
                middleware.name ||
                "anonymous",

            createdAt:
                Date.now()

        };


        state.middleware.push(
            record
        );


        state.middleware.sort(
            function (
                first,
                second
            ) {

                return (
                    first.priority -
                    second.priority
                );

            }
        );


        emit(
            "middleware-added",
            {
                middleware:
                    {
                        id:
                            record.id,

                        name:
                            record.name,

                        priority:
                            record.priority,

                        enabled:
                            record.enabled
                    }
            }
        );


        return record;

    }


    /* =====================================================
       MIDDLEWARE ENTFERNEN
       ===================================================== */

    function removeMiddleware(
        middlewareOrId
    ) {

        let index =
            -1;


        if (
            isFunction(
                middlewareOrId
            )
        ) {

            index =
                state.middleware.findIndex(
                    item =>
                        item.handler ===
                        middlewareOrId
                );

        }
        else {

            const id =
                toStringSafe(
                    middlewareOrId
                );


            index =
                state.middleware.findIndex(
                    item =>
                        item.id ===
                        id
                );

        }


        if (
            index ===
            -1
        ) {

            return false;

        }


        const removed =
            state.middleware.splice(
                index,
                1
            )[0];


        emit(
            "middleware-removed",
            {
                middleware:
                    {
                        id:
                            removed.id,

                        name:
                            removed.name
                    }
            }
        );


        return true;

    }


    /* =====================================================
       MIDDLEWARE ABRUFEN
       ===================================================== */

    function getMiddleware() {

        return state.middleware.map(
            middleware => {

                return {

                    id:
                        middleware.id,

                    name:
                        middleware.name,

                    priority:
                        middleware.priority,

                    enabled:
                        middleware.enabled,

                    createdAt:
                        middleware.createdAt

                };

            }
        );

    }


    /* =====================================================
       MIDDLEWARE AKTIVIEREN / DEAKTIVIEREN
       ===================================================== */

    function setMiddlewareEnabled(
        middlewareOrId,
        enabled
    ) {

        const id =
            isFunction(
                middlewareOrId
            )
                ? null
                : toStringSafe(
                    middlewareOrId
                );


        const middleware =
            state.middleware.find(
                item =>
                    (
                        id &&
                        item.id ===
                        id
                    ) ||
                    (
                        isFunction(
                            middlewareOrId
                        ) &&
                        item.handler ===
                        middlewareOrId
                    )
            );


        if (
            !middleware
        ) {

            return false;

        }


        middleware.enabled =
            enabled !==
            false;


        emit(
            "middleware-state-changed",
            {
                id:
                    middleware.id,

                enabled:
                    middleware.enabled
            }
        );


        return true;

    }


    /* =====================================================
       NAVIGATION CONTEXT ERSTELLEN
       ===================================================== */

    function createNavigationContext(
        target,
        options
    ) {

        const config =
            isObject(
                options
            )
                ? options
                : {};


        const targetPath =
            normalizePath(
                target
            );


        const query =
            isObject(
                config.query
            )
                ? cloneData(
                    config.query
                )
                : parseQuery(
                    config.query ||
                    ""
                );


        const hash =
            normalizeHash(
                config.hash ||
                ""
            );


        const matched =
            matchRoute(
                targetPath
            );


        const from =
            {

                path:
                    state.currentPath,

                route:
                    state.currentRoute
                        ? cloneData(
                            state.currentRoute
                        )
                        : null,

                appId:
                    state.currentApp,

                params:
                    cloneData(
                        state.currentParams
                    ),

                query:
                    cloneData(
                        state.currentQuery
                    ),

                hash:
                    state.currentHash

            };


        const to =
            {

                path:
                    targetPath,

                route:
                    matched
                        ? cloneData(
                            matched.route
                        )
                        : null,

                appId:
                    matched &&
                    matched.route
                        ? matched.route.appId
                        : null,

                params:
                    matched
                        ? cloneData(
                            matched.params
                        )
                        : {},

                query:
                    cloneData(
                        query
                    ),

                hash

            };


        return {

            id:
                state.navigationId +
                1,

            from,

            to,

            route:
                matched
                    ? matched.route
                    : null,

            params:
                matched
                    ? matched.params
                    : {},

            query,

            hash,

            options:
                config,

            source:
                config.source ||
                "application",

            replace:
                Boolean(
                    config.replace
                ),

            history:
                config.history !==
                false,

            browserState:
                config.browserState ||
                null,

            timestamp:
                Date.now(),

            cancelled:
                false,

            redirected:
                false,

            redirect:
                null,

            result:
                null,

            error:
                null

        };

    }


    /* =====================================================
       GUARD RESULT AUSWERTEN
       ===================================================== */

    function interpretGuardResult(
        result,
        context
    ) {

        if (
            result ===
            undefined ||
            result ===
            true
        ) {

            return {

                allowed:
                    true,

                context

            };

        }


        if (
            result ===
            false
        ) {

            return {

                allowed:
                    false,

                cancelled:
                    true,

                reason:
                    "guard-rejected",

                context

            };

        }


        if (
            typeof result ===
            "string"
        ) {

            return {

                allowed:
                    false,

                redirected:
                    true,

                redirect:
                    result,

                reason:
                    "guard-redirect",

                context

            };

        }


        if (
            isObject(
                result
            )
        ) {

            if (
                result.redirect
            ) {

                return {

                    allowed:
                        false,

                    redirected:
                        true,

                    redirect:
                        result.redirect,

                    reason:
                        result.reason ||
                        "guard-redirect",

                    context

                };

            }


            if (
                result.cancel ===
                true ||
                result.cancelled ===
                true
            ) {

                return {

                    allowed:
                        false,

                    cancelled:
                        true,

                    reason:
                        result.reason ||
                        "guard-cancelled",

                    context

                };

            }


            if (
                result.allow ===
                false
            ) {

                return {

                    allowed:
                        false,

                    cancelled:
                        true,

                    reason:
                        result.reason ||
                        "guard-rejected",

                    context

                };

            }


            if (
                result.allow ===
                true
            ) {

                return {

                    allowed:
                        true,

                    context

                };

            }

        }


        /*
         * Unbekannte Rückgaben werden aus
         * Sicherheitsgründen nicht blockierend behandelt.
         */

        return {

            allowed:
                true,

            context

        };

    }


    /* =====================================================
       EINZELNEN GUARD AUSFÜHREN
       ===================================================== */

    async function executeGuard(
        guard,
        context
    ) {

        if (
            !guard ||
            !guard.enabled ||
            !isFunction(
                guard.handler
            )
        ) {

            return {

                allowed:
                    true,

                context

            };

        }


        try {

            const result =
                await guard.handler(
                    context,
                    api
                );


            return interpretGuardResult(
                result,
                context
            );

        }
        catch (
            error
        ) {

            handleError(
                error,
                {
                    phase:
                        "guard",

                    guard:
                        guard.id,

                    route:
                        context.to.path
                }
            );


            return {

                allowed:
                    false,

                cancelled:
                    true,

                reason:
                    "guard-error",

                error,

                context

            };

        }

    }


    /* =====================================================
       ALLE GLOBALEN GUARDS AUSFÜHREN
       ===================================================== */

    async function runGlobalGuards(
        context
    ) {

        for (
            const guard of
            state.guards
        ) {

            if (
                !guard.enabled
            ) {

                continue;

            }


            const result =
                await executeGuard(
                    guard,
                    context
                );


            if (
                !result.allowed
            ) {

                return result;

            }

        }


        return {

            allowed:
                true,

            context

        };

    }


    /* =====================================================
       ROUTE-SPEZIFISCHE GUARDS
       ===================================================== */

    async function runRouteGuards(
        context
    ) {

        const route =
            context.route;


        if (
            !route
        ) {

            return {

                allowed:
                    true,

                context

            };

        }


        const guards =
            Array.isArray(
                route.guards
            )
                ? route.guards
                : [];


        for (
            const guard of guards
        ) {

            if (
                !isFunction(
                    guard
                )
            ) {

                continue;

            }


            try {

                const result =
                    await guard(
                        context,
                        api
                    );


                const interpreted =
                    interpretGuardResult(
                        result,
                        context
                    );


                if (
                    !interpreted.allowed
                ) {

                    return interpreted;

                }

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {
                        phase:
                            "route-guard",

                        route:
                            route.id
                    }
                );


                return {

                    allowed:
                        false,

                    cancelled:
                        true,

                    reason:
                        "route-guard-error",

                    error,

                    context

                };

            }

        }


        return {

            allowed:
                true,

            context

        };

    }


    /* =====================================================
       MIDDLEWARE AUSFÜHREN
       ===================================================== */

    async function runMiddleware(
        context
    ) {

        const middleware =
            state.middleware.filter(
                item =>
                    item.enabled &&
                    isFunction(
                        item.handler
                    )
            );


        let index =
            -1;


        async function next() {

            index +=
                1;


            if (
                index >=
                middleware.length
            ) {

                return {

                    allowed:
                        true,

                    context

                };

            }


            const current =
                middleware[index];


            try {

                const result =
                    await current.handler(
                        context,
                        next,
                        api
                    );


                if (
                    result ===
                    undefined
                ) {

                    return {

                        allowed:
                            true,

                        context

                    };

                }


                return interpretGuardResult(
                    result,
                    context
                );

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {
                        phase:
                            "middleware",

                        middleware:
                            current.id
                    }
                );


                return {

                    allowed:
                        false,

                    cancelled:
                        true,

                    reason:
                        "middleware-error",

                    error,

                    context

                };

            }

        }


        return next();

    }


    /* =====================================================
       NAVIGATION API VERÖFFENTLICHEN
       ===================================================== */

    api.addGuard =
        addGuard;

    api.removeGuard =
        removeGuard;

    api.getGuards =
        getGuards;

    api.setGuardEnabled =
        setGuardEnabled;

    api.addMiddleware =
        addMiddleware;

    api.removeMiddleware =
        removeMiddleware;

    api.getMiddleware =
        getMiddleware;

    api.setMiddlewareEnabled =
        setMiddlewareEnabled;

    api.createNavigationContext =
        createNavigationContext;


/* =========================================================
   ENDE TEIL 4 / 16
   ========================================================= */
 /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 5 / 16
   ========================================================= */

    /* =====================================================
       NAVIGATION RESULT ERSTELLEN
       ===================================================== */

    function createNavigationResult(
        success,
        context,
        extra
    ) {

        const additional =
            isObject(
                extra
            )
                ? extra
                : {};


        return {

            success:
                Boolean(
                    success
                ),

            id:
                context
                    ? context.id
                    : null,

            path:
                context &&
                context.to
                    ? context.to.path
                    : null,

            from:
                context &&
                context.from
                    ? cloneData(
                        context.from
                    )
                    : null,

            to:
                context &&
                context.to
                    ? cloneData(
                        context.to
                    )
                    : null,

            route:
                context &&
                context.route
                    ? cloneData(
                        context.route
                    )
                    : null,

            params:
                context
                    ? cloneData(
                        context.params ||
                        {}
                    )
                    : {},

            query:
                context
                    ? cloneData(
                        context.query ||
                        {}
                    )
                    : {},

            hash:
                context
                    ? context.hash || ""
                    : "",

            cancelled:
                Boolean(
                    context &&
                    context.cancelled
                ),

            redirected:
                Boolean(
                    context &&
                    context.redirected
                ),

            redirect:
                context
                    ? context.redirect
                    : null,

            source:
                context
                    ? context.source
                    : null,

            timestamp:
                Date.now(),

            ...additional

        };

    }


    /* =====================================================
       ROUTE NICHT GEFUNDEN
       ===================================================== */

    function handleRouteNotFound(
        context
    ) {

        emit(
            "route-not-found",
            {

                path:
                    context.to.path,

                query:
                    cloneData(
                        context.query
                    ),

                hash:
                    context.hash,

                context:
                    cloneData(
                        context
                    )

            }
        );


        /*
         * Falls ausdrücklich keine Fallback-Route
         * gewünscht wurde, bleibt die Navigation
         * kontrolliert abgebrochen.
         */

        if (
            context.options &&
            context.options.fallback ===
                false
        ) {

            context.cancelled =
                true;


            return {

                handled:
                    true,

                redirected:
                    false,

                cancelled:
                    true,

                reason:
                    "route-not-found"

            };

        }


        const fallback =
            context.options &&
            context.options.fallback
                ? context.options.fallback
                : state.notFoundRoute;


        /*
         * Nur umleiten, wenn die Not-Found-Route
         * tatsächlich registriert ist.
         */

        if (
            fallback &&
            hasRoute(
                fallback
            )
        ) {

            context.redirected =
                true;

            context.redirect =
                fallback;


            return {

                handled:
                    true,

                redirected:
                    true,

                cancelled:
                    false,

                redirect:
                    fallback,

                reason:
                    "route-not-found"

            };

        }


        /*
         * Alternativ kann die konfigurierte
         * Fallback-Route verwendet werden.
         */

        const fallbackRoute =
            state.fallbackRoute;


        if (
            fallbackRoute &&
            fallbackRoute !==
                context.to.path &&
            hasRoute(
                fallbackRoute
            )
        ) {

            context.redirected =
                true;

            context.redirect =
                fallbackRoute;


            return {

                handled:
                    true,

                redirected:
                    true,

                cancelled:
                    false,

                redirect:
                    fallbackRoute,

                reason:
                    "route-not-found-fallback"

            };

        }


        context.cancelled =
            true;


        return {

            handled:
                true,

            redirected:
                false,

            cancelled:
                true,

            reason:
                "route-not-found"

        };

    }


    /* =====================================================
       AUTHENTIFIZIERUNGSSTATUS ERMITTELN
       ===================================================== */

    function getAuthenticationState() {

        const candidates =
            [

                window.HalDoAuth,

                window.HalDoAuthentication,

                window.HalDoUser,

                HalDoOS.auth,

                HalDoOS.authentication

            ];


        for (
            const candidate of
            candidates
        ) {

            if (
                !candidate
            ) {

                continue;

            }


            if (
                typeof candidate.isAuthenticated ===
                "function"
            ) {

                try {

                    return Boolean(
                        candidate.isAuthenticated()
                    );

                }
                catch (
                    error
                ) {

                    handleError(
                        error,
                        {
                            phase:
                                "authentication-check"
                        }
                    );

                }

            }


            if (
                typeof candidate.authenticated ===
                "boolean"
            ) {

                return candidate.authenticated;

            }


            if (
                typeof candidate.isLoggedIn ===
                "function"
            ) {

                try {

                    return Boolean(
                        candidate.isLoggedIn()
                    );

                }
                catch (
                    error
                ) {

                    handleError(
                        error,
                        {
                            phase:
                                "login-check"
                        }
                    );

                }

            }

        }


        /*
         * Wenn kein Auth-System vorhanden ist,
         * wird die Route nicht automatisch blockiert.
         */

        return null;

    }


    /* =====================================================
       AUTH GUARD
       ===================================================== */

    async function runAuthenticationGuard(
        context
    ) {

        const route =
            context.route;


        if (
            !route
        ) {

            return {

                allowed:
                    true,

                context

            };

        }


        const protectedRoute =
            Boolean(
                route.requiresAuth ||
                route.protected
            );


        if (
            !protectedRoute
        ) {

            return {

                allowed:
                    true,

                context

            };

        }


        const authenticated =
            getAuthenticationState();


        /*
         * Kein Auth-System registriert:
         * Router blockiert die Route nicht,
         * damit HalDo AI OS auch ohne externes
         * Auth-Modul bootfähig bleibt.
         */

        if (
            authenticated ===
            null
        ) {

            emit(
                "authentication-unavailable",
                {
                    route:
                        route.id,

                    path:
                        route.path
                }
            );


            return {

                allowed:
                    true,

                context

            };

        }


        if (
            authenticated
        ) {

            return {

                allowed:
                    true,

                context

            };

        }


        /*
         * Standardmäßige Login-Route.
         */

        const loginRoute =
            context.options &&
            context.options.loginRoute
                ? context.options.loginRoute
                : "/login";


        if (
            loginRoute &&
            normalizePath(
                loginRoute
            ) !==
            normalizePath(
                context.to.path
            )
        ) {

            return {

                allowed:
                    false,

                redirected:
                    true,

                redirect:
                    loginRoute,

                reason:
                    "authentication-required",

                context

            };

        }


        return {

            allowed:
                false,

            cancelled:
                true,

            reason:
                "authentication-required",

            context

        };

    }


    /* =====================================================
       NAVIGATION STATE ZURÜCKSETZEN
       ===================================================== */

    function resetNavigationState() {

        state.navigating =
            false;

        state.pendingNavigation =
            null;

    }


    /* =====================================================
       AKTUELLEN ROUTER STATE AKTUALISIEREN
       ===================================================== */

    function commitRouteState(
        context,
        entry
    ) {

        const previousRoute =
            state.currentRoute;


        const previousPath =
            state.currentPath;


        const previousApp =
            state.currentApp;


        state.previousRoute =
            previousRoute
                ? cloneData(
                    previousRoute
                )
                : null;


        state.previousPath =
            previousPath;


        state.previousApp =
            previousApp;


        state.currentRoute =
            context.route
                ? cloneData(
                    context.route
                )
                : null;


        state.currentPath =
            context.to.path;


        state.currentApp =
            context.to.appId ||
            null;


        state.currentParams =
            cloneData(
                context.params ||
                {}
            );


        state.currentQuery =
            cloneData(
                context.query ||
                {}
            );


        state.currentHash =
            context.hash ||
            "";


        state.lastNavigationAt =
            Date.now();


        state.navigationCount +=
            1;


        if (
            entry
        ) {

            state.lastHistoryEntry =
                cloneData(
                    entry
                );

        }


        emit(
            "state-committed",
            {

                current:
                    {
                        route:
                            cloneData(
                                state.currentRoute
                            ),

                        path:
                            state.currentPath,

                        appId:
                            state.currentApp,

                        params:
                            cloneData(
                                state.currentParams
                            ),

                        query:
                            cloneData(
                                state.currentQuery
                            ),

                        hash:
                            state.currentHash
                    },

                previous:
                    {
                        route:
                            cloneData(
                                state.previousRoute
                            ),

                        path:
                            state.previousPath,

                        appId:
                            state.previousApp
                    }

            }
        );

    }


    /* =====================================================
       DOCUMENT TITLE AKTUALISIEREN
       ===================================================== */

    function updateDocumentTitle(
        route,
        context
    ) {

        if (
            !route
        ) {

            return;

        }


        if (
            context &&
            context.options &&
            context.options.updateTitle ===
                false
        ) {

            return;

        }


        let title =
            route.title ||
            route.name ||
            "";


        if (
            isFunction(
                route.title
            )
        ) {

            try {

                title =
                    route.title(
                        context
                    );

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {
                        phase:
                            "route-title",

                        route:
                            route.id
                    }
                );


                title =
                    route.name ||
                    "";

            }

        }


        if (
            title
        ) {

            try {

                document.title =
                    toStringSafe(
                        title
                    );

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {
                        phase:
                            "document-title"
                    }
                );

            }

        }

    }


    /* =====================================================
       ROUTE META-DATEN AKTUALISIEREN
       ===================================================== */

    function updateRouteMetadata(
        route,
        context
    ) {

        if (
            !route ||
            !route.meta
        ) {

            return;

        }


        const meta =
            route.meta;


        /*
         * Beschreibung aktualisieren.
         */

        if (
            meta.description
        ) {

            let description =
                meta.description;


            if (
                isFunction(
                    description
                )
            ) {

                try {

                    description =
                        description(
                            context
                        );

                }
                catch (
                    error
                ) {

                    handleError(
                        error,
                        {
                            phase:
                                "meta-description"
                        }
                    );

                    description =
                        "";

                }

            }


            if (
                description
            ) {

                let element =
                    document.querySelector(
                        'meta[name="description"]'
                    );


                if (
                    !element
                ) {

                    element =
                        document.createElement(
                            "meta"
                        );


                    element.setAttribute(
                        "name",
                        "description"
                    );


                    document.head.appendChild(
                        element
                    );

                }


                element.setAttribute(
                    "content",
                    toStringSafe(
                        description
                    )
                );

            }

        }


        /*
         * Theme-Color kann optional
         * über die Route definiert werden.
         */

        if (
            meta.themeColor
        ) {

            let themeMeta =
                document.querySelector(
                    'meta[name="theme-color"]'
                );


            if (
                !themeMeta
            ) {

                themeMeta =
                    document.createElement(
                        "meta"
                    );


                themeMeta.setAttribute(
                    "name",
                    "theme-color"
                );


                document.head.appendChild(
                    themeMeta
                );

            }


            themeMeta.setAttribute(
                "content",
                toStringSafe(
                    meta.themeColor
                )
            );

        }


        emit(
            "metadata-updated",
            {

                route:
                    route.id,

                meta:
                    cloneData(
                        meta
                    )

            }
        );

    }


    /* =====================================================
       ROUTE ENTER HOOK
       ===================================================== */

    async function executeRouteEnter(
        context
    ) {

        const route =
            context.route;


        if (
            !route
        ) {

            return {

                allowed:
                    true,

                context

            };

        }


        const hooks =
            [

                route.beforeEnter,

                route.enter,

                route.handler

            ];


        for (
            const hook of hooks
        ) {

            if (
                !isFunction(
                    hook
                )
            ) {

                continue;

            }


            try {

                const result =
                    await hook(
                        context,
                        api
                    );


                const interpreted =
                    interpretGuardResult(
                        result,
                        context
                    );


                if (
                    !interpreted.allowed
                ) {

                    return interpreted;

                }

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {
                        phase:
                            "route-enter",

                        route:
                            route.id
                    }
                );


                return {

                    allowed:
                        false,

                    cancelled:
                        true,

                    reason:
                        "route-enter-error",

                    error,

                    context

                };

            }

        }


        return {

            allowed:
                true,

            context

        };

    }


    /* =====================================================
       ROUTE LEAVE HOOK
       ===================================================== */

    async function executeRouteLeave(
        context
    ) {

        const route =
            context.from &&
            context.from.route;


        if (
            !route
        ) {

            return {

                allowed:
                    true,

                context

            };

        }


        const hooks =
            [

                route.beforeLeave,

                route.leave,

                route.afterLeave

            ];


        for (
            const hook of hooks
        ) {

            if (
                !isFunction(
                    hook
                )
            ) {

                continue;

            }


            try {

                const result =
                    await hook(
                        context,
                        api
                    );


                const interpreted =
                    interpretGuardResult(
                        result,
                        context
                    );


                if (
                    !interpreted.allowed
                ) {

                    return interpreted;

                }

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {
                        phase:
                            "route-leave",

                        route:
                            route.id
                    }
                );


                return {

                    allowed:
                        false,

                    cancelled:
                        true,

                    reason:
                        "route-leave-error",

                    error,

                    context

                };

            }

        }


        return {

            allowed:
                true,

            context

        };

    }


    /* =====================================================
       ROUTE AFTER-ENTER HOOK
       ===================================================== */

    async function executeAfterEnter(
        context
    ) {

        const route =
            context.route;


        if (
            !route ||
            !isFunction(
                route.afterEnter
            )
        ) {

            return {

                allowed:
                    true,

                context

            };

        }


        try {

            const result =
                await route.afterEnter(
                    context,
                    api
                );


            return interpretGuardResult(
                result,
                context
            );

        }
        catch (
            error
        ) {

            handleError(
                error,
                {
                    phase:
                        "route-after-enter",

                    route:
                        route.id
                }
            );


            return {

                allowed:
                    false,

                cancelled:
                    true,

                reason:
                    "route-after-enter-error",

                error,

                context

            };

        }

    }


    /* =====================================================
       ROUTER API ERWEITERN
       ===================================================== */

    api.addGuard =
        addGuard;

    api.removeGuard =
        removeGuard;

    api.getGuards =
        getGuards;

    api.setGuardEnabled =
        setGuardEnabled;

    api.addMiddleware =
        addMiddleware;

    api.removeMiddleware =
        removeMiddleware;

    api.getMiddleware =
        getMiddleware;

    api.setMiddlewareEnabled =
        setMiddlewareEnabled;

    api.createNavigationContext =
        createNavigationContext;

    api.createNavigationResult =
        createNavigationResult;

    api.getAuthenticationState =
        getAuthenticationState;


/* =========================================================
   ENDE TEIL 5 / 16
   ========================================================= */
 /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 6 / 16
   ========================================================= */

    /* =====================================================
       NAVIGATION AUSFÜHREN
       ===================================================== */

    async function navigate(
        target,
        options
    ) {

        if (
            state.destroyed
        ) {

            return createNavigationResult(
                false,
                null,
                {
                    cancelled:
                        true,

                    reason:
                        "router-destroyed"
                }
            );

        }


        const config =
            isObject(
                options
            )
                ? {
                    ...options
                }
                : {};


        /*
         * Bereits laufende Navigation kontrolliert
         * behandeln.
         */

        if (
            state.navigating &&
            !config.allowConcurrent
        ) {

            if (
                config.cancelPrevious !==
                false
            ) {

                cancelPendingNavigation(
                    "superseded"
                );

            }
            else {

                return createNavigationResult(
                    false,
                    state.pendingNavigation,
                    {
                        cancelled:
                            true,

                        reason:
                            "navigation-in-progress"
                    }
                );

            }

        }


        /*
         * Ziel analysieren.
         */

        const parsedTarget =
            parseNavigationTarget(
                target,
                config
            );


        const context =
            createNavigationContext(
                parsedTarget.path,
                {
                    ...config,

                    query:
                        parsedTarget.query,

                    hash:
                        parsedTarget.hash
                }
            );


        context.id =
            ++state.navigationId;


        context.source =
            config.source ||
            "application";


        /*
         * AbortController für die laufende
         * Navigation.
         */

        if (
            typeof AbortController !==
            "undefined"
        ) {

            context.signalController =
                new AbortController();

            context.signal =
                context.signalController
                    .signal;

        }
        else {

            context.signalController =
                null;

            context.signal =
                null;

        }


        state.navigating =
            true;

        state.pendingNavigation =
            context;


        emit(
            "navigation-start",
            {
                id:
                    context.id,

                from:
                    cloneData(
                        context.from
                    ),

                to:
                    cloneData(
                        context.to
                    ),

                source:
                    context.source
            }
        );


        try {

            /*
             * Gleiche Route erkennen.
             */

            if (
                isSameNavigation(
                    context
                ) &&
                config.force !==
                    true
            ) {

                if (
                    config.scroll !==
                    false
                ) {

                    restoreScrollPosition(
                        context,
                        true
                    );

                }


                const sameResult =
                    createNavigationResult(
                        true,
                        context,
                        {
                            sameRoute:
                                true,

                            reason:
                                "same-route"
                        }
                    );


                emit(
                    "navigation-complete",
                    sameResult
                );


                resetNavigationState();


                return sameResult;

            }


            /*
             * Abbruch vor Guards.
             */

            throwIfNavigationAborted(
                context
            );


            /*
             * Globale Guards.
             */

            let result =
                await runGlobalGuards(
                    context
                );


            throwIfNavigationAborted(
                context
            );


            if (
                !result.allowed
            ) {

                if (
                    result.redirected
                ) {

                    return await processRedirect(
                        result.redirect,
                        context,
                        result.reason
                    );

                }


                return await finishCancelledNavigation(
                    context,
                    result.reason ||
                        "guard-rejected",
                    result.error
                );

            }


            /*
             * Route muss nach den Guards erneut
             * geprüft werden, da ein Guard
             * theoretisch Registry-Zustände
             * verändert haben kann.
             */

            const refreshedMatch =
                matchRoute(
                    context.to.path
                );


            if (
                refreshedMatch
            ) {

                context.route =
                    refreshedMatch.route;

                context.params =
                    refreshedMatch.params;

                context.to.route =
                    cloneData(
                        refreshedMatch.route
                    );

                context.to.params =
                    cloneData(
                        refreshedMatch.params
                    );

                context.to.appId =
                    refreshedMatch.route.appId ||
                    null;

            }


            /*
             * Not-Found behandeln.
             */

            if (
                !context.route
            ) {

                const notFound =
                    handleRouteNotFound(
                        context
                    );


                if (
                    notFound.redirected
                ) {

                    return await processRedirect(
                        notFound.redirect,
                        context,
                        notFound.reason
                    );

                }


                return await finishCancelledNavigation(
                    context,
                    notFound.reason
                );

            }


            throwIfNavigationAborted(
                context
            );


            /*
             * Authentifizierung.
             */

            result =
                await runAuthenticationGuard(
                    context
                );


            throwIfNavigationAborted(
                context
            );


            if (
                !result.allowed
            ) {

                if (
                    result.redirected
                ) {

                    return await processRedirect(
                        result.redirect,
                        context,
                        result.reason
                    );

                }


                return await finishCancelledNavigation(
                    context,
                    result.reason ||
                        "authentication-required",
                    result.error
                );

            }


            /*
             * Route-spezifische Guards.
             */

            result =
                await runRouteGuards(
                    context
                );


            throwIfNavigationAborted(
                context
            );


            if (
                !result.allowed
            ) {

                if (
                    result.redirected
                ) {

                    return await processRedirect(
                        result.redirect,
                        context,
                        result.reason
                    );

                }


                return await finishCancelledNavigation(
                    context,
                    result.reason ||
                        "route-guard-rejected",
                    result.error
                );

            }


            /*
             * Middleware.
             */

            result =
                await runMiddleware(
                    context
                );


            throwIfNavigationAborted(
                context
            );


            if (
                !result.allowed
            ) {

                if (
                    result.redirected
                ) {

                    return await processRedirect(
                        result.redirect,
                        context,
                        result.reason
                    );

                }


                return await finishCancelledNavigation(
                    context,
                    result.reason ||
                        "middleware-rejected",
                    result.error
                );

            }


            /*
             * Leave-Hooks der aktuellen Route.
             */

            result =
                await executeRouteLeave(
                    context
                );


            throwIfNavigationAborted(
                context
            );


            if (
                !result.allowed
            ) {

                if (
                    result.redirected
                ) {

                    return await processRedirect(
                        result.redirect,
                        context,
                        result.reason
                    );

                }


                return await finishCancelledNavigation(
                    context,
                    result.reason ||
                        "route-leave-rejected",
                    result.error
                );

            }


            /*
             * Enter-Hooks der Zielroute.
             */

            result =
                await executeRouteEnter(
                    context
                );


            throwIfNavigationAborted(
                context
            );


            if (
                !result.allowed
            ) {

                if (
                    result.redirected
                ) {

                    return await processRedirect(
                        result.redirect,
                        context,
                        result.reason
                    );

                }


                return await finishCancelledNavigation(
                    context,
                    result.reason ||
                        "route-enter-rejected",
                    result.error
                );

            }


            /*
             * Route-Rendering vorbereiten.
             */

            await renderRoute(
                context
            );


            throwIfNavigationAborted(
                context
            );


            /*
             * Router-State übernehmen.
             */

            const entry =
                createHistoryEntry(
                    context.to.path,
                    context.params,
                    context.query,
                    context.hash,
                    context.route,
                    config
                );


            /*
             * Browser-History nur dann verändern,
             * wenn dies ausdrücklich erlaubt ist.
             */

            if (
                context.history
            ) {

                pushHistoryEntry(
                    entry,
                    context.replace
                );


                if (
                    !context.options.fromPopState &&
                    !context.options.fromHashChange
                ) {

                    pushBrowserState(
                        entry,
                        context.replace
                    );

                }

            }


            /*
             * Route-State committen.
             */

            commitRouteState(
                context,
                entry
            );


            /*
             * Titel und Meta aktualisieren.
             */

            updateDocumentTitle(
                context.route,
                context
            );


            updateRouteMetadata(
                context.route,
                context
            );


            /*
             * Scroll-Verhalten.
             */

            if (
                config.scroll !==
                false
            ) {

                restoreScrollPosition(
                    context,
                    false
                );

            }


            /*
             * After-Enter Hook.
             */

            result =
                await executeAfterEnter(
                    context
                );


            throwIfNavigationAborted(
                context
            );


            if (
                !result.allowed
            ) {

                if (
                    result.redirected
                ) {

                    return await processRedirect(
                        result.redirect,
                        context,
                        result.reason
                    );

                }


                return await finishCancelledNavigation(
                    context,
                    result.reason ||
                        "route-after-enter-rejected",
                    result.error
                );

            }


            /*
             * Erfolgreiche Navigation.
             */

            const navigationResult =
                createNavigationResult(
                    true,
                    context,
                    {
                        entry:
                            cloneData(
                                entry
                            ),

                        sameRoute:
                            false
                    }
                );


            context.result =
                navigationResult;


            emit(
                "navigation-success",
                navigationResult
            );


            emit(
                "route-changed",
                {

                    route:
                        cloneData(
                            context.route
                        ),

                    path:
                        context.to.path,

                    params:
                        cloneData(
                            context.params
                        ),

                    query:
                        cloneData(
                            context.query
                        ),

                    hash:
                        context.hash,

                    previous:
                        cloneData(
                            context.from
                        ),

                    navigation:
                        navigationResult

                }
            );


            emit(
                "navigation-complete",
                navigationResult
            );


            resetNavigationState();


            return navigationResult;

        }
        catch (
            error
        ) {

            if (
                isNavigationAbortError(
                    error
                )
            ) {

                return await finishCancelledNavigation(
                    context,
                    error.reason ||
                        "navigation-aborted",
                    error
                );

            }


            context.error =
                error;


            emit(
                "navigation-error",
                {

                    id:
                        context.id,

                    path:
                        context.to.path,

                    error,

                    context:
                        cloneData(
                            context
                        )

                }
            );


            resetNavigationState();


            return createNavigationResult(
                false,
                context,
                {

                    error,

                    reason:
                        "navigation-error"

                }
            );

        }

    }


    /* =====================================================
       NAVIGATIONS-ZIEL PARSEN
       ===================================================== */

    function parseNavigationTarget(
        target,
        options
    ) {

        let raw =
            "";


        if (
            typeof target ===
            "string"
        ) {

            raw =
                target.trim();

        }
        else if (
            isObject(
                target
            )
        ) {

            raw =
                target.path ||
                target.route ||
                target.url ||
                target.name ||
                "/";

        }
        else {

            raw =
                "/";

        }


        if (
            !raw
        ) {

            raw =
                "/";

        }


        /*
         * Absolute URLs auf den lokalen Pfad
         * reduzieren.
         */

        try {

            if (
                /^https?:\/\//i.test(
                    raw
                )
            ) {

                const url =
                    new URL(
                        raw,
                        window.location.origin
                    );


                raw =
                    url.pathname +
                    url.search +
                    url.hash;

            }

        }
        catch (
            error
        ) {

            /*
             * Ungültige externe URL wird als
             * normaler Router-Pfad behandelt.
             */

        }


        /*
         * Hash-Routen unterstützen.
         */

        if (
            raw.charAt(
                0
            ) === "#"
        ) {

            raw =
                raw.slice(
                    1
                );

        }


        let hash =
            "";


        let query =
            {};


        const hashIndex =
            raw.indexOf(
                "#"
            );


        if (
            hashIndex !==
            -1
        ) {

            hash =
                raw.slice(
                    hashIndex + 1
                );


            raw =
                raw.slice(
                    0,
                    hashIndex
                );

        }


        const queryIndex =
            raw.indexOf(
                "?"
            );


        if (
            queryIndex !==
            -1
        ) {

            query =
                parseQuery(
                    raw.slice(
                        queryIndex + 1
                    )
                );


            raw =
                raw.slice(
                    0,
                    queryIndex
                );

        }


        if (
            isObject(
                options
            ) &&
            isObject(
                options.query
            )
        ) {

            query =
                {

                    ...query,

                    ...cloneData(
                        options.query
                    )

                };

        }


        if (
            isObject(
                target
            ) &&
            target.hash !==
                undefined
        ) {

            hash =
                normalizeHash(
                    target.hash
                );

        }


        return {

            path:
                normalizePath(
                    raw
                ),

            query,

            hash:
                normalizeHash(
                    hash
                )

        };

    }


    /* =====================================================
       GLEICHE NAVIGATION ERKENNEN
       ===================================================== */

    function isSameNavigation(
        context
    ) {

        if (
            !state.currentPath
        ) {

            return false;

        }


        if (
            normalizePath(
                state.currentPath
            ) !==
            normalizePath(
                context.to.path
            )
        ) {

            return false;

        }


        if (
            !areObjectsEqual(
                state.currentParams,
                context.params
            )
        ) {

            return false;

        }


        if (
            !areObjectsEqual(
                state.currentQuery,
                context.query
            )
        ) {

            return false;

        }


        return (
            normalizeHash(
                state.currentHash
            ) ===
            normalizeHash(
                context.hash
            )
        );

    }


    /* =====================================================
       ABORT PRÜFEN
       ===================================================== */

    function throwIfNavigationAborted(
        context
    ) {

        if (
            !context
        ) {

            return;

        }


        if (
            context.cancelled
        ) {

            const error =
                new Error(
                    "Navigation wurde abgebrochen."
                );


            error.name =
                "NavigationAbortError";


            error.reason =
                context.cancelReason ||
                "cancelled";


            throw error;

        }


        if (
            context.signal &&
            context.signal.aborted
        ) {

            const error =
                new Error(
                    "Navigation wurde abgebrochen."
                );


            error.name =
                "NavigationAbortError";


            error.reason =
                context.cancelReason ||
                "aborted";


            throw error;

        }

    }


    /* =====================================================
       NAVIGATION ABORT-FEHLER ERKENNEN
       ===================================================== */

    function isNavigationAbortError(
        error
    ) {

        return Boolean(
            error &&
            (
                error.name ===
                    "NavigationAbortError" ||
                error.code ===
                    "NAVIGATION_ABORTED"
            )
        );

    }


    /* =====================================================
       NAVIGATION ABBRECHEN
       ===================================================== */

    function cancelPendingNavigation(
        reason
    ) {

        const context =
            state.pendingNavigation;


        if (
            !context
        ) {

            return false;

        }


        context.cancelled =
            true;


        context.cancelReason =
            reason ||
            "cancelled";


        if (
            context.signalController
        ) {

            try {

                context.signalController.abort();

            }
            catch (
                error
            ) {

                /*
                 * AbortController kann in älteren
                 * Browsern eingeschränkt sein.
                 */

            }

        }


        emit(
            "navigation-cancel-requested",
            {

                id:
                    context.id,

                path:
                    context.to &&
                    context.to.path,

                reason:
                    context.cancelReason

            }
        );


        return true;

    }


    /* =====================================================
       ABBRUCH RESULTAT ABSCHLIESSEN
       ===================================================== */

    async function finishCancelledNavigation(
        context,
        reason,
        error
    ) {

        if (
            !context
        ) {

            resetNavigationState();


            return {

                success:
                    false,

                cancelled:
                    true,

                reason:
                    reason ||
                    "cancelled"

            };

        }


        context.cancelled =
            true;


        context.cancelReason =
            reason ||
            context.cancelReason ||
            "cancelled";


        context.error =
            error ||
            context.error ||
            null;


        const result =
            createNavigationResult(
                false,
                context,
                {

                    cancelled:
                        true,

                    reason:
                        context.cancelReason,

                    error:
                        context.error

                }
            );


        context.result =
            result;


        emit(
            "navigation-cancelled",
            result
        );


        emit(
            "navigation-complete",
            result
        );


        resetNavigationState();


        return result;

    }


    /* =====================================================
       REDIRECT VERARBEITEN
       ===================================================== */

    async function processRedirect(
        redirect,
        context,
        reason
    ) {

        if (
            !redirect
        ) {

            return await finishCancelledNavigation(
                context,
                reason ||
                    "invalid-redirect"
            );

        }


        const redirectCount =
            Number(
                context.options &&
                context.options.redirectCount
            ) || 0;


        if (
            redirectCount >=
            MAX_REDIRECTS
        ) {

            return await finishCancelledNavigation(
                context,
                "redirect-limit"
            );

        }


        context.redirected =
            true;


        context.redirect =
            redirect;


        emit(
            "navigation-redirect",
            {

                from:
                    context.to.path,

                to:
                    redirect,

                reason:
                    reason ||
                    "redirect",

                id:
                    context.id

            }
        );


        resetNavigationState();


        return navigate(
            redirect,
            {

                ...(context.options ||
                    {}),

                redirectCount:
                    redirectCount +
                    1,

                source:
                    "redirect",

                replace:
                    true

            }
        );

    }


    /* =====================================================
       SCROLL POSITION SPEICHERN
       ===================================================== */

    function saveScrollPosition(
        path
    ) {

        if (
            typeof window ===
            "undefined"
        ) {

            return;

        }


        const key =
            normalizePath(
                path ||
                state.currentPath ||
                "/"
            );


        state.scrollPositions.set(
            key,
            {

                x:
                    Number(
                        window.scrollX
                    ) || 0,

                y:
                    Number(
                        window.scrollY
                    ) || 0,

                timestamp:
                    Date.now()

            }
        );

    }


    /* =====================================================
       SCROLL POSITION WIEDERHERSTELLEN
       ===================================================== */

    function restoreScrollPosition(
        context,
        sameRoute
    ) {

        if (
            typeof window ===
            "undefined"
        ) {

            return false;

        }


        if (
            context &&
            context.options &&
            context.options.scroll ===
                false
        ) {

            return false;

        }


        const path =
            context &&
            context.to
                ? context.to.path
                : state.currentPath;


        const saved =
            state.scrollPositions.get(
                normalizePath(
                    path
                )
            );


        const behavior =
            context &&
            context.options &&
            context.options.scrollBehavior
                ? context.options.scrollBehavior
                : "auto";


        const applyScroll =
            function () {

                try {

                    if (
                        saved &&
                        !sameRoute
                    ) {

                        window.scrollTo(
                            {
                                left:
                                    saved.x,

                                top:
                                    saved.y,

                                behavior
                            }
                        );

                    }
                    else if (
                        context &&
                        context.options &&
                        context.options.scrollTop
                    ) {

                        window.scrollTo(
                            {
                                left:
                                    0,

                                top:
                                    0,

                                behavior
                            }
                        );

                    }

                }
                catch (
                    error
                ) {

                    try {

                        window.scrollTo(
                            0,
                            saved
                                ? saved.y
                                : 0
                        );

                    }
                    catch (
                        fallbackError
                    ) {

                        handleError(
                            fallbackError,
                            {
                                phase:
                                    "scroll-restore"
                            }
                        );

                    }

                }

            };


        if (
            typeof window.requestAnimationFrame ===
            "function"
        ) {

            window.requestAnimationFrame(
                applyScroll
            );

        }
        else {

            setTimeout(
                applyScroll,
                0
            );

        }


        return true;

    }


    /* =====================================================
       NAVIGATION API
       ===================================================== */

    api.navigate =
        navigate;

    api.go =
        navigate;

    api.cancelNavigation =
        cancelPendingNavigation;

    api.saveScrollPosition =
        saveScrollPosition;

    api.restoreScrollPosition =
        restoreScrollPosition;


/* =========================================================
   ENDE TEIL 6 / 16
   ========================================================= */
 /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 7 / 16
   ========================================================= */

    /* =====================================================
       ROUTE RENDERING
       ===================================================== */

    async function renderRoute(
        context
    ) {

        if (
            !context ||
            !context.route
        ) {

            return false;

        }


        const route =
            context.route;


        const renderTarget =
            resolveRenderTarget(
                route,
                context
            );


        /*
         * Eine Route kann entweder über eine
         * render()-Funktion, component-Funktion,
         * template oder ein vorhandenes DOM-Ziel
         * dargestellt werden.
         */

        if (
            isFunction(
                route.render
            )
        ) {

            const result =
                await route.render(
                    context,
                    api
                );


            await applyRenderResult(
                result,
                renderTarget,
                context
            );


            emit(
                "route-rendered",
                {

                    route:
                        route.id,

                    path:
                        context.to.path,

                    target:
                        getTargetDescription(
                            renderTarget
                        )

                }
            );


            return true;

        }


        if (
            isFunction(
                route.component
            )
        ) {

            const result =
                await route.component(
                    context,
                    api
                );


            await applyRenderResult(
                result,
                renderTarget,
                context
            );


            emit(
                "route-rendered",
                {

                    route:
                        route.id,

                    path:
                        context.to.path,

                    target:
                        getTargetDescription(
                            renderTarget
                        )

                }
            );


            return true;

        }


        if (
            route.template !==
                undefined
        ) {

            const template =
                isFunction(
                    route.template
                )
                    ? await route.template(
                        context,
                        api
                    )
                    : route.template;


            await applyRenderResult(
                template,
                renderTarget,
                context
            );


            emit(
                "route-rendered",
                {

                    route:
                        route.id,

                    path:
                        context.to.path,

                    target:
                        getTargetDescription(
                            renderTarget
                        )

                }
            );


            return true;

        }


        /*
         * Wenn kein Rendering-Handler vorhanden
         * ist, kann die Route trotzdem gültig sein.
         * Das ist wichtig für reine Service- und
         * Zustandsrouten.
         */

        emit(
            "route-rendered",
            {

                route:
                    route.id,

                path:
                    context.to.path,

                target:
                    null,

                passive:
                    true

            }
        );


        return true;

    }


    /* =====================================================
       RENDER-ZIEL AUFLÖSEN
       ===================================================== */

    function resolveRenderTarget(
        route,
        context
    ) {

        if (
            context &&
            context.options &&
            context.options.target
        ) {

            return resolveDomTarget(
                context.options.target
            );

        }


        if (
            route &&
            route.target
        ) {

            return resolveDomTarget(
                route.target
            );

        }


        if (
            route &&
            route.outlet
        ) {

            return resolveDomTarget(
                route.outlet
            );

        }


        if (
            state.outlet
        ) {

            return state.outlet;

        }


        /*
         * HalDo AI OS verwendet bevorzugt einen
         * zentralen Router-/App-Outlet.
         */

        const selectors =
            [

                "[data-haldo-router-outlet]",

                "[data-router-outlet]",

                "#haldo-router-outlet",

                "#app-router-outlet",

                "#app",

                "#app-root"

            ];


        for (
            const selector of
            selectors
        ) {

            try {

                const element =
                    document.querySelector(
                        selector
                    );


                if (
                    element
                ) {

                    return element;

                }

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {
                        phase:
                            "render-target-search",

                        selector
                    }
                );

            }

        }


        return null;

    }


    /* =====================================================
       DOM-ZIEL AUFLÖSEN
       ===================================================== */

    function resolveDomTarget(
        target
    ) {

        if (
            !target
        ) {

            return null;

        }


        if (
            typeof Element !==
            "undefined" &&
            target instanceof Element
        ) {

            return target;

        }


        if (
            typeof target ===
            "string"
        ) {

            try {

                return document.querySelector(
                    target
                );

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {
                        phase:
                            "resolve-dom-target",

                        target
                    }
                );


                return null;

            }

        }


        return null;

    }


    /* =====================================================
       RENDER-ERGEBNIS ANWENDEN
       ===================================================== */

    async function applyRenderResult(
        result,
        target,
        context
    ) {

        if (
            result ===
            undefined ||
            result ===
            null
        ) {

            return;

        }


        /*
         * Ein Renderer kann die DOM-Verarbeitung
         * vollständig selbst übernehmen.
         */

        if (
            result ===
            true ||
            result ===
            false
        ) {

            return;

        }


        /*
         * DOM-Node direkt einsetzen.
         */

        if (
            typeof Node !==
                "undefined" &&
            result instanceof Node
        ) {

            if (
                target
            ) {

                target.replaceChildren(
                    result
                );

            }


            return;

        }


        /*
         * DocumentFragment.
         */

        if (
            typeof DocumentFragment !==
                "undefined" &&
            result instanceof
                DocumentFragment
        ) {

            if (
                target
            ) {

                target.replaceChildren(
                    result
                );

            }


            return;

        }


        /*
         * HTML-String.
         */

        if (
            typeof result ===
            "string"
        ) {

            if (
                target
            ) {

                target.innerHTML =
                    result;

            }


            return;

        }


        /*
         * Render-Ergebnis als Objekt.
         */

        if (
            isObject(
                result
            )
        ) {

            if (
                result.element
            ) {

                await applyRenderResult(
                    result.element,
                    target,
                    context
                );

            }
            else if (
                result.html !==
                    undefined
            ) {

                await applyRenderResult(
                    result.html,
                    target,
                    context
                );

            }
            else if (
                result.content !==
                    undefined
            ) {

                await applyRenderResult(
                    result.content,
                    target,
                    context
                );

            }


            if (
                result.title
            ) {

                try {

                    document.title =
                        toStringSafe(
                            result.title
                        );

                }
                catch (
                    error
                ) {

                    handleError(
                        error,
                        {
                            phase:
                                "render-result-title"
                        }
                    );

                }

            }


            return;

        }

    }


    /* =====================================================
       TARGET BESCHREIBUNG
       ===================================================== */

    function getTargetDescription(
        target
    ) {

        if (
            !target
        ) {

            return null;

        }


        if (
            target.id
        ) {

            return "#" +
                target.id;

        }


        if (
            target.getAttribute
        ) {

            const routerOutlet =
                target.getAttribute(
                    "data-haldo-router-outlet"
                );


            if (
                routerOutlet
            ) {

                return (
                    "[data-haldo-router-outlet=\"" +
                    routerOutlet +
                    "\"]"
                );

            }


            const routerTarget =
                target.getAttribute(
                    "data-router-outlet"
                );


            if (
                routerTarget
            ) {

                return (
                    "[data-router-outlet=\"" +
                    routerTarget +
                    "\"]"
                );

            }

        }


        return target.tagName ||
            "element";

    }


    /* =====================================================
       ROUTE OUTLET SETZEN
       ===================================================== */

    function setOutlet(
        outlet
    ) {

        const target =
            resolveDomTarget(
                outlet
            );


        if (
            !target
        ) {

            if (
                outlet ===
                null
            ) {

                state.outlet =
                    null;


                emit(
                    "outlet-changed",
                    {
                        outlet:
                            null
                    }
                );


                return true;

            }


            return false;

        }


        state.outlet =
            target;


        emit(
            "outlet-changed",
            {

                outlet:
                    getTargetDescription(
                        target
                    )

            }
        );


        return true;

    }


    /* =====================================================
       OUTLET ABRUFEN
       ===================================================== */

    function getOutlet() {

        return state.outlet ||
            null;

    }


    /* =====================================================
       ROUTE-DATA ERSTELLEN
       ===================================================== */

    function createRouteData(
        route,
        params,
        query,
        hash,
        context
    ) {

        if (
            !route
        ) {

            return null;

        }


        const data = {

            id:
                route.id,

            name:
                route.name ||
                "",

            path:
                route.path,

            appId:
                route.appId ||
                null,

            params:
                cloneData(
                    params ||
                    {}
                ),

            query:
                cloneData(
                    query ||
                    {}
                ),

            hash:
                normalizeHash(
                    hash
                ),

            meta:
                cloneData(
                    route.meta ||
                    {}
                ),

            requiresAuth:
                Boolean(
                    route.requiresAuth ||
                    route.protected
                ),

            timestamp:
                Date.now()

        };


        if (
            context
        ) {

            data.navigationId =
                context.id;

            data.source =
                context.source;

        }


        return data;

    }


    /* =====================================================
       ROUTE-DATA ABRUFEN
       ===================================================== */

    function getCurrentRouteData() {

        return createRouteData(
            state.currentRoute,
            state.currentParams,
            state.currentQuery,
            state.currentHash
        );

    }


    /* =====================================================
       AKTUELLEN PFAD ABRUFEN
       ===================================================== */

    function getCurrentPath() {

        return state.currentPath ||
            DEFAULT_ROUTE;

    }


    /* =====================================================
       AKTUELLE PARAMETER
       ===================================================== */

    function getCurrentParams() {

        return cloneData(
            state.currentParams ||
            {}
        );

    }


    /* =====================================================
       AKTUELLE QUERY-DATEN
       ===================================================== */

    function getCurrentQuery() {

        return cloneData(
            state.currentQuery ||
            {}
        );

    }


    /* =====================================================
       AKTUELLEN HASH
       ===================================================== */

    function getCurrentHash() {

        return state.currentHash ||
            "";

    }


    /* =====================================================
       VORHERIGEN PFAD
       ===================================================== */

    function getPreviousPath() {

        return state.previousPath ||
            null;

    }


    /* =====================================================
       VORHERIGE ROUTE
       ===================================================== */

    function getPreviousRoute() {

        return state.previousRoute
            ? cloneData(
                state.previousRoute
            )
            : null;

    }


    /* =====================================================
       ROUTE-PARAMETER AUFLÖSEN
       ===================================================== */

    function resolveRouteParameters(
        route,
        path
    ) {

        if (
            !route
        ) {

            return {};

        }


        if (
            !route.paramNames ||
            !Array.isArray(
                route.paramNames
            )
        ) {

            return {};

        }


        const params =
            matchPathPattern(
                route.path,
                normalizePath(
                    path
                )
            );


        return params
            ? params.params
            : {};

    }


    /* =====================================================
       ROUTEN-METADATEN ABRUFEN
       ===================================================== */

    function getRouteMetadata(
        routeOrPath
    ) {

        let route =
            null;


        if (
            isObject(
                routeOrPath
            )
        ) {

            route =
                routeOrPath;

        }
        else {

            const match =
                matchRoute(
                    routeOrPath
                );


            route =
                match
                    ? match.route
                    : null;

        }


        if (
            !route
        ) {

            return null;

        }


        return {

            id:
                route.id,

            name:
                route.name ||
                "",

            path:
                route.path,

            appId:
                route.appId ||
                null,

            title:
                route.title ||
                "",

            meta:
                cloneData(
                    route.meta ||
                    {}
                ),

            requiresAuth:
                Boolean(
                    route.requiresAuth ||
                    route.protected
                ),

            children:
                Array.isArray(
                    route.children
                )
                    ? route.children.map(
                        child =>
                            child.id ||
                            child.path ||
                            ""
                    )
                    : []

        };

    }


    /* =====================================================
       ROUTER API ERWEITERN
       ===================================================== */

    api.renderRoute =
        renderRoute;

    api.setOutlet =
        setOutlet;

    api.getOutlet =
        getOutlet;

    api.getCurrentRouteData =
        getCurrentRouteData;

    api.getCurrentPath =
        getCurrentPath;

    api.getCurrentParams =
        getCurrentParams;

    api.getCurrentQuery =
        getCurrentQuery;

    api.getCurrentHash =
        getCurrentHash;

    api.getPreviousPath =
        getPreviousPath;

    api.getPreviousRoute =
        getPreviousRoute;

    api.getRouteMetadata =
        getRouteMetadata;

    api.resolveRouteParameters =
        resolveRouteParameters;


/* =========================================================
   ENDE TEIL 7 / 16
   ========================================================= */
 /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 8 / 16
   ========================================================= */

    /* =====================================================
       HISTORY ENTRY ERSTELLEN
       ===================================================== */

    function createHistoryEntry(
        path,
        params,
        query,
        hash,
        route,
        options
    ) {

        const config =
            isObject(
                options
            )
                ? options
                : {};


        const entry = {

            id:
                (
                    "haldo-route-" +
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(
                            36
                        )
                        .slice(
                            2,
                            10
                        )
                ),

            path:
                normalizePath(
                    path
                ),

            params:
                cloneData(
                    params ||
                    {}
                ),

            query:
                cloneData(
                    query ||
                    {}
                ),

            hash:
                normalizeHash(
                    hash ||
                    ""
                ),

            routeId:
                route &&
                route.id
                    ? route.id
                    : null,

            routeName:
                route &&
                route.name
                    ? route.name
                    : null,

            appId:
                route &&
                route.appId
                    ? route.appId
                    : null,

            title:
                route &&
                route.title
                    ? route.title
                    : null,

            timestamp:
                Date.now(),

            source:
                config.source ||
                "router",

            state:
                config.state !==
                undefined
                    ? cloneData(
                        config.state
                    )
                    : null

        };


        return entry;

    }


    /* =====================================================
       HISTORY ENTRY KLONEN
       ===================================================== */

    function cloneHistoryEntry(
        entry
    ) {

        if (
            !entry
        ) {

            return null;

        }


        return cloneData(
            entry
        );

    }


    /* =====================================================
       INTERNE HISTORY INITIALISIEREN
       ===================================================== */

    function initializeHistory() {

        if (
            state.historyInitialized
        ) {

            return true;

        }


        state.history =
            Array.isArray(
                state.history
            )
                ? state.history
                : [];


        state.historyIndex =
            Number.isInteger(
                state.historyIndex
            )
                ? state.historyIndex
                : -1;


        state.historyInitialized =
            true;


        /*
         * Bestehenden Browser-State übernehmen,
         * wenn der Browser bereits einen HalDo-
         * Eintrag besitzt.
         */

        try {

            const browserState =
                window.history &&
                window.history.state;


            if (
                browserState &&
                browserState.__haldoRouter
            ) {

                const entry =
                    browserState.__haldoRouter;


                if (
                    entry.path
                ) {

                    state.history.push(
                        cloneHistoryEntry(
                            entry
                        )
                    );


                    state.historyIndex =
                        0;

                }

            }

        }
        catch (
            error
        ) {

            handleError(
                error,
                {
                    phase:
                        "history-initialize"
                }
            );

        }


        emit(
            "history-initialized",
            {

                length:
                    state.history.length,

                index:
                    state.historyIndex

            }
        );


        return true;

    }


    /* =====================================================
       INTERNE HISTORY ENTRY HINZUFÜGEN
       ===================================================== */

    function pushHistoryEntry(
        entry,
        replace
    ) {

        if (
            !entry
        ) {

            return false;

        }


        initializeHistory();


        const normalizedEntry =
            cloneHistoryEntry(
                entry
            );


        if (
            replace
        ) {

            if (
                state.historyIndex >=
                0 &&
                state.historyIndex <
                    state.history.length
            ) {

                state.history[
                    state.historyIndex
                ] =
                    normalizedEntry;

            }
            else {

                state.history.push(
                    normalizedEntry
                );


                state.historyIndex =
                    state.history.length -
                    1;

            }

        }
        else {

            /*
             * Vorhandene Vorwärts-History löschen,
             * wenn nach einem Back navigiert wurde.
             */

            if (
                state.historyIndex <
                state.history.length -
                1
            ) {

                state.history =
                    state.history.slice(
                        0,
                        state.historyIndex +
                        1
                    );

            }


            state.history.push(
                normalizedEntry
            );


            state.historyIndex =
                state.history.length -
                1;

        }


        state.lastHistoryEntry =
            cloneHistoryEntry(
                normalizedEntry
            );


        emit(
            "history-entry-added",
            {

                entry:
                    cloneHistoryEntry(
                        normalizedEntry
                    ),

                replace:
                    Boolean(
                        replace
                    ),

                index:
                    state.historyIndex,

                length:
                    state.history.length

            }
        );


        return true;

    }


    /* =====================================================
       BROWSER HISTORY AKTUALISIEREN
       ===================================================== */

    function pushBrowserState(
        entry,
        replace
    ) {

        if (
            typeof window ===
                "undefined" ||
            !window.history
        ) {

            return false;

        }


        const browserState = {

            __haldoRouter:
                cloneHistoryEntry(
                    entry
                ),

            haldo:
                true,

            router:
                ROUTER_NAME,

            timestamp:
                Date.now()

        };


        try {

            const url =
                buildBrowserUrl(
                    entry
                );


            if (
                replace
            ) {

                window.history.replaceState(
                    browserState,
                    entry.title ||
                        "",
                    url
                );

            }
            else {

                window.history.pushState(
                    browserState,
                    entry.title ||
                        "",
                    url
                );

            }


            state.browserHistorySupported =
                true;


            emit(
                "browser-history-updated",
                {

                    entry:
                        cloneHistoryEntry(
                            entry
                        ),

                    replace:
                        Boolean(
                            replace
                        ),

                    url

                }
            );


            return true;

        }
        catch (
            error
        ) {

            state.browserHistorySupported =
                false;


            handleError(
                error,
                {
                    phase:
                        "browser-history",

                    replace:
                        Boolean(
                            replace
                        )
                }
            );


            return false;

        }

    }


    /* =====================================================
       BROWSER URL AUFBAUEN
       ===================================================== */

    function buildBrowserUrl(
        entry
    ) {

        if (
            !entry
        ) {

            return window.location.href;

        }


        const path =
            normalizePath(
                entry.path ||
                "/"
            );


        const queryString =
            stringifyQuery(
                entry.query ||
                {}
            );


        const hash =
            normalizeHash(
                entry.hash ||
                ""
            );


        /*
         * Router-Modus bestimmen.
         */

        const mode =
            state.mode ||
            ROUTER_MODE_HISTORY;


        if (
            mode ===
            ROUTER_MODE_HASH
        ) {

            let url =
                window.location.pathname +
                window.location.search +
                "#" +
                path;


            if (
                queryString
            ) {

                url +=
                    "?" +
                    queryString;

            }


            if (
                hash
            ) {

                url +=
                    "#" +
                    hash;

            }


            return url;

        }


        let url =
            path;


        if (
            queryString
        ) {

            url +=
                "?" +
                queryString;

        }


        if (
            hash
        ) {

            url +=
                "#" +
                hash;

        }


        return url;

    }


    /* =====================================================
       QUERY STRING ERSTELLEN
       ===================================================== */

    function stringifyQuery(
        query
    ) {

        if (
            !isObject(
                query
            )
        ) {

            return "";

        }


        const entries =
            Object.entries(
                query
            );


        if (
            !entries.length
        ) {

            return "";

        }


        const parts =
            [];


        for (
            const [
                key,
                value
            ] of entries
        ) {

            if (
                value ===
                undefined ||
                value ===
                null
            ) {

                continue;

            }


            const encodedKey =
                encodeURIComponent(
                    String(
                        key
                    )
                );


            if (
                Array.isArray(
                    value
                )
            ) {

                for (
                    const item of
                    value
                ) {

                    if (
                        item ===
                        undefined ||
                        item ===
                        null
                    ) {

                        continue;

                    }


                    parts.push(
                        encodedKey +
                        "=" +
                        encodeURIComponent(
                            String(
                                item
                            )
                        )
                    );

                }


                continue;

            }


            if (
                typeof value ===
                "boolean"
            ) {

                parts.push(
                    encodedKey +
                    "=" +
                    (
                        value
                            ? "true"
                            : "false"
                    )
                );


                continue;

            }


            parts.push(
                encodedKey +
                "=" +
                encodeURIComponent(
                    String(
                        value
                    )
                )
            );

        }


        return parts.join(
            "&"
        );

    }


    /* =====================================================
       QUERY STRING PARSEN
       ===================================================== */

    function parseQuery(
        query
    ) {

        const result =
            {};


        if (
            !query
        ) {

            return result;

        }


        let raw =
            String(
                query
            );


        if (
            raw.charAt(
                0
            ) === "?"
        ) {

            raw =
                raw.slice(
                    1
                );

        }


        if (
            !raw
        ) {

            return result;

        }


        const pairs =
            raw.split(
                "&"
            );


        for (
            const pair of pairs
        ) {

            if (
                !pair
            ) {

                continue;

            }


            const separator =
                pair.indexOf(
                    "="
                );


            let key =
                separator ===
                -1
                    ? pair
                    : pair.slice(
                        0,
                        separator
                    );


            let value =
                separator ===
                -1
                    ? ""
                    : pair.slice(
                        separator + 1
                    );


            try {

                key =
                    decodeURIComponent(
                        key.replace(
                            /\+/g,
                            " "
                        )
                    );

            }
            catch (
                error
            ) {

                /*
                 * Ungültige URI-Sequenzen dürfen
                 * den Router nicht zum Absturz bringen.
                 */

            }


            try {

                value =
                    decodeURIComponent(
                        value.replace(
                            /\+/g,
                            " "
                        )
                    );

            }
            catch (
                error
            ) {

                /*
                 * Rohwert beibehalten.
                 */

            }


            if (
                Object.prototype.hasOwnProperty.call(
                    result,
                    key
                )
            ) {

                if (
                    !Array.isArray(
                        result[key]
                    )
                ) {

                    result[key] =
                        [

                            result[key]

                        ];

                }


                result[key].push(
                    value
                );

            }
            else {

                result[key] =
                    value;

            }

        }


        return result;

    }


    /* =====================================================
       ROUTER HISTORY ABRUFEN
       ===================================================== */

    function getHistory() {

        initializeHistory();


        return state.history.map(
            entry =>
                cloneHistoryEntry(
                    entry
                )
        );

    }


    /* =====================================================
       HISTORY LÄNGE
       ===================================================== */

    function getHistoryLength() {

        initializeHistory();


        return state.history.length;

    }


    /* =====================================================
       HISTORY INDEX
       ===================================================== */

    function getHistoryIndex() {

        initializeHistory();


        return state.historyIndex;

    }


    /* =====================================================
       AKTUELLEN HISTORY-EINTRAG
       ===================================================== */

    function getCurrentHistoryEntry() {

        initializeHistory();


        if (
            state.historyIndex <
                0 ||
            state.historyIndex >=
                state.history.length
        ) {

            return null;

        }


        return cloneHistoryEntry(
            state.history[
                state.historyIndex
            ]
        );

    }


    /* =====================================================
       VORHERIGEN HISTORY-EINTRAG
       ===================================================== */

    function getPreviousHistoryEntry() {

        initializeHistory();


        const index =
            state.historyIndex -
            1;


        if (
            index <
                0 ||
            index >=
                state.history.length
        ) {

            return null;

        }


        return cloneHistoryEntry(
            state.history[
                index
            ]
        );

    }


    /* =====================================================
       NÄCHSTEN HISTORY-EINTRAG
       ===================================================== */

    function getNextHistoryEntry() {

        initializeHistory();


        const index =
            state.historyIndex +
            1;


        if (
            index <
                0 ||
            index >=
                state.history.length
        ) {

            return null;

        }


        return cloneHistoryEntry(
            state.history[
                index
            ]
        );

    }


    /* =====================================================
       HISTORY ZURÜCKSETZEN
       ===================================================== */

    function clearHistory(
        options
    ) {

        const config =
            isObject(
                options
            )
                ? options
                : {};


        state.history =
            [];


        state.historyIndex =
            -1;


        state.lastHistoryEntry =
            null;


        if (
            config.browser !==
                false &&
            typeof window !==
                "undefined" &&
            window.history
        ) {

            try {

                window.history.replaceState(
                    null,
                    document.title,
                    window.location.pathname +
                    window.location.search +
                    window.location.hash
                );

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {
                        phase:
                            "clear-browser-history"
                    }
                );

            }

        }


        emit(
            "history-cleared",
            {

                browser:
                    config.browser !==
                    false

            }
        );


        return true;

    }


    /* =====================================================
       HISTORY EINTRAG SUCHEN
       ===================================================== */

    function findHistoryEntry(
        predicate
    ) {

        initializeHistory();


        if (
            !isFunction(
                predicate
            )
        ) {

            return null;

        }


        for (
            let index =
                state.history.length -
                1;

            index >=
                0;

            index--
        ) {

            const entry =
                state.history[
                    index
                ];


            try {

                if (
                    predicate(
                        cloneHistoryEntry(
                            entry
                        ),
                        index
                    )
                ) {

                    return {

                        entry:
                            cloneHistoryEntry(
                                entry
                            ),

                        index

                    };

                }

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {
                        phase:
                            "history-search",

                        index
                    }
                );

            }

        }


        return null;

    }


    /* =====================================================
       HISTORY STATUS
       ===================================================== */

    function getHistoryStatus() {

        initializeHistory();


        return {

            length:
                state.history.length,

            index:
                state.historyIndex,

            canGoBack:
                state.historyIndex >
                0,

            canGoForward:
                state.historyIndex <
                state.history.length -
                1,

            current:
                getCurrentHistoryEntry(),

            previous:
                getPreviousHistoryEntry(),

            next:
                getNextHistoryEntry(),

            browserSupported:
                Boolean(
                    state.browserHistorySupported
                )

        };

    }


    /* =====================================================
       ROUTER HISTORY API
       ===================================================== */

    api.initializeHistory =
        initializeHistory;

    api.createHistoryEntry =
        createHistoryEntry;

    api.getHistory =
        getHistory;

    api.getHistoryLength =
        getHistoryLength;

    api.getHistoryIndex =
        getHistoryIndex;

    api.getCurrentHistoryEntry =
        getCurrentHistoryEntry;

    api.getPreviousHistoryEntry =
        getPreviousHistoryEntry;

    api.getNextHistoryEntry =
        getNextHistoryEntry;

    api.getHistoryStatus =
        getHistoryStatus;

    api.clearHistory =
        clearHistory;

    api.findHistoryEntry =
        findHistoryEntry;


/* =========================================================
   ENDE TEIL 8 / 16
   ========================================================= */
 /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 9 / 16
   ========================================================= */

    /* =====================================================
       BROWSER-HISTORY EVENTS
       ===================================================== */

    function handlePopState(
        event
    ) {

        if (
            state.destroyed
        ) {

            return;

        }


        const browserState =
            event &&
            event.state &&
            event.state.__haldoRouter
                ? event.state.__haldoRouter
                : null;


        let target =
            null;


        if (
            browserState &&
            browserState.path
        ) {

            target =
                browserState.path;

        }
        else {

            target =
                getPathFromLocation();

        }


        const locationData =
            getLocationData();


        /*
         * Bei Browser-Navigation müssen Query und
         * Hash direkt aus der aktuellen URL gelesen
         * werden.
         */

        const navigationOptions = {

            source:
                "popstate",

            fromPopState:
                true,

            replace:
                true,

            history:
                false,

            query:
                browserState &&
                browserState.query
                    ? cloneData(
                        browserState.query
                    )
                    : locationData.query,

            hash:
                browserState &&
                browserState.hash !==
                    undefined
                    ? browserState.hash
                    : locationData.hash

        };


        emit(
            "browser-navigation",
            {

                type:
                    "popstate",

                target,

                state:
                    cloneData(
                        browserState
                    )

            }
        );


        navigate(
            target,
            navigationOptions
        )
        .catch(
            error => {

                handleError(
                    error,
                    {
                        phase:
                            "popstate-navigation"
                    }
                );

            }
        );

    }


    /* =====================================================
       HASH-CHANGE EVENT
       ===================================================== */

    function handleHashChange(
        event
    ) {

        if (
            state.destroyed
        ) {

            return;

        }


        const locationData =
            getLocationData();


        let target =
            locationData.path;


        if (
            state.mode ===
            ROUTER_MODE_HASH
        ) {

            target =
                extractHashRoute(
                    locationData.hash
                );

        }


        emit(
            "browser-navigation",
            {

                type:
                    "hashchange",

                target,

                oldURL:
                    event &&
                    event.oldURL
                        ? event.oldURL
                        : null,

                newURL:
                    event &&
                    event.newURL
                        ? event.newURL
                        : null

            }
        );


        navigate(
            target,
            {

                source:
                    "hashchange",

                fromHashChange:
                    true,

                replace:
                    true,

                history:
                    false,

                query:
                    locationData.query,

                hash:
                    locationData.hash

            }
        )
        .catch(
            error => {

                handleError(
                    error,
                    {
                        phase:
                            "hashchange-navigation"
                    }
                );

            }
        );

    }


    /* =====================================================
       CURRENT LOCATION LESEN
       ===================================================== */

    function getLocationData() {

        if (
            typeof window ===
            "undefined" ||
            !window.location
        ) {

            return {

                path:
                    DEFAULT_ROUTE,

                query:
                    {},

                hash:
                    ""

            };

        }


        let path =
            window.location.pathname ||
            DEFAULT_ROUTE;


        let query =
            parseQuery(
                window.location.search ||
                ""
            );


        let hash =
            window.location.hash ||
            "";


        /*
         * Hash-Router:
         *
         * #/dashboard?mode=dark
         *
         * wird in Route + Query zerlegt.
         */

        if (
            state.mode ===
            ROUTER_MODE_HASH
        ) {

            const hashRoute =
                extractHashRoute(
                    hash
                );


            if (
                hashRoute
            ) {

                const parsed =
                    parseNavigationTarget(
                        hashRoute
                    );


                path =
                    parsed.path;


                query =
                    {

                        ...query,

                        ...parsed.query

                    };


                hash =
                    parsed.hash;

            }
            else {

                path =
                    DEFAULT_ROUTE;

            }

        }
        else {

            const parsed =
                parseNavigationTarget(
                    path +
                    (
                        window.location.search ||
                        ""
                    ) +
                    (
                        window.location.hash ||
                        ""
                    )
                );


            path =
                parsed.path;


            query =
                parsed.query;


            hash =
                parsed.hash;

        }


        return {

            path:
                normalizePath(
                    path
                ),

            query:
                cloneData(
                    query
                ),

            hash:
                normalizeHash(
                    hash
                )

        };

    }


    /* =====================================================
       PFAD AUS LOCATION ERMITTELN
       ===================================================== */

    function getPathFromLocation() {

        return getLocationData()
            .path;

    }


    /* =====================================================
       HASH-ROUTE EXTRAHIEREN
       ===================================================== */

    function extractHashRoute(
        hash
    ) {

        if (
            !hash
        ) {

            return DEFAULT_ROUTE;

        }


        let value =
            String(
                hash
            );


        if (
            value.charAt(
                0
            ) === "#"
        ) {

            value =
                value.slice(
                    1
                );

        }


        /*
         * Unterstützte Formen:
         *
         * #/dashboard
         * #dashboard
         * #!/dashboard
         */

        if (
            value.indexOf(
                "!"
            ) ===
            0
        ) {

            value =
                value.slice(
                    1
                );

        }


        if (
            !value
        ) {

            return DEFAULT_ROUTE;

        }


        if (
            value.charAt(
                0
            ) !== "/"
        ) {

            value =
                "/" +
                value;

        }


        return value;

    }


    /* =====================================================
       BROWSER EVENTS REGISTRIEREN
       ===================================================== */

    function bindBrowserEvents() {

        if (
            state.browserEventsBound
        ) {

            return true;

        }


        if (
            typeof window ===
            "undefined"
        ) {

            return false;

        }


        window.addEventListener(
            "popstate",
            handlePopState
        );


        window.addEventListener(
            "hashchange",
            handleHashChange
        );


        state.browserEventsBound =
            true;


        emit(
            "browser-events-bound",
            {

                popstate:
                    true,

                hashchange:
                    true

            }
        );


        return true;

    }


    /* =====================================================
       BROWSER EVENTS ENTFERNEN
       ===================================================== */

    function unbindBrowserEvents() {

        if (
            !state.browserEventsBound
        ) {

            return true;

        }


        if (
            typeof window !==
            "undefined"
        ) {

            window.removeEventListener(
                "popstate",
                handlePopState
            );


            window.removeEventListener(
                "hashchange",
                handleHashChange
            );

        }


        state.browserEventsBound =
            false;


        emit(
            "browser-events-unbound",
            {

                popstate:
                    true,

                hashchange:
                    true

            }
        );


        return true;

    }


    /* =====================================================
       ROUTER INITIALISIEREN
       ===================================================== */

    async function initialize(
        options
    ) {

        if (
            state.destroyed
        ) {

            state.destroyed =
                false;

        }


        const config =
            isObject(
                options
            )
                ? {
                    ...options
                }
                : {};


        if (
            state.initialized &&
            !config.force
        ) {

            return {

                success:
                    true,

                initialized:
                    true,

                alreadyInitialized:
                    true,

                path:
                    state.currentPath

            };

        }


        /*
         * Router-Modus übernehmen.
         */

        if (
            config.mode
        ) {

            setMode(
                config.mode
            );

        }


        /*
         * Outlet übernehmen.
         */

        if (
            config.outlet
        ) {

            setOutlet(
                config.outlet
            );

        }


        /*
         * Browser-History vorbereiten.
         */

        initializeHistory();


        /*
         * Browser-Events registrieren.
         */

        bindBrowserEvents();


        /*
         * Initiale URL lesen.
         */

        const locationData =
            getLocationData();


        let initialPath =
            config.initialPath ||
            locationData.path ||
            DEFAULT_ROUTE;


        if (
            state.mode ===
            ROUTER_MODE_HASH &&
            !config.initialPath
        ) {

            initialPath =
                extractHashRoute(
                    window.location.hash
                );

        }


        state.initialized =
            true;


        state.ready =
            false;


        emit(
            "router-initializing",
            {

                path:
                    initialPath,

                mode:
                    state.mode,

                query:
                    cloneData(
                        locationData.query
                    ),

                hash:
                    locationData.hash

            }
        );


        /*
         * Optional registrierte Initialisierungs-
         * Middleware ausführen.
         */

        const initializationResult =
            await runInitializationHooks(
                config
            );


        if (
            initializationResult ===
            false
        ) {

            state.ready =
                false;


            emit(
                "router-initialization-cancelled",
                {

                    path:
                        initialPath

                }
            );


            return {

                success:
                    false,

                cancelled:
                    true,

                path:
                    initialPath

            };

        }


        /*
         * Initiale Route navigieren.
         */

        const navigationResult =
            await navigate(
                initialPath,
                {

                    ...config,

                    source:
                        "router-init",

                    query:
                        locationData.query,

                    hash:
                        locationData.hash,

                    replace:
                        true,

                    history:
                        config.history !==
                        false

                }
            );


        state.ready =
            Boolean(
                navigationResult &&
                navigationResult.success
            );


        emit(
            "router-ready",
            {

                ready:
                    state.ready,

                path:
                    state.currentPath,

                route:
                    state.currentRoute
                        ? cloneData(
                            state.currentRoute
                        )
                        : null

            }
        );


        return {

            success:
                state.ready,

            initialized:
                true,

            ready:
                state.ready,

            navigation:
                navigationResult,

            path:
                state.currentPath

        };

    }


    /* =====================================================
       INITIALISIERUNGS-HOOKS
       ===================================================== */

    async function runInitializationHooks(
        options
    ) {

        const hooks =
            [];


        if (
            isFunction(
                options.beforeInitialize
            )
        ) {

            hooks.push(
                options.beforeInitialize
            );

        }


        for (
            const hook of
            state.initializationHooks
        ) {

            if (
                hook &&
                hook.enabled !==
                    false &&
                isFunction(
                    hook.handler
                )
            ) {

                hooks.push(
                    hook.handler
                );

            }

        }


        for (
            const hook of hooks
        ) {

            try {

                const result =
                    await hook(
                        {
                            router:
                                api,

                            state:
                                getRouterState(),

                            options:
                                cloneData(
                                    options
                                )
                        },
                        api
                    );


                if (
                    result ===
                    false
                ) {

                    return false;

                }


                if (
                    isObject(
                        result
                    ) &&
                    result.allowed ===
                        false
                ) {

                    return false;

                }

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {
                        phase:
                            "router-initialization-hook"
                    }
                );


                if (
                    options.stopOnError
                ) {

                    return false;

                }

            }

        }


        return true;

    }


    /* =====================================================
       INITIALISIERUNGS-HOOK HINZUFÜGEN
       ===================================================== */

    function addInitializationHook(
        hook,
        options
    ) {

        if (
            !isFunction(
                hook
            )
        ) {

            return null;

        }


        const config =
            isObject(
                options
            )
                ? options
                : {};


        const entry = {

            id:
                config.id ||
                createHookId(
                    "init"
                ),

            handler:
                hook,

            enabled:
                config.enabled !==
                false,

            priority:
                Number.isFinite(
                    config.priority
                )
                    ? config.priority
                    : 0,

            createdAt:
                Date.now()

        };


        state.initializationHooks.push(
            entry
        );


        state.initializationHooks.sort(
            (
                a,
                b
            ) =>
                b.priority -
                a.priority
        );


        emit(
            "initialization-hook-added",
            {

                id:
                    entry.id,

                priority:
                    entry.priority

            }
        );


        return entry.id;

    }


    /* =====================================================
       INITIALISIERUNGS-HOOK ENTFERNEN
       ===================================================== */

    function removeInitializationHook(
        id
    ) {

        const index =
            state.initializationHooks.findIndex(
                hook =>
                    hook.id ===
                    id
            );


        if (
            index ===
            -1
        ) {

            return false;

        }


        state.initializationHooks.splice(
            index,
            1
        );


        emit(
            "initialization-hook-removed",
            {
                id
            }
        );


        return true;

    }


    /* =====================================================
       INITIALISIERUNGS-HOOK AKTIVIEREN
       ===================================================== */

    function setInitializationHookEnabled(
        id,
        enabled
    ) {

        const hook =
            state.initializationHooks.find(
                item =>
                    item.id ===
                    id
            );


        if (
            !hook
        ) {

            return false;

        }


        hook.enabled =
            Boolean(
                enabled
            );


        emit(
            "initialization-hook-updated",
            {

                id,

                enabled:
                    hook.enabled

            }
        );


        return true;

    }


    /* =====================================================
       ROUTER-STATE ABRUFEN
       ===================================================== */

    function getRouterState() {

        return {

            initialized:
                Boolean(
                    state.initialized
                ),

            ready:
                Boolean(
                    state.ready
                ),

            destroyed:
                Boolean(
                    state.destroyed
                ),

            navigating:
                Boolean(
                    state.navigating
                ),

            mode:
                state.mode,

            currentPath:
                state.currentPath,

            currentApp:
                state.currentApp,

            currentRoute:
                state.currentRoute
                    ? cloneData(
                        state.currentRoute
                    )
                    : null,

            previousPath:
                state.previousPath,

            previousApp:
                state.previousApp,

            currentParams:
                cloneData(
                    state.currentParams
                ),

            currentQuery:
                cloneData(
                    state.currentQuery
                ),

            currentHash:
                state.currentHash,

            navigationCount:
                state.navigationCount,

            navigationId:
                state.navigationId,

            routeCount:
                state.routes.size,

            guardCount:
                state.guards.length,

            middlewareCount:
                state.middleware.length,

            history:
                getHistoryStatus(),

            outlet:
                getTargetDescription(
                    state.outlet
                ),

            browserEventsBound:
                Boolean(
                    state.browserEventsBound
                )

        };

    }


    /* =====================================================
       READY STATUS
       ===================================================== */

    function isReady() {

        return Boolean(
            state.ready
        );

    }


    /* =====================================================
       INITIALIZED STATUS
       ===================================================== */

    function isInitialized() {

        return Boolean(
            state.initialized
        );

    }


    /* =====================================================
       NAVIGATION STATUS
       ===================================================== */

    function isNavigating() {

        return Boolean(
            state.navigating
        );

    }


    /* =====================================================
       ROUTER API ERWEITERN
       ===================================================== */

    api.initialize =
        initialize;

    api.init =
        initialize;

    api.isReady =
        isReady;

    api.isInitialized =
        isInitialized;

    api.isNavigating =
        isNavigating;

    api.getRouterState =
        getRouterState;

    api.getState =
        getRouterState;

    api.bindBrowserEvents =
        bindBrowserEvents;

    api.unbindBrowserEvents =
        unbindBrowserEvents;

    api.getLocationData =
        getLocationData;

    api.getPathFromLocation =
        getPathFromLocation;

    api.addInitializationHook =
        addInitializationHook;

    api.removeInitializationHook =
        removeInitializationHook;

    api.setInitializationHookEnabled =
        setInitializationHookEnabled;


/* =========================================================
   ENDE TEIL 9 / 16
   ========================================================= */
 /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 10 / 16
   ========================================================= */

    /* =====================================================
       ROUTE LEBENSZYKLUS — BEFORE / AFTER EVENTS
       ===================================================== */

    function emitRouteLifecycle(
        phase,
        context,
        payload
    ) {

        const data =
            {

                phase,

                navigationId:
                    context &&
                    context.id
                        ? context.id
                        : null,

                path:
                    context &&
                    context.to
                        ? context.to.path
                        : null,

                route:
                    context &&
                    context.route
                        ? cloneData(
                            context.route
                        )
                        : null,

                timestamp:
                    Date.now(),

                ...(isObject(
                    payload
                )
                    ? payload
                    : {})

            };


        emit(
            "route-lifecycle",
            data
        );


        emit(
            "route:" +
            phase,
            data
        );


        return data;

    }


    /* =====================================================
       ROUTE LOAD HANDLER
       ===================================================== */

    async function loadRoute(
        route,
        context
    ) {

        if (
            !route
        ) {

            return null;

        }


        /*
         * Bereits geladene Route wiederverwenden.
         */

        if (
            route.loaded &&
            route.module
        ) {

            return route.module;

        }


        if (
            !route.load &&
            !route.loader
        ) {

            return route.module ||
                null;

        }


        const loader =
            route.load ||
            route.loader;


        if (
            !isFunction(
                loader
            )
        ) {

            return null;

        }


        emitRouteLifecycle(
            "load-start",
            context,
            {

                routeId:
                    route.id

            }
        );


        try {

            const module =
                await loader(
                    context,
                    api
                );


            if (
                module !==
                undefined
            ) {

                route.module =
                    module;

            }


            route.loaded =
                true;


            route.loadedAt =
                Date.now();


            emitRouteLifecycle(
                "load-complete",
                context,
                {

                    routeId:
                        route.id,

                    loaded:
                        true

                }
            );


            return module;

        }
        catch (
            error
        ) {

            route.loaded =
                false;


            route.loadError =
                error;


            handleError(
                error,
                {

                    phase:
                        "route-load",

                    route:
                        route.id,

                    path:
                        route.path

                }
            );


            emitRouteLifecycle(
                "load-error",
                context,
                {

                    routeId:
                        route.id,

                    error

                }
            );


            throw error;

        }

    }


    /* =====================================================
       ROUTE MODUL AUFLÖSEN
       ===================================================== */

    async function resolveRouteModule(
        route,
        context
    ) {

        if (
            !route
        ) {

            return null;

        }


        /*
         * Lazy Loader zuerst ausführen.
         */

        if (
            route.load ||
            route.loader
        ) {

            const loaded =
                await loadRoute(
                    route,
                    context
                );


            if (
                loaded
            ) {

                return loaded;

            }

        }


        if (
            route.module
        ) {

            return route.module;

        }


        return null;

    }


    /* =====================================================
       ROUTE MODUL INITIALISIEREN
       ===================================================== */

    async function initializeRouteModule(
        route,
        module,
        context
    ) {

        if (
            !module
        ) {

            return true;

        }


        const initializers =
            [

                module.init,

                module.initialize,

                module.mount

            ];


        for (
            const initializer of
            initializers
        ) {

            if (
                !isFunction(
                    initializer
                )
            ) {

                continue;

            }


            try {

                const result =
                    await initializer.call(
                        module,
                        context,
                        api
                    );


                if (
                    result ===
                    false
                ) {

                    return false;

                }


            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {

                        phase:
                            "route-module-init",

                        route:
                            route.id

                    }
                );


                throw error;

            }

        }


        return true;

    }


    /* =====================================================
       ROUTE MODUL DESTROYEN
       ===================================================== */

    async function destroyRouteModule(
        route,
        context
    ) {

        if (
            !route ||
            !route.module
        ) {

            return true;

        }


        const module =
            route.module;


        const destroyers =
            [

                module.beforeUnmount,

                module.unmount,

                module.destroy,

                module.dispose

            ];


        for (
            const destroyer of
            destroyers
        ) {

            if (
                !isFunction(
                    destroyer
                )
            ) {

                continue;

            }


            try {

                await destroyer.call(
                    module,
                    context,
                    api
                );

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {

                        phase:
                            "route-module-destroy",

                        route:
                            route.id

                    }
                );

            }

        }


        return true;

    }


    /* =====================================================
       ROUTE MODUL AKTIVIEREN
       ===================================================== */

    async function activateRouteModule(
        route,
        context
    ) {

        const module =
            await resolveRouteModule(
                route,
                context
            );


        if (
            !module
        ) {

            return true;

        }


        const initialized =
            await initializeRouteModule(
                route,
                module,
                context
            );


        if (
            !initialized
        ) {

            return false;

        }


        if (
            isFunction(
                module.activate
            )
        ) {

            const result =
                await module.activate(
                    context,
                    api
                );


            if (
                result ===
                false
            ) {

                return false;

            }

        }


        route.active =
            true;


        route.activeAt =
            Date.now();


        emitRouteLifecycle(
            "module-activated",
            context,
            {

                routeId:
                    route.id

            }
        );


        return true;

    }


    /* =====================================================
       ROUTE MODUL DEAKTIVIEREN
       ===================================================== */

    async function deactivateRouteModule(
        route,
        context
    ) {

        if (
            !route ||
            !route.module
        ) {

            return true;

        }


        const module =
            route.module;


        if (
            isFunction(
                module.deactivate
            )
        ) {

            try {

                await module.deactivate(
                    context,
                    api
                );

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {

                        phase:
                            "route-module-deactivate",

                        route:
                            route.id

                    }
                );

            }

        }


        route.active =
            false;


        emitRouteLifecycle(
            "module-deactivated",
            context,
            {

                routeId:
                    route.id

            }
        );


        return true;

    }


    /* =====================================================
       ROUTE TRANSITION
       ===================================================== */

    async function runRouteTransition(
        context,
        phase
    ) {

        const route =
            context.route;


        if (
            !route
        ) {

            return true;

        }


        const transition =
            context.options &&
            context.options.transition !==
                undefined
                ? context.options.transition
                : route.transition;


        if (
            transition ===
            false
        ) {

            return true;

        }


        const transitionHandler =
            resolveTransitionHandler(
                transition,
                phase
            );


        if (
            !transitionHandler
        ) {

            return true;

        }


        emitRouteLifecycle(
            "transition-" +
            phase +
            "-start",
            context,
            {

                transition:
                    getTransitionName(
                        transition
                    )

            }
        );


        try {

            const result =
                await transitionHandler(
                    context,
                    api
                );


            emitRouteLifecycle(
                "transition-" +
                phase +
                "-complete",
                context,
                {

                    transition:
                        getTransitionName(
                            transition
                        )

                }
            );


            return result !==
                false;

        }
        catch (
            error
        ) {

            handleError(
                error,
                {

                    phase:
                        "route-transition-" +
                        phase,

                    route:
                        route.id

                }
            );


            emitRouteLifecycle(
                "transition-" +
                phase +
                "-error",
                context,
                {

                    error

                }
            );


            return false;

        }

    }


    /* =====================================================
       TRANSITION HANDLER AUFLÖSEN
       ===================================================== */

    function resolveTransitionHandler(
        transition,
        phase
    ) {

        if (
            isFunction(
                transition
            )
        ) {

            return transition;

        }


        if (
            isObject(
                transition
            )
        ) {

            if (
                isFunction(
                    transition[
                        phase
                    ]
                )
            ) {

                return transition[
                    phase
                ];

            }


            if (
                isFunction(
                    transition.run
                )
            ) {

                return transition.run;

            }

        }


        if (
            typeof transition ===
            "string"
        ) {

            const handler =
                state.transitions.get(
                    transition
                );


            if (
                handler &&
                isFunction(
                    handler[
                        phase
                    ]
                )
            ) {

                return handler[
                    phase
                ];

            }


            if (
                isFunction(
                    handler
                )
            ) {

                return handler;

            }

        }


        return null;

    }


    /* =====================================================
       TRANSITION NAMEN
       ===================================================== */

    function getTransitionName(
        transition
    ) {

        if (
            typeof transition ===
            "string"
        ) {

            return transition;

        }


        if (
            isFunction(
                transition
            )
        ) {

            return transition.name ||
                "anonymous";

        }


        if (
            isObject(
                transition
            )
        ) {

            return transition.name ||
                "custom";

        }


        return "none";

    }


    /* =====================================================
       TRANSITION REGISTRIEREN
       ===================================================== */

    function registerTransition(
        name,
        handler
    ) {

        if (
            !name ||
            (
                !isFunction(
                    handler
                ) &&
                !isObject(
                    handler
                )
            )
        ) {

            return false;

        }


        state.transitions.set(
            String(
                name
            ),
            handler
        );


        emit(
            "transition-registered",
            {

                name:
                    String(
                        name
                    )

            }
        );


        return true;

    }


    /* =====================================================
       TRANSITION ENTFERNEN
       ===================================================== */

    function unregisterTransition(
        name
    ) {

        if (
            !name
        ) {

            return false;

        }


        const removed =
            state.transitions.delete(
                String(
                    name
                )
            );


        if (
            removed
        ) {

            emit(
                "transition-unregistered",
                {

                    name:
                        String(
                            name
                        )

                }
            );

        }


        return removed;

    }


    /* =====================================================
       TRANSITION ABRUFEN
       ===================================================== */

    function getTransition(
        name
    ) {

        if (
            !name
        ) {

            return null;

        }


        return state.transitions.get(
            String(
                name
            )
        ) ||
            null;

    }


    /* =====================================================
       ALLE TRANSITIONS
       ===================================================== */

    function getTransitions() {

        const result =
            {};


        for (
            const [
                name,
                handler
            ] of
            state.transitions.entries()
        ) {

            result[
                name
            ] =
                handler;

        }


        return result;

    }


    /* =====================================================
       ROUTE MODULE API
       ===================================================== */

    api.loadRoute =
        loadRoute;

    api.resolveRouteModule =
        resolveRouteModule;

    api.initializeRouteModule =
        initializeRouteModule;

    api.destroyRouteModule =
        destroyRouteModule;

    api.activateRouteModule =
        activateRouteModule;

    api.deactivateRouteModule =
        deactivateRouteModule;

    api.runRouteTransition =
        runRouteTransition;

    api.registerTransition =
        registerTransition;

    api.unregisterTransition =
        unregisterTransition;

    api.getTransition =
        getTransition;

    api.getTransitions =
        getTransitions;


/* =========================================================
   ENDE TEIL 10 / 16
   ========================================================= */
 /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 11 / 16
   ========================================================= */

    /* =====================================================
       NAVIGATION CONTEXT ERSTELLEN
       ===================================================== */

    function createNavigationContext(
        target,
        options
    ) {

        const config =
            isObject(
                options
            )
                ? {
                    ...options
                }
                : {};


        const parsedTarget =
            parseNavigationTarget(
                target
            );


        const path =
            normalizePath(
                parsedTarget.path
            );


        const query =
            config.query !==
                undefined
                ? normalizeQuery(
                    config.query
                )
                : parsedTarget.query;


        const hash =
            config.hash !==
                undefined
                ? normalizeHash(
                    config.hash
                )
                : parsedTarget.hash;


        const match =
            matchRoute(
                path
            );


        const route =
            match
                ? match.route
                : null;


        const params =
            match
                ? match.params
                : {};


        const fromRoute =
            state.currentRoute
                ? cloneData(
                    state.currentRoute
                )
                : null;


        const from = {

            path:
                state.currentPath ||
                null,

            route:
                fromRoute,

            params:
                cloneData(
                    state.currentParams ||
                    {}
                ),

            query:
                cloneData(
                    state.currentQuery ||
                    {}
                ),

            hash:
                state.currentHash ||
                "",

            appId:
                state.currentApp ||
                null

        };


        const to = {

            path,

            route:
                route
                    ? cloneData(
                        route
                    )
                    : null,

            params:
                cloneData(
                    params
                ),

            query:
                cloneData(
                    query
                ),

            hash,

            appId:
                route &&
                route.appId
                    ? route.appId
                    : null

        };


        const context = {

            id:
                ++state.navigationId,

            navigationId:
                state.navigationId,

            from,

            to,

            route,

            params:
                cloneData(
                    params
                ),

            query:
                cloneData(
                    query
                ),

            hash,

            options:
                config,

            source:
                config.source ||
                "programmatic",

            replace:
                Boolean(
                    config.replace
                ),

            redirected:
                Boolean(
                    config.redirected
                ),

            redirectCount:
                Number.isInteger(
                    config.redirectCount
                )
                    ? config.redirectCount
                    : 0,

            cancelled:
                false,

            completed:
                false,

            timestamp:
                Date.now(),

            startedAt:
                Date.now(),

            duration:
                null,

            error:
                null

        };


        return context;

    }


    /* =====================================================
       NAVIGATION STARTEN
       ===================================================== */

    async function navigate(
        target,
        options
    ) {

        if (
            state.destroyed
        ) {

            return createNavigationResult(
                null,
                false,
                "router-destroyed"
            );

        }


        const context =
            createNavigationContext(
                target,
                options
            );


        emit(
            "navigation-start",
            createNavigationSnapshot(
                context
            )
        );


        /*
         * Doppelte Navigation vermeiden,
         * sofern dies nicht ausdrücklich erlaubt ist.
         */

        if (
            !context.options.force &&
            !context.options.allowSameRoute &&
            isSameLocation(
                context.to,
                {
                    path:
                        state.currentPath,

                    query:
                        state.currentQuery,

                    hash:
                        state.currentHash
                }
            )
        ) {

            const sameResult =
                createNavigationResult(
                    context,
                    true,
                    "same-route"
                );


            sameResult.skipped =
                true;


            emit(
                "navigation-skipped",
                createNavigationSnapshot(
                    context
                )
            );


            return sameResult;

        }


        if (
            state.navigating
        ) {

            if (
                context.options.queue !==
                    false
            ) {

                return enqueueNavigation(
                    context
                );

            }


            if (
                context.options.cancelPrevious !==
                    false
            ) {

                cancelActiveNavigation(
                    "superseded"
                );

            }
            else {

                return createNavigationResult(
                    context,
                    false,
                    "navigation-busy"
                );

            }

        }


        state.navigating =
            true;


        state.activeNavigation =
            context;


        state.navigationStartedAt =
            Date.now();


        try {

            const result =
                await executeNavigation(
                    context
                );


            context.completed =
                Boolean(
                    result &&
                    result.success
                );


            context.duration =
                Date.now() -
                context.startedAt;


            emit(
                result.success
                    ? "navigation-complete"
                    : "navigation-failed",
                {

                    ...createNavigationSnapshot(
                        context
                    ),

                    result:
                        cloneData(
                            result
                        )

                }
            );


            return result;

        }
        catch (
            error
        ) {

            context.error =
                error;


            context.duration =
                Date.now() -
                context.startedAt;


            handleError(
                error,
                {

                    phase:
                        "navigate",

                    navigationId:
                        context.id,

                    path:
                        context.to.path

                }
            );


            const result =
                createNavigationResult(
                    context,
                    false,
                    "navigation-error",
                    error
                );


            emit(
                "navigation-failed",
                {

                    ...createNavigationSnapshot(
                        context
                    ),

                    result:
                        cloneData(
                            result
                        )

                }
            );


            return result;

        }
        finally {

            state.navigating =
                false;


            state.activeNavigation =
                null;


            state.navigationStartedAt =
                null;


            processNavigationQueue();

        }

    }


    /* =====================================================
       NAVIGATION AUSFÜHREN
       ===================================================== */

    async function executeNavigation(
        context
    ) {

        const route =
            context.route;


        /*
         * Route nicht gefunden.
         */

        if (
            !route
        ) {

            return handleNotFound(
                context
            );

        }


        emit(
            "navigation-before-guards",
            createNavigationSnapshot(
                context
            )
        );


        const guardResult =
            await runGuards(
                context
            );


        if (
            !guardResult.allowed
        ) {

            context.cancelled =
                true;


            return createNavigationResult(
                context,
                false,
                guardResult.reason ||
                    "navigation-blocked",
                guardResult.error
            );

        }


        /*
         * Middleware.
         */

        emit(
            "navigation-before-middleware",
            createNavigationSnapshot(
                context
            )
        );


        const middlewareResult =
            await runMiddleware(
                context
            );


        if (
            !middlewareResult.allowed
        ) {

            context.cancelled =
                true;


            return createNavigationResult(
                context,
                false,
                middlewareResult.reason ||
                    "navigation-blocked",
                middlewareResult.error
            );

        }


        /*
         * Redirects können durch Guards oder
         * Middleware ausgelöst worden sein.
         */

        if (
            middlewareResult.redirect
        ) {

            return executeRedirect(
                context,
                middlewareResult.redirect
            );

        }


        if (
            guardResult.redirect
        ) {

            return executeRedirect(
                context,
                guardResult.redirect
            );

        }


        emit(
            "navigation-before-load",
            createNavigationSnapshot(
                context
            )
        );


        /*
         * Lazy Route laden.
         */

        try {

            await loadRoute(
                route,
                context
            );

        }
        catch (
            error
        ) {

            return handleNavigationError(
                context,
                error,
                "route-load-failed"
            );

        }


        /*
         * Alte Route verlassen.
         */

        if (
            state.currentRoute &&
            state.currentRoute !==
                route
        ) {

            const leaveResult =
                await leaveCurrentRoute(
                    context
                );


            if (
                !leaveResult
            ) {

                context.cancelled =
                    true;


                return createNavigationResult(
                    context,
                    false,
                    "leave-cancelled"
                );

            }

        }


        emit(
            "navigation-before-transition",
            createNavigationSnapshot(
                context
            )
        );


        const transitionOut =
            await runRouteTransition(
                {

                    ...context,

                    route:
                        state.currentRoute ||
                        route

                },
                "leave"
            );


        if (
            transitionOut ===
            false &&
            context.options.strictTransition
        ) {

            return createNavigationResult(
                context,
                false,
                "leave-transition-failed"
            );

        }


        /*
         * Neue Route aktivieren.
         */

        const activationResult =
            await activateRouteModule(
                route,
                context
            );


        if (
            activationResult ===
            false
        ) {

            return createNavigationResult(
                context,
                false,
                "route-activation-failed"
            );

        }


        emit(
            "navigation-before-render",
            createNavigationSnapshot(
                context
            )
        );


        try {

            await renderRoute(
                context
            );

        }
        catch (
            error
        ) {

            return handleNavigationError(
                context,
                error,
                "route-render-failed"
            );

        }


        /*
         * Router-Zustand aktualisieren.
         */

        commitNavigationState(
            context
        );


        /*
         * Browser-History schreiben.
         */

        if (
            context.options.history !==
                false
        ) {

            const historyEntry =
                createHistoryEntry(
                    context.to.path,
                    context.to.params,
                    context.to.query,
                    context.to.hash,
                    route,
                    context.options
                );


            pushHistoryEntry(
                historyEntry,
                Boolean(
                    context.replace ||
                    context.options.replace
                )
            );


            if (
                !context.options.fromPopState &&
                !context.options.fromHashChange
            ) {

                pushBrowserState(
                    historyEntry,
                    Boolean(
                        context.replace ||
                        context.options.replace
                    )
                );

            }

        }


        emit(
            "navigation-after-render",
            createNavigationSnapshot(
                context
            )
        );


        const transitionIn =
            await runRouteTransition(
                context,
                "enter"
            );


        if (
            transitionIn ===
                false &&
            context.options.strictTransition
        ) {

            return createNavigationResult(
                context,
                false,
                "enter-transition-failed"
            );

        }


        await activateCurrentRoute(
            context
        );


        state.navigationCount +=
            1;


        context.duration =
            Date.now() -
            context.startedAt;


        emit(
            "route-changed",
            {

                ...createNavigationSnapshot(
                    context
                ),

                previousPath:
                    context.from.path,

                currentPath:
                    context.to.path

            }
        );


        return createNavigationResult(
            context,
            true,
            "navigation-complete"
        );

    }


    /* =====================================================
       NAVIGATION STATE COMMIT
       ===================================================== */

    function commitNavigationState(
        context
    ) {

        state.previousPath =
            state.currentPath;


        state.previousRoute =
            state.currentRoute
                ? cloneData(
                    state.currentRoute
                )
                : null;


        state.previousApp =
            state.currentApp;


        state.currentPath =
            context.to.path;


        state.currentRoute =
            context.route
                ? cloneData(
                    context.route
                )
                : null;


        state.currentParams =
            cloneData(
                context.to.params
            );


        state.currentQuery =
            cloneData(
                context.to.query
            );


        state.currentHash =
            context.to.hash;


        state.currentApp =
            context.to.appId;


        state.lastNavigation =
            {

                id:
                    context.id,

                path:
                    context.to.path,

                routeId:
                    context.route &&
                    context.route.id
                        ? context.route.id
                        : null,

                timestamp:
                    Date.now()

            };


        if (
            context.route
        ) {

            context.route.lastVisitedAt =
                Date.now();

        }


        emit(
            "state-committed",
            {

                currentPath:
                    state.currentPath,

                currentApp:
                    state.currentApp,

                route:
                    state.currentRoute
                        ? cloneData(
                            state.currentRoute
                        )
                        : null

            }
        );

    }


    /* =====================================================
       CURRENT ROUTE AKTIVIEREN
       ===================================================== */

    async function activateCurrentRoute(
        context
    ) {

        const route =
            context.route;


        if (
            !route
        ) {

            return true;

        }


        if (
            route.module &&
            isFunction(
                route.module.afterNavigate
            )
        ) {

            try {

                const result =
                    await route.module.afterNavigate(
                        context,
                        api
                    );


                if (
                    result ===
                    false
                ) {

                    return false;

                }

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {

                        phase:
                            "route-after-navigate",

                        route:
                            route.id

                    }
                );

            }

        }


        emit(
            "route-activated",
            {

                routeId:
                    route.id,

                path:
                    context.to.path

            }
        );


        return true;

    }


    /* =====================================================
       AKTUELLE ROUTE VERLASSEN
       ===================================================== */

    async function leaveCurrentRoute(
        context
    ) {

        const route =
            state.currentRoute;


        if (
            !route
        ) {

            return true;

        }


        emit(
            "route-leaving",
            {

                routeId:
                    route.id,

                path:
                    state.currentPath,

                navigationId:
                    context.id

            }
        );


        if (
            route.module &&
            isFunction(
                route.module.beforeLeave
            )
        ) {

            try {

                const result =
                    await route.module.beforeLeave(
                        context,
                        api
                    );


                if (
                    result ===
                    false
                ) {

                    return false;

                }

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {

                        phase:
                            "route-before-leave",

                        route:
                            route.id

                    }
                );


                if (
                    context.options.stopOnError
                ) {

                    return false;

                }

            }

        }


        await deactivateRouteModule(
            route,
            context
        );


        await destroyRouteModule(
            route,
            context
        );


        emit(
            "route-left",
            {

                routeId:
                    route.id,

                path:
                    state.currentPath,

                navigationId:
                    context.id

            }
        );


        return true;

    }


    /* =====================================================
       NAVIGATION RESULT
       ===================================================== */

    function createNavigationResult(
        context,
        success,
        reason,
        error
    ) {

        return {

            success:
                Boolean(
                    success
                ),

            reason:
                reason ||
                (
                    success
                        ? "success"
                        : "failed"

           /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 12 / 16
   ========================================================= */

    /* =====================================================
       GUARDS AUSFÜHREN
       ===================================================== */

    async function runGuards(
        context
    ) {

        const guards =
            getOrderedGuards();


        if (
            !guards.length
        ) {

            return {

                allowed:
                    true,

                redirect:
                    null,

                reason:
                    null,

                error:
                    null

            };

        }


        emit(
            "guards-start",
            createNavigationSnapshot(
                context
            )
        );


        for (
            const guardEntry of
            guards
        ) {

            if (
                guardEntry.enabled ===
                false
            ) {

                continue;

            }


            let result;


            try {

                result =
                    await guardEntry.handler(
                        context,
                        api
                    );

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {

                        phase:
                            "navigation-guard",

                        guard:
                            guardEntry.id,

                        navigationId:
                            context.id

                    }
                );


                if (
                    guardEntry.allowOnError
                ) {

                    continue;

                }


                return {

                    allowed:
                        false,

                    redirect:
                        null,

                    reason:
                        "guard-error",

                    error

                };

            }


            const normalized =
                normalizeGuardResult(
                    result
                );


            emit(
                "guard-result",
                {

                    guardId:
                        guardEntry.id,

                    allowed:
                        normalized.allowed,

                    redirect:
                        normalized.redirect,

                    navigationId:
                        context.id

                }
            );


            if (
                normalized.redirect
            ) {

                return {

                    allowed:
                        false,

                    redirect:
                        normalized.redirect,

                    reason:
                        "guard-redirect",

                    error:
                        null

                };

            }


            if (
                normalized.allowed ===
                false
            ) {

                return {

                    allowed:
                        false,

                    redirect:
                        null,

                    reason:
                        normalized.reason ||
                            "guard-blocked",

                    error:
                        normalized.error ||
                        null

                };

            }

        }


        emit(
            "guards-complete",
            createNavigationSnapshot(
                context
            )
        );


        return {

            allowed:
                true,

            redirect:
                null,

            reason:
                null,

            error:
                null

        };

    }


    /* =====================================================
       GUARD-ERGEBNIS NORMALISIEREN
       ===================================================== */

    function normalizeGuardResult(
        result
    ) {

        if (
            result ===
            undefined ||
            result ===
            null ||
            result ===
            true
        ) {

            return {

                allowed:
                    true,

                redirect:
                    null,

                reason:
                    null,

                error:
                    null

            };

        }


        if (
            result ===
            false
        ) {

            return {

                allowed:
                    false,

                redirect:
                    null,

                reason:
                    "blocked",

                error:
                    null

            };

        }


        if (
            typeof result ===
            "string"
        ) {

            return {

                allowed:
                    false,

                redirect:
                    result,

                reason:
                    "redirect",

                error:
                    null

            };

        }


        if (
            isObject(
                result
            )
        ) {

            if (
                result.redirect
            ) {

                return {

                    allowed:
                        false,

                    redirect:
                        result.redirect,

                    reason:
                        result.reason ||
                        "redirect",

                    error:
                        result.error ||
                        null

                };

            }


            if (
                result.allowed ===
                false ||
                result.blocked ===
                true
            ) {

                return {

                    allowed:
                        false,

                    redirect:
                        null,

                    reason:
                        result.reason ||
                        "blocked",

                    error:
                        result.error ||
                        null

                };

            }


            return {

                allowed:
                    true,

                redirect:
                    null,

                reason:
                    result.reason ||
                    null,

                error:
                    null

            };

        }


        return {

            allowed:
                Boolean(
                    result
                ),

            redirect:
                null,

            reason:
                null,

            error:
                null

        };

    }


    /* =====================================================
       GUARDS SORTIERT ABRUFEN
       ===================================================== */

    function getOrderedGuards() {

        return state.guards
            .filter(
                guard =>
                    guard &&
                    isFunction(
                        guard.handler
                    )
            )
            .slice()
            .sort(
                (
                    a,
                    b
                ) =>
                    b.priority -
                    a.priority
            );

    }


    /* =====================================================
       GUARD REGISTRIEREN
       ===================================================== */

    function registerGuard(
        guard,
        options
    ) {

        if (
            !isFunction(
                guard
            )
        ) {

            return null;

        }


        const config =
            isObject(
                options
            )
                ? options
                : {};


        const id =
            config.id ||
            createHookId(
                "guard"
            );


        const existing =
            state.guards.find(
                item =>
                    item.id ===
                    id
            );


        if (
            existing
        ) {

            existing.handler =
                guard;

            existing.priority =
                Number.isFinite(
                    config.priority
                )
                    ? config.priority
                    : existing.priority;

            existing.enabled =
                config.enabled !==
                false;

            existing.allowOnError =
                Boolean(
                    config.allowOnError
                );


            emit(
                "guard-updated",
                {

                    id,

                    priority:
                        existing.priority

                }
            );


            return id;

        }


        const entry = {

            id,

            handler:
                guard,

            priority:
                Number.isFinite(
                    config.priority
                )
                    ? config.priority
                    : 0,

            enabled:
                config.enabled !==
                false,

            allowOnError:
                Boolean(
                    config.allowOnError
                ),

            createdAt:
                Date.now(),

            metadata:
                isObject(
                    config.metadata
                )
                    ? cloneData(
                        config.metadata
                    )
                    : {}

        };


        state.guards.push(
            entry
        );


        emit(
            "guard-registered",
            {

                id,

                priority:
                    entry.priority

            }
        );


        return id;

    }


    /* =====================================================
       GUARD ENTFERNEN
       ===================================================== */

    function unregisterGuard(
        id
    ) {

        const index =
            state.guards.findIndex(
                guard =>
                    guard.id ===
                    id
            );


        if (
            index ===
            -1
        ) {

            return false;

        }


        state.guards.splice(
            index,
            1
        );


        emit(
            "guard-unregistered",
            {
                id
            }
        );


        return true;

    }


    /* =====================================================
       GUARD AKTIVIEREN / DEAKTIVIEREN
       ===================================================== */

    function setGuardEnabled(
        id,
        enabled
    ) {

        const guard =
            state.guards.find(
                item =>
                    item.id ===
                    id
            );


        if (
            !guard
        ) {

            return false;

        }


        guard.enabled =
            Boolean(
                enabled
            );


        emit(
            "guard-updated",
            {

                id,

                enabled:
                    guard.enabled

            }
        );


        return true;

    }


    /* =====================================================
       GUARD ABRUFEN
       ===================================================== */

    function getGuard(
        id
    ) {

        const guard =
            state.guards.find(
                item =>
                    item.id ===
                    id
            );


        if (
            !guard
        ) {

            return null;

        }


        return {

            id:
                guard.id,

            priority:
                guard.priority,

            enabled:
                guard.enabled,

            allowOnError:
                guard.allowOnError,

            createdAt:
                guard.createdAt,

            metadata:
                cloneData(
                    guard.metadata
                )

        };

    }


    /* =====================================================
       ALLE GUARDS
       ===================================================== */

    function getGuards() {

        return state.guards.map(
            guard =>
                ({

                    id:
                        guard.id,

                    priority:
                        guard.priority,

                    enabled:
                        guard.enabled,

                    allowOnError:
                        guard.allowOnError,

                    createdAt:
                        guard.createdAt,

                    metadata:
                        cloneData(
                            guard.metadata
                        )

                })
        );

    }


    /* =====================================================
       MIDDLEWARE AUSFÜHREN
       ===================================================== */

    async function runMiddleware(
        context
    ) {

        const middleware =
            getOrderedMiddleware();


        if (
            !middleware.length
        ) {

            return {

                allowed:
                    true,

                redirect:
                    null,

                reason:
                    null,

                error:
                    null

            };

        }


        emit(
            "middleware-start",
            createNavigationSnapshot(
                context
            )
        );


        let index =
            -1;


        let redirect =
            null;


        let blocked =
            false;


        let blockReason =
            null;


        let middlewareError =
            null;


        const dispatch =
            async (
                currentIndex
            ) => {

                if (
                    currentIndex <=
                    index
                ) {

                    throw new Error(
                        "HalDoAppRouter: Middleware next() wurde mehrfach aufgerufen."
                    );

                }


                index =
                    currentIndex;


                if (
                    currentIndex >=
                    middleware.length
                ) {

                    return true;

                }


                const entry =
                    middleware[
                        currentIndex
                    ];


                if (
                    !entry ||
                    entry.enabled ===
                        false
                ) {

                    return dispatch(
                        currentIndex +
                        1
                    );

                }


                let nextCalled =
                    false;


                const next =
                    async (
                        nextResult
                    ) => {

                        if (
                            nextCalled
                        ) {

                            throw new Error(
                                "HalDoAppRouter: Middleware next() wurde mehrfach aufgerufen."
                            );

                        }


                        nextCalled =
                            true;


                        const normalized =
                            normalizeMiddlewareResult(
                                nextResult
                            );


                        if (
                            normalized.redirect
                        ) {

                            redirect =
                                normalized.redirect;


                            return false;

                        }


                        if (
                            normalized.allowed ===
                            false
                        ) {

                            blocked =
                                true;


                            blockReason =
                                normalized.reason ||
                                "middleware-blocked";


                            return false;

                        }


                        return dispatch(
                            currentIndex +
                            1
                        );

                    };


                try {

                    const result =
                        await entry.handler(
                            context,
                            next,
                            api
                        );


                    const normalized =
                        normalizeMiddlewareResult(
                            result
                        );


                    if (
                        normalized.redirect
                    ) {

                        redirect =
                            normalized.redirect;


                        return false;

                    }


                    if (
                        normalized.allowed ===
                        false
                    ) {

                        blocked =
                            true;


                        blockReason =
                            normalized.reason ||
                            "middleware-blocked";


                        return false;

                    }


                    if (
                        !nextCalled
                    ) {

                        return true;

                    }


                    return result !==
                        false;

                }
                catch (
                    error
                ) {

                    middlewareError =
                        error;


                    handleError(
                        error,
                        {

                            phase:
                                "navigation-middleware",

                            middleware:
                                entry.id,

                            navigationId:
                                context.id

                        }
                    );


                    if (
                        entry.allowOnError
                    ) {

                        return dispatch(
                            currentIndex +
                            1
                        );

                    }


                    return false;

                }

            };


        try {

            await dispatch(
                0
            );

        }
        catch (
            error
        ) {

            middlewareError =
                error;


            handleError(
                error,
                {

                    phase:
                        "middleware-dispatch",

                    navigationId:
                        context.id

                }
            );

        }


        emit(
            "middleware-complete",
            {

                ...createNavigationSnapshot(
                    context
                ),

                blocked,

                redirect,

                error:
                    middlewareError

            }
        );


        if (
            redirect
        ) {

            return {

                allowed:
                    false,

                redirect,

                reason:
                    "middleware-redirect",

                error:
                    null

            };

        }


        if (
            blocked
        ) {

            return {

                allowed:
                    false,

                redirect:
                    null,

                reason:
                    blockReason,

                error:
                    null

            };

        }


        if (
            middlewareError
        ) {

            return {

                allowed:
                    false,

                redirect:
                    null,

                reason:
                    "middleware-error",

                error:
                    middlewareError

            };

        }


        return {

            allowed:
                true,

            redirect:
                null,

            reason:
                null,

            error:
                null

        };

    }


    /* =====================================================
       MIDDLEWARE ERGEBNIS NORMALISIEREN
       ===================================================== */

    function normalizeMiddlewareResult(
        result
    ) {

        if (
            result ===
            undefined ||
            result ===
            null ||
            result ===
            true
        ) {

            return {

                allowed:
                    true,

                redirect:
                    null,

                reason:
                    null,

                error:
                    null

            };

        }


        if (
            result ===
            false
        ) {

            return {

                allowed:
                    false,

                redirect:
                    null,

                reason:
                    "blocked",

                error:
                    null

            };

        }


        if (
            typeof result ===
            "string"
        ) {

            return {

                allowed:
                    false,

                redirect:
                    result,

                reason:
                    "redirect",

                error:
                    null

            };

        }


        if (
            isObject(
                result
            )
        ) {

            return {

                allowed:
                    result.allowed !==
                        false &&
                    result.blocked !==
                        true,

                redirect:
                    result.redirect ||
                    null,

                reason:
                    result.reason ||
                    null,

                error:
                    result.error ||
                    null

            };

        }


        return {

            allowed:
                Boolean(
                    result
                ),

            redirect:
                null,

            reason:
                null,

            error:
                null

        };

    }


    /* =====================================================
       MIDDLEWARE SORTIERT ABRUFEN
       ===================================================== */

    function getOrderedMiddleware() {

        return state.middleware
            .filter(
                item =>
                    item &&
                    isFunction(
                        item.handler
                    )
            )
            .slice()
            .sort(
                (
                    a,
                    b
                ) =>
                    b.priority -
                    a.priority
            );

    }


    /* =====================================================
       MIDDLEWARE REGISTRIEREN
       ===================================================== */

    function registerMiddleware(
        middleware,
        options
    ) {

        if (
            !isFunction(
                middleware
            )
        ) {

            return null;

        }


        const config =
            isObject(
                options
            )
                ? options
                : {};


        const id =
            config.id ||
            createHookId(
                "middleware"
            );


        const existing =
            state.middleware.find(
                item =>
                    item.id ===
                    id
            );


        if (
            existing
        ) {

            existing.handler =
                middleware;

            existing.priority =
                Number.isFinite(
                    config.priority
                )
                    ? config.priority
                    : existing.priority;

            existing.enabled =
                config.enabled !==
                false;

            existing.allowOnError =
                Boolean(
                    config.allowOnError
                );


            emit(
                "middleware-updated",
                {

                    id,

                    priority:
                        existing.priority

                }
            );


            return id;

        }


        const entry = {

            id,

            handler:
                middleware,

            priority:
                Number.isFinite(
                    config.priority
                )
                    ? config.priority
                    : 0,

            enabled:
                config.enabled !==
                false,

            allowOnError:
                Boolean(
                    config.allowOnError
                ),

            createdAt:
                Date.now(),

            metadata:
                isObject(
                    config.metadata
                )
                    ? cloneData(
                        config.metadata
                    )
                    : {}

        };


        state.middleware.push(
            entry
        );


        emit(
            "middleware-registered",
            {

                id,

                priority:
                    entry.priority

            }
        );


        return id;

    }


    /* =====================================================
       MIDDLEWARE ENTFERNEN
       ===================================================== */

    function unregisterMiddleware(
        id
    ) {

        const index =
            state.middleware.findIndex(
                item =>
                    item.id ===
                    id
            );


        if (
            index ===
            -1
        ) {

            return false;

        }


        state.middleware.splice(
            index,
            1
        );


        emit(
            "middleware-unregistered",
            {
                id
            }
        );


        return true;

    }


    /* =====================================================
       MIDDLEWARE AKTIVIEREN / DEAKTIVIEREN
       ===================================================== */

    function setMiddlewareEnabled(
        id,
        enabled
    ) {

        const middleware =
            state.middleware.find(
                item =>
                    item.id ===
                    id
            );


        if (
            !middleware
        ) {

            return false;

        }


        middleware.enabled =
            Boolean(
                enabled
            );


        emit(
            "middleware-updated",
            {

                id,

                enabled:
                    middleware.enabled

            }
        );


        return true;

    }


    /* =====================================================
       MIDDLEWARE ABRUFEN
       ===================================================== */

    function getMiddleware(
        id
    ) {

        const middleware =
            state.middleware.find(
                item =>
                    item.id ===
                    id
            );


        if (
            !middleware
        ) {

            return null;

        }


        return {

            id:
                middleware.id,

            priority:
                middleware.priority,

            enabled:
                middleware.enabled,

            allowOnError:
                middleware.allowOnError,

            createdAt:
                middleware.createdAt,

            metadata:
                cloneData(
                    middleware.metadata
                )

        };

    }


    /* =====================================================
       ALLE MIDDLEWARES
       ===================================================== */

    function getMiddlewareList() {

        return state.middleware.map(
            middleware =>
                ({

                    id:
                        middleware.id,

                    priority:
                        middleware.priority,

                    enabled:
                        middleware.enabled,

                    allowOnError:
                        middleware.allowOnError,

                    createdAt:
                        middleware.createdAt,

                    metadata:
                        cloneData(
                            middleware.metadata
                        )

                })
        );

    }


    /* =====================================================
       GUARD & MIDDLEWARE API
       ===================================================== */

    api.runGuards =
        runGuards;

    api.registerGuard =
        registerGuard;

    api.unregisterGuard =
        unregisterGuard;

    api.setGuardEnabled =
        setGuardEnabled;

    api.getGuard =
        getGuard;

    api.getGuards =
        getGuards;

    api.runMiddleware =
        runMiddleware;

    api.registerMiddleware =
        registerMiddleware;

    api.unregisterMiddleware =
        unregisterMiddleware;

    api.setMiddlewareEnabled =
        setMiddlewareEnabled;

    api.getMiddleware =
        getMiddleware;

    api.getMiddlewareList =
        getMiddlewareList;


/* =========================================================
   ENDE TEIL 12 / 16
   ========================================================= */
   /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 13 / 16
   ========================================================= */

    /* =====================================================
       ROUTE RENDERING
       ===================================================== */

    async function renderRoute(
        context
    ) {

        if (
            !context ||
            !context.route
        ) {

            return false;

        }


        const route =
            context.route;


        const module =
            route.module ||
            null;


        const outlet =
            resolveRouteOutlet(
                route,
                context
            );


        emit(
            "route-render-start",
            {

                navigationId:
                    context.id,

                routeId:
                    route.id,

                path:
                    context.to.path,

                outlet:
                    getTargetDescription(
                        outlet
                    )

            }
        );


        /*
         * Die Route kann entweder über ihr Modul,
         * über einen Renderer oder direkt über ihr
         * Element gerendert werden.
         */

        let rendered =
            false;


        if (
            module &&
            isFunction(
                module.render
            )
        ) {

            const result =
                await module.render(
                    {
                        ...context,

                        outlet

                    },
                    api
                );


            if (
                result !==
                false
            ) {

                rendered =
                    true;

            }

        }


        if (
            !rendered &&
            isFunction(
                route.render
            )
        ) {

            const result =
                await route.render(
                    {
                        ...context,

                        outlet

                    },
                    api
                );


            if (
                result !==
                false
            ) {

                rendered =
                    true;

            }

        }


        /*
         * HTML-Content einer Route.
         */

        if (
            !rendered &&
            route.template !==
                undefined
        ) {

            rendered =
                renderRouteTemplate(
                    route.template,
                    outlet,
                    context
                );

        }


        /*
         * Element einer Route.
         */

        if (
            !rendered &&
            route.element
        ) {

            rendered =
                renderRouteElement(
                    route.element,
                    outlet,
                    context
                );

        }


        /*
         * App-Integration:
         * Falls die Route zu einer App gehört und
         * kein eigener Renderer vorhanden ist, wird
         * der App-Manager als Fallback angesprochen.
         */

        if (
            !rendered
        ) {

            rendered =
                await renderThroughAppManager(
                    route,
                    context,
                    outlet
                );

        }


        /*
         * Letzter Fallback:
         * Outlet leeren und Route-Container erzeugen.
         */

        if (
            !rendered &&
            outlet
        ) {

            rendered =
                renderFallbackRoute(
                    route,
                    outlet,
                    context
                );

        }


        if (
            !rendered
        ) {

            throw new Error(
                "HalDoAppRouter: Route konnte nicht gerendert werden: " +
                context.to.path
            );

        }


        emit(
            "route-render-complete",
            {

                navigationId:
                    context.id,

                routeId:
                    route.id,

                path:
                    context.to.path,

                rendered:
                    true

            }
        );


        return true;

    }


    /* =====================================================
       ROUTE OUTLET AUFLÖSEN
       ===================================================== */

    function resolveRouteOutlet(
        route,
        context
    ) {

        if (
            context &&
            context.options &&
            context.options.outlet
        ) {

            return resolveTarget(
                context.options.outlet
            );

        }


        if (
            route &&
            route.outlet
        ) {

            return resolveTarget(
                route.outlet
            );

        }


        return state.outlet;

    }


    /* =====================================================
       ROUTE TEMPLATE RENDERN
       ===================================================== */

    function renderRouteTemplate(
        template,
        outlet,
        context
    ) {

        if (
            !outlet
        ) {

            return false;

        }


        let content =
            template;


        if (
            isFunction(
                template
            )
        ) {

            content =
                template(
                    context,
                    api
                );

        }


        if (
            content ===
            undefined ||
            content ===
            null
        ) {

            return false;

        }


        if (
            typeof content ===
            "string"
        ) {

            outlet.innerHTML =
                content;


            return true;

        }


        if (
            typeof Node !==
                "undefined" &&
            content instanceof Node
        ) {

            outlet.replaceChildren(
                content
            );


            return true;

        }


        return false;

    }


    /* =====================================================
       ROUTE ELEMENT RENDERN
       ===================================================== */

    function renderRouteElement(
        element,
        outlet,
        context
    ) {

        if (
            !outlet ||
            !element
        ) {

            return false;

        }


        let resolved =
            element;


        if (
            isFunction(
                element
            )
        ) {

            resolved =
                element(
                    context,
                    api
                );

        }


        if (
            typeof resolved ===
            "string"
        ) {

            outlet.innerHTML =
                resolved;


            return true;

        }


        if (
            typeof Node !==
                "undefined" &&
            resolved instanceof Node
        ) {

            outlet.replaceChildren(
                resolved
            );


            return true;

        }


        if (
            Array.isArray(
                resolved
            )
        ) {

            const fragment =
                document.createDocumentFragment();


            for (
                const item of
                resolved
            ) {

                if (
                    typeof item ===
                    "string"
                ) {

                    const wrapper =
                        document.createElement(
                            "div"
                        );


                    wrapper.innerHTML =
                        item;


                    while (
                        wrapper.firstChild
                    ) {

                        fragment.appendChild(
                            wrapper.firstChild
                        );

                    }

                }
                else if (
                    typeof Node !==
                        "undefined" &&
                    item instanceof Node
                ) {

                    fragment.appendChild(
                        item
                    );

                }

            }


            outlet.replaceChildren(
                fragment
            );


            return true;

        }


        return false;

    }


    /* =====================================================
       APP-MANAGER RENDER FALLBACK
       ===================================================== */

    async function renderThroughAppManager(
        route,
        context,
        outlet
    ) {

        const appId =
            route &&
            route.appId
                ? route.appId
                : null;


        if (
            !appId
        ) {

            return false;

        }


        let appManager =
            null;


        /*
         * Globales HalDo-System prüfen.
         */

        if (
            typeof window !==
                "undefined" &&
            window.HalDoOS
        ) {

            appManager =
                window.HalDoOS.appManager ||
                null;


            if (
                !appManager &&
                window.HalDoOS.system
            ) {

                const system =
                    window.HalDoOS.system;


                if (
                    isFunction(
                        system.getService
                    )
                ) {

                    appManager =
                        system.getService(
                            "app-manager"
                        ) ||
                        system.getService(
                            "appManager"
                        ) ||
                        null;

                }

            }

        }


        /*
         * Alternativer globaler Zugriff.
         */

        if (
            !appManager &&
            typeof window !==
                "undefined"
        ) {

            appManager =
                window.HalDoAppManager ||
                null;

        }


        if (
            !appManager
        ) {

            return false;

        }


        const methods =
            [

                "launch",

                "open",

                "activate",

                "render",

                "launchApp",

                "openApp"

            ];


        for (
            const method of
            methods
        ) {

            if (
                !isFunction(
                    appManager[
                        method
                    ]
                )
            ) {

                continue;

            }


            try {

                const result =
                    await appManager[
                        method
                    ](
                        appId,
                        {

                            route:
                                cloneData(
                                    route
                                ),

                            context,

                            outlet,

                            router:
                                api

                        }
                    );


                if (
                    result !==
                    false
                ) {

                    return true;

                }

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {

                        phase:
                            "app-manager-render",

                        appId,

                        route:
                            route.id

                    }
                );

            }

        }


        return false;

    }


    /* =====================================================
       FALLBACK ROUTE RENDERN
       ===================================================== */

    function renderFallbackRoute(
        route,
        outlet,
        context
    ) {

        if (
            !outlet
        ) {

            return false;

        }


        const title =
            route.title ||
            route.name ||
            route.appId ||
            context.to.path;


        const container =
            document.createElement(
                "section"
            );


        container.className =
            "haldo-route-view";


        container.dataset.routeId =
            String(
                route.id ||
                ""
            );


        container.dataset.path =
            context.to.path;


        const heading =
            document.createElement(
                "h1"
            );


        heading.textContent =
            String(
                title
            );


        container.appendChild(
            heading
        );


        outlet.replaceChildren(
            container
        );


        return true;

    }


    /* =====================================================
       NOT-FOUND ROUTE
       ===================================================== */

    async function handleNotFound(
        context
    ) {

        emit(
            "route-not-found",
            {

                navigationId:
                    context.id,

                path:
                    context.to.path

            }
        );


        const notFoundRoute =
            resolveNotFoundRoute();


        if (
            notFoundRoute &&
            context.redirectCount <
                MAX_REDIRECTS
        ) {

            return executeRedirect(
                context,
                {

                    target:
                        notFoundRoute,

                    replace:
                        true,

                    reason:
                        "route-not-found"

                }
            );

        }


        const outlet =
            resolveRouteOutlet(
                null,
                context
            );


        if (
            outlet
        ) {

            renderNotFoundView(
                outlet,
                context
            );

        }


        return createNavigationResult(
            context,
            false,
            "route-not-found"
        );

    }


    /* =====================================================
       NOT-FOUND ROUTE AUFLÖSEN
       ===================================================== */

    function resolveNotFoundRoute() {

        const candidates =
            [

                state.notFoundRoute,

                "/404",

                "/not-found"

            ];


        for (
            const candidate of
            candidates
        ) {

            if (
                !candidate
            ) {

                continue;

            }


            const match =
                matchRoute(
                    candidate
                );


            if (
                match
            ) {

                return candidate;

            }

        }


        return null;

    }


    /* =====================================================
       NOT-FOUND VIEW
       ===================================================== */

    function renderNotFoundView(
        outlet,
        context
    ) {

        if (
            !outlet
        ) {

            return false;

        }


        const container =
            document.createElement(
                "section"
            );


        container.className =
            "haldo-route-not-found";


        container.setAttribute(
            "role",
            "alert"
        );


        const title =
            document.createElement(
                "h1"
            );


        title.textContent =
            "Seite nicht gefunden";


        const message =
            document.createElement(
                "p"
            );


        message.textContent =
            "Die angeforderte HalDo AI OS Route wurde nicht gefunden.";


        const path =
            document.createElement(
                "code"
            );


        path.textContent =
            context.to.path;


        container.appendChild(
            title
        );


        container.appendChild(
            message
        );


        container.appendChild(
            path
        );


        outlet.replaceChildren(
            container
        );


        return true;

    }


    /* =====================================================
       NAVIGATION FEHLER BEHANDELN
       ===================================================== */

    async function handleNavigationError(
        context,
        error,
        reason
    ) {

        context.error =
            error;


        emit(
            "navigation-error",
            {

                navigationId:
                    context.id,

                path:
                    context.to.path,

                routeId:
                    context.route &&
                    context.route.id
                        ? context.route.id
                        : null,

                reason:
                    reason ||
                    "navigation-error",

                error

            }
        );


        /*
         * Fehler-Handler der Route.
         */

        if (
            context.route &&
            isFunction(
                context.route.onError
            )
        ) {

            try {

                const result =
                    await context.route.onError(
                        error,
                        context,
                        api
                    );


                if (
                    result ===
                    true
                ) {

                    return createNavigationResult(
                        context,
                        true,
                        "handled-navigation-error"
                    );

                }

            }
            catch (
                handlerError
            ) {

                handleError(
                    handlerError,
                    {

                        phase:
                            "route-error-handler",

                        route:
                            context.route.id

                    }
                );

            }

        }


        /*
         * Globaler Router-Error-Handler.
         */

        if (
            isFunction(
                state.errorHandler
            )
        ) {

            try {

                const result =
                    await state.errorHandler(
                        error,
                        context,
                        api
                    );


                if (
                    result ===
                    true
                ) {

                    return createNavigationResult(
                        context,
                        true,
                        "handled-navigation-error"
                    );

                }

            }
            catch (
                handlerError
            ) {

                handleError(
                    handlerError,
                    {

                        phase:
                            "global-navigation-error-handler"

                    }
                );

            }

        }


        return createNavigationResult(
            context,
            false,
            reason ||
                "navigation-error",
            error
        );

    }


    /* =====================================================
       REDIRECT AUSFÜHREN
       ===================================================== */

    async function executeRedirect(
        context,
        redirect
    ) {

        if (
            context.redirectCount >=
            MAX_REDIRECTS
        ) {

            return createNavigationResult(
                context,
                false,
                "maximum-redirects"
            );

        }


        let target =
            redirect;


        let options =
            {};


        if (
            isObject(
                redirect
            )
        ) {

            target =
                redirect.target ||
                redirect.path ||
                redirect.to;


            options =
                {
                    ...redirect
                };

        }


        if (
            !target
        ) {

            return createNavigationResult(
                context,
                false,
                "invalid-redirect"
            );

        }


        emit(
            "navigation-redirect",
            {

                navigationId:
                    context.id,

                from:
                    context.to.path,

                to:
                    target,

                redirectCount:
                    context.redirectCount +
                    1

            }
        );


        return navigate(
            target,
            {

                ...context.options,

                ...options,

                source:
                    "redirect",

                redirected:
                    true,

                redirectCount:
                    context.redirectCount +
                    1,

                replace:
                    options.replace !==
                        undefined
                        ? options.replace
                        : true

            }
        );

    }


    /* =====================================================
       REDIRECT REGISTRIEREN
       ===================================================== */

    function setNotFoundRoute(
        route
    ) {

        if (
            route ===
            null ||
            route ===
            undefined
        ) {

            state.notFoundRoute =
                null;

            emit(
                "not-found-route-changed",
                {
                    route:
                        null
                }
            );


            return true;

        }


        state.notFoundRoute =
            normalizePath(
                String(
                    route
                )
            );


        emit(
            "not-found-route-changed",
            {

                route:
                    state.notFoundRoute

            }
        );


        return true;

    }


    /* =====================================================
       GLOBALEN ERROR HANDLER SETZEN
       ===================================================== */

    function setErrorHandler(
        handler
    ) {

        if (
            handler !==
                null &&
            !isFunction(
                handler
            )
        ) {

            return false;

        }


        state.errorHandler =
            handler ||
            null;


        emit(
            "error-handler-changed",
            {

                enabled:
                    Boolean(
                        state.errorHandler
                    )

            }
        );


        return true;

    }


    /* =====================================================
       RENDER-API
       ===================================================== */

    api.renderRoute =
        renderRoute;

    api.resolveRouteOutlet =
        resolveRouteOutlet;

    api.renderRouteTemplate =
        renderRouteTemplate;

    api.renderRouteElement =
        renderRouteElement;

    api.renderThroughAppManager =
        renderThroughAppManager;

    api.handleNotFound =
        handleNotFound;

    api.setNotFoundRoute =
        setNotFoundRoute;

    api.setErrorHandler =
        setErrorHandler;

    api.handleNavigationError =
        handleNavigationError;

    api.executeRedirect =
        executeRedirect;


/* =========================================================
   ENDE TEIL 13 / 16
   ========================================================= */
   /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 14 / 16
   ========================================================= */

    /* =====================================================
       NAVIGATION QUEUE
       ===================================================== */

    function enqueueNavigation(
        context
    ) {

        return new Promise(
            resolve => {

                state.navigationQueue.push(
                    {

                        context,

                        resolve,

                        queuedAt:
                            Date.now()

                    }
                );


                emit(
                    "navigation-queued",
                    {

                        navigationId:
                            context.id,

                        path:
                            context.to.path,

                        queueLength:
                            state.navigationQueue.length

                    }
                );

            }
        );

    }


    /* =====================================================
       QUEUE VERARBEITEN
       ===================================================== */

    async function processNavigationQueue() {

        if (
            state.navigating
        ) {

            return;

        }


        if (
            state.processingQueue
        ) {

            return;

        }


        state.processingQueue =
            true;


        try {

            while (
                state.navigationQueue.length &&
                !state.navigating
            ) {

                const entry =
                    state.navigationQueue.shift();


                if (
                    !entry
                ) {

                    continue;

                }


                const context =
                    entry.context;


                if (
                    !context
                ) {

                    entry.resolve(
                        createNavigationResult(
                            null,
                            false,
                            "invalid-queued-navigation"
                        )
                    );


                    continue;

                }


                /*
                 * Queue-Kontext erneut ausführen.
                 */

                state.navigating =
                    true;


                state.activeNavigation =
                    context;


                state.navigationStartedAt =
                    Date.now();


                let result;


                try {

                    result =
                        await executeNavigation(
                            context
                        );

                }
                catch (
                    error
                ) {

                    context.error =
                        error;


                    result =
                        createNavigationResult(
                            context,
                            false,
                            "queued-navigation-error",
                            error
                        );


                    handleError(
                        error,
                        {

                            phase:
                                "queued-navigation",

                            navigationId:
                                context.id

                        }
                    );

                }
                finally {

                    state.navigating =
                        false;


                    state.activeNavigation =
                        null;


                    state.navigationStartedAt =
                        null;

                }


                entry.resolve(
                    result
                );


                emit(
                    "queued-navigation-complete",
                    {

                        navigationId:
                            context.id,

                        success:
                            Boolean(
                                result &&
                                result.success
                            ),

                        path:
                            context.to.path

                    }
                );

            }

        }
        finally {

            state.processingQueue =
                false;

        }

    }


    /* =====================================================
       AKTIVE NAVIGATION ABBRECHEN
       ===================================================== */

    function cancelActiveNavigation(
        reason
    ) {

        const active =
            state.activeNavigation;


        if (
            !active
        ) {

            return false;

        }


        active.cancelled =
            true;


        active.cancelReason =
            reason ||
            "cancelled";


        if (
            active.abortController &&
            isFunction(
                active.abortController.abort
            )
        ) {

            try {

                active.abortController.abort();

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {

                        phase:
                            "navigation-abort",

                        navigationId:
                            active.id

                    }
                );

            }

        }


        emit(
            "navigation-cancelled",
            {

                navigationId:
                    active.id,

                path:
                    active.to.path,

                reason:
                    active.cancelReason

            }
        );


        return true;

    }


    /* =====================================================
       NAVIGATION CANCEL TOKEN
       ===================================================== */

    function createAbortController(
        context
    ) {

        if (
            typeof AbortController ===
            "undefined"
        ) {

            return null;

        }


        const controller =
            new AbortController();


        context.abortController =
            controller;


        return controller;

    }


    /* =====================================================
       NAVIGATION CANCEL PRÜFEN
       ===================================================== */

    function assertNavigationActive(
        context
    ) {

        if (
            !context
        ) {

            throw new Error(
                "HalDoAppRouter: Ungültiger Navigation-Kontext."
            );

        }


        if (
            context.cancelled
        ) {

            const error =
                new Error(
                    "HalDoAppRouter: Navigation wurde abgebrochen."
                );


            error.code =
                "HALDO_NAVIGATION_CANCELLED";


            error.reason =
                context.cancelReason ||
                "cancelled";


            throw error;

        }


        if (
            state.activeNavigation &&
            state.activeNavigation !==
                context
        ) {

            const error =
                new Error(
                    "HalDoAppRouter: Navigation wurde durch eine andere Navigation ersetzt."
                );


            error.code =
                "HALDO_NAVIGATION_SUPERSEDED";


            throw error;

        }


        return true;

    }


    /* =====================================================
       NAVIGATION HISTORY
       ===================================================== */

    function initializeHistory() {

        if (
            state.historyInitialized
        ) {

            return true;

        }


        state.historyInitialized =
            true;


        if (
            typeof window ===
                "undefined" ||
            !window.history
        ) {

            return false;

        }


        const locationData =
            getLocationData();


        const initialEntry =
            {

                __haldoRouter:
                    true,

                routerVersion:
                    ROUTER_VERSION,

                path:
                    locationData.path,

                query:
                    cloneData(
                        locationData.query
                    ),

                hash:
                    locationData.hash,

                timestamp:
                    Date.now(),

                navigationId:
                    0

            };


        try {

            window.history.replaceState(
                initialEntry,
                "",
                window.location.href
            );


            state.historyIndex =
                0;


            state.historyEntries =
                [

                    cloneData(
                        initialEntry
                    )

                ];


            return true;

        }
        catch (
            error
        ) {

            handleError(
                error,
                {

                    phase:
                        "history-initialize"

                }
            );


            return false;

        }

    }


    /* =====================================================
       HISTORY ENTRY ERSTELLEN
       ===================================================== */

    function createHistoryEntry(
        path,
        params,
        query,
        hash,
        route,
        options
    ) {

        const normalizedPath =
            normalizePath(
                path
            );


        const normalizedQuery =
            normalizeQuery(
                query
            );


        const normalizedHash =
            normalizeHash(
                hash
            );


        return {

            __haldoRouter:
                true,

            routerVersion:
                ROUTER_VERSION,

            navigationId:
                state.navigationId,

            path:
                normalizedPath,

            params:
                cloneData(
                    params ||
                    {}
                ),

            query:
                cloneData(
                    normalizedQuery
                ),

            hash:
                normalizedHash,

            routeId:
                route &&
                route.id
                    ? route.id
                    : null,

            appId:
                route &&
                route.appId
                    ? route.appId
                    : null,

            source:
                options &&
                options.source
                    ? options.source
                    : "programmatic",

            timestamp:
                Date.now()

        };

    }


    /* =====================================================
       HISTORY ENTRY SPEICHERN
       ===================================================== */

    function pushHistoryEntry(
        entry,
        replace
    ) {

        if (
            !entry
        ) {

            return false;

        }


        const item =
            cloneData(
                entry
            );


        if (
            replace
        ) {

            if (
                state.historyIndex >=
                0 &&
                state.historyEntries[
                    state.historyIndex
                ]
            ) {

                state.historyEntries[
                    state.historyIndex
                ] =
                    item;

            }
            else {

                state.historyEntries =
                    [

                        item

                    ];


                state.historyIndex =
                    0;

            }

        }
        else {

            /*
             * Vorhandene Forward-History
             * entfernen.
             */

            if (
                state.historyIndex <
                state.historyEntries.length -
                1
            ) {

                state.historyEntries =
                    state.historyEntries.slice(
                        0,
                        state.historyIndex +
                        1
                    );

            }


            state.historyEntries.push(
                item
            );


            state.historyIndex =
                state.historyEntries.length -
                1;

        }


        emit(
            "history-updated",
            {

                index:
                    state.historyIndex,

                length:
                    state.historyEntries.length,

                entry:
                    cloneData(
                        item
                    )

            }
        );


        return true;

    }


    /* =====================================================
       BROWSER HISTORY AKTUALISIEREN
       ===================================================== */

    function pushBrowserState(
        entry,
        replace
    ) {

        if (
            typeof window ===
                "undefined" ||
            !window.history ||
            !entry
        ) {

            return false;

        }


        const url =
            buildBrowserURL(
                entry
            );


        try {

            if (
                replace
            ) {

                window.history.replaceState(
                    entry,
                    "",
                    url
                );

            }
            else {

                window.history.pushState(
                    entry,
                    "",
                    url
                );

            }


            return true;

        }
        catch (
            error
        ) {

            handleError(
                error,
                {

                    phase:
                        "browser-history-update",

                    path:
                        entry.path

                }
            );


            return false;

        }

    }


    /* =====================================================
       BROWSER URL ERSTELLEN
       ===================================================== */

    function buildBrowserURL(
        entry
    ) {

        if (
            !entry
        ) {

            return null;

        }


        const path =
            normalizePath(
                entry.path
            );


        const query =
            stringifyQuery(
                entry.query
            );


        const hash =
            normalizeHash(
                entry.hash
            );


        if (
            state.mode ===
            ROUTER_MODE_HASH
        ) {

            const routePart =
                path ===
                    DEFAULT_ROUTE
                    ? "/"
                    : path;


            return (
                window.location.pathname +
                window.location.search +
                "#" +
                routePart +
                query +
                hash
            );

        }


        return (
            path +
            query +
            hash
        );

    }


    /* =====================================================
       HISTORY STATUS
       ===================================================== */

    function getHistoryStatus() {

        return {

            initialized:
                Boolean(
                    state.historyInitialized
                ),

            index:
                state.historyIndex,

            length:
                state.historyEntries.length,

            canGoBack:
                state.historyIndex >
                0,

            canGoForward:
                state.historyIndex >=
                    0 &&
                state.historyIndex <
                    state.historyEntries.length -
                    1,

            entries:
                state.historyEntries.map(
                    entry =>
                        cloneData(
                            entry
                        )
                )

        };

    }


    /* =====================================================
       HISTORY BACK
       ===================================================== */

    function back(
        steps
    ) {

        const amount =
            Number.isInteger(
                steps
            )
                ? Math.max(
                    1,
                    Math.abs(
                        steps
                    )
                )
                : 1;


        if (
            typeof window !==
                "undefined" &&
            window.history &&
            isFunction(
                window.history.go
            )
        ) {

            window.history.go(
                -amount
            );


            return true;

        }


        return false;

    }


    /* =====================================================
       HISTORY FORWARD
       ===================================================== */

    function forward(
        steps
    ) {

        const amount =
            Number.isInteger(
                steps
            )
                ? Math.max(
                    1,
                    Math.abs(
                        steps
                    )
                )
                : 1;


        if (
            typeof window !==
                "undefined" &&
            window.history &&
            isFunction(
                window.history.go
            )
        ) {

            window.history.go(
                amount
            );


            return true;

        }


        return false;

    }


    /* =====================================================
       HISTORY ZUR POSITION
       ===================================================== */

    function go(
        steps
    ) {

        const amount =
            Number.isInteger(
                steps
            )
                ? steps
                : 0;


        if (
            !amount
        ) {

            return true;

        }


        if (
            typeof window !==
                "undefined" &&
            window.history &&
            isFunction(
                window.history.go
            )
        ) {

            window.history.go(
                amount
            );


            return true;

        }


        return false;

    }


    /* =====================================================
       HISTORY LEEREN
       ===================================================== */

    function clearNavigationQueue(
        reason
    ) {

        const queue =
            state.navigationQueue.splice(
                0
            );


        for (
            const entry of
            queue
        ) {

            if (
                entry &&
                isFunction(
                    entry.resolve
                )
            ) {

                entry.resolve(
                    createNavigationResult(
                        entry.context,
                        false,
                        reason ||
                            "navigation-queue-cleared"
                    )
                );

            }

        }


        emit(
            "navigation-queue-cleared",
            {

                count:
                    queue.length,

                reason:
                    reason ||
                    "navigation-queue-cleared"

            }
        );


        return queue.length;

    }


    /* =====================================================
       QUEUE / HISTORY API
       ===================================================== */

    api.enqueueNavigation =
        enqueueNavigation;

    api.processNavigationQueue =
        processNavigationQueue;

    api.clearNavigationQueue =
        clearNavigationQueue;

    api.cancelActiveNavigation =
        cancelActiveNavigation;

    api.createAbortController =
        createAbortController;

    api.assertNavigationActive =
        assertNavigationActive;

    api.initializeHistory =
        initializeHistory;

    api.createHistoryEntry =
        createHistoryEntry;

    api.pushHistoryEntry =
        pushHistoryEntry;

    api.pushBrowserState =
        pushBrowserState;

    api.buildBrowserURL =
        buildBrowserURL;

    api.getHistoryStatus =
        getHistoryStatus;

    api.back =
        back;

    api.forward =
        forward;

    api.go =
        go;


/* =========================================================
   ENDE TEIL 14 / 16
   ========================================================= */
   /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 15 / 16
   ========================================================= */

    /* =====================================================
       ROUTE TRANSITIONS
       ===================================================== */

    async function runRouteTransition(
        context,
        phase
    ) {

        if (
            !context ||
            !context.route
        ) {

            return true;

        }


        const route =
            context.route;


        const transition =
            resolveTransition(
                route,
                context
            );


        if (
            !transition
        ) {

            return true;

        }


        emit(
            "transition-start",
            {

                navigationId:
                    context.id,

                routeId:
                    route.id,

                phase,

                transition:
                    getTransitionName(
                        transition
                    )

            }
        );


        try {

            let result =
                true;


            if (
                isFunction(
                    transition
                )
            ) {

                result =
                    await transition(
                        context,
                        phase,
                        api
                    );

            }
            else if (
                phase ===
                    "enter" &&
                isFunction(
                    transition.enter
                )
            ) {

                result =
                    await transition.enter(
                        context,
                        api
                    );

            }
            else if (
                phase ===
                    "leave" &&
                isFunction(
                    transition.leave
                )
            ) {

                result =
                    await transition.leave(
                        context,
                        api
                    );

            }


            emit(
                "transition-complete",
                {

                    navigationId:
                        context.id,

                    routeId:
                        route.id,

                    phase,

                    success:
                        result !==
                        false

                }
            );


            return result !==
                false;

        }
        catch (
            error
        ) {

            handleError(
                error,
                {

                    phase:
                        "route-transition",

                    transition:
                        getTransitionName(
                            transition
                        ),

                    navigationId:
                        context.id,

                    routeId:
                        route.id

                }
            );


            emit(
                "transition-error",
                {

                    navigationId:
                        context.id,

                    routeId:
                        route.id,

                    phase,

                    error

                }
            );


            return false;

        }

    }


    /* =====================================================
       TRANSITION AUFLÖSEN
       ===================================================== */

    function resolveTransition(
        route,
        context
    ) {

        if (
            context &&
            context.options &&
            context.options.transition !==
                undefined
        ) {

            return context.options.transition;

        }


        if (
            route &&
            route.transition !==
                undefined
        ) {

            return route.transition;

        }


        if (
            state.transition !==
                undefined
        ) {

            return state.transition;

        }


        return null;

    }


    /* =====================================================
       TRANSITION NAME
       ===================================================== */

    function getTransitionName(
        transition
    ) {

        if (
            typeof transition ===
            "string"
        ) {

            return transition;

        }


        if (
            transition &&
            transition.name
        ) {

            return transition.name;

        }


        if (
            isFunction(
                transition
            ) &&
            transition.name
        ) {

            return transition.name;

        }


        return "custom";

    }


    /* =====================================================
       ROUTE MODUL LADEN
       ===================================================== */

    async function loadRoute(
        route,
        context
    ) {

        if (
            !route
        ) {

            return false;

        }


        assertNavigationActive(
            context
        );


        if (
            route.loaded
        ) {

            return true;

        }


        emit(
            "route-load-start",
            {

                navigationId:
                    context.id,

                routeId:
                    route.id,

                path:
                    context.to.path

            }
        );


        try {

            /*
             * Bereits registriertes Modul.
             */

            if (
                route.module
            ) {

                route.loaded =
                    true;


                route.loadedAt =
                    Date.now();


                return true;

            }


            /*
             * Lazy Loader.
             */

            if (
                isFunction(
                    route.load
                )
            ) {

                const module =
                    await route.load(
                        context,
                        api
                    );


                assertNavigationActive(
                    context
                );


                if (
                    module
                ) {

                    route.module =
                        module.default ||
                        module;

                }


                route.loaded =
                    true;


                route.loadedAt =
                    Date.now();


                emit(
                    "route-loaded",
                    {

                        navigationId:
                            context.id,

                        routeId:
                            route.id,

                        path:
                            context.to.path

                    }
                );


                return true;

            }


            /*
             * Dynamischer Import.
             */

            if (
                route.import
            ) {

                const module =
                    await dynamicImport(
                        route.import
                    );


                assertNavigationActive(
                    context
                );


                route.module =
                    module &&
                    module.default
                        ? module.default
                        : module;


                route.loaded =
                    true;


                route.loadedAt =
                    Date.now();


                emit(
                    "route-loaded",
                    {

                        navigationId:
                            context.id,

                        routeId:
                            route.id,

                        path:
                            context.to.path

                    }
                );


                return true;

            }


            /*
             * Inline Component.
             */

            if (
                route.component
            ) {

                route.module =
                    route.component;


                route.loaded =
                    true;


                route.loadedAt =
                    Date.now();


                return true;

            }


            /*
             * Route ohne Modul darf trotzdem
             * durch Template / Element / AppManager
             * gerendert werden.
             */

            route.loaded =
                true;


            route.loadedAt =
                Date.now();


            emit(
                "route-loaded",
                {

                    navigationId:
                        context.id,

                    routeId:
                        route.id,

                    path:
                        context.to.path,

                    mode:
                        "native-route"

                }
            );


            return true;

        }
        catch (
            error
        ) {

            route.loadError =
                error;


            emit(
                "route-load-error",
                {

                    navigationId:
                        context.id,

                    routeId:
                        route.id,

                    path:
                        context.to.path,

                    error

                }
            );


            throw error;

        }

    }


    /* =====================================================
       ROUTE MODUL AKTIVIEREN
       ===================================================== */

    async function activateRouteModule(
        route,
        context
    ) {

        if (
            !route
        ) {

            return false;

        }


        assertNavigationActive(
            context
        );


        const module =
            route.module;


        if (
            !module
        ) {

            return true;

        }


        if (
            isFunction(
                module.activate
            )
        ) {

            const result =
                await module.activate(
                    context,
                    api
                );


            if (
                result ===
                false
            ) {

                return false;

            }

        }


        if (
            isFunction(
                module.mount
            )
        ) {

            const outlet =
                resolveRouteOutlet(
                    route,
                    context
                );


            const result =
                await module.mount(
                    outlet,
                    context,
                    api
                );


            if (
                result ===
                false
            ) {

                return false;

            }

        }


        emit(
            "route-module-activated",
            {

                navigationId:
                    context.id,

                routeId:
                    route.id

            }
        );


        return true;

    }


    /* =====================================================
       ROUTE MODUL DEAKTIVIEREN
       ===================================================== */

    async function deactivateRouteModule(
        route,
        context
    ) {

        if (
            !route ||
            !route.module
        ) {

            return true;

        }


        const module =
            route.module;


        try {

            if (
                isFunction(
                    module.deactivate
                )
            ) {

                await module.deactivate(
                    context,
                    api
                );

            }


            if (
                isFunction(
                    module.unmount
                )
            ) {

                const outlet =
                    resolveRouteOutlet(
                        route,
                        context
                    );


                await module.unmount(
                    outlet,
                    context,
                    api
                );

            }


            emit(
                "route-module-deactivated",
                {

                    navigationId:
                        context.id,

                    routeId:
                        route.id

                }
            );


            return true;

        }
        catch (
            error
        ) {

            handleError(
                error,
                {

                    phase:
                        "route-module-deactivate",

                    routeId:
                        route.id

                }
            );


            return false;

        }

    }


    /* =====================================================
       ROUTE MODUL ZERSTÖREN
       ===================================================== */

    async function destroyRouteModule(
        route,
        context
    ) {

        if (
            !route ||
            !route.module
        ) {

            return true;

        }


        const module =
            route.module;


        if (
            isFunction(
                module.destroy
            )
        ) {

            try {

                await module.destroy(
                    context,
                    api
                );

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {

                        phase:
                            "route-module-destroy",

                        routeId:
                            route.id

                    }
                );

            }

        }


        if (
            context &&
            context.options &&
            context.options.unloadRoute
        ) {

            route.module =
                null;

            route.loaded =
                false;

        }


        emit(
            "route-module-destroyed",
            {

                navigationId:
                    context.id,

                routeId:
                    route.id

            }
        );


        return true;

    }


    /* =====================================================
       DYNAMIC IMPORT SICHER AUSFÜHREN
       ===================================================== */

    async function dynamicImport(
        modulePath
    ) {

        if (
            !modulePath
        ) {

            throw new Error(
                "HalDoAppRouter: Kein Modulpfad für dynamischen Import."
            );

        }


        /*
         * Browser-Modulauflösung.
         */

        const resolvedPath =
            String(
                modulePath
            );


        try {

            return await import(
                /* webpackIgnore: true */
                resolvedPath
            );

        }
        catch (
            error
        ) {

            /*
             * Einige Build-Systeme akzeptieren
             * keine webpackIgnore-Annotation.
             * Der Import selbst bleibt jedoch
             * vollständig standardkonform.
             */

            throw error;

        }

    }


    /* =====================================================
       TRANSITION / MODULE API
       ===================================================== */

    api.runRouteTransition =
        runRouteTransition;

    api.resolveTransition =
        resolveTransition;

    api.loadRoute =
        loadRoute;

    api.activateRouteModule =
        activateRouteModule;

    api.deactivateRouteModule =
        deactivateRouteModule;

    api.destroyRouteModule =
        destroyRouteModule;

    api.dynamicImport =
        dynamicImport;


/* =========================================================
   ENDE TEIL 15 / 16
   ========================================================= */
   /* =========================================================
   HalDo AI OS 20
   js/app-router.js
   TEIL 16 / 16 — LETZTER TEIL
   ========================================================= */

    /* =====================================================
       ROUTER STATUS
       ===================================================== */

    function getStatus() {

        return {

            name:
                ROUTER_NAME,

            version:
                ROUTER_VERSION,

            initialized:
                Boolean(
                    state.initialized
                ),

            ready:
                Boolean(
                    state.ready
                ),

            destroyed:
                Boolean(
                    state.destroyed
                ),

            mode:
                state.mode,

            navigating:
                Boolean(
                    state.navigating
                ),

            processingQueue:
                Boolean(
                    state.processingQueue
                ),

            currentPath:
                state.currentPath,

            previousPath:
                state.previousPath,

            currentApp:
                state.currentApp,

            routeCount:
                state.routes.length,

            guardCount:
                state.guards.length,

            middlewareCount:
                state.middleware.length,

            transitionCount:
                state.transitions.size,

            navigationCount:
                state.navigationCount,

            navigationId:
                state.navigationId,

            queueLength:
                state.navigationQueue.length,

            history:
                getHistoryStatus(),

            outlet:
                getTargetDescription(
                    state.outlet
                ),

            startedAt:
                state.startedAt,

            readyAt:
                state.readyAt

        };

    }


    /* =====================================================
       ROUTER SNAPSHOT
       ===================================================== */

    function getSnapshot() {

        return {

            status:
                getStatus(),

            currentRoute:
                state.currentRoute
                    ? cloneData(
                        state.currentRoute
                    )
                    : null,

            previousRoute:
                state.previousRoute
                    ? cloneData(
                        state.previousRoute
                    )
                    : null,

            currentParams:
                cloneData(
                    state.currentParams
                ),

            currentQuery:
                cloneData(
                    state.currentQuery
                ),

            currentHash:
                state.currentHash,

            routes:
                state.routes.map(
                    route =>
                        cloneData(
                            route
                        )
                ),

            guards:
                getGuards(),

            middleware:
                getMiddlewareList()

        };

    }


    /* =====================================================
       CURRENT ROUTE
       ===================================================== */

    function getCurrentRoute() {

        return state.currentRoute
            ? cloneData(
                state.currentRoute
            )
            : null;

    }


    /* =====================================================
       CURRENT LOCATION
       ===================================================== */

    function getCurrentLocation() {

        return {

            path:
                state.currentPath ||
                DEFAULT_ROUTE,

            params:
                cloneData(
                    state.currentParams
                ),

            query:
                cloneData(
                    state.currentQuery
                ),

            hash:
                state.currentHash ||
                "",

            appId:
                state.currentApp ||
                null,

            route:
                state.currentRoute
                    ? cloneData(
                        state.currentRoute
                    )
                    : null

        };

    }


    /* =====================================================
       OUTLET SETZEN
       ===================================================== */

    function setOutlet(
        target
    ) {

        const outlet =
            resolveTarget(
                target
            );


        if (
            !outlet
        ) {

            return false;

        }


        state.outlet =
            outlet;


        emit(
            "outlet-changed",
            {

                outlet:
                    getTargetDescription(
                        outlet
                    )

            }
        );


        return true;

    }


    /* =====================================================
       MODE SETZEN
       ===================================================== */

    function setMode(
        mode
    ) {

        const normalized =
            normalizeRouterMode(
                mode
            );


        if (
            !normalized
        ) {

            return false;

        }


        const previous =
            state.mode;


        state.mode =
            normalized;


        emit(
            "mode-changed",
            {

                previous,

                current:
                    normalized

            }
        );


        return true;

    }


    /* =====================================================
       ROUTER READY
       ===================================================== */

    function markReady() {

        if (
            state.ready
        ) {

            return true;

        }


        state.ready =
            true;


        state.readyAt =
            Date.now();


        emit(
            "ready",
            getStatus()
        );


        /*
         * Globales HalDo-System informieren.
         */

        if (
            typeof window !==
                "undefined"
        ) {

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        "haldo:router-ready",
                        {

                            detail:
                                getStatus()

                        }
                    )
                );

            }
            catch (
                error
            ) {

                /*
                 * Ältere Browser ohne
                 * CustomEvent-Konstruktor.
                 */

                try {

                    const event =
                        document.createEvent(
                            "CustomEvent"
                        );


                    event.initCustomEvent(
                        "haldo:router-ready",
                        false,
                        false,
                        getStatus()
                    );


                    window.dispatchEvent(
                        event
                    );

                }
                catch (
                    dispatchError
                ) {

                    handleError(
                        dispatchError,
                        {

                            phase:
                                "router-ready-event"

                        }
                    );

                }

            }

        }


        return true;

    }


    /* =====================================================
       ROUTER INITIALISIEREN
       ===================================================== */

    async function initialize(
        options
    ) {

        if (
            state.destroyed
        ) {

            throw new Error(
                "HalDoAppRouter: Router wurde bereits zerstört."
            );

        }


        if (
            state.initialized
        ) {

            return getStatus();

        }


        const config =
            isObject(
                options
            )
                ? options
                : {};


        state.startedAt =
            Date.now();


        /*
         * Konfiguration übernehmen.
         */

        if (
            config.mode
        ) {

            setMode(
                config.mode
            );

        }


        if (
            config.outlet
        ) {

            setOutlet(
                config.outlet
            );

        }


        if (
            config.notFound
        ) {

            setNotFoundRoute(
                config.notFound
            );

        }


        if (
            isFunction(
                config.errorHandler
            )
        ) {

            setErrorHandler(
                config.errorHandler
            );

        }


        /*
         * History vorbereiten.
         */

        if (
            config.history !==
            false
        ) {

            initializeHistory();

        }


        /*
         * Browser Events anbinden.
         */

        bindBrowserEvents();


        /*
         * Initiale Route bestimmen.
         */

        const initialLocation =
            getLocationData();


        state.initialized =
            true;


        emit(
            "initialized",
            {

                location:
                    cloneData(
                        initialLocation
                    ),

                status:
                    getStatus()

            }
        );


        /*
         * Initialnavigation.
         */

        if (
            config.initialNavigation !==
            false
        ) {

            try {

                await navigate(
                    initialLocation.path +
                    stringifyQuery(
                        initialLocation.query
                    ) +
                    (
                        initialLocation.hash ||
                        ""
                    ),
                    {

                        source:
                            "initialization",

                        replace:
                            true,

                        history:
                            false,

                        allowSameRoute:
                            true

                    }
                );

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {

                        phase:
                            "initial-navigation"

                    }
                );

            }

        }


        markReady();


        return getStatus();

    }


    /* =====================================================
       BROWSER EVENTS
       ===================================================== */

    function bindBrowserEvents() {

        if (
            state.browserEventsBound
        ) {

            return true;

        }


        if (
            typeof window ===
                "undefined"
        ) {

            return false;

        }


        const popStateHandler =
            event => {

                handlePopState(
                    event
                );

            };


        const hashChangeHandler =
            event => {

                handleHashChange(
                    event
                );

            };


        state.browserHandlers =
            {

                popStateHandler,

                hashChangeHandler

            };


        window.addEventListener(
            "popstate",
            popStateHandler
        );


        window.addEventListener(
            "hashchange",
            hashChangeHandler
        );


        state.browserEventsBound =
            true;


        emit(
            "browser-events-bound",
            {}

        );


        return true;

    }


    /* =====================================================
       BROWSER EVENTS ENTFERNEN
       ===================================================== */

    function unbindBrowserEvents() {

        if (
            !state.browserEventsBound
        ) {

            return true;

        }


        if (
            typeof window ===
                "undefined"
        ) {

            return false;

        }


        const handlers =
            state.browserHandlers;


        if (
            handlers &&
            handlers.popStateHandler
        ) {

            window.removeEventListener(
                "popstate",
                handlers.popStateHandler
            );

        }


        if (
            handlers &&
            handlers.hashChangeHandler
        ) {

            window.removeEventListener(
                "hashchange",
                handlers.hashChangeHandler
            );

        }


        state.browserHandlers =
            null;


        state.browserEventsBound =
            false;


        emit(
            "browser-events-unbound",
            {}

        );


        return true;

    }


    /* =====================================================
       POPSTATE
       ===================================================== */

    function handlePopState(
        event
    ) {

        const locationData =
            getLocationData();


        const entry =
            event &&
            event.state &&
            event.state.__haldoRouter
                ? event.state
                : null;


        if (
            entry
        ) {

            state.historyIndex =
                findHistoryIndex(
                    entry
                );

        }


        emit(
            "popstate",
            {

                event,

                entry:
                    entry
                        ? cloneData(
                            entry
                        )
                        : null,

                location:
                    cloneData(
                        locationData
                    )

            }
        );


        navigate(
            locationData.path +
            stringifyQuery(
                locationData.query
            ) +
            locationData.hash,
            {

                source:
                    "popstate",

                fromPopState:
                    true,

                history:
                    false,

                allowSameRoute:
                    true

            }
        );


    }


    /* =====================================================
       HASH CHANGE
       ===================================================== */

    function handleHashChange(
        event
    ) {

        if (
            state.mode !==
            ROUTER_MODE_HASH
        ) {

            return;

        }


        const locationData =
            getLocationData();


        emit(
            "hashchange",
            {

                event,

                location:
                    cloneData(
                        locationData
                    )

            }
        );


        navigate(
            locationData.path +
            stringifyQuery(
                locationData.query
            ) +
            locationData.hash,
            {

                source:
                    "hashchange",

                fromHashChange:
                    true,

                history:
                    false,

                allowSameRoute:
                    true

            }
        );

    }


    /* =====================================================
       HISTORY INDEX FINDEN
       ===================================================== */

    function findHistoryIndex(
        entry
    ) {

        if (
            !entry
        ) {

            return -1;

        }


        return state.historyEntries.findIndex(
            item =>
                item &&
                entry.navigationId !==
                    undefined &&
                item.navigationId ===
                    entry.navigationId
        );

    }


    /* =====================================================
       DESTROY
       ===================================================== */

    async function destroy() {

        if (
            state.destroyed
        ) {

            return true;

        }


        clearNavigationQueue(
            "router-destroyed"
        );


        cancelActiveNavigation(
            "router-destroyed"
        );


        unbindBrowserEvents();


        if (
            state.currentRoute
        ) {

            const context = {

                id:
                    ++state.navigationId,

                route:
                    state.currentRoute,

                options:
                    {

                        reason:
                            "router-destroyed"

                    }

            };


            try {

                await deactivateRouteModule(
                    state.currentRoute,
                    context
                );


                await destroyRouteModule(
                    state.currentRoute,
                    context
                );

            }
            catch (
                error
            ) {

                handleError(
                    error,
                    {

                        phase:
                            "router-destroy"

                    }
                );

            }

        }


        state.routes.length =
            0;


        state.guards.length =
            0;


        state.middleware.length =
            0;


        state.transitions.clear();


        state.currentRoute =
            null;


        state.previousRoute =
            null;


        state.currentPath =
            null;


        state.previousPath =
            null;


        state.currentParams =
            {};


        state.currentQuery =
            {};


        state.currentHash =
            "";


        state.currentApp =
            null;


        state.outlet =
            null;


        state.initialized =
            false;


        state.ready =
            false;


        state.destroyed =
            true;


        emit(
            "destroyed",
            {

                timestamp:
                    Date.now()

            }
        );


        /*
         * Globale HalDo-Referenz sauber entfernen,
         * ohne andere Systemkomponenten zu beschädigen.
         */

        if (
            typeof window !==
                "undefined" &&
            window.HalDoOS &&
            window.HalDoOS.appRouter ===
                api
        ) {

            try {

                delete window.HalDoOS.appRouter;

            }
            catch (
                error
            ) {

                window.HalDoOS.appRouter =
                    null;

            }

        }


        return true;

    }


    /* =====================================================
       API — NAVIGATION
       ===================================================== */

    api.navigate =
        navigate;

    api.goTo =
        navigate;

    api.push =
        navigate;


    /* =====================================================
       API — STATUS
       ===================================================== */

    api.getStatus =
        getStatus;

    api.getSnapshot =
        getSnapshot;

    api.getCurrentRoute =
        getCurrentRoute;

    api.getCurrentLocation =
        getCurrentLocation;


    /* =====================================================
       API — ROUTER CONTROL
       ===================================================== */

    api.initialize =
        initialize;

    api.init =
        initialize;

    api.markReady =
        markReady;

    api.destroy =
        destroy;

    api.setOutlet =
        setOutlet;

    api.setMode =
        setMode;


    /* =====================================================
       API — BROWSER EVENTS
       ===================================================== */

    api.bindBrowserEvents =
        bindBrowserEvents;

    api.unbindBrowserEvents =
        unbindBrowserEvents;

    api.handlePopState =
        handlePopState;

    api.handleHashChange =
        handleHashChange;


    /* =====================================================
       GLOBALE HALDOOS VERBINDUNG
       ===================================================== */

    function exposeRouterGlobally() {

        if (
            typeof window ===
                "undefined"
        ) {

            return false;

        }


        try {

            window.HalDoAppRouter =
                api;


            window.HalDoRouter =
                api;


            if (
                !window.HalDoOS
            ) {

                window.HalDoOS =
                    {};

            }


            window.HalDoOS.appRouter =
                api;


            window.HalDoOS.router =
                api;


            return true;

        }
        catch (
            error
        ) {

            handleError(
                error,
                {

                    phase:
                        "router-global-expose"

                }
            );


            return false;

        }

    }


    /* =====================================================
       SYSTEM / KERNEL REGISTRIERUNG
       ===================================================== */

    function registerWithHalDoSystem() {

        if (
            typeof window ===
                "undefined"
        ) {

            return false;

        }


        const system =
            window.HalDoSystem ||
            (
                window.HalDoOS &&
                window.HalDoOS.system
            );


        if (
            !system
        ) {

            return false;

        }


        try {

            if (
                isFunction(
                    system.registerService
                )
            ) {

                system.registerService(
                    "app-router",
                    api
                );

            }


            if (
                isFunction(
                    system.register
                )
            ) {

                system.register(
                    "app-router",
                    api
                );

            }


            if (
                isFunction(
                    system.emit
                )
            ) {

                system.emit(
                    "router:ready",
                    {

                        router:
                            api,

                        version:
                            ROUTER_VERSION

                    }
                );

            }


            return true;

        }
        catch (
            error
        ) {

            handleError(
                error,
                {

                    phase:
                        "system-registration"

                }
            );


            return false;

        }

    }


    /* =====================================================
       KERNEL REGISTRIERUNG
       ===================================================== */

    function registerWithKernel() {

        if (
            typeof window ===
                "undefined"
        ) {

            return false;

        }


        const kernel =
            window.HalDoKernel ||
            (
                window.HalDoOS &&
                window.HalDoOS.kernel
            );


        if (
            !kernel
        ) {

            return false;

        }


        try {

            if (
                isFunction(
                    kernel.registerService
                )
            ) {

                kernel.registerService(
                    "app-router",
                    api
                );

            }


            if (
                isFunction(
                    kernel.register
                )
            ) {

                kernel.register(
                    "app-router",
                    api
                );

            }


            return true;

        }
        catch (
            error
        ) {

            handleError(
                error,
                {

                    phase:
                        "kernel-registration"

                }
            );


            return false;

        }

    }


    /* =====================================================
       AUTO INITIALISIERUNG
       ===================================================== */

    function autoInitialize() {

        if (
            state.autoInitializeStarted
        ) {

            return;

        }


        state.autoInitializeStarted =
            true;


        const start =
            () => {

                exposeRouterGlobally();

                registerWithHalDoSystem();

                registerWithKernel();


                /*
                 * Initialisierung bewusst nur dann
                 * automatisch ausführen, wenn kein
                 * übergeordnetes Boot-System die
                 * Kontrolle übernehmen möchte.
                 */

                if (
                    typeof window !==
                        "undefined" &&
                    window.HalDoOS &&
                    window.HalDoOS.config &&
                    window.HalDoOS.config.manualRouterInit
                ) {

                    return;

                }


                initialize(
                    {

                        initialNavigation:
                            true

                    }
                ).catch(
                    error => {

                        handleError(
                            error,
                            {

                                phase:
                                    "auto-initialize"

                            }
                        );

                    }
                );

            };


        if (
            typeof document ===
                "undefined"
        ) {

            start();

            return;

        }


        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                start,
                {
                    once:
                        true
                }
            );

        }
        else {

            start();

        }

    }


    /* =====================================================
       FINALER API-STATUS
       ===================================================== */

    api.version =
        ROUTER_VERSION;

    api.name =
        ROUTER_NAME;

    api.router =
        api;

    api.state =
        state;


    /* =====================================================
       GLOBALE API FINAL VERÖFFENTLICHEN
       ===================================================== */

    exposeRouterGlobally();


    /* =====================================================
       KERNEL / SYSTEM VERBINDUNG VORBEREITEN
       ===================================================== */

    registerWithHalDoSystem();

    registerWithKernel();


    /* =====================================================
       AUTOMATISCHEN START VORBEREITEN
       ===================================================== */

    autoInitialize();


    /* =====================================================
       GLOBALER EXPORT
       ===================================================== */

    if (
        typeof globalThis !==
            "undefined"
    ) {

        try {

            globalThis.HalDoAppRouter =
                api;

        }
        catch (
            error
        ) {

            /*
             * Globaler Export ist optional.
             */

        }

    }


    /* =====================================================
       MODULE EXPORT
       ===================================================== */

    if (
        typeof module !==
            "undefined" &&
        module.exports
    ) {

        module.exports =
            api;

    }


    if (
        typeof exports !==
            "undefined"
    ) {

        try {

            exports.HalDoAppRouter =
                api;

        }
        catch (
            error
        ) {

            /*
             * Browser-Runtime ignoriert diesen
             * Pfad, falls exports nicht beschreibbar ist.
             */

        }

    }


    /* =====================================================
       FINALER START-EVENT
       ===================================================== */

    emit(
        "router-created",
        {

            name:
                ROUTER_NAME,

            version:
                ROUTER_VERSION,

            timestamp:
                Date.now()

        }
    );


/* =========================================================
   ENDE TEIL 16 / 16
   js/app-router.js — LETZTER TEIL
   ========================================================= */
