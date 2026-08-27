/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 1 / 16
   ============================================================ */


/* ============================================================
   1 — HALDO ROUTER EXTENSION STATE
   ============================================================ */

const __HALDO_ROUTER_EXTENSION_STATE__ = {

    initialized:
        false,

    ready:
        false,

    navigating:
        false,

    currentRoute:
        null,

    previousRoute:
        null,

    currentAppId:
        null,

    previousAppId:
        null,

    history:
        [],

    listeners:
        new Map(),

    guards:
        [],

    middleware:
        [],

    routes:
        new Map(),

    aliases:
        new Map(),

    parameters:
        new Map(),

    errors:
        [],

    statistics: {

        navigations:
            0,

        successfulNavigations:
            0,

        failedNavigations:
            0,

        redirects:
            0,

        blockedNavigations:
            0

    },

    createdAt:
        Date.now(),

    updatedAt:
        Date.now()

};


/* ============================================================
   2 — ROUTER VALUE HELPERS
   ============================================================ */

function __haldoRouterNormalizeRoute(
    route
) {

    if (
        route ===
        null ||
        route ===
        undefined
    ) {

        return "/";

    }


    let value =
        String(
            route
        ).trim();


    if (!value) {

        return "/";

    }


    if (
        !value.startsWith("/")
    ) {

        value =
            "/" +
            value;

    }


    value =
        value.replace(
            /\/{2,}/g,
            "/"
        );


    if (
        value.length >
        1 &&
        value.endsWith("/")
    ) {

        value =
            value.slice(
                0,
                -1
            );

    }


    return value;

}


function __haldoRouterClone(
    value
) {

    if (
        value ===
        undefined
    ) {

        return undefined;

    }


    if (
        value ===
        null
    ) {

        return null;

    }


    try {

        return JSON.parse(
            JSON.stringify(
                value
            )
        );

    } catch (_) {

        return value;

    }

}


function __haldoRouterNormalizeAppId(
    appId
) {

    if (
        appId ===
        null ||
        appId ===
        undefined
    ) {

        return null;

    }


    const value =
        String(
            appId
        ).trim();


    return value ||
        null;

}


function __haldoRouterNow() {

    return Date.now();

}


function __haldoRouterIsFunction(
    value
) {

    return typeof value ===
        "function";

}


function __haldoRouterIsObject(
    value
) {

    return (
        value !==
        null &&
        typeof value ===
        "object" &&
        !Array.isArray(
            value
        )
    );

}


/* ============================================================
   3 — ROUTER EVENT EMITTER
   ============================================================ */

function __haldoRouterEmit(
    eventName,
    detail = {}
) {

    const name =
        String(
            eventName
        ).trim();


    if (!name) {

        return;

    }


    const listeners =
        __HALDO_ROUTER_EXTENSION_STATE__.listeners.get(
            name
        );


    if (
        listeners
    ) {

        for (
            const listener
            of Array.from(
                listeners
            )
        ) {

            try {

                listener(
                    __haldoRouterClone(
                        detail
                    )
                );

            } catch (exception) {

                console.error(
                    "[HalDo Router] listener error:",
                    exception
                );

            }

        }

    }


    if (
        typeof window !==
        "undefined" &&
        typeof window.dispatchEvent ===
        "function"
    ) {

        try {

            let event =
                null;


            if (
                typeof CustomEvent ===
                "function"
            ) {

                event =
                    new CustomEvent(
                        name,
                        {

                            detail:
                                __haldoRouterClone(
                                    detail
                                )

                        }
                    );

            }


            if (
                event
            ) {

                window.dispatchEvent(
                    event
                );

            }

        } catch (exception) {

            console.error(
                "[HalDo Router] browser event error:",
                exception
            );

        }

    }

}


function __haldoRouterOn(
    eventName,
    listener
) {

    const name =
        String(
            eventName
        ).trim();


    if (
        !name ||
        !__haldoRouterIsFunction(
            listener
        )
    ) {

        return () => {};

    }


    let listeners =
        __HALDO_ROUTER_EXTENSION_STATE__.listeners.get(
            name
        );


    if (
        !listeners
    ) {

        listeners =
            new Set();

        __HALDO_ROUTER_EXTENSION_STATE__.listeners.set(
            name,
            listeners
        );

    }


    listeners.add(
        listener
    );


    return () => {

        listeners.delete(
            listener
        );

        if (
            listeners.size ===
            0
        ) {

            __HALDO_ROUTER_EXTENSION_STATE__.listeners.delete(
                name
            );

        }

    };

}


/* ============================================================
   4 — ROUTER APP-MANAGER ACCESS
   ============================================================ */

function __haldoRouterGetAppManager() {

    const candidates = [

        typeof globalThis !==
        "undefined"
            ? globalThis.HalDoAppManager
            : null,

        typeof globalThis !==
        "undefined"
            ? globalThis.HalDoOSAppManager
            : null,

        typeof window !==
        "undefined"
            ? window.HalDoAppManager
            : null,

        typeof window !==
        "undefined"
            ? window.HalDoOSAppManager
            : null,

        typeof window !==
        "undefined" &&
        window.HalDoOS
            ? window.HalDoOS.appManager
            : null

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            candidate
        ) {

            return candidate;

        }

    }


    return null;

}


/* ============================================================
   5 — ROUTER WINDOW-MANAGER ACCESS
   ============================================================ */

function __haldoRouterGetWindowManager() {

    const candidates = [

        typeof globalThis !==
        "undefined"
            ? globalThis.HalDoWindowManager
            : null,

        typeof globalThis !==
        "undefined"
            ? globalThis.HalDoOSWindowManager
            : null,

        typeof window !==
        "undefined"
            ? window.HalDoWindowManager
            : null,

        typeof window !==
        "undefined"
            ? window.HalDoOSWindowManager
            : null,

        typeof window !==
        "undefined" &&
        window.HalDoOS
            ? window.HalDoOS.windowManager
            : null

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            candidate
        ) {

            return candidate;

        }

    }


    return null;

}


/* ============================================================
   6 — ROUTER APP OPENING
   ============================================================ */

async function __haldoRouterOpenApp(
    appId,
    route,
    options = {}
) {

    const manager =
        __haldoRouterGetAppManager();


    const id =
        __haldoRouterNormalizeAppId(
            appId
        );


    if (
        !id
    ) {

        return false;

    }


    if (
        !manager
    ) {

        return false;

    }


    try {

        if (
            __haldoRouterIsFunction(
                manager.open
            )
        ) {

            await manager.open(
                id,
                {

                    route,

                    router:
                        true,

                    source:
                        options.source ||
                        "router"

                }
            );

            return true;

        }


        if (
            __haldoRouterIsFunction(
                manager.start
            )
        ) {

            await manager.start(
                id,
                {

                    route,

                    router:
                        true,

                    source:
                        options.source ||
                        "router"

                }
            );

            return true;

        }


        if (
            __haldoRouterIsFunction(
                manager.launch
            )
        ) {

            await manager.launch(
                id,
                {

                    route,

                    router:
                        true,

                    source:
                        options.source ||
                        "router"

                }
            );

            return true;

        }

    } catch (exception) {

        console.error(
            "[HalDo Router] App open failed:",
            exception
        );

        return false;

    }


    return false;

}


/* ============================================================
   7 — ROUTER APP ACTIVATION
   ============================================================ */

async function __haldoRouterActivateApp(
    appId,
    options = {}
) {

    const manager =
        __haldoRouterGetAppManager();


    const id =
        __haldoRouterNormalizeAppId(
            appId
        );


    if (
        !id ||
        !manager
    ) {

        return false;

    }


    try {

        if (
            __haldoRouterIsFunction(
                manager.activate
            )
        ) {

            await manager.activate(
                id,
                options
            );

            return true;

        }


        if (
            __haldoRouterIsFunction(
                manager.focusApp
            )
        ) {

            await manager.focusApp(
                id,
                options
            );

            return true;

        }


        if (
            __haldoRouterIsFunction(
                manager.focus
            )
        ) {

            await manager.focus(
                id,
                options
            );

            return true;

        }

    } catch (exception) {

        console.error(
            "[HalDo Router] App activation failed:",
            exception
        );

        return false;

    }


    return false;

}


/* ============================================================
   8 — ROUTER APP ROUTE SYNC
   ============================================================ */

async function __haldoRouterSyncAppRoute(
    appId,
    route
) {

    const manager =
        __haldoRouterGetAppManager();


    const id =
        __haldoRouterNormalizeAppId(
            appId
        );


    if (
        !manager ||
        !id
    ) {

        return;

    }


    try {

        if (
            __haldoRouterIsFunction(
                manager.setAppRoute
            )
        ) {

            await manager.setAppRoute(
                id,
                route,
                {
                    navigate:
                        false
                }
            );

            return;

        }


        if (
            __haldoRouterIsFunction(
                manager.setRoute
            )
        ) {

            await manager.setRoute(
                id,
                route,
                {
                    navigate:
                        false
                }
            );

        }

    } catch (exception) {

        console.error(
            "[HalDo Router] App route synchronization failed:",
            exception
        );

    }

}


/* ============================================================
   9 — ROUTER INITIALIZATION
   ============================================================ */

function __haldoRouterInitializeExtension() {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;


    if (
        state.initialized
    ) {

        return true;

    }


    state.initialized =
        true;

    state.ready =
        true;

    state.updatedAt =
        __haldoRouterNow();


    __haldoRouterEmit(
        "haldo:router:extension-initialized",
        {

            timestamp:
                new Date().toISOString(),

            ready:
                true

        }
    );


    return true;

}


__haldoRouterInitializeExtension();


/* ============================================================
   10 — END TEIL 1 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 2 / 16
   ============================================================ */


/* ============================================================
   11 — ROUTE REGISTRATION
   ============================================================ */

function __haldoRouterRegisterRoute(
    pattern,
    handler,
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const route =
        __haldoRouterNormalizeRoute(
            pattern
        );

    if (
        !route
    ) {

        throw new Error(
            "Router-Route fehlt."
        );

    }

    if (
        !__haldoRouterIsFunction(
            handler
        )
    ) {

        throw new Error(
            "Router-Handler muss eine Funktion sein."
        );

    }

    const definition = {

        pattern:
            route,

        handler,

        appId:
            __haldoRouterNormalizeAppId(
                options.appId
            ),

        name:
            options.name ||
            route,

        priority:
            Number.isFinite(
                options.priority
            )
                ? options.priority
                : 0,

        exact:
            options.exact !==
            false,

        metadata:
            __haldoRouterClone(
                options.metadata ||
                {}
            ),

        createdAt:
            __haldoRouterNow(),

        updatedAt:
            __haldoRouterNow()

    };

    state.routes.set(
        route,
        definition
    );

    state.updatedAt =
        __haldoRouterNow();

    __haldoRouterEmit(
        "haldo:router:route-registered",
        {

            route,

            appId:
                definition.appId,

            name:
                definition.name

        }
    );

    return definition;

}


/* ============================================================
   12 — ROUTE UNREGISTRATION
   ============================================================ */

function __haldoRouterUnregisterRoute(
    pattern
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const route =
        __haldoRouterNormalizeRoute(
            pattern
        );

    if (
        !state.routes.has(
            route
        )
    ) {

        return false;

    }

    const removed =
        state.routes.delete(
            route
        );

    if (
        removed
    ) {

        state.updatedAt =
            __haldoRouterNow();

        __haldoRouterEmit(
            "haldo:router:route-unregistered",
            {
                route
            }
        );

    }

    return removed;

}


/* ============================================================
   13 — ROUTE ALIAS REGISTRATION
   ============================================================ */

function __haldoRouterRegisterAlias(
    alias,
    target
) {

    const source =
        __haldoRouterNormalizeRoute(
            alias
        );

    const destination =
        __haldoRouterNormalizeRoute(
            target
        );

    if (
        !source ||
        !destination
    ) {

        return false;

    }

    __HALDO_ROUTER_EXTENSION_STATE__.aliases.set(
        source,
        destination
    );

    __HALDO_ROUTER_EXTENSION_STATE__.updatedAt =
        __haldoRouterNow();

    __haldoRouterEmit(
        "haldo:router:alias-registered",
        {

            alias:
                source,

            target:
                destination

        }
    );

    return true;

}


/* ============================================================
   14 — ROUTE ALIAS RESOLUTION
   ============================================================ */

function __haldoRouterResolveAlias(
    route
) {

    let current =
        __haldoRouterNormalizeRoute(
            route
        );

    const visited =
        new Set();

    while (
        __HALDO_ROUTER_EXTENSION_STATE__.aliases.has(
            current
        )
    ) {

        if (
            visited.has(
                current
            )
        ) {

            throw new Error(
                "Router-Alias-Zyklus erkannt: " +
                current
            );

        }

        visited.add(
            current
        );

        current =
            __haldoRouterNormalizeRoute(
                __HALDO_ROUTER_EXTENSION_STATE__.aliases.get(
                    current
                )
            );

    }

    return current;

}


/* ============================================================
   15 — ROUTE PARAMETER EXTRACTION
   ============================================================ */

function __haldoRouterExtractParameters(
    pattern,
    route
) {

    const patternValue =
        __haldoRouterNormalizeRoute(
            pattern
        );

    const routeValue =
        __haldoRouterNormalizeRoute(
            route
        );

    const patternParts =
        patternValue
            .split("/")
            .filter(
                Boolean
            );

    const routeParts =
        routeValue
            .split("/")
            .filter(
                Boolean
            );

    const parameters = {};

    if (
        patternParts.length !==
        routeParts.length
    ) {

        return null;

    }

    for (
        let index = 0;
        index <
        patternParts.length;
        index += 1
    ) {

        const patternPart =
            patternParts[
                index
            ];

        const routePart =
            routeParts[
                index
            ];

        if (
            patternPart.startsWith(
                ":"
            )
        ) {

            const name =
                patternPart
                    .slice(
                        1
                    )
                    .trim();

            if (
                name
            ) {

                parameters[
                    name
                ] =
                    decodeURIComponent(
                        routePart
                    );

            }

        } else if (
            patternPart !==
            routePart
        ) {

            return null;

        }

    }

    return parameters;

}


/* ============================================================
   16 — ROUTE MATCHING
   ============================================================ */

function __haldoRouterMatchRoute(
    route
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const normalized =
        __haldoRouterResolveAlias(
            route
        );

    const matches = [];

    for (
        const definition
        of state.routes.values()
    ) {

        const parameters =
            __haldoRouterExtractParameters(
                definition.pattern,
                normalized
            );

        if (
            parameters !==
            null
        ) {

            matches.push(
                {

                    definition,

                    parameters

                }
            );

            continue;

        }

        if (
            !definition.exact
        ) {

            const prefix =
                definition.pattern
                    .replace(
                        /\/$/,
                        ""
                    );

            if (
                normalized ===
                prefix ||
                normalized.startsWith(
                    prefix +
                    "/"
                )
            ) {

                matches.push(
                    {

                        definition,

                        parameters:
                            {}

                    }
                );

            }

        }

    }

    matches.sort(
        (
            first,
            second
        ) =>
            second.definition.priority -
            first.definition.priority
    );

    return matches;

}


/* ============================================================
   17 — ROUTE EXISTS
   ============================================================ */

function __haldoRouterRouteExists(
    route
) {

    const normalized =
        __haldoRouterResolveAlias(
            route
        );

    return (
        __HALDO_ROUTER_EXTENSION_STATE__.routes.has(
            normalized
        ) ||
        __haldoRouterMatchRoute(
            normalized
        ).length >
        0
    );

}


/* ============================================================
   18 — GET ROUTE DEFINITION
   ============================================================ */

function __haldoRouterGetRoute(
    route
) {

    const normalized =
        __haldoRouterResolveAlias(
            route
        );

    const direct =
        __HALDO_ROUTER_EXTENSION_STATE__.routes.get(
            normalized
        );

    if (
        direct
    ) {

        return direct;

    }

    const matches =
        __haldoRouterMatchRoute(
            normalized
        );

    return matches.length
        ? matches[
            0
        ].definition
        : null;

}


/* ============================================================
   19 — GET ALL ROUTES
   ============================================================ */

function __haldoRouterGetRoutes() {

    return Array.from(
        __HALDO_ROUTER_EXTENSION_STATE__.routes.values()
    ).map(
        definition =>
            __haldoRouterClone(
                {
                    ...definition,
                    handler:
                        undefined
                }
            )
    );

}


/* ============================================================
   20 — ROUTER URL INFORMATION
   ============================================================ */

function __haldoRouterParse(
    route
) {

    const normalized =
        __haldoRouterResolveAlias(
            route
        );

    const queryIndex =
        normalized.indexOf(
            "?"
        );

    const hashIndex =
        normalized.indexOf(
            "#"
        );

    let pathname =
        normalized;

    let query =
        "";

    let hash =
        "";

    if (
        queryIndex >=
        0
    ) {

        pathname =
            normalized.slice(
                0,
                queryIndex
            );

        query =
            normalized.slice(
                queryIndex +
                1,
                hashIndex >= 0
                    ? hashIndex
                    : undefined
            );

    }

    if (
        hashIndex >=
        0
    ) {

        if (
            queryIndex <
            0
        ) {

            pathname =
                normalized.slice(
                    0,
                    hashIndex
                );

        }

        hash =
            normalized.slice(
                hashIndex +
                1
            );

    }

    const params =
        new URLSearchParams(
            query
        );

    const queryObject = {};

    for (
        const [
            key,
            value
        ]
        of params.entries()
    ) {

        queryObject[
            key
        ] =
            value;

    }

    return {

        route:
            normalized,

        pathname:
            __haldoRouterNormalizeRoute(
                pathname
            ),

        query,

        queryObject,

        hash,

        parameters:
            {}

    };

}


/* ============================================================
   21 — END TEIL 2 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 3 / 16
   ============================================================ */


/* ============================================================
   22 — ROUTE CONTEXT CREATION
   ============================================================ */

function __haldoRouterCreateContext(
    route,
    options = {}
) {

    const parsed =
        __haldoRouterParse(
            route
        );

    const matches =
        __haldoRouterMatchRoute(
            parsed.pathname
        );

    const match =
        matches.length
            ? matches[
                0
            ]
            : null;

    const context = {

        route:
            parsed.route,

        pathname:
            parsed.pathname,

        query:
            parsed.query,

        queryObject:
            __haldoRouterClone(
                parsed.queryObject
            ),

        hash:
            parsed.hash,

        parameters:
            match
                ? __haldoRouterClone(
                    match.parameters
                )
                : {},

        appId:
            __haldoRouterNormalizeAppId(
                options.appId ||
                (
                    match &&
                    match.definition
                        ? match.definition.appId
                        : null
                )
            ),

        matched:
            !!match,

        definition:
            match
                ? __haldoRouterClone(
                    {
                        ...match.definition,
                        handler:
                            undefined
                    }
                )
                : null,

        source:
            options.source ||
            "router",

        timestamp:
            new Date().toISOString()

    };

    return context;

}


/* ============================================================
   23 — ROUTER HISTORY ENTRY
   ============================================================ */

function __haldoRouterCreateHistoryEntry(
    route,
    options = {}
) {

    const normalized =
        __haldoRouterNormalizeRoute(
            route
        );

    const context =
        __haldoRouterCreateContext(
            normalized,
            options
        );

    return {

        id:
            "route-" +
            __haldoRouterNow() +
            "-" +
            Math.random()
                .toString(
                    36
                )
                .slice(
                    2,
                    8
                ),

        route:
            normalized,

        pathname:
            context.pathname,

        appId:
            context.appId,

        parameters:
            __haldoRouterClone(
                context.parameters
            ),

        queryObject:
            __haldoRouterClone(
                context.queryObject
            ),

        hash:
            context.hash,

        source:
            options.source ||
            "router",

        timestamp:
            new Date().toISOString()

    };

}


/* ============================================================
   24 — PUSH HISTORY
   ============================================================ */

function __haldoRouterPushHistory(
    route,
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const entry =
        __haldoRouterCreateHistoryEntry(
            route,
            options
        );

    state.history.push(
        entry
    );

    /*
     * Verhindert unkontrolliertes Anwachsen
     * des In-Memory-Verlaufs.
     */
    const maxHistory =
        Number.isFinite(
            options.maxHistory
        )
            ? Math.max(
                1,
                options.maxHistory
            )
            : 500;

    if (
        state.history.length >
        maxHistory
    ) {

        state.history.splice(
            0,
            state.history.length -
            maxHistory
        );

    }

    state.updatedAt =
        __haldoRouterNow();

    __haldoRouterEmit(
        "haldo:router:history-updated",
        {

            entry:
                __haldoRouterClone(
                    entry
                ),

            length:
                state.history.length

        }
    );

    return entry;

}


/* ============================================================
   25 — GET HISTORY
   ============================================================ */

function __haldoRouterGetHistory() {

    return __haldoRouterClone(
        __HALDO_ROUTER_EXTENSION_STATE__.history
    );

}


/* ============================================================
   26 — CLEAR HISTORY
   ============================================================ */

function __haldoRouterClearHistory() {

    __HALDO_ROUTER_EXTENSION_STATE__.history =
        [];

    __HALDO_ROUTER_EXTENSION_STATE__.updatedAt =
        __haldoRouterNow();

    __haldoRouterEmit(
        "haldo:router:history-cleared",
        {
            timestamp:
                new Date().toISOString()
        }
    );

    return true;

}


/* ============================================================
   27 — CURRENT ROUTER STATE
   ============================================================ */

function __haldoRouterGetCurrentState() {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    return {

        initialized:
            !!state.initialized,

        ready:
            !!state.ready,

        navigating:
            !!state.navigating,

        currentRoute:
            state.currentRoute,

        previousRoute:
            state.previousRoute,

        currentAppId:
            state.currentAppId,

        previousAppId:
            state.previousAppId,

        historyLength:
            state.history.length,

        routeCount:
            state.routes.size,

        aliasCount:
            state.aliases.size,

        errorCount:
            state.errors.length,

        statistics:
            __haldoRouterClone(
                state.statistics
            ),

        timestamp:
            new Date().toISOString()

    };

}


/* ============================================================
   28 — ROUTER STATISTICS
   ============================================================ */

function __haldoRouterGetStatistics() {

    return __haldoRouterClone(
        __HALDO_ROUTER_EXTENSION_STATE__.statistics
    );

}


/* ============================================================
   29 — ROUTER ERROR RECORDING
   ============================================================ */

function __haldoRouterRecordError(
    error,
    context = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const record = {

        message:
            error &&
            error.message
                ? error.message
                : String(
                    error ||
                    "Unknown router error"
                ),

        name:
            error &&
            error.name
                ? error.name
                : "Error",

        route:
            context.route ||
            state.currentRoute ||
            null,

        appId:
            context.appId ||
            state.currentAppId ||
            null,

        timestamp:
            new Date().toISOString()

    };

    state.errors.push(
        record
    );

    if (
        state.errors.length >
        100
    ) {

        state.errors.shift();

    }

    state.statistics.failedNavigations +=
        1;

    state.updatedAt =
        __haldoRouterNow();

    __haldoRouterEmit(
        "haldo:router:error",
        __haldoRouterClone(
            record
        )
    );

    return record;

}


/* ============================================================
   30 — GET ROUTER ERRORS
   ============================================================ */

function __haldoRouterGetErrors() {

    return __haldoRouterClone(
        __HALDO_ROUTER_EXTENSION_STATE__.errors
    );

}


/* ============================================================
   31 — CLEAR ROUTER ERRORS
   ============================================================ */

function __haldoRouterClearErrors() {

    __HALDO_ROUTER_EXTENSION_STATE__.errors =
        [];

    __HALDO_ROUTER_EXTENSION_STATE__.updatedAt =
        __haldoRouterNow();

    return true;

}


/* ============================================================
   32 — END TEIL 3 / 16
   ============================================================ */
HalDo AI OS — /js/app-router.js

ERGÄNZEN — direkt unter TEIL 3 / 16

/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 4 / 16
   ============================================================ */
/* ============================================================
   33 — ROUTER GUARD REGISTRATION
   ============================================================ */
function __haldoRouterAddGuard(
    guard,
    options = {}
) {
    if (
        !__haldoRouterIsFunction(
            guard
        )
    ) {
        throw new TypeError(
            "Router Guard muss eine Funktion sein."
        );
    }
    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;
    const entry = {
        id:
            "guard-" +
            __haldoRouterNow() +
            "-" +
            Math.random()
                .toString(
                    36
                )
                .slice(
                    2,
                    8
                ),
        guard,
        priority:
            Number.isFinite(
                options.priority
            )
                ? options.priority
                : 0,
        name:
            options.name ||
            "guard",
        enabled:
            options.enabled !==
            false,
        createdAt:
            __haldoRouterNow()
    };
    state.guards.push(
        entry
    );
    state.guards.sort(
        (
            first,
            second
        ) =>
            second.priority -
            first.priority
    );
    state.updatedAt =
        __haldoRouterNow();
    __haldoRouterEmit(
        "haldo:router:guard-added",
        {
            id:
                entry.id,
            name:
                entry.name,
            priority:
                entry.priority
        }
    );
    return {
        ...entry,
        guard:
            undefined
    };
}
/* ============================================================
   34 — REMOVE ROUTER GUARD
   ============================================================ */
function __haldoRouterRemoveGuard(
    guardOrId
) {
    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;
    const index =
        state.guards.findIndex(
            entry =>
                entry.id ===
                    guardOrId ||
                entry.guard ===
                    guardOrId
        );
    if (
        index <
        0
    ) {
        return false;
    }
    const [
        removed
    ] =
        state.guards.splice(
            index,
            1
        );
    state.updatedAt =
        __haldoRouterNow();
    __haldoRouterEmit(
        "haldo:router:guard-removed",
        {
            id:
                removed.id,
            name:
                removed.name
        }
    );
    return true;
}
/* ============================================================
   35 — MIDDLEWARE REGISTRATION
   ============================================================ */
function __haldoRouterUse(
    middleware,
    options = {}
) {
    if (
        !__haldoRouterIsFunction(
            middleware
        )
    ) {
        throw new TypeError(
            "Router Middleware muss eine Funktion sein."
        );
    }
    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;
    const entry = {
        id:
            "middleware-" +
            __haldoRouterNow() +
            "-" +
            Math.random()
                .toString(
                    36
                )
                .slice(
                    2,
                    8
                ),
        middleware,
        priority:
            Number.isFinite(
                options.priority
            )
                ? options.priority
                : 0,
        name:
            options.name ||
            "middleware",
        enabled:
            options.enabled !==
            false,
        createdAt:
            __haldoRouterNow()
    };
    state.middleware.push(
        entry
    );
    state.middleware.sort(
        (
            first,
            second
        ) =>
            second.priority -
            first.priority
    );
    state.updatedAt =
        __haldoRouterNow();
    __haldoRouterEmit(
        "haldo:router:middleware-added",
        {
            id:
                entry.id,
            name:
                entry.name,
            priority:
                entry.priority
        }
    );
    return {
        ...entry,
        middleware:
            undefined
    };
}
/* ============================================================
   36 — REMOVE ROUTER MIDDLEWARE
   ============================================================ */
function __haldoRouterRemoveMiddleware(
    middlewareOrId
) {
    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;
    const index =
        state.middleware.findIndex(
            entry =>
                entry.id ===
                    middlewareOrId ||
                entry.middleware ===
                    middlewareOrId
        );
    if (
        index <
        0
    ) {
        return false;
    }
    const [
        removed
    ] =
        state.middleware.splice(
            index,
            1
        );
    state.updatedAt =
        __haldoRouterNow();
    __haldoRouterEmit(
        "haldo:router:middleware-removed",
        {
            id:
                removed.id,
            name:
                removed.name
        }
    );
    return true;
}
/* ============================================================
   37 — ENABLE GUARD
   ============================================================ */
function __haldoRouterEnableGuard(
    guardId
) {
    const entry =
        __HALDO_ROUTER_EXTENSION_STATE__.guards.find(
            item =>
                item.id ===
                guardId
        );
    if (
        !entry
    ) {
        return false;
    }
    entry.enabled =
        true;
    entry.updatedAt =
        __haldoRouterNow();
    return true;
}
/* ============================================================
   38 — DISABLE GUARD
   ============================================================ */
function __haldoRouterDisableGuard(
    guardId
) {
    const entry =
        __HALDO_ROUTER_EXTENSION_STATE__.guards.find(
            item =>
                item.id ===
                guardId
        );
    if (
        !entry
    ) {
        return false;
    }
    entry.enabled =
        false;
    entry.updatedAt =
        __haldoRouterNow();
    return true;
}
/* ============================================================
   39 — ENABLE MIDDLEWARE
   ============================================================ */
function __haldoRouterEnableMiddleware(
    middlewareId
) {
    const entry =
        __HALDO_ROUTER_EXTENSION_STATE__.middleware.find(
            item =>
                item.id ===
                middlewareId
        );
    if (
        !entry
    ) {
        return false;
    }
    entry.enabled =
        true;
    entry.updatedAt =
        __haldoRouterNow();
    return true;
}
/* ============================================================
   40 — DISABLE MIDDLEWARE
   ============================================================ */
function __haldoRouterDisableMiddleware(
    middlewareId
) {
    const entry =
        __HALDO_ROUTER_EXTENSION_STATE__.middleware.find(
            item =>
                item.id ===
                middlewareId
        );
    if (
        !entry
    ) {
        return false;
    }
    entry.enabled =
        false;
    entry.updatedAt =
        __haldoRouterNow();
    return true;
}
/* ============================================================
   41 — RUN GUARDS
   ============================================================ */
async function __haldoRouterRunGuards(
    context
) {
    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;
    for (
        const entry
        of state.guards
    ) {
        if (
            !entry.enabled
        ) {
            continue;
        }
        try {
            const result =
                await entry.guard(
                    __haldoRouterClone(
                        context
                    )
                );
            if (
                result ===
                false
            ) {
                state.statistics.blockedNavigations +=
                    1;
                return {
                    allowed:
                        false,
                    reason:
                        "blocked",
                    guardId:
                        entry.id
                };
            }
            if (
                typeof result ===
                "string"
            ) {
                state.statistics.redirects +=
                    1;
                return {
                    allowed:
                        false,
                    redirect:
                        __haldoRouterNormalizeRoute(
                            result
                        ),
                    guardId:
                        entry.id
                };
            }
            if (
                __haldoRouterIsObject(
                    result
                ) &&
                result.redirect
            ) {
                state.statistics.redirects +=
                    1;
                return {
                    allowed:
                        false,
                    redirect:
                        __haldoRouterNormalizeRoute(
                            result.redirect
                        ),
                    guardId:
                        entry.id
                };
            }
        } catch (exception) {
            __haldoRouterRecordError(
                exception,
                context
            );
            return {
                allowed:
                    false,
                reason:
                    "guard-error",
                guardId:
                    entry.id
            };
        }
    }
    return {
        allowed:
            true
    };
}
/* ============================================================
   42 — RUN MIDDLEWARE
   ============================================================ */
async function __haldoRouterRunMiddleware(
    context
) {
    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;
    let currentContext =
        __haldoRouterClone(
            context
        );
    for (
        const entry
        of state.middleware
    ) {
        if (
            !entry.enabled
        ) {
            continue;
        }
        try {
            const result =
                await entry.middleware(
                    currentContext
                );
            if (
                result ===
                false
            ) {
                return {
                    allowed:
                        false,
                    reason:
                        "middleware-blocked"
                };
            }
            if (
                __haldoRouterIsObject(
                    result
                )
            ) {
                currentContext =
                    {
                        ...currentContext,
                        ...result
                    };
                if (
                    result.redirect
                ) {
                    state.statistics.redirects +=
                        1;
                    return {
                        allowed:
                            false,
                        redirect:
                            __haldoRouterNormalizeRoute(
                                result.redirect
                            ),
                        context:
                            currentContext
                    };
                }
            }
        } catch (exception) {
            __haldoRouterRecordError(
                exception,
                context
            );
            return {
                allowed:
                    false,
                reason:
                    "middleware-error"
            };
        }
    }
    return {
        allowed:
            true,
        context:
            currentContext
    };
}
/* ============================================================
   43 — END TEIL 4 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 5 / 16
   ============================================================ */


/* ============================================================
   44 — ROUTER NAVIGATION LOCK
   ============================================================ */

function __haldoRouterAcquireNavigationLock() {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    if (
        state.navigating
    ) {

        return false;

    }

    state.navigating =
        true;

    state.updatedAt =
        __haldoRouterNow();

    return true;

}


/* ============================================================
   45 — ROUTER NAVIGATION UNLOCK
   ============================================================ */

function __haldoRouterReleaseNavigationLock() {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    state.navigating =
        false;

    state.updatedAt =
        __haldoRouterNow();

    return true;

}


/* ============================================================
   46 — ROUTER CURRENT ROUTE
   ============================================================ */

function __haldoRouterGetCurrentRoute() {

    return (
        __HALDO_ROUTER_EXTENSION_STATE__.currentRoute ||
        "/"
    );

}


/* ============================================================
   47 — ROUTER CURRENT APP
   ============================================================ */

function __haldoRouterGetCurrentAppId() {

    return (
        __HALDO_ROUTER_EXTENSION_STATE__.currentAppId ||
        null
    );

}


/* ============================================================
   48 — ROUTER PREVIOUS ROUTE
   ============================================================ */

function __haldoRouterGetPreviousRoute() {

    return (
        __HALDO_ROUTER_EXTENSION_STATE__.previousRoute ||
        null
    );

}


/* ============================================================
   49 — ROUTER PREVIOUS APP
   ============================================================ */

function __haldoRouterGetPreviousAppId() {

    return (
        __HALDO_ROUTER_EXTENSION_STATE__.previousAppId ||
        null
    );

}


/* ============================================================
   50 — ROUTER COMMIT ROUTE
   ============================================================ */

function __haldoRouterCommitRoute(
    route,
    context,
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const normalized =
        __haldoRouterNormalizeRoute(
            route
        );

    const previousRoute =
        state.currentRoute;

    const previousAppId =
        state.currentAppId;

    state.previousRoute =
        previousRoute ||
        null;

    state.previousAppId =
        previousAppId ||
        null;

    state.currentRoute =
        normalized;

    state.currentAppId =
        __haldoRouterNormalizeAppId(
            context &&
            context.appId
        );

    state.parameters =
        new Map();

    if (
        context &&
        context.parameters
    ) {

        for (
            const [
                key,
                value
            ]
            of Object.entries(
                context.parameters
            )
        ) {

            state.parameters.set(
                key,
                value
            );

        }

    }

    state.statistics.navigations +=
        1;

    state.statistics.successfulNavigations +=
        1;

    state.updatedAt =
        __haldoRouterNow();

    const historyEntry =
        __haldoRouterPushHistory(
            normalized,
            {

                ...options,

                appId:
                    state.currentAppId

            }
        );

    __haldoRouterEmit(
        "haldo:router:route-committed",
        {

            route:
                normalized,

            previousRoute:
                previousRoute ||
                null,

            appId:
                state.currentAppId,

            previousAppId:
                previousAppId ||
                null,

            context:
                __haldoRouterClone(
                    context
                ),

            historyEntry:
                __haldoRouterClone(
                    historyEntry
                )

        }
    );

    return {

        route:
            normalized,

        previousRoute:
            previousRoute ||
            null,

        appId:
            state.currentAppId,

        previousAppId:
            previousAppId ||
            null,

        context:
            __haldoRouterClone(
                context
            ),

        historyEntry:
            __haldoRouterClone(
                historyEntry
            )

    };

}


/* ============================================================
   51 — ROUTER BROWSER HISTORY SUPPORT
   ============================================================ */

function __haldoRouterWriteBrowserHistory(
    route,
    options = {}
) {

    if (
        typeof window ===
        "undefined" ||
        !window.history
    ) {

        return false;

    }

    const normalized =
        __haldoRouterNormalizeRoute(
            route
        );

    try {

        if (
            options.replace
        ) {

            window.history.replaceState(
                {
                    haldo:
                        true,

                    route:
                        normalized

                },
                "",
                normalized
            );

        } else {

            window.history.pushState(
                {
                    haldo:
                        true,

                    route:
                        normalized

                },
                "",
                normalized
            );

        }

        return true;

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                route:
                    normalized
            }
        );

        return false;

    }

}


/* ============================================================
   52 — ROUTER BROWSER LOCATION
   ============================================================ */

function __haldoRouterGetBrowserRoute() {

    if (
        typeof window ===
        "undefined" ||
        !window.location
    ) {

        return "/";

    }

    try {

        const pathname =
            window.location.pathname ||
            "/";

        const search =
            window.location.search ||
            "";

        const hash =
            window.location.hash ||
            "";

        return __haldoRouterNormalizeRoute(
            pathname +
            search +
            hash
        );

    } catch (_) {

        return "/";

    }

}


/* ============================================================
   53 — ROUTER NAVIGATION CORE
   ============================================================ */

async function __haldoRouterNavigate(
    route,
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const target =
        __haldoRouterNormalizeRoute(
            route
        );

    if (
        !__haldoRouterAcquireNavigationLock()
    ) {

        return {

            success:
                false,

            reason:
                "navigation-in-progress",

            route:
                target

        };

    }

    try {

        let resolvedRoute =
            __haldoRouterResolveAlias(
                target
            );

        let context =
            __haldoRouterCreateContext(
                resolvedRoute,
                options
            );


        /* ----------------------------------------------------
           Middleware
           ---------------------------------------------------- */

        const middlewareResult =
            await __haldoRouterRunMiddleware(
                context
            );

        if (
            !middlewareResult.allowed
        ) {

            if (
                middlewareResult.redirect
            ) {

                return await __haldoRouterNavigate(
                    middlewareResult.redirect,
                    {

                        ...options,

                        source:
                            "middleware-redirect",

                        replace:
                            true

                    }
                );

            }

            state.statistics.blockedNavigations +=
                1;

            return {

                success:
                    false,

                reason:
                    middlewareResult.reason ||
                    "middleware-blocked",

                route:
                    resolvedRoute

            };

        }


        context =
            middlewareResult.context ||
            context;


        /* ----------------------------------------------------
           Guards
           ---------------------------------------------------- */

        const guardResult =
            await __haldoRouterRunGuards(
                context
            );

        if (
            !guardResult.allowed
        ) {

            if (
                guardResult.redirect
            ) {

                return await __haldoRouterNavigate(
                    guardResult.redirect,
                    {

                        ...options,

                        source:
                            "guard-redirect",

                        replace:
                            true

                    }
                );

            }

            return {

                success:
                    false,

                reason:
                    guardResult.reason ||
                    "guard-blocked",

                route:
                    resolvedRoute

            };

        }


        /* ----------------------------------------------------
           Route Handler
           ---------------------------------------------------- */

        const matches =
            __haldoRouterMatchRoute(
                context.pathname
            );

        const match =
            matches.length
                ? matches[0]
                : null;


        if (
            match &&
            match.definition &&
            __haldoRouterIsFunction(
                match.definition.handler
            )
        ) {

            try {

                await match.definition.handler(
                    __haldoRouterClone(
                        context
                    )
                );

            } catch (exception) {

                __haldoRouterRecordError(
                    exception,
                    context
                );

                return {

                    success:
                        false,

                    reason:
                        "route-handler-error",

                    route:
                        resolvedRoute,

                    error:
                        exception

                };

            }

        }


        /* ----------------------------------------------------
           App Synchronization
           ---------------------------------------------------- */

        const appId =
            __haldoRouterNormalizeAppId(
                context.appId
            );

        if (
            appId
        ) {

            await __haldoRouterSyncAppRoute(
                appId,
                resolvedRoute
            );

            await __haldoRouterOpenApp(
                appId,
                resolvedRoute,
                options
            );

            await __haldoRouterActivateApp(
                appId,
                options
            );

        }


        /* ----------------------------------------------------
           Browser History
           ---------------------------------------------------- */

        if (
            options.browserHistory !==
            false
        ) {

            __haldoRouterWriteBrowserHistory(
                resolvedRoute,
                options
            );

        }


        /* ----------------------------------------------------
           Commit
           ---------------------------------------------------- */

        const result =
            __haldoRouterCommitRoute(
                resolvedRoute,
                context,
                options
            );


        __haldoRouterEmit(
            "haldo:router:navigated",
            {

                success:
                    true,

                ...result

            }
        );


        return {

            success:
                true,

            ...result

        };

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {

                route:
                    target

            }
        );

        return {

            success:
                false,

            reason:
                "navigation-error",

            route:
                target,

            error:
                exception

        };

    } finally {

        __haldoRouterReleaseNavigationLock();

    }

}


/* ============================================================
   54 — ROUTER GO
   ============================================================ */

async function __haldoRouterGo(
    route,
    options = {}
) {

    return __haldoRouterNavigate(
        route,
        options
    );

}


/* ============================================================
   55 — ROUTER REPLACE
   ============================================================ */

async function __haldoRouterReplace(
    route,
    options = {}
) {

    return __haldoRouterNavigate(
        route,
        {

            ...options,

            replace:
                true

        }
    );

}


/* ============================================================
   56 — ROUTER INITIAL BROWSER SYNC
   ============================================================ */

async function __haldoRouterSyncBrowser(
    options = {}
) {

    const route =
        __haldoRouterGetBrowserRoute();

    if (
        !route
    ) {

        return false;

    }

    if (
        options.navigate ===
        false
    ) {

        const context =
            __haldoRouterCreateContext(
                route,
                options
            );

        __haldoRouterCommitRoute(
            route,
            context,
            {

                ...options,

                source:
                    "browser-sync",

                browserHistory:
                    false

            }
        );

        return true;

    }

    const result =
        await __haldoRouterNavigate(
            route,
            {

                ...options,

                source:
                    "browser-sync",

                browserHistory:
                    false

            }
        );

    return !!(
        result &&
        result.success
    );

}


/* ============================================================
   57 — BROWSER POPSTATE LISTENER
   ============================================================ */

function __haldoRouterInstallPopState() {

    if (
        typeof window ===
        "undefined" ||
        typeof window.addEventListener !==
        "function"
    ) {

        return false;

    }

    if (
        window.__HALDO_ROUTER_POPSTATE_INSTALLED__
    ) {

        return true;

    }

    const handler =
        async function handleHalDoRouterPopState() {

            const route =
                __haldoRouterGetBrowserRoute();

            await __haldoRouterNavigate(
                route,
                {

                    source:
                        "browser-popstate",

                    browserHistory:
                        false,

                    replace:
                        true

                }
            );

        };


    window.addEventListener(
        "popstate",
        handler
    );


    window.__HALDO_ROUTER_POPSTATE_INSTALLED__ =
        true;


    __haldoRouterEmit(
        "haldo:router:popstate-installed",
        {
            timestamp:
                new Date().toISOString()
        }
    );


    return true;

}


/* ============================================================
   58 — ROUTER INITIAL READY STATE
   ============================================================ */

__haldoRouterInstallPopState();


__haldoRouterEmit(
    "haldo:router:navigation-core-ready",
    {

        initialized:
            __HALDO_ROUTER_EXTENSION_STATE__.initialized,

        ready:
            __HALDO_ROUTER_EXTENSION_STATE__.ready,

        timestamp:
            new Date().toISOString()

    }
);


/* ============================================================
   59 — END TEIL 5 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 6 / 16
   ============================================================ */


/* ============================================================
   60 — ROUTER APP ROUTE REGISTRATION
   ============================================================ */

function __haldoRouterRegisterAppRoute(
    appId,
    route,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    const pattern =
        __haldoRouterNormalizeRoute(
            route
        );

    if (
        !id ||
        !pattern
    ) {

        throw new Error(
            "App-ID und Route sind erforderlich."
        );

    }

    const existing =
        __HALDO_ROUTER_EXTENSION_STATE__.routes.get(
            pattern
        );

    /*
     * Eine bestehende Route wird nicht blind entfernt.
     * Nur die App-Zuordnung wird kontrolliert aktualisiert.
     */

    const handler =
        __haldoRouterIsFunction(
            options.handler
        )
            ? options.handler
            : existing &&
              __haldoRouterIsFunction(
                  existing.handler
              )
                ? existing.handler
                : async function defaultAppRouteHandler(
                    context
                ) {

                    const manager =
                        __haldoRouterGetAppManager();

                    if (
                        !manager
                    ) {

                        return;

                    }

                    try {

                        if (
                            __haldoRouterIsFunction(
                                manager.open
                            )
                        ) {

                            await manager.open(
                                id,
                                {
                                    route:
                                        context.route,

                                    router:
                                        true,

                                    source:
                                        "app-route"

                                }
                            );

                            return;

                        }

                        if (
                            __haldoRouterIsFunction(
                                manager.launch
                            )
                        ) {

                            await manager.launch(
                                id,
                                {
                                    route:
                                        context.route,

                                    router:
                                        true,

                                    source:
                                        "app-route"

                                }
                            );

                        }

                    } catch (exception) {

                        __haldoRouterRecordError(
                            exception,
                            {
                                ...context,
                                appId:
                                    id
                            }
                        );

                    }

                };


    const definition =
        __haldoRouterRegisterRoute(
            pattern,
            handler,
            {

                ...options,

                appId:
                    id,

                name:
                    options.name ||
                    id,

                metadata:
                    {
                        ...(existing &&
                            existing.metadata
                                ? existing.metadata
                                : {}),

                        ...(options.metadata ||
                            {}),

                        appRoute:
                            true

                    }

            }
        );


    __haldoRouterEmit(
        "haldo:router:app-route-registered",
        {

            appId:
                id,

            route:
                pattern,

            definition:
                __haldoRouterClone(
                    {
                        ...definition,
                        handler:
                            undefined
                    }
                )

        }
    );


    return definition;

}


/* ============================================================
   61 — UNREGISTER ALL ROUTES OF AN APP
   ============================================================ */

function __haldoRouterUnregisterAppRoutes(
    appId
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return 0;

    }

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const routesToRemove = [];

    for (
        const [
            route,
            definition
        ]
        of state.routes.entries()
    ) {

        if (
            definition &&
            definition.appId ===
            id
        ) {

            routesToRemove.push(
                route
            );

        }

    }

    for (
        const route
        of routesToRemove
    ) {

        state.routes.delete(
            route
        );

    }

    if (
        routesToRemove.length
    ) {

        state.updatedAt =
            __haldoRouterNow();

        __haldoRouterEmit(
            "haldo:router:app-routes-unregistered",
            {

                appId:
                    id,

                routes:
                    routesToRemove

            }
        );

    }

    return routesToRemove.length;

}


/* ============================================================
   62 — GET APP ROUTES
   ============================================================ */

function __haldoRouterGetAppRoutes(
    appId
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return [];

    }

    return Array.from(
        __HALDO_ROUTER_EXTENSION_STATE__.routes.values()
    )
        .filter(
            definition =>
                definition &&
                definition.appId ===
                id
        )
        .map(
            definition =>
                __haldoRouterClone(
                    {
                        ...definition,
                        handler:
                            undefined
                    }
                )
        );

}


/* ============================================================
   63 — ROUTE NAVIGATION RESULT
   ============================================================ */

function __haldoRouterCreateNavigationResult(
    success,
    route,
    context,
    extra = {}
) {

    return {

        success:
            !!success,

        route:
            __haldoRouterNormalizeRoute(
                route
            ),

        appId:
            __haldoRouterNormalizeAppId(
                context &&
                context.appId
            ),

        pathname:
            context &&
            context.pathname
                ? context.pathname
                : null,

        parameters:
            context &&
            context.parameters
                ? __haldoRouterClone(
                    context.parameters
                )
                : {},

        queryObject:
            context &&
            context.queryObject
                ? __haldoRouterClone(
                    context.queryObject
                )
                : {},

        hash:
            context &&
            context.hash
                ? context.hash
                : "",

        timestamp:
            new Date().toISOString(),

        ...extra

    };

}


/* ============================================================
   64 — ROUTER REDIRECT
   ============================================================ */

async function __haldoRouterRedirect(
    route,
    options = {}
) {

    const target =
        __haldoRouterNormalizeRoute(
            route
        );

    if (
        !target
    ) {

        return {

            success:
                false,

            reason:
                "invalid-redirect"

        };

    }

    __HALDO_ROUTER_EXTENSION_STATE__.statistics.redirects +=
        1;

    __haldoRouterEmit(
        "haldo:router:redirect",
        {

            route:
                target,

            source:
                options.source ||
                "router"

        }
    );

    return __haldoRouterNavigate(
        target,
        {

            ...options,

            source:
                options.source ||
                "redirect",

            replace:
                options.replace !==
                false

        }
    );

}


/* ============================================================
   65 — ROUTER BACK
   ============================================================ */

async function __haldoRouterBack(
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    if (
        state.history.length <
        2
    ) {

        if (
            typeof window !==
            "undefined" &&
            window.history
        ) {

            try {

                window.history.back();

                return {

                    success:
                        true,

                    browser:
                        true,

                    reason:
                        "browser-back"

                };

            } catch (exception) {

                __haldoRouterRecordError(
                    exception
                );

            }

        }

        return {

            success:
                false,

            reason:
                "no-history"

        };

    }


    const currentIndex =
        state.history.length -
        1;

    const previousEntry =
        state.history[
            currentIndex -
            1
        ];

    if (
        !previousEntry
    ) {

        return {

            success:
                false,

            reason:
                "no-previous-route"

        };

    }

    const result =
        await __haldoRouterNavigate(
            previousEntry.route,
            {

                ...options,

                source:
                    options.source ||
                    "router-back",

                browserHistory:
                    false,

                replace:
                    true

            }
        );

    return {

        ...result,

        navigation:
            "back"

    };

}


/* ============================================================
   66 — ROUTER FORWARD
   ============================================================ */

async function __haldoRouterForward(
    options = {}
) {

    if (
        typeof window !==
        "undefined" &&
        window.history
    ) {

        try {

            window.history.forward();

            return {

                success:
                    true,

                browser:
                    true,

                reason:
                    "browser-forward"

            };

        } catch (exception) {

            __haldoRouterRecordError(
                exception
            );

        }

    }

    return {

        success:
            false,

        reason:
            "forward-not-available"

    };

}


/* ============================================================
   67 — ROUTER RELOAD CURRENT ROUTE
   ============================================================ */

async function __haldoRouterReload(
    options = {}
) {

    const current =
        __haldoRouterGetCurrentRoute();

    if (
        !current
    ) {

        return {

            success:
                false,

            reason:
                "no-current-route"

        };

    }

    __haldoRouterEmit(
        "haldo:router:reload-start",
        {

            route:
                current

        }
    );

    const result =
        await __haldoRouterNavigate(
            current,
            {

                ...options,

                source:
                    options.source ||
                    "router-reload",

                browserHistory:
                    false,

                replace:
                    true

            }
        );

    __haldoRouterEmit(
        "haldo:router:reload-complete",
        {

            route:
                current,

            success:
                !!(
                    result &&
                    result.success
                )

        }
    );

    return result;

}


/* ============================================================
   68 — ROUTER APP ACTIVATION BY ROUTE
   ============================================================ */

async function __haldoRouterOpenRoute(
    route,
    options = {}
) {

    const normalized =
        __haldoRouterNormalizeRoute(
            route
        );

    const context =
        __haldoRouterCreateContext(
            normalized,
            options
        );

    const appId =
        __haldoRouterNormalizeAppId(
            context.appId
        );

    if (
        !appId
    ) {

        return __haldoRouterNavigate(
            normalized,
            options
        );

    }

    const opened =
        await __haldoRouterOpenApp(
            appId,
            normalized,
            options
        );

    if (
        !opened
    ) {

        return {

            success:
                false,

            reason:
                "app-open-failed",

            route:
                normalized,

            appId

        };

    }

    return __haldoRouterNavigate(
        normalized,
        options
    );

}


/* ============================================================
   69 — ROUTER CLOSE APP WITHOUT ROUTE DESTRUCTION
   ============================================================ */

async function __haldoRouterCloseApp(
    appId,
    options = {}
) {

    const manager =
        __haldoRouterGetAppManager();

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !manager ||
        !id
    ) {

        return false;

    }

    try {

        if (
            __haldoRouterIsFunction(
                manager.close
            )
        ) {

            await manager.close(
                id,
                options
            );

            __haldoRouterEmit(
                "haldo:router:app-closed",
                {

                    appId:
                        id

                }
            );

            return true;

        }

        if (
            __haldoRouterIsFunction(
                manager.stop
            )
        ) {

            await manager.stop(
                id,
                options
            );

            __haldoRouterEmit(
                "haldo:router:app-closed",
                {

                    appId:
                        id

                }
            );

            return true;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                appId:
                    id
            }
        );

    }

    return false;

}


/* ============================================================
   70 — ROUTER APP NAVIGATION EVENT
   ============================================================ */

function __haldoRouterNotifyAppNavigation(
    appId,
    route,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    const normalized =
        __haldoRouterNormalizeRoute(
            route
        );

    if (
        !id
    ) {

        return false;

    }

    const manager =
        __haldoRouterGetAppManager();

    const payload = {

        appId:
            id,

        route:
            normalized,

        source:
            options.source ||
            "router",

        timestamp:
            new Date().toISOString()

    };

    try {

        if (
            manager &&
            __haldoRouterIsFunction(
                manager.send
            )
        ) {

            manager.send(
                id,
                "router:navigation",
                payload
            );

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            payload
        );

    }

    __haldoRouterEmit(
        "haldo:router:app-navigation",
        payload
    );

    return true;

}


/* ============================================================
   71 — END TEIL 6 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 7 / 16
   ============================================================ */


/* ============================================================
   72 — WINDOW-MANAGER ACCESS
   ============================================================ */

function __haldoRouterGetWindowManagerSafe() {

    try {

        return __haldoRouterGetWindowManager();

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

        return null;

    }

}


/* ============================================================
   73 — OPEN APP WINDOW
   ============================================================ */

async function __haldoRouterOpenAppWindow(
    appId,
    route,
    options = {}
) {

    const windowManager =
        __haldoRouterGetWindowManagerSafe();

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !windowManager ||
        !id
    ) {

        return {

            success:
                false,

            reason:
                "window-manager-unavailable",

            appId:
                id

        };

    }

    const payload = {

        appId:
            id,

        route:
            __haldoRouterNormalizeRoute(
                route
            ),

        router:
            true,

        source:
            options.source ||
            "router"

    };


    try {

        if (
            __haldoRouterIsFunction(
                windowManager.openApp
            )
        ) {

            const result =
                await windowManager.openApp(
                    id,
                    payload
                );

            return {

                success:
                    result !==
                    false,

                result:
                    __haldoRouterClone(
                        result
                    )

            };

        }


        if (
            __haldoRouterIsFunction(
                windowManager.open
            )
        ) {

            const result =
                await windowManager.open(
                    id,
                    payload
                );

            return {

                success:
                    result !==
                    false,

                result:
                    __haldoRouterClone(
                        result
                    )

            };

        }


        if (
            __haldoRouterIsFunction(
                windowManager.create
            )
        ) {

            const result =
                await windowManager.create(
                    payload
                );

            return {

                success:
                    result !==
                    false,

                result:
                    __haldoRouterClone(
                        result
                    )

            };

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            payload
        );

        return {

            success:
                false,

            reason:
                "window-open-error",

            error:
                exception

        };

    }


    return {

        success:
            false,

        reason:
            "window-open-method-unavailable",

        appId:
            id

    };

}


/* ============================================================
   74 — FOCUS APP WINDOW
   ============================================================ */

async function __haldoRouterFocusAppWindow(
    appId,
    options = {}
) {

    const windowManager =
        __haldoRouterGetWindowManagerSafe();

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !windowManager ||
        !id
    ) {

        return false;

    }

    try {

        if (
            __haldoRouterIsFunction(
                windowManager.focusApp
            )
        ) {

            const result =
                await windowManager.focusApp(
                    id,
                    options
                );

            return result !==
                false;

        }


        if (
            __haldoRouterIsFunction(
                windowManager.focus
            )
        ) {

            const result =
                await windowManager.focus(
                    id,
                    options
                );

            return result !==
                false;

        }


        if (
            __haldoRouterIsFunction(
                windowManager.bringToFront
            )
        ) {

            const result =
                await windowManager.bringToFront(
                    id,
                    options
                );

            return result !==
                false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                appId:
                    id
            }
        );

    }

    return false;

}


/* ============================================================
   75 — MINIMIZE APP WINDOW
   ============================================================ */

async function __haldoRouterMinimizeAppWindow(
    appId,
    options = {}
) {

    const windowManager =
        __haldoRouterGetWindowManagerSafe();

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !windowManager ||
        !id
    ) {

        return false;

    }

    try {

        if (
            __haldoRouterIsFunction(
                windowManager.minimizeApp
            )
        ) {

            return (
                await windowManager.minimizeApp(
                    id,
                    options
                )
            ) !== false;

        }


        if (
            __haldoRouterIsFunction(
                windowManager.minimize
            )
        ) {

            return (
                await windowManager.minimize(
                    id,
                    options
                )
            ) !== false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                appId:
                    id
            }
        );

    }

    return false;

}


/* ============================================================
   76 — MAXIMIZE APP WINDOW
   ============================================================ */

async function __haldoRouterMaximizeAppWindow(
    appId,
    options = {}
) {

    const windowManager =
        __haldoRouterGetWindowManagerSafe();

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !windowManager ||
        !id
    ) {

        return false;

    }

    try {

        if (
            __haldoRouterIsFunction(
                windowManager.maximizeApp
            )
        ) {

            return (
                await windowManager.maximizeApp(
                    id,
                    options
                )
            ) !== false;

        }


        if (
            __haldoRouterIsFunction(
                windowManager.maximize
            )
        ) {

            return (
                await windowManager.maximize(
                    id,
                    options
                )
            ) !== false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                appId:
                    id
            }
        );

    }

    return false;

}


/* ============================================================
   77 — CLOSE APP WINDOW
   ============================================================ */

async function __haldoRouterCloseAppWindow(
    appId,
    options = {}
) {

    const windowManager =
        __haldoRouterGetWindowManagerSafe();

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !windowManager ||
        !id
    ) {

        return false;

    }

    try {

        if (
            __haldoRouterIsFunction(
                windowManager.closeApp
            )
        ) {

            return (
                await windowManager.closeApp(
                    id,
                    options
                )
            ) !== false;

        }


        if (
            __haldoRouterIsFunction(
                windowManager.close
            )
        ) {

            return (
                await windowManager.close(
                    id,
                    options
                )
            ) !== false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                appId:
                    id
            }
        );

    }

    return false;

}


/* ============================================================
   78 — RESTORE APP WINDOW
   ============================================================ */

async function __haldoRouterRestoreAppWindow(
    appId,
    options = {}
) {

    const windowManager =
        __haldoRouterGetWindowManagerSafe();

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !windowManager ||
        !id
    ) {

        return false;

    }

    try {

        if (
            __haldoRouterIsFunction(
                windowManager.restoreApp
            )
        ) {

            return (
                await windowManager.restoreApp(
                    id,
                    options
                )
            ) !== false;

        }


        if (
            __haldoRouterIsFunction(
                windowManager.restore
            )
        ) {

            return (
                await windowManager.restore(
                    id,
                    options
                )
            ) !== false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                appId:
                    id
            }
        );

    }

    return false;

}


/* ============================================================
   79 — RESIZE APP WINDOW
   ============================================================ */

async function __haldoRouterResizeAppWindow(
    appId,
    width,
    height,
    options = {}
) {

    const windowManager =
        __haldoRouterGetWindowManagerSafe();

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    const numericWidth =
        Number(
            width
        );

    const numericHeight =
        Number(
            height
        );

    if (
        !windowManager ||
        !id ||
        !Number.isFinite(
            numericWidth
        ) ||
        !Number.isFinite(
            numericHeight
        )
    ) {

        return false;

    }

    const size = {

        width:
            Math.max(
                1,
                numericWidth
            ),

        height:
            Math.max(
                1,
                numericHeight
            )

    };

    try {

        if (
            __haldoRouterIsFunction(
                windowManager.resizeApp
            )
        ) {

            return (
                await windowManager.resizeApp(
                    id,
                    size,
                    options
                )
            ) !== false;

        }


        if (
            __haldoRouterIsFunction(
                windowManager.resize
            )
        ) {

            return (
                await windowManager.resize(
                    id,
                    size,
                    options
                )
            ) !== false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                appId:
                    id,

                width:
                    size.width,

                height:
                    size.height

            }
        );

    }

    return false;

}


/* ============================================================
   80 — MOVE APP WINDOW
   ============================================================ */

async function __haldoRouterMoveAppWindow(
    appId,
    x,
    y,
    options = {}
) {

    const windowManager =
        __haldoRouterGetWindowManagerSafe();

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    const numericX =
        Number(
            x
        );

    const numericY =
        Number(
            y
        );

    if (
        !windowManager ||
        !id ||
        !Number.isFinite(
            numericX
        ) ||
        !Number.isFinite(
            numericY
        )
    ) {

        return false;

    }

    const position = {

        x:
            numericX,

        y:
            numericY

    };

    try {

        if (
            __haldoRouterIsFunction(
                windowManager.moveApp
            )
        ) {

            return (
                await windowManager.moveApp(
                    id,
                    position,
                    options
                )
            ) !== false;

        }


        if (
            __haldoRouterIsFunction(
                windowManager.move
            )
        ) {

            return (
                await windowManager.move(
                    id,
                    position,
                    options
                )
            ) !== false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                appId:
                    id,

                x:
                    numericX,

                y:
                    numericY

            }
        );

    }

    return false;

}


/* ============================================================
   81 — WINDOW STATE QUERY
   ============================================================ */

function __haldoRouterGetAppWindowState(
    appId
) {

    const windowManager =
        __haldoRouterGetWindowManagerSafe();

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !windowManager ||
        !id
    ) {

        return null;

    }

    try {

        if (
            __haldoRouterIsFunction(
                windowManager.getAppWindowState
            )
        ) {

            return __haldoRouterClone(
                windowManager.getAppWindowState(
                    id
                )
            );

        }


        if (
            __haldoRouterIsFunction(
                windowManager.getWindowState
            )
        ) {

            return __haldoRouterClone(
                windowManager.getWindowState(
                    id
                )
            );

        }


        if (
            __haldoRouterIsFunction(
                windowManager.get
            )
        ) {

            return __haldoRouterClone(
                windowManager.get(
                    id
                )
            );

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                appId:
                    id
            }
        );

    }

    return null;

}


/* ============================================================
   82 — END TEIL 7 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 8 / 16
   ============================================================ */


/* ============================================================
   83 — APP MANAGER ROUTER EVENT BRIDGE
   ============================================================ */

function __haldoRouterInstallAppManagerBridge() {

    if (
        typeof window ===
        "undefined" ||
        typeof window.addEventListener !==
        "function"
    ) {

        return false;

    }

    if (
        window.__HALDO_ROUTER_APP_MANAGER_BRIDGE__
    ) {

        return true;

    }

    const events = [

        "haldo:app:opened",
        "haldo:app:started",
        "haldo:app:activated",
        "haldo:app:focused",
        "haldo:app:closed",
        "haldo:app:stopped",
        "haldo:app:destroyed",
        "app-opened",
        "app-started",
        "app-activated",
        "app-focused",
        "app-closed",
        "app-stopped"

    ];

    const handlers = new Map();

    for (
        const eventName
        of events
    ) {

        const handler =
            function handleAppManagerEvent(
                event
            ) {

                try {

                    const detail =
                        event &&
                        event.detail
                            ? event.detail
                            : {};

                    const appId =
                        __haldoRouterNormalizeAppId(
                            detail.appId ||
                            detail.id ||
                            detail.app ||
                            (
                                detail.appInfo &&
                                detail.appInfo.id
                            )
                        );

                    if (
                        appId
                    ) {

                        __haldoRouterEmit(
                            "haldo:router:app-manager-event",
                            {

                                event:
                                    eventName,

                                appId,

                                detail:
                                    __haldoRouterClone(
                                        detail
                                    ),

                                timestamp:
                                    new Date().toISOString()

                            }
                        );

                    }

                } catch (exception) {

                    __haldoRouterRecordError(
                        exception
                    );

                }

            };

        handlers.set(
            eventName,
            handler
        );

        window.addEventListener(
            eventName,
            handler
        );

    }

    window.__HALDO_ROUTER_APP_MANAGER_BRIDGE__ =
        handlers;

    return true;

}


/* ============================================================
   84 — WINDOW MANAGER ROUTER EVENT BRIDGE
   ============================================================ */

function __haldoRouterInstallWindowManagerBridge() {

    if (
        typeof window ===
        "undefined" ||
        typeof window.addEventListener !==
        "function"
    ) {

        return false;

    }

    if (
        window.__HALDO_ROUTER_WINDOW_MANAGER_BRIDGE__
    ) {

        return true;

    }

    const events = [

        "haldo:window:opened",
        "haldo:window:closed",
        "haldo:window:focused",
        "haldo:window:minimized",
        "haldo:window:maximized",
        "haldo:window:restored",
        "haldo:window:moved",
        "haldo:window:resized",
        "window-opened",
        "window-closed",
        "window-focused"

    ];

    const handlers = new Map();

    for (
        const eventName
        of events
    ) {

        const handler =
            function handleWindowManagerEvent(
                event
            ) {

                try {

                    const detail =
                        event &&
                        event.detail
                            ? event.detail
                            : {};

                    const appId =
                        __haldoRouterNormalizeAppId(
                            detail.appId ||
                            detail.app ||
                            detail.id
                        );

                    __haldoRouterEmit(
                        "haldo:router:window-manager-event",
                        {

                            event:
                                eventName,

                            appId,

                            detail:
                                __haldoRouterClone(
                                    detail
                                ),

                            timestamp:
                                new Date().toISOString()

                        }
                    );

                } catch (exception) {

                    __haldoRouterRecordError(
                        exception
                    );

                }

            };

        handlers.set(
            eventName,
            handler
        );

        window.addEventListener(
            eventName,
            handler
        );

    }

    window.__HALDO_ROUTER_WINDOW_MANAGER_BRIDGE__ =
        handlers;

    return true;

}


/* ============================================================
   85 — ROUTER SYSTEM EVENT BRIDGE
   ============================================================ */

function __haldoRouterInstallSystemBridge() {

    if (
        typeof window ===
        "undefined" ||
        typeof window.addEventListener !==
        "function"
    ) {

        return false;

    }

    if (
        window.__HALDO_ROUTER_SYSTEM_BRIDGE__
    ) {

        return true;

    }

    const events = [

        "haldo:system:ready",
        "haldo:system:shutdown",
        "haldo:system:error",
        "haldo:os:ready",
        "haldo:os:shutdown",
        "haldo:kernel:ready",
        "haldo:kernel:error"

    ];

    const handlers = new Map();

    for (
        const eventName
        of events
    ) {

        const handler =
            function handleSystemEvent(
                event
            ) {

                try {

                    __haldoRouterEmit(
                        "haldo:router:system-event",
                        {

                            event:
                                eventName,

                            detail:
                                event &&
                                event.detail
                                    ? __haldoRouterClone(
                                        event.detail
                                    )
                                    : {},

                            timestamp:
                                new Date().toISOString()

                        }
                    );

                } catch (exception) {

                    __haldoRouterRecordError(
                        exception
                    );

                }

            };

        handlers.set(
            eventName,
            handler
        );

        window.addEventListener(
            eventName,
            handler
        );

    }

    window.__HALDO_ROUTER_SYSTEM_BRIDGE__ =
        handlers;

    return true;

}


/* ============================================================
   86 — INSTALL ALL ROUTER BRIDGES
   ============================================================ */

function __haldoRouterInstallBridges() {

    return {

        appManager:
            __haldoRouterInstallAppManagerBridge(),

        windowManager:
            __haldoRouterInstallWindowManagerBridge(),

        system:
            __haldoRouterInstallSystemBridge()

    };

}


__haldoRouterInstallBridges();


/* ============================================================
   87 — APP ROUTER SERVICE EVENT
   ============================================================ */

function __haldoRouterNotifyService(
    service,
    payload = {}
) {

    const normalizedService =
        String(
            service ||
            ""
        ).trim();

    if (
        !normalizedService
    ) {

        return false;

    }

    const detail = {

        service:
            normalizedService,

        payload:
            __haldoRouterClone(
                payload
            ),

        timestamp:
            new Date().toISOString()

    };

    __haldoRouterEmit(
        "haldo:router:service-event",
        detail
    );

    return true;

}


/* ============================================================
   88 — APP ROUTER SYSTEM READY CHECK
   ============================================================ */

function __haldoRouterIsSystemReady() {

    const candidates = [

        typeof globalThis !==
        "undefined"
            ? globalThis.HalDoOS
            : null,

        typeof window !==
        "undefined"
            ? window.HalDoOS
            : null

    ];

    for (
        const system
        of candidates
    ) {

        if (
            !system
        ) {

            continue;

        }

        if (
            system.ready ===
            true ||
            system.isReady ===
            true
        ) {

            return true;

        }

        if (
            system.state &&
            (
                system.state.ready ===
                true ||
                system.state.status ===
                "ready"
            )
        ) {

            return true;

        }

    }

    return false;

}


/* ============================================================
   89 — ROUTER WAIT FOR SYSTEM READY
   ============================================================ */

function __haldoRouterWaitForSystemReady(
    options = {}
) {

    const timeout =
        Number.isFinite(
            options.timeout
        )
            ? Math.max(
                0,
                options.timeout
            )
            : 10000;

    const interval =
        Number.isFinite(
            options.interval
        )
            ? Math.max(
                10,
                options.interval
            )
            : 100;

    if (
        __haldoRouterIsSystemReady()
    ) {

        return Promise.resolve(
            true
        );

    }

    return new Promise(
        resolve => {

            const start =
                __haldoRouterNow();

            const check =
                function checkSystemReady() {

                    if (
                        __haldoRouterIsSystemReady()
                    ) {

                        resolve(
                            true
                        );

                        return;

                    }

                    if (
                        __haldoRouterNow() -
                        start >=
                        timeout
                    ) {

                        resolve(
                            false
                        );

                        return;

                    }

                    setTimeout(
                        check,
                        interval
                    );

                };

            check();

        }
    );

}


/* ============================================================
   90 — ROUTER APP MANAGER WAIT
   ============================================================ */

function __haldoRouterWaitForAppManager(
    options = {}
) {

    const timeout =
        Number.isFinite(
            options.timeout
        )
            ? Math.max(
                0,
                options.timeout
            )
            : 10000;

    const interval =
        Number.isFinite(
            options.interval
        )
            ? Math.max(
                10,
                options.interval
            )
            : 100;

    const existing =
        __haldoRouterGetAppManager();

    if (
        existing
    ) {

        return Promise.resolve(
            existing
        );

    }

    return new Promise(
        resolve => {

            const start =
                __haldoRouterNow();

            const check =
                function checkAppManager() {

                    const manager =
                        __haldoRouterGetAppManager();

                    if (
                        manager
                    ) {

                        resolve(
                            manager
                        );

                        return;

                    }

                    if (
                        __haldoRouterNow() -
                        start >=
                        timeout
                    ) {

                        resolve(
                            null
                        );

                        return;

                    }

                    setTimeout(
                        check,
                        interval
                    );

                };

            check();

        }
    );

}


/* ============================================================
   91 — ROUTER WINDOW MANAGER WAIT
   ============================================================ */

function __haldoRouterWaitForWindowManager(
    options = {}
) {

    const timeout =
        Number.isFinite(
            options.timeout
        )
            ? Math.max(
                0,
                options.timeout
            )
            : 10000;

    const interval =
        Number.isFinite(
            options.interval
        )
            ? Math.max(
                10,
                options.interval
            )
            : 100;

    const existing =
        __haldoRouterGetWindowManagerSafe();

    if (
        existing
    ) {

        return Promise.resolve(
            existing
        );

    }

    return new Promise(
        resolve => {

            const start =
                __haldoRouterNow();

            const check =
                function checkWindowManager() {

                    const manager =
                        __haldoRouterGetWindowManagerSafe();

                    if (
                        manager
                    ) {

                        resolve(
                            manager
                        );

                        return;

                    }

                    if (
                        __haldoRouterNow() -
                        start >=
                        timeout
                    ) {

                        resolve(
                            null
                        );

                        return;

                    }

                    setTimeout(
                        check,
                        interval
                    );

                };

            check();

        }
    );

}


/* ============================================================
   92 — END TEIL 8 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 9 / 16
   ============================================================ */


/* ============================================================
   93 — ROUTER AI CORE ACCESS
   ============================================================ */

function __haldoRouterGetAICoreSafe() {

    try {

        if (
            typeof __haldoRouterGetAICore ===
            "function"
        ) {

            return __haldoRouterGetAICore();

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return null;

}


/* ============================================================
   94 — ROUTER VOICE SERVICE ACCESS
   ============================================================ */

function __haldoRouterGetVoiceServiceSafe() {

    try {

        if (
            typeof __haldoRouterGetVoiceService ===
            "function"
        ) {

            return __haldoRouterGetVoiceService();

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return null;

}


/* ============================================================
   95 — ROUTER STORAGE ACCESS
   ============================================================ */

function __haldoRouterGetStorageSafe() {

    try {

        if (
            typeof __haldoRouterGetStorage ===
            "function"
        ) {

            return __haldoRouterGetStorage();

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return null;

}


/* ============================================================
   96 — AI ROUTE CONTEXT
   ============================================================ */

function __haldoRouterCreateAIRouteContext(
    route,
    options = {}
) {

    const normalized =
        __haldoRouterNormalizeRoute(
            route
        );

    const context =
        __haldoRouterCreateContext(
            normalized,
            options
        );

    return {

        ...context,

        ai: {

            enabled:
                options.ai !==
                false,

            source:
                options.aiSource ||
                "router",

            timestamp:
                new Date().toISOString()

        }

    };

}


/* ============================================================
   97 — AI ROUTER EVENT
   ============================================================ */

function __haldoRouterEmitAIEvent(
    eventName,
    payload = {}
) {

    const name =
        String(
            eventName ||
            ""
        ).trim();

    if (
        !name
    ) {

        return false;

    }

    __haldoRouterEmit(
        "haldo:router:ai:" + name,
        {

            ...__haldoRouterClone(
                payload
            ),

            timestamp:
                new Date().toISOString()

        }
    );

    return true;

}


/* ============================================================
   98 — AI ROUTER REQUEST
   ============================================================ */

async function __haldoRouterAIRequest(
    input,
    options = {}
) {

    const ai =
        __haldoRouterGetAICoreSafe();

    if (
        !ai
    ) {

        return {

            success:
                false,

            reason:
                "ai-core-unavailable",

            input

        };

    }

    const payload = {

        input:
            typeof input ===
            "string"
                ? input
                : __haldoRouterClone(
                    input
                ),

        route:
            __haldoRouterGetCurrentRoute(),

        appId:
            __haldoRouterGetCurrentAppId(),

        source:
            options.source ||
            "router",

        timestamp:
            new Date().toISOString()

    };


    __haldoRouterEmitAIEvent(
        "request-start",
        payload
    );


    try {

        let result;


        if (
            __haldoRouterIsFunction(
                ai.request
            )
        ) {

            result =
                await ai.request(
                    payload.input,
                    options
                );

        } else if (
            __haldoRouterIsFunction(
                ai.ask
            )
        ) {

            result =
                await ai.ask(
                    payload.input,
                    options
                );

        } else if (
            __haldoRouterIsFunction(
                ai.chat
            )
        ) {

            result =
                await ai.chat(
                    payload.input,
                    options
                );

        } else if (
            __haldoRouterIsFunction(
                ai.complete
            )
        ) {

            result =
                await ai.complete(
                    payload.input,
                    options
                );

        } else {

            return {

                success:
                    false,

                reason:
                    "ai-request-method-unavailable",

                input:
                    payload.input

            };

        }


        __haldoRouterEmitAIEvent(
            "request-complete",
            {

                ...payload,

                result:
                    __haldoRouterClone(
                        result
                    )

            }
        );


        return {

            success:
                true,

            result:
                __haldoRouterClone(
                    result
                ),

            route:
                payload.route,

            appId:
                payload.appId

        };

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            payload
        );

        __haldoRouterEmitAIEvent(
            "request-error",
            {

                ...payload,

                error:
                    exception

            }
        );


        return {

            success:
                false,

            reason:
                "ai-request-error",

            error:
                exception

        };

    }

}


/* ============================================================
   99 — AI ROUTE NAVIGATION
   ============================================================ */

async function __haldoRouterNavigateWithAI(
    route,
    aiInput,
    options = {}
) {

    const routeResult =
        await __haldoRouterNavigate(
            route,
            {

                ...options,

                source:
                    options.source ||
                    "ai-router"

            }
        );

    if (
        !routeResult ||
        !routeResult.success
    ) {

        return {

            success:
                false,

            route:
                routeResult,

            ai:
                null

        };

    }

    const aiResult =
        await __haldoRouterAIRequest(
            aiInput,
            {

                ...options,

                source:
                    "ai-navigation"

            }
        );

    return {

        success:
            !!(
                routeResult.success &&
                aiResult.success
            ),

        route:
            routeResult,

        ai:
            aiResult

    };

}


/* ============================================================
   100 — AI APP COMMAND
   ============================================================ */

async function __haldoRouterExecuteAIAppCommand(
    appId,
    command,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return {

            success:
                false,

            reason:
                "invalid-app-id"

        };

    }

    const ai =
        __haldoRouterGetAICoreSafe();

    const appManager =
        __haldoRouterGetAppManager();

    const payload = {

        appId:
            id,

        command:
            typeof command ===
            "string"
                ? command
                : __haldoRouterClone(
                    command
                ),

        route:
            __haldoRouterGetCurrentRoute(),

        source:
            options.source ||
            "ai-app-command",

        timestamp:
            new Date().toISOString()

    };


    __haldoRouterEmitAIEvent(
        "app-command-start",
        payload
    );


    try {

        let result;


        if (
            appManager &&
            __haldoRouterIsFunction(
                appManager.command
            )
        ) {

            result =
                await appManager.command(
                    id,
                    payload.command,
                    options
                );

        } else if (
            appManager &&
            __haldoRouterIsFunction(
                appManager.execute
            )
        ) {

            result =
                await appManager.execute(
                    id,
                    payload.command,
                    options
                );

        } else if (
            ai &&
            __haldoRouterIsFunction(
                ai.executeAppCommand
            )
        ) {

            result =
                await ai.executeAppCommand(
                    payload
                );

        } else {

            return {

                success:
                    false,

                reason:
                    "app-command-method-unavailable",

                appId:
                    id

            };

        }


        __haldoRouterEmitAIEvent(
            "app-command-complete",
            {

                ...payload,

                result:
                    __haldoRouterClone(
                        result
                    )

            }
        );


        return {

            success:
                true,

            appId:
                id,

            result:
                __haldoRouterClone(
                    result
                )

        };

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            payload
        );

        __haldoRouterEmitAIEvent(
            "app-command-error",
            {

                ...payload,

                error:
                    exception

            }
        );


        return {

            success:
                false,

            reason:
                "app-command-error",

            appId:
                id,

            error:
                exception

        };

    }

}


/* ============================================================
   101 — AI ROUTER STATE
   ============================================================ */

function __haldoRouterGetAIState() {

    const ai =
        __haldoRouterGetAICoreSafe();

    if (
        !ai
    ) {

        return {

            available:
                false,

            state:
                "unavailable"

        };

    }

    try {

        if (
            __haldoRouterIsFunction(
                ai.getState
            )
        ) {

            return {

                available:
                    true,

                state:
                    __haldoRouterClone(
                        ai.getState()
                    )

            };

        }

        if (
            ai.state !==
            undefined
        ) {

            return {

                available:
                    true,

                state:
                    __haldoRouterClone(
                        ai.state
                    )

            };

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return {

        available:
            true,

        state:
            "ready"

    };

}


/* ============================================================
   102 — END TEIL 9 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 10 / 16
   ============================================================ */


/* ============================================================
   103 — VOICE ROUTER REQUEST
   ============================================================ */

async function __haldoRouterVoiceRequest(
    input,
    options = {}
) {

    const voice =
        __haldoRouterGetVoiceServiceSafe();

    if (
        !voice
    ) {

        return {

            success:
                false,

            reason:
                "voice-service-unavailable",

            input

        };

    }

    const payload = {

        input:
            typeof input ===
            "string"
                ? input
                : __haldoRouterClone(
                    input
                ),

        route:
            __haldoRouterGetCurrentRoute(),

        appId:
            __haldoRouterGetCurrentAppId(),

        source:
            options.source ||
            "router",

        timestamp:
            new Date().toISOString()

    };


    __haldoRouterEmitAIEvent(
        "voice-request-start",
        payload
    );


    try {

        let result;


        if (
            __haldoRouterIsFunction(
                voice.request
            )
        ) {

            result =
                await voice.request(
                    payload.input,
                    options
                );

        } else if (
            __haldoRouterIsFunction(
                voice.speak
            )
        ) {

            result =
                await voice.speak(
                    payload.input,
                    options
                );

        } else if (
            __haldoRouterIsFunction(
                voice.say
            )
        ) {

            result =
                await voice.say(
                    payload.input,
                    options
                );

        } else if (
            __haldoRouterIsFunction(
                voice.play
            )
        ) {

            result =
                await voice.play(
                    payload.input,
                    options
                );

        } else {

            return {

                success:
                    false,

                reason:
                    "voice-request-method-unavailable"

            };

        }


        __haldoRouterEmitAIEvent(
            "voice-request-complete",
            {

                ...payload,

                result:
                    __haldoRouterClone(
                        result
                    )

            }
        );


        return {

            success:
                true,

            result:
                __haldoRouterClone(
                    result
                )

        };

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            payload
        );

        __haldoRouterEmitAIEvent(
            "voice-request-error",
            {

                ...payload,

                error:
                    exception

            }
        );


        return {

            success:
                false,

            reason:
                "voice-request-error",

            error:
                exception

        };

    }

}


/* ============================================================
   104 — VOICE ROUTER LISTEN
   ============================================================ */

async function __haldoRouterVoiceListen(
    options = {}
) {

    const voice =
        __haldoRouterGetVoiceServiceSafe();

    if (
        !voice
    ) {

        return {

            success:
                false,

            reason:
                "voice-service-unavailable"

        };

    }

    try {

        let result;


        if (
            __haldoRouterIsFunction(
                voice.listen
            )
        ) {

            result =
                await voice.listen(
                    options
                );

        } else if (
            __haldoRouterIsFunction(
                voice.startListening
            )
        ) {

            result =
                await voice.startListening(
                    options
                );

        } else if (
            __haldoRouterIsFunction(
                voice.startRecognition
            )
        ) {

            result =
                await voice.startRecognition(
                    options
                );

        } else {

            return {

                success:
                    false,

                reason:
                    "voice-listen-method-unavailable"

            };

        }


        __haldoRouterEmitAIEvent(
            "voice-listening-started",
            {

                result:
                    __haldoRouterClone(
                        result
                    )

            }
        );


        return {

            success:
                true,

            result:
                __haldoRouterClone(
                    result
                )

        };

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

        return {

            success:
                false,

            reason:
                "voice-listen-error",

            error:
                exception

        };

    }

}


/* ============================================================
   105 — VOICE ROUTER STOP LISTENING
   ============================================================ */

async function __haldoRouterVoiceStopListening(
    options = {}
) {

    const voice =
        __haldoRouterGetVoiceServiceSafe();

    if (
        !voice
    ) {

        return false;

    }

    try {

        if (
            __haldoRouterIsFunction(
                voice.stopListening
            )
        ) {

            return (
                await voice.stopListening(
                    options
                )
            ) !== false;

        }

        if (
            __haldoRouterIsFunction(
                voice.stopRecognition
            )
        ) {

            return (
                await voice.stopRecognition(
                    options
                )
            ) !== false;

        }

        if (
            __haldoRouterIsFunction(
                voice.stop
            )
        ) {

            return (
                await voice.stop(
                    options
                )
            ) !== false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return false;

}


/* ============================================================
   106 — VOICE ROUTER MUTE
   ============================================================ */

async function __haldoRouterVoiceMute(
    options = {}
) {

    const voice =
        __haldoRouterGetVoiceServiceSafe();

    if (
        !voice
    ) {

        return false;

    }

    try {

        if (
            __haldoRouterIsFunction(
                voice.mute
            )
        ) {

            return (
                await voice.mute(
                    options
                )
            ) !== false;

        }

        if (
            __haldoRouterIsFunction(
                voice.setMuted
            )
        ) {

            return (
                await voice.setMuted(
                    true,
                    options
                )
            ) !== false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return false;

}


/* ============================================================
   107 — VOICE ROUTER UNMUTE
   ============================================================ */

async function __haldoRouterVoiceUnmute(
    options = {}
) {

    const voice =
        __haldoRouterGetVoiceServiceSafe();

    if (
        !voice
    ) {

        return false;

    }

    try {

        if (
            __haldoRouterIsFunction(
                voice.unmute
            )
        ) {

            return (
                await voice.unmute(
                    options
                )
            ) !== false;

        }

        if (
            __haldoRouterIsFunction(
                voice.setMuted
            )
        ) {

            return (
                await voice.setMuted(
                    false,
                    options
                )
            ) !== false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return false;

}


/* ============================================================
   108 — VOICE ROUTER STATE
   ============================================================ */

function __haldoRouterGetVoiceState() {

    const voice =
        __haldoRouterGetVoiceServiceSafe();

    if (
        !voice
    ) {

        return {

            available:
                false,

            state:
                "unavailable"

        };

    }

    try {

        if (
            __haldoRouterIsFunction(
                voice.getState
            )
        ) {

            return {

                available:
                    true,

                state:
                    __haldoRouterClone(
                        voice.getState()
                    )

            };

        }

        if (
            voice.state !==
            undefined
        ) {

            return {

                available:
                    true,

                state:
                    __haldoRouterClone(
                        voice.state
                    )

            };

        }

        return {

            available:
                true,

            state:
                "ready"

        };

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

        return {

            available:
                true,

            state:
                "error"

        };

    }

}


/* ============================================================
   109 — ROUTER STORAGE READ
   ============================================================ */

async function __haldoRouterStorageGet(
    key,
    fallback = null
) {

    const storage =
        __haldoRouterGetStorageSafe();

    const normalizedKey =
        String(
            key ||
            ""
        ).trim();

    if (
        !storage ||
        !normalizedKey
    ) {

        return fallback;

    }

    try {

        if (
            __haldoRouterIsFunction(
                storage.get
            )
        ) {

            const result =
                await storage.get(
                    normalizedKey
                );

            return result ===
                undefined
                    ? fallback
                    : result;

        }

        if (
            __haldoRouterIsFunction(
                storage.read
            )
        ) {

            const result =
                await storage.read(
                    normalizedKey
                );

            return result ===
                undefined
                    ? fallback
                    : result;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {

                key:
                    normalizedKey

            }
        );

    }

    return fallback;

}


/* ============================================================
   110 — ROUTER STORAGE WRITE
   ============================================================ */

async function __haldoRouterStorageSet(
    key,
    value
) {

    const storage =
        __haldoRouterGetStorageSafe();

    const normalizedKey =
        String(
            key ||
            ""
        ).trim();

    if (
        !storage ||
        !normalizedKey
    ) {

        return false;

    }

    try {

        if (
            __haldoRouterIsFunction(
                storage.set
            )
        ) {

            const result =
                await storage.set(
                    normalizedKey,
                    value
                );

            return result !==
                false;

        }

        if (
            __haldoRouterIsFunction(
                storage.write
            )
        ) {

            const result =
                await storage.write(
                    normalizedKey,
                    value
                );

            return result !==
                false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {

                key:
                    normalizedKey,

                value:
                    __haldoRouterClone(
                        value
                    )

            }
        );

    }

    return false;

}


/* ============================================================
   111 — ROUTER STORAGE REMOVE
   ============================================================ */

async function __haldoRouterStorageRemove(
    key
) {

    const storage =
        __haldoRouterGetStorageSafe();

    const normalizedKey =
        String(
            key ||
            ""
        ).trim();

    if (
        !storage ||
        !normalizedKey
    ) {

        return false;

    }

    try {

        if (
            __haldoRouterIsFunction(
                storage.remove
            )
        ) {

            const result =
                await storage.remove(
                    normalizedKey
                );

            return result !==
                false;

        }

        if (
            __haldoRouterIsFunction(
                storage.delete
            )
        ) {

            const result =
                await storage.delete(
                    normalizedKey
                );

            return result !==
                false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {

                key:
                    normalizedKey

            }
        );

    }

    return false;

}


/* ============================================================
   112 — END TEIL 10 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 11 / 16
   ============================================================ */


/* ============================================================
   113 — ROUTER PERSIST CURRENT STATE
   ============================================================ */

async function __haldoRouterPersistState(
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const key =
        options.key ||
        "haldo.router.state";

    const snapshot = {

        currentRoute:
            state.currentRoute ||
            "/",

        previousRoute:
            state.previousRoute ||
            null,

        currentAppId:
            state.currentAppId ||
            null,

        previousAppId:
            state.previousAppId ||
            null,

        updatedAt:
            state.updatedAt ||
            __haldoRouterNow(),

        statistics:
            __haldoRouterClone(
                state.statistics
            )

    };

    const written =
        await __haldoRouterStorageSet(
            key,
            snapshot
        );

    if (
        written
    ) {

        __haldoRouterEmit(
            "haldo:router:state-persisted",
            {

                key,

                state:
                    __haldoRouterClone(
                        snapshot
                    )

            }
        );

    }

    return written;

}


/* ============================================================
   114 — ROUTER RESTORE PERSISTED STATE
   ============================================================ */

async function __haldoRouterRestoreState(
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const key =
        options.key ||
        "haldo.router.state";

    const stored =
        await __haldoRouterStorageGet(
            key,
            null
        );

    if (
        !stored ||
        typeof stored !==
        "object"
    ) {

        return false;

    }

    try {

        if (
            stored.currentRoute
        ) {

            state.currentRoute =
                __haldoRouterNormalizeRoute(
                    stored.currentRoute
                );

        }

        if (
            stored.previousRoute
        ) {

            state.previousRoute =
                __haldoRouterNormalizeRoute(
                    stored.previousRoute
                );

        }

        state.currentAppId =
            __haldoRouterNormalizeAppId(
                stored.currentAppId
            );

        state.previousAppId =
            __haldoRouterNormalizeAppId(
                stored.previousAppId
            );

        state.updatedAt =
            stored.updatedAt ||
            __haldoRouterNow();

        if (
            stored.statistics &&
            typeof stored.statistics ===
            "object"
        ) {

            state.statistics =
                {

                    ...state.statistics,

                    ...stored.statistics

                };

        }

        __haldoRouterEmit(
            "haldo:router:state-restored",
            {

                key,

                state:
                    __haldoRouterClone(
                        stored
                    )

            }
        );

        return true;

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                key
            }
        );

        return false;

    }

}


/* ============================================================
   115 — ROUTER SAVE HISTORY
   ============================================================ */

async function __haldoRouterPersistHistory(
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const key =
        options.key ||
        "haldo.router.history";

    const history =
        Array.isArray(
            state.history
        )
            ? state.history
            : [];

    const value =
        __haldoRouterClone(
            history
        );

    const result =
        await __haldoRouterStorageSet(
            key,
            value
        );

    if (
        result
    ) {

        __haldoRouterEmit(
            "haldo:router:history-persisted",
            {

                key,

                count:
                    history.length

            }
        );

    }

    return result;

}


/* ============================================================
   116 — ROUTER RESTORE HISTORY
   ============================================================ */

async function __haldoRouterRestoreHistory(
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const key =
        options.key ||
        "haldo.router.history";

    const stored =
        await __haldoRouterStorageGet(
            key,
            []
        );

    if (
        !Array.isArray(
            stored
        )
    ) {

        return false;

    }

    try {

        state.history =
            stored
                .filter(
                    entry =>
                        entry &&
                        typeof entry ===
                        "object" &&
                        entry.route
                )
                .map(
                    entry =>
                        ({

                            ...__haldoRouterClone(
                                entry
                            ),

                            route:
                                __haldoRouterNormalizeRoute(
                                    entry.route
                                ),

                            timestamp:
                                entry.timestamp ||
                                new Date().toISOString()

                        })
                );

        __haldoRouterEmit(
            "haldo:router:history-restored",
            {

                key,

                count:
                    state.history.length

            }
        );

        return true;

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                key
            }
        );

        return false;

    }

}


/* ============================================================
   117 — ROUTER CLEAR HISTORY
   ============================================================ */

async function __haldoRouterClearHistory(
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const previousCount =
        Array.isArray(
            state.history
        )
            ? state.history.length
            : 0;

    state.history =
        [];

    state.updatedAt =
        __haldoRouterNow();

    if (
        options.persist !==
        false
    ) {

        await __haldoRouterPersistHistory(
            options
        );

    }

    __haldoRouterEmit(
        "haldo:router:history-cleared",
        {

            previousCount

        }
    );

    return true;

}


/* ============================================================
   118 — ROUTER HISTORY SNAPSHOT
   ============================================================ */

function __haldoRouterGetHistory(
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    let history =
        Array.isArray(
            state.history
        )
            ? state.history
            : [];

    if (
        Number.isFinite(
            options.limit
        )
    ) {

        const limit =
            Math.max(
                0,
                Math.floor(
                    options.limit
                )
            );

        history =
            history.slice(
                Math.max(
                    0,
                    history.length -
                    limit
                )
            );

    }

    return __haldoRouterClone(
        history
    );

}


/* ============================================================
   119 — ROUTER FIND HISTORY ENTRY
   ============================================================ */

function __haldoRouterFindHistoryEntry(
    route
) {

    const normalized =
        __haldoRouterNormalizeRoute(
            route
        );

    const history =
        __HALDO_ROUTER_EXTENSION_STATE__.history;

    if (
        !Array.isArray(
            history
        )
    ) {

        return null;

    }

    for (
        let index =
            history.length -
            1;

        index >=
        0;

        index -=
        1
    ) {

        const entry =
            history[index];

        if (
            entry &&
            __haldoRouterNormalizeRoute(
                entry.route
            ) ===
            normalized
        ) {

            return {

                index,

                entry:
                    __haldoRouterClone(
                        entry
                    )

            };

        }

    }

    return null;

}


/* ============================================================
   120 — ROUTER HISTORY NAVIGATION
   ============================================================ */

async function __haldoRouterNavigateHistoryEntry(
    index,
    options = {}
) {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    if (
        !Array.isArray(
            state.history
        )
    ) {

        return {

            success:
                false,

            reason:
                "history-unavailable"

        };

    }

    const numericIndex =
        Number(
            index
        );

    if (
        !Number.isInteger(
            numericIndex
        ) ||
        numericIndex <
        0 ||
        numericIndex >=
        state.history.length
    ) {

        return {

            success:
                false,

            reason:
                "invalid-history-index"

        };

    }

    const entry =
        state.history[
            numericIndex
        ];

    if (
        !entry ||
        !entry.route
    ) {

        return {

            success:
                false,

            reason:
                "invalid-history-entry"

        };

    }

    return __haldoRouterNavigate(
        entry.route,
        {

            ...options,

            source:
                options.source ||
                "history-entry",

            browserHistory:
                false,

            replace:
                true

        }
    );

}


/* ============================================================
   121 — ROUTER ROUTE EXISTS
   ============================================================ */

function __haldoRouterRouteExists(
    route
) {

    const normalized =
        __haldoRouterNormalizeRoute(
            route
        );

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    if (
        state.routes &&
        state.routes.has(
            normalized
        )
    ) {

        return true;

    }

    const matches =
        __haldoRouterMatchRoute(
            normalized
        );

    return Array.isArray(
        matches
    ) &&
    matches.length >
    0;

}


/* ============================================================
   122 — ROUTER ROUTE INFORMATION
   ============================================================ */

function __haldoRouterGetRouteInfo(
    route
) {

    const normalized =
        __haldoRouterNormalizeRoute(
            route
        );

    const context =
        __haldoRouterCreateContext(
            normalized,
            {}
        );

    const matches =
        __haldoRouterMatchRoute(
            context.pathname
        );

    const match =
        Array.isArray(
            matches
        ) &&
        matches.length
            ? matches[0]
            : null;

    return {

        route:
            normalized,

        exists:
            !!match,

        pathname:
            context.pathname,

        query:
            context.query,

        queryObject:
            __haldoRouterClone(
                context.queryObject
            ),

        hash:
            context.hash,

        parameters:
            __haldoRouterClone(
                context.parameters
            ),

        appId:
            __haldoRouterNormalizeAppId(
                context.appId
            ),

        definition:
            match &&
            match.definition
                ? __haldoRouterClone(
                    {
                        ...match.definition,
                        handler:
                            undefined
                    }
                )
                : null

    };

}


/* ============================================================
   123 — ROUTER RESOLVE ROUTE
   ============================================================ */

function __haldoRouterResolveRoute(
    route,
    options = {}
) {

    const normalized =
        __haldoRouterNormalizeRoute(
            route
        );

    let resolved =
        normalized;

    try {

        resolved =
            __haldoRouterResolveAlias(
                normalized
            );

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {
                route:
                    normalized
            }
        );

    }

    if (
        options.ensureLeadingSlash !==
        false
    ) {

        resolved =
            __haldoRouterNormalizeRoute(
                resolved
            );

    }

    return resolved;

}


/* ============================================================
   124 — ROUTER ROUTE PARAMETER BUILD
   ============================================================ */

function __haldoRouterBuildRoute(
    route,
    parameters = {},
    options = {}
) {

    let template =
        __haldoRouterNormalizeRoute(
            route
        );

    const source =
        parameters &&
        typeof parameters ===
        "object"
            ? parameters
            : {};

    for (
        const [
            key,
            value
        ]
        of Object.entries(
            source
        )
    ) {

        const encoded =
            encodeURIComponent(
                String(
                    value
                )
            );

        const token =
            ":" +
            key;

        template =
            template.replace(
                new RegExp(
                    token +
                    "(?=/|$)",
                    "g"
                ),
                encoded
            );

    }

    if (
        options.query &&
        typeof options.query ===
        "object"
    ) {

        const queryEntries =
            Object.entries(
                options.query
            );

        if (
            queryEntries.length
        ) {

            const queryString =
                queryEntries
                    .filter(
                        ([, value]) =>
                            value !==
                            undefined &&
                            value !==
                            null
                    )
                    .map(
                        ([key, value]) =>
                            encodeURIComponent(
                                key
                            ) +
                            "=" +
                            encodeURIComponent(
                                String(
                                    value
                                )
                            )
                    )
                    .join(
                        "&"
                    );

            if (
                queryString
            ) {

                template +=
                    template.includes("?")
                        ? "&" +
                          queryString
                        : "?" +
                          queryString;

            }

        }

    }

    if (
        options.hash
    ) {

        const hash =
            String(
                options.hash
            ).replace(
                /^#/,
                ""
            );

        if (
            hash
        ) {

            template +=
                "#" +
                hash;

        }

    }

    return __haldoRouterNormalizeRoute(
        template
    );

}


/* ============================================================
   125 — ROUTER APP ROUTE BUILD
   ============================================================ */

function __haldoRouterBuildAppRoute(
    appId,
    route = "/",
    parameters = {},
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    let target =
        __haldoRouterBuildRoute(
            route,
            parameters,
            options
        );

    if (
        id &&
        options.prefixApp !==
        false
    ) {

        const prefix =
            "/" +
            id;

        if (
            target ===
            "/" ||
            target ===
            ""
        ) {

            target =
                prefix;

        } else if (
            !target.startsWith(
                prefix +
                "/"
            ) &&
            target !==
            prefix
        ) {

            target =
                prefix +
                target;

        }

    }

    return __haldoRouterNormalizeRoute(
        target
    );

}


/* ============================================================
   126 — ROUTER MATCH APP
   ============================================================ */

function __haldoRouterMatchApp(
    appId,
    route = null
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return [];

    }

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    const results = [];

    if (
        state.routes &&
        typeof state.routes.entries ===
        "function"
    ) {

        for (
            const [
                registeredRoute,
                definition
            ]
            of state.routes.entries()
        ) {

            if (
                definition &&
                __haldoRouterNormalizeAppId(
                    definition.appId
                ) ===
                id
            ) {

                if (
                    route ===
                    null
                ) {

                    results.push(
                        {

                            route:
                                registeredRoute,

                            definition:
                                __haldoRouterClone(
                                    {
                                        ...definition,
                                        handler:
                                            undefined
                                    }
                                )

                        }
                    );

                    continue;

                }

                const requested =
                    __haldoRouterNormalizeRoute(
                        route
                    );

                const matches =
                    __haldoRouterMatchRoute(
                        requested
                    );

                for (
                    const match
                    of matches
                ) {

                    if (
                        match &&
                        match.definition &&
                        __haldoRouterNormalizeAppId(
                            match.definition.appId
                        ) ===
                        id
                    ) {

                        results.push(
                            __haldoRouterClone(
                                match
                            )
                        );

                    }

                }

            }

        }

    }

    return results;

}


/* ============================================================
   127 — ROUTER APP ACTIVE CHECK
   ============================================================ */

function __haldoRouterIsAppActive(
    appId
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return false;

    }

    return (
        __haldoRouterGetCurrentAppId() ===
        id
    );

}


/* ============================================================
   128 — ROUTER APP ROUTE NAVIGATION
   ============================================================ */

async function __haldoRouterNavigateApp(
    appId,
    route = "/",
    parameters = {},
    options = {}
) {

    const target =
        __haldoRouterBuildAppRoute(
            appId,
            route,
            parameters,
            options
        );

    return __haldoRouterNavigate(
        target,
        {

            ...options,

            appId:
                __haldoRouterNormalizeAppId(
                    appId
                ),

            source:
                options.source ||
                "app-navigation"

        }
    );

}


/* ============================================================
   129 — END TEIL 11 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 12 / 16
   ============================================================ */


/* ============================================================
   130 — ROUTER APP COMMAND DISPATCH
   ============================================================ */

async function __haldoRouterDispatchAppCommand(
    appId,
    command,
    payload = {},
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return {

            success:
                false,

            reason:
                "invalid-app-id"

        };

    }

    const manager =
        __haldoRouterGetAppManager();

    const commandPayload = {

        appId:
            id,

        command:
            typeof command ===
            "string"
                ? command
                : __haldoRouterClone(
                    command
                ),

        payload:
            __haldoRouterClone(
                payload
            ),

        route:
            __haldoRouterGetCurrentRoute(),

        source:
            options.source ||
            "router",

        timestamp:
            new Date().toISOString()

    };

    try {

        let result;


        if (
            manager &&
            __haldoRouterIsFunction(
                manager.dispatch
            )
        ) {

            result =
                await manager.dispatch(
                    id,
                    commandPayload.command,
                    commandPayload.payload,
                    options
                );

        } else if (
            manager &&
            __haldoRouterIsFunction(
                manager.command
            )
        ) {

            result =
                await manager.command(
                    id,
                    commandPayload.command,
                    {
                        ...commandPayload.payload,
                        ...options
                    }
                );

        } else if (
            manager &&
            __haldoRouterIsFunction(
                manager.execute
            )
        ) {

            result =
                await manager.execute(
                    id,
                    commandPayload.command,
                    {
                        ...commandPayload.payload,
                        ...options
                    }
                );

        } else {

            return {

                success:
                    false,

                reason:
                    "app-command-dispatch-unavailable",

                appId:
                    id

            };

        }


        __haldoRouterNotifyAppNavigation(
            id,
            commandPayload.route,
            {

                source:
                    "app-command"

            }
        );


        return {

            success:
                result !== false,

            appId:
                id,

            command:
                commandPayload.command,

            result:
                __haldoRouterClone(
                    result
                )

        };

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            commandPayload
        );

        return {

            success:
                false,

            reason:
                "app-command-dispatch-error",

            appId:
                id,

            error:
                exception

        };

    }

}


/* ============================================================
   131 — ROUTER APP LIFECYCLE
   ============================================================ */

async function __haldoRouterAppLifecycle(
    appId,
    action,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    const normalizedAction =
        String(
            action ||
            ""
        )
            .trim()
            .toLowerCase();

    if (
        !id ||
        !normalizedAction
    ) {

        return {

            success:
                false,

            reason:
                "invalid-lifecycle-request"

        };

    }

    const manager =
        __haldoRouterGetAppManager();

    if (
        !manager
    ) {

        return {

            success:
                false,

            reason:
                "app-manager-unavailable",

            appId:
                id

        };

    }

    const methodMap = {

        open:
            [
                "open",
                "launch",
                "start"
            ],

        launch:
            [
                "launch",
                "open",
                "start"
            ],

        start:
            [
                "start",
                "launch",
                "open"
            ],

        activate:
            [
                "activate",
                "focus",
                "resume"
            ],

        focus:
            [
                "focus",
                "activate"
            ],

        resume:
            [
                "resume",
                "activate",
                "start"
            ],

        stop:
            [
                "stop",
                "close"
            ],

        close:
            [
                "close",
                "stop"
            ],

        suspend:
            [
                "suspend",
                "pause"
            ],

        pause:
            [
                "pause",
                "suspend"
            ]

    };

    const candidates =
        methodMap[
            normalizedAction
        ] ||
        [
            normalizedAction
        ];

    try {

        for (
            const methodName
            of candidates
        ) {

            if (
                __haldoRouterIsFunction(
                    manager[
                        methodName
                    ]
                )
            ) {

                const result =
                    await manager[
                        methodName
                    ](
                        id,
                        options
                    );

                __haldoRouterEmit(
                    "haldo:router:app-lifecycle",
                    {

                        appId:
                            id,

                        action:
                            normalizedAction,

                        method:
                            methodName,

                        success:
                            result !== false,

                        result:
                            __haldoRouterClone(
                                result
                            )

                    }
                );

                return {

                    success:
                        result !== false,

                    appId:
                        id,

                    action:
                        normalizedAction,

                    result:
                        __haldoRouterClone(
                            result
                        )

                };

            }

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {

                appId:
                    id,

                action:
                    normalizedAction

            }
        );

        return {

            success:
                false,

            reason:
                "app-lifecycle-error",

            appId:
                id,

            action:
                normalizedAction,

            error:
                exception

        };

    }

    return {

        success:
            false,

        reason:
            "lifecycle-method-unavailable",

        appId:
            id,

        action:
            normalizedAction

    };

}


/* ============================================================
   132 — ROUTER APP OPEN
   ============================================================ */

async function __haldoRouterLaunchApp(
    appId,
    options = {}
) {

    return __haldoRouterAppLifecycle(
        appId,
        "launch",
        options
    );

}


/* ============================================================
   133 — ROUTER APP START
   ============================================================ */

async function __haldoRouterStartApp(
    appId,
    options = {}
) {

    return __haldoRouterAppLifecycle(
        appId,
        "start",
        options
    );

}


/* ============================================================
   134 — ROUTER APP ACTIVATE
   ============================================================ */

async function __haldoRouterActivateAppSafe(
    appId,
    options = {}
) {

    return __haldoRouterAppLifecycle(
        appId,
        "activate",
        options
    );

}


/* ============================================================
   135 — ROUTER APP RESUME
   ============================================================ */

async function __haldoRouterResumeApp(
    appId,
    options = {}
) {

    return __haldoRouterAppLifecycle(
        appId,
        "resume",
        options
    );

}


/* ============================================================
   136 — ROUTER APP SUSPEND
   ============================================================ */

async function __haldoRouterSuspendApp(
    appId,
    options = {}
) {

    return __haldoRouterAppLifecycle(
        appId,
        "suspend",
        options
    );

}


/* ============================================================
   137 — ROUTER APP STOP
   ============================================================ */

async function __haldoRouterStopApp(
    appId,
    options = {}
) {

    return __haldoRouterAppLifecycle(
        appId,
        "stop",
        options
    );

}


/* ============================================================
   138 — ROUTER APP CLOSE
   ============================================================ */

async function __haldoRouterCloseAppSafe(
    appId,
    options = {}
) {

    return __haldoRouterAppLifecycle(
        appId,
        "close",
        options
    );

}


/* ============================================================
   139 — ROUTER APP FOCUS
   ============================================================ */

async function __haldoRouterFocusApp(
    appId,
    options = {}
) {

    const windowResult =
        await __haldoRouterFocusAppWindow(
            appId,
            options
        );

    if (
        windowResult
    ) {

        return {

            success:
                true,

            appId:
                __haldoRouterNormalizeAppId(
                    appId
                ),

            source:
                "window-manager"

        };

    }

    return __haldoRouterAppLifecycle(
        appId,
        "focus",
        options
    );

}


/* ============================================================
   140 — ROUTER APP OPEN + FOCUS
   ============================================================ */

async function __haldoRouterOpenAndFocusApp(
    appId,
    route = "/",
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return {

            success:
                false,

            reason:
                "invalid-app-id"

        };

    }

    const lifecycle =
        await __haldoRouterLaunchApp(
            id,
            options
        );

    if (
        !lifecycle.success &&
        options.allowRouteOnly !==
        true
    ) {

        return lifecycle;

    }

    const windowResult =
        await __haldoRouterOpenAppWindow(
            id,
            route,
            options
        );

    const focusResult =
        await __haldoRouterFocusAppWindow(
            id,
            options
        );

    const navigation =
        await __haldoRouterNavigate(
            route,
            {

                ...options,

                appId:
                    id,

                source:
                    options.source ||
                    "open-and-focus"

            }
        );

    return {

        success:
            !!(
                (
                    lifecycle.success ||
                    options.allowRouteOnly ===
                    true
                ) &&
                (
                    windowResult.success ||
                    focusResult
                ) &&
                navigation.success
            ),

        appId:
            id,

        lifecycle,

        window:
            windowResult,

        focus:
            focusResult,

        navigation

    };

}


/* ============================================================
   141 — ROUTER WINDOW TOGGLE
   ============================================================ */

async function __haldoRouterToggleAppWindow(
    appId,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    const currentState =
        __haldoRouterGetAppWindowState(
            id
        );

    if (
        currentState &&
        (
            currentState.minimized ===
            true ||
            currentState.state ===
            "minimized"
        )
    ) {

        const restored =
            await __haldoRouterRestoreAppWindow(
                id,
                options
            );

        const focused =
            await __haldoRouterFocusAppWindow(
                id,
                options
            );

        return {

            success:
                restored &&
                focused,

            appId:
                id,

            action:
                "restore"

        };

    }

    const minimized =
        await __haldoRouterMinimizeAppWindow(
            id,
            options
        );

    return {

        success:
            minimized,

        appId:
            id,

        action:
            "minimize"

    };

}


/* ============================================================
   142 — ROUTER WINDOW MAXIMIZE OR RESTORE
   ============================================================ */

async function __haldoRouterMaximizeOrRestoreApp(
    appId,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    const currentState =
        __haldoRouterGetAppWindowState(
            id
        );

    if (
        currentState &&
        (
            currentState.maximized ===
            true ||
            currentState.state ===
            "maximized"
        )
    ) {

        const restored =
            await __haldoRouterRestoreAppWindow(
                id,
                options
            );

        return {

            success:
                restored,

            appId:
                id,

            action:
                "restore"

        };

    }

    const maximized =
        await __haldoRouterMaximizeAppWindow(
            id,
            options
        );

    return {

        success:
            maximized,

        appId:
            id,

        action:
            "maximize"

    };

}


/* ============================================================
   143 — ROUTER WINDOW CLOSE + ROUTE
   ============================================================ */

async function __haldoRouterCloseAppAndNavigate(
    appId,
    route = "/",
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    const closed =
        await __haldoRouterCloseAppWindow(
            id,
            options
        );

    const navigation =
        await __haldoRouterNavigate(
            route,
            {

                ...options,

                source:
                    options.source ||
                    "close-app-navigate",

                browserHistory:
                    options.browserHistory !==
                    false

            }
        );

    return {

        success:
            navigation.success,

        appId:
            id,

        closed,

        navigation

    };

}


/* ============================================================
   144 — END TEIL 12 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 13 / 16
   ============================================================ */


/* ============================================================
   145 — ROUTER WINDOW MANAGER ACCESS
   ============================================================ */

function __haldoRouterGetWindowManagerSafe() {

    try {

        if (
            typeof __haldoRouterGetWindowManager ===
            "function"
        ) {

            return __haldoRouterGetWindowManager();

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return null;

}


/* ============================================================
   146 — ROUTER WINDOW REGISTRY
   ============================================================ */

function __haldoRouterGetWindowRegistry() {

    const state =
        __HALDO_ROUTER_EXTENSION_STATE__;

    if (
        !state.windows ||
        !(state.windows instanceof Map)
    ) {

        state.windows =
            new Map();

    }

    return state.windows;

}


/* ============================================================
   147 — WINDOW STATE NORMALIZER
   ============================================================ */

function __haldoRouterNormalizeWindowState(
    appId,
    state = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    const source =
        state &&
        typeof state ===
        "object"
            ? state
            : {};

    const normalizedState = {

        appId:
            id,

        state:
            source.state ||
            "normal",

        minimized:
            source.minimized ===
            true,

        maximized:
            source.maximized ===
            true,

        focused:
            source.focused ===
            true,

        visible:
            source.visible !==
            false,

        x:
            Number.isFinite(
                source.x
            )
                ? source.x
                : null,

        y:
            Number.isFinite(
                source.y
            )
                ? source.y
                : null,

        width:
            Number.isFinite(
                source.width
            )
                ? source.width
                : null,

        height:
            Number.isFinite(
                source.height
            )
                ? source.height
                : null,

        zIndex:
            Number.isFinite(
                source.zIndex
            )
                ? source.zIndex
                : null,

        updatedAt:
            source.updatedAt ||
            new Date().toISOString()

    };

    if (
        normalizedState.maximized
    ) {

        normalizedState.state =
            "maximized";

    } else if (
        normalizedState.minimized
    ) {

        normalizedState.state =
            "minimized";

    }

    return normalizedState;

}


/* ============================================================
   148 — GET APP WINDOW STATE
   ============================================================ */

function __haldoRouterGetAppWindowState(
    appId
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return null;

    }

    const registry =
        __haldoRouterGetWindowRegistry();

    const state =
        registry.get(
            id
        );

    if (
        !state
    ) {

        return null;

    }

    return __haldoRouterClone(
        state
    );

}


/* ============================================================
   149 — SET APP WINDOW STATE
   ============================================================ */

function __haldoRouterSetAppWindowState(
    appId,
    state = {},
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return false;

    }

    const registry =
        __haldoRouterGetWindowRegistry();

    const previous =
        registry.get(
            id
        ) ||
        null;

    const normalized =
        __haldoRouterNormalizeWindowState(
            id,
            {

                ...(previous || {}),

                ...__haldoRouterClone(
                    state
                ),

                updatedAt:
                    new Date().toISOString()

            }
        );

    registry.set(
        id,
        normalized
    );

    __haldoRouterEmit(
        "haldo:router:window-state-changed",
        {

            appId:
                id,

            previous:
                previous
                    ? __haldoRouterClone(
                        previous
                    )
                    : null,

            current:
                __haldoRouterClone(
                    normalized
                )

        }
    );

    if (
        options.persist ===
        true
    ) {

        __haldoRouterPersistWindowStates()
            .catch(
                exception =>
                    __haldoRouterRecordError(
                        exception
                    )
            );

    }

    return true;

}


/* ============================================================
   150 — WINDOW MANAGER INVOKE
   ============================================================ */

async function __haldoRouterInvokeWindowManager(
    methodNames,
    args = []
) {

    const manager =
        __haldoRouterGetWindowManagerSafe();

    if (
        !manager
    ) {

        return {

            called:
                false,

            success:
                false,

            reason:
                "window-manager-unavailable"

        };

    }

    const candidates =
        Array.isArray(
            methodNames
        )
            ? methodNames
            : [
                methodNames
            ];

    for (
        const methodName
        of candidates
    ) {

        if (
            !__haldoRouterIsFunction(
                manager[
                    methodName
                ]
            )
        ) {

            continue;

        }

        try {

            const result =
                await manager[
                    methodName
                ](
                    ...args
                );

            return {

                called:
                    true,

                success:
                    result !== false,

                method:
                    methodName,

                result:
                    __haldoRouterClone(
                        result
                    )

            };

        } catch (exception) {

            __haldoRouterRecordError(
                exception,
                {

                    method:
                        methodName,

                    args:
                        __haldoRouterClone(
                            args
                        )

                }
            );

            return {

                called:
                    true,

                success:
                    false,

                method:
                    methodName,

                reason:
                    "window-manager-method-error",

                error:
                    exception

            };

        }

    }

    return {

        called:
            false,

        success:
            false,

        reason:
            "window-manager-method-unavailable"

    };

}


/* ============================================================
   151 — OPEN APP WINDOW
   ============================================================ */

async function __haldoRouterOpenAppWindow(
    appId,
    route = "/",
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return {

            success:
                false,

            reason:
                "invalid-app-id"

        };

    }

    const targetRoute =
        __haldoRouterNormalizeRoute(
            route ||
            "/"
        );

    const result =
        await __haldoRouterInvokeWindowManager(
            [
                "openAppWindow",
                "openWindow",
                "createWindow",
                "open"
            ],
            [
                id,
                {

                    route:
                        targetRoute,

                    ...options

                }
            ]
        );

    if (
        result.success
    ) {

        __haldoRouterSetAppWindowState(
            id,
            {

                visible:
                    true,

                minimized:
                    false,

                focused:
                    false,

                state:
                    "normal"

            },
            options
        );

    }

    return {

        ...result,

        appId:
            id,

        route:
            targetRoute

    };

}


/* ============================================================
   152 — CLOSE APP WINDOW
   ============================================================ */

async function __haldoRouterCloseAppWindow(
    appId,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return false;

    }

    const result =
        await __haldoRouterInvokeWindowManager(
            [
                "closeAppWindow",
                "closeWindow",
                "destroyWindow",
                "close"
            ],
            [
                id,
                options
            ]
        );

    if (
        result.success
    ) {

        __haldoRouterSetAppWindowState(
            id,
            {

                visible:
                    false,

                focused:
                    false,

                minimized:
                    false,

                maximized:
                    false,

                state:
                    "closed"

            },
            options
        );

    }

    return result.success;

}


/* ============================================================
   153 — FOCUS APP WINDOW
   ============================================================ */

async function __haldoRouterFocusAppWindow(
    appId,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return false;

    }

    const result =
        await __haldoRouterInvokeWindowManager(
            [
                "focusAppWindow",
                "focusWindow",
                "bringToFront",
                "focus"
            ],
            [
                id,
                options
            ]
        );

    if (
        result.success
    ) {

        const registry =
            __haldoRouterGetWindowRegistry();

        for (
            const [
                registeredAppId,
                windowState
            ]
            of registry.entries()
        ) {

            if (
                registeredAppId !==
                id
            ) {

                windowState.focused =
                    false;

            }

        }

        __haldoRouterSetAppWindowState(
            id,
            {

                visible:
                    true,

                focused:
                    true,

                minimized:
                    false,

                state:
                    "normal"

            },
            options
        );

    }

    return result.success;

}


/* ============================================================
   154 — MINIMIZE APP WINDOW
   ============================================================ */

async function __haldoRouterMinimizeAppWindow(
    appId,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return false;

    }

    const result =
        await __haldoRouterInvokeWindowManager(
            [
                "minimizeAppWindow",
                "minimizeWindow",
                "minimize"
            ],
            [
                id,
                options
            ]
        );

    if (
        result.success
    ) {

        __haldoRouterSetAppWindowState(
            id,
            {

                minimized:
                    true,

                maximized:
                    false,

                focused:
                    false,

                visible:
                    false,

                state:
                    "minimized"

            },
            options
        );

    }

    return result.success;

}


/* ============================================================
   155 — MAXIMIZE APP WINDOW
   ============================================================ */

async function __haldoRouterMaximizeAppWindow(
    appId,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return false;

    }

    const result =
        await __haldoRouterInvokeWindowManager(
            [
                "maximizeAppWindow",
                "maximizeWindow",
                "maximize"
            ],
            [
                id,
                options
            ]
        );

    if (
        result.success
    ) {

        __haldoRouterSetAppWindowState(
            id,
            {

                maximized:
                    true,

                minimized:
                    false,

                focused:
                    true,

                visible:
                    true,

                state:
                    "maximized"

            },
            options
        );

    }

    return result.success;

}


/* ============================================================
   156 — RESTORE APP WINDOW
   ============================================================ */

async function __haldoRouterRestoreAppWindow(
    appId,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return false;

    }

    const result =
        await __haldoRouterInvokeWindowManager(
            [
                "restoreAppWindow",
                "restoreWindow",
                "restore"
            ],
            [
                id,
                options
            ]
        );

    if (
        result.success
    ) {

        __haldoRouterSetAppWindowState(
            id,
            {

                minimized:
                    false,

                maximized:
                    false,

                focused:
                    true,

                visible:
                    true,

                state:
                    "normal"

            },
            options
        );

    }

    return result.success;

}


/* ============================================================
   157 — MOVE APP WINDOW
   ============================================================ */

async function __haldoRouterMoveAppWindow(
    appId,
    x,
    y,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return {

            success:
                false,

            reason:
                "invalid-app-id"

        };

    }

    const result =
        await __haldoRouterInvokeWindowManager(
            [
                "moveAppWindow",
                "moveWindow",
                "setPosition",
                "move"
            ],
            [
                id,
                x,
                y,
                options
            ]
        );

    if (
        result.success
    ) {

        __haldoRouterSetAppWindowState(
            id,
            {

                x:
                    Number.isFinite(
                        x
                    )
                        ? x
                        : null,

                y:
                    Number.isFinite(
                        y
                    )
                        ? y
                        : null

            },
            options
        );

    }

    return {

        ...result,

        appId:
            id,

        x,

        y

    };

}


/* ============================================================
   158 — RESIZE APP WINDOW
   ============================================================ */

async function __haldoRouterResizeAppWindow(
    appId,
    width,
    height,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return {

            success:
                false,

            reason:
                "invalid-app-id"

        };

    }

    const result =
        await __haldoRouterInvokeWindowManager(
            [
                "resizeAppWindow",
                "resizeWindow",
                "setSize",
                "resize"
            ],
            [
                id,
                width,
                height,
                options
            ]
        );

    if (
        result.success
    ) {

        __haldoRouterSetAppWindowState(
            id,
            {

                width:
                    Number.isFinite(
                        width
                    )
                        ? width
                        : null,

                height:
                    Number.isFinite(
                        height
                    )
                        ? height
                        : null

            },
            options
        );

    }

    return {

        ...result,

        appId:
            id,

        width,

        height

    };

}


/* ============================================================
   159 — PERSIST WINDOW STATES
   ============================================================ */

async function __haldoRouterPersistWindowStates(
    options = {}
) {

    const registry =
        __haldoRouterGetWindowRegistry();

    const snapshot = {};

    for (
        const [
            appId,
            state
        ]
        of registry.entries()
    ) {

        snapshot[
            appId
        ] =
            __haldoRouterClone(
                state
            );

    }

    const result =
        await __haldoRouterStorageSet(
            options.key ||
            "haldo.router.windows",
            snapshot
        );

    return result;

}


/* ============================================================
   160 — RESTORE WINDOW STATES
   ============================================================ */

async function __haldoRouterRestoreWindowStates(
    options = {}
) {

    const stored =
        await __haldoRouterStorageGet(
            options.key ||
            "haldo.router.windows",
            {}
        );

    if (
        !stored ||
        typeof stored !==
        "object"
    ) {

        return false;

    }

    const registry =
        __haldoRouterGetWindowRegistry();

    try {

        for (
            const [
                appId,
                state
            ]
            of Object.entries(
                stored
            )
        ) {

            const id =
                __haldoRouterNormalizeAppId(
                    appId
                );

            if (
                !id
            ) {

                continue;

            }

            registry.set(
                id,
                __haldoRouterNormalizeWindowState(
                    id,
                    state
                )
            );

        }

        __haldoRouterEmit(
            "haldo:router:window-states-restored",
            {

                count:
                    registry.size

            }
        );

        return true;

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

        return false;

    }

}


/* ============================================================
   161 — END TEIL 13 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 14 / 16
   ============================================================ */


/* ============================================================
   162 — ROUTER WINDOW EVENT SYNCHRONIZATION
   ============================================================ */

function __haldoRouterInstallWindowStateSynchronization() {

    if (
        typeof window ===
        "undefined" ||
        typeof window.addEventListener !==
        "function"
    ) {

        return false;

    }

    if (
        window.__HALDO_ROUTER_WINDOW_SYNC__
    ) {

        return true;

    }

    const events = [

        "haldo:window:opened",
        "haldo:window:closed",
        "haldo:window:focused",
        "haldo:window:minimized",
        "haldo:window:maximized",
        "haldo:window:restored",
        "haldo:window:moved",
        "haldo:window:resized"

    ];

    const handlers = new Map();

    for (
        const eventName
        of events
    ) {

        const handler =
            function handleWindowSyncEvent(
                event
            ) {

                try {

                    const detail =
                        event &&
                        event.detail
                            ? event.detail
                            : {};

                    const appId =
                        __haldoRouterNormalizeAppId(
                            detail.appId ||
                            detail.app ||
                            detail.id
                        );

                    if (
                        !appId
                    ) {

                        return;

                    }

                    const current =
                        __haldoRouterGetAppWindowState(
                            appId
                        ) ||
                        {};

                    const next = {

                        ...current

                    };

                    switch (
                        eventName
                    ) {

                        case "haldo:window:opened":

                            next.visible =
                                true;

                            next.minimized =
                                false;

                            next.state =
                                "normal";

                            break;


                        case "haldo:window:closed":

                            next.visible =
                                false;

                            next.focused =
                                false;

                            next.state =
                                "closed";

                            break;


                        case "haldo:window:focused":

                            next.visible =
                                true;

                            next.focused =
                                true;

                            next.minimized =
                                false;

                            break;


                        case "haldo:window:minimized":

                            next.visible =
                                false;

                            next.focused =
                                false;

                            next.minimized =
                                true;

                            next.maximized =
                                false;

                            next.state =
                                "minimized";

                            break;


                        case "haldo:window:maximized":

                            next.visible =
                                true;

                            next.focused =
                                true;

                            next.minimized =
                                false;

                            next.maximized =
                                true;

                            next.state =
                                "maximized";

                            break;


                        case "haldo:window:restored":

                            next.visible =
                                true;

                            next.focused =
                                true;

                            next.minimized =
                                false;

                            next.maximized =
                                false;

                            next.state =
                                "normal";

                            break;


                        case "haldo:window:moved":

                            if (
                                Number.isFinite(
                                    detail.x
                                )
                            ) {

                                next.x =
                                    detail.x;

                            }

                            if (
                                Number.isFinite(
                                    detail.y
                                )
                            ) {

                                next.y =
                                    detail.y;

                            }

                            break;


                        case "haldo:window:resized":

                            if (
                                Number.isFinite(
                                    detail.width
                                )
                            ) {

                                next.width =
                                    detail.width;

                            }

                            if (
                                Number.isFinite(
                                    detail.height
                                )
                            ) {

                                next.height =
                                    detail.height;

                            }

                            break;

                    }

                    __haldoRouterSetAppWindowState(
                        appId,
                        next,
                        {
                            persist:
                                false
                        }
                    );

                } catch (exception) {

                    __haldoRouterRecordError(
                        exception
                    );

                }

            };

        handlers.set(
            eventName,
            handler
        );

        window.addEventListener(
            eventName,
            handler
        );

    }

    window.__HALDO_ROUTER_WINDOW_SYNC__ =
        handlers;

    return true;

}


__haldoRouterInstallWindowStateSynchronization();


/* ============================================================
   163 — WINDOW GEOMETRY VALIDATION
   ============================================================ */

function __haldoRouterValidateWindowGeometry(
    geometry = {},
    options = {}
) {

    const source =
        geometry &&
        typeof geometry ===
        "object"
            ? geometry
            : {};

    const viewportWidth =
        Number.isFinite(
            options.viewportWidth
        )
            ? options.viewportWidth
            : (
                typeof window !==
                "undefined"
                    ? window.innerWidth
                    : null
            );

    const viewportHeight =
        Number.isFinite(
            options.viewportHeight
        )
            ? options.viewportHeight
            : (
                typeof window !==
                "undefined"
                    ? window.innerHeight
                    : null
            );

    const minimumWidth =
        Number.isFinite(
            options.minimumWidth
        )
            ? Math.max(
                1,
                options.minimumWidth
            )
            : 280;

    const minimumHeight =
        Number.isFinite(
            options.minimumHeight
        )
            ? Math.max(
                1,
                options.minimumHeight
            )
            : 180;

    let width =
        Number.isFinite(
            source.width
        )
            ? source.width
            : null;

    let height =
        Number.isFinite(
            source.height
        )
            ? source.height
            : null;

    let x =
        Number.isFinite(
            source.x
        )
            ? source.x
            : 0;

    let y =
        Number.isFinite(
            source.y
        )
            ? source.y
            : 0;


    if (
        width !==
        null
    ) {

        width =
            Math.max(
                minimumWidth,
                width
            );

        if (
            Number.isFinite(
                viewportWidth
            )
        ) {

            width =
                Math.min(
                    width,
                    Math.max(
                        minimumWidth,
                        viewportWidth
                    )
                );

        }

    }


    if (
        height !==
        null
    ) {

        height =
            Math.max(
                minimumHeight,
                height
            );

        if (
            Number.isFinite(
                viewportHeight
            )
        ) {

            height =
                Math.min(
                    height,
                    Math.max(
                        minimumHeight,
                        viewportHeight
                    )
                );

        }

    }


    if (
        Number.isFinite(
            viewportWidth
        ) &&
        width !==
        null
    ) {

        x =
            Math.min(
                Math.max(
                    0,
                    x
                ),
                Math.max(
                    0,
                    viewportWidth -
                    width
                )
            );

    }


    if (
        Number.isFinite(
            viewportHeight
        ) &&
        height !==
        null
    ) {

        y =
            Math.min(
                Math.max(
                    0,
                    y
                ),
                Math.max(
                    0,
                    viewportHeight -
                    height
                )
            );

    }


    return {

        x,

        y,

        width,

        height,

        viewportWidth,

        viewportHeight

    };

}


/* ============================================================
   164 — APPLY WINDOW GEOMETRY
   ============================================================ */

async function __haldoRouterApplyWindowGeometry(
    appId,
    geometry = {},
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return {

            success:
                false,

            reason:
                "invalid-app-id"

        };

    }

    const validated =
        __haldoRouterValidateWindowGeometry(
            geometry,
            options
        );

    const move =
        await __haldoRouterMoveAppWindow(
            id,
            validated.x,
            validated.y,
            options
        );

    let resize = {

        success:
            true

    };

    if (
        validated.width !==
        null &&
        validated.height !==
        null
    ) {

        resize =
            await __haldoRouterResizeAppWindow(
                id,
                validated.width,
                validated.height,
                options
            );

    }

    return {

        success:
            move.success &&
            resize.success,

        appId:
            id,

        geometry:
            validated,

        move,

        resize

    };

}


/* ============================================================
   165 — RESPONSIVE WINDOW GEOMETRY
   ============================================================ */

function __haldoRouterCalculateResponsiveWindowGeometry(
    options = {}
) {

    const viewportWidth =
        Number.isFinite(
            options.viewportWidth
        )
            ? options.viewportWidth
            : (
                typeof window !==
                "undefined"
                    ? window.innerWidth
                    : 1280
            );

    const viewportHeight =
        Number.isFinite(
            options.viewportHeight
        )
            ? options.viewportHeight
            : (
                typeof window !==
                "undefined"
                    ? window.innerHeight
                    : 720
            );


    let width =
        viewportWidth *
        (
            viewportWidth <
            600
                ? 0.94
                : viewportWidth <
                  1024
                    ? 0.82
                    : 0.68
        );

    let height =
        viewportHeight *
        (
            viewportWidth <
            600
                ? 0.78
                : viewportWidth <
                  1024
                    ? 0.76
                    : 0.72
        );


    const minimumWidth =
        Number.isFinite(
            options.minimumWidth
        )
            ? options.minimumWidth
            : 280;

    const minimumHeight =
        Number.isFinite(
            options.minimumHeight
        )
            ? options.minimumHeight
            : 180;

    width =
        Math.max(
            minimumWidth,
            width
        );

    height =
        Math.max(
            minimumHeight,
            height
        );

    width =
        Math.min(
            viewportWidth,
            width
        );

    height =
        Math.min(
            viewportHeight,
            height
        );


    const x =
        Math.max(
            0,
            (
                viewportWidth -
                width
            ) /
            2
        );

    const y =
        Math.max(
            0,
            (
                viewportHeight -
                height
            ) /
            2
        );


    return {

        x,

        y,

        width,

        height,

        viewportWidth,

        viewportHeight

    };

}


/* ============================================================
   166 — APPLY RESPONSIVE WINDOW GEOMETRY
   ============================================================ */

async function __haldoRouterApplyResponsiveWindowGeometry(
    appId,
    options = {}
) {

    const geometry =
        __haldoRouterCalculateResponsiveWindowGeometry(
            options
        );

    return __haldoRouterApplyWindowGeometry(
        appId,
        geometry,
        options
    );

}


/* ============================================================
   167 — ROUTER WINDOW Z-INDEX
   ============================================================ */

function __haldoRouterBringAppToFront(
    appId
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return false;

    }

    const registry =
        __haldoRouterGetWindowRegistry();

    let highest =
        0;

    for (
        const state
        of registry.values()
    ) {

        if (
            state &&
            Number.isFinite(
                state.zIndex
            )
        ) {

            highest =
                Math.max(
                    highest,
                    state.zIndex
                );

        }

    }

    const nextZIndex =
        highest +
        1;

    __haldoRouterSetAppWindowState(
        id,
        {

            zIndex:
                nextZIndex,

            focused:
                true,

            visible:
                true,

            minimized:
                false

        }
    );

    for (
        const [
            registeredAppId,
            state
        ]
        of registry.entries()
    ) {

        if (
            registeredAppId !==
            id
        ) {

            state.focused =
                false;

        }

    }

    return true;

}


/* ============================================================
   168 — WINDOW STATE RESET
   ============================================================ */

function __haldoRouterResetAppWindowState(
    appId,
    options = {}
) {

    const id =
        __haldoRouterNormalizeAppId(
            appId
        );

    if (
        !id
    ) {

        return false;

    }

    const registry =
        __haldoRouterGetWindowRegistry();

    registry.set(
        id,
        __haldoRouterNormalizeWindowState(
            id,
            {

                visible:
                    true,

                focused:
                    false,

                minimized:
                    false,

                maximized:
                    false,

                state:
                    "normal",

                x:
                    null,

                y:
                    null,

                width:
                    null,

                height:
                    null,

                zIndex:
                    null

            }
        )
    );

    if (
        options.persist ===
        true
    ) {

        __haldoRouterPersistWindowStates()
            .catch(
                exception =>
                    __haldoRouterRecordError(
                        exception
                    )
            );

    }

    return true;

}


/* ============================================================
   169 — WINDOW STATE SNAPSHOT
   ============================================================ */

function __haldoRouterGetAllWindowStates() {

    const registry =
        __haldoRouterGetWindowRegistry();

    const snapshot = {};

    for (
        const [
            appId,
            state
        ]
        of registry.entries()
    ) {

        snapshot[
            appId
        ] =
            __haldoRouterClone(
                state
            );

    }

    return snapshot;

}


/* ============================================================
   170 — END TEIL 14 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 15 / 16
   ============================================================ */


/* ============================================================
   171 — ROUTER DISPLAY ACCESS
   ============================================================ */

function __haldoRouterGetDisplaySafe() {

    try {

        if (
            typeof __haldoRouterGetDisplay ===
            "function"
        ) {

            return __haldoRouterGetDisplay();

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return null;

}


/* ============================================================
   172 — ROUTER DISPLAY ELEMENT
   ============================================================ */

function __haldoRouterGetDisplayElement() {

    const candidates = [

        typeof document !==
        "undefined"
            ? document.querySelector(
                "#haldo-display"
            )
            : null,

        typeof document !==
        "undefined"
            ? document.querySelector(
                "[data-haldo-display]"
            )
            : null,

        typeof document !==
        "undefined"
            ? document.querySelector(
                ".haldo-display"
            )
            : null,

        typeof document !==
        "undefined"
            ? document.querySelector(
                "#display"
            )
            : null

    ];

    for (
        const element
        of candidates
    ) {

        if (
            element
        ) {

            return element;

        }

    }

    const display =
        __haldoRouterGetDisplaySafe();

    if (
        display &&
        display.element
    ) {

        return display.element;

    }

    if (
        display &&
        display.el
    ) {

        return display.el;

    }

    return null;

}


/* ============================================================
   173 — DISPLAY ROUTER EVENT
   ============================================================ */

function __haldoRouterEmitDisplayEvent(
    eventName,
    payload = {}
) {

    const normalizedName =
        String(
            eventName ||
            ""
        ).trim();

    if (
        !normalizedName
    ) {

        return false;

    }

    __haldoRouterEmit(
        "haldo:router:display:" +
        normalizedName,
        {

            ...__haldoRouterClone(
                payload
            ),

            timestamp:
                new Date().toISOString()

        }
    );

    return true;

}


/* ============================================================
   174 — DISPLAY ROUTE CHANGE
   ============================================================ */

function __haldoRouterNotifyDisplayRoute(
    route,
    options = {}
) {

    const normalized =
        __haldoRouterNormalizeRoute(
            route
        );

    const display =
        __haldoRouterGetDisplaySafe();

    const payload = {

        route:
            normalized,

        source:
            options.source ||
            "router",

        timestamp:
            new Date().toISOString()

    };


    __haldoRouterEmitDisplayEvent(
        "route-change",
        payload
    );


    if (
        display
    ) {

        try {

            if (
                __haldoRouterIsFunction(
                    display.navigate
                )
            ) {

                display.navigate(
                    normalized,
                    options
                );

            } else if (
                __haldoRouterIsFunction(
                    display.setRoute
                )
            ) {

                display.setRoute(
                    normalized,
                    options
                );

            } else if (
                __haldoRouterIsFunction(
                    display.updateRoute
                )
            ) {

                display.updateRoute(
                    normalized,
                    options
                );

            }

        } catch (exception) {

            __haldoRouterRecordError(
                exception,
                payload
            );

        }

    }

    return true;

}


/* ============================================================
   175 — DISPLAY SHOW
   ============================================================ */

async function __haldoRouterShowDisplay(
    options = {}
) {

    const display =
        __haldoRouterGetDisplaySafe();

    const element =
        __haldoRouterGetDisplayElement();

    try {

        if (
            display &&
            __haldoRouterIsFunction(
                display.show
            )
        ) {

            const result =
                await display.show(
                    options
                );

            __haldoRouterEmitDisplayEvent(
                "shown",
                {

                    result:
                        __haldoRouterClone(
                            result
                        )

                }
            );

            return result !== false;

        }

        if (
            element
        ) {

            element.hidden =
                false;

            element.removeAttribute(
                "aria-hidden"
            );

            element.classList.remove(
                "is-hidden"
            );

            element.classList.add(
                "is-visible"
            );

            __haldoRouterEmitDisplayEvent(
                "shown"
            );

            return true;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return false;

}


/* ============================================================
   176 — DISPLAY HIDE
   ============================================================ */

async function __haldoRouterHideDisplay(
    options = {}
) {

    const display =
        __haldoRouterGetDisplaySafe();

    const element =
        __haldoRouterGetDisplayElement();

    try {

        if (
            display &&
            __haldoRouterIsFunction(
                display.hide
            )
        ) {

            const result =
                await display.hide(
                    options
                );

            __haldoRouterEmitDisplayEvent(
                "hidden",
                {

                    result:
                        __haldoRouterClone(
                            result
                        )

                }
            );

            return result !== false;

        }

        if (
            element
        ) {

            element.hidden =
                true;

            element.setAttribute(
                "aria-hidden",
                "true"
            );

            element.classList.remove(
                "is-visible"
            );

            element.classList.add(
                "is-hidden"
            );

            __haldoRouterEmitDisplayEvent(
                "hidden"
            );

            return true;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return false;

}


/* ============================================================
   177 — DISPLAY TOGGLE
   ============================================================ */

async function __haldoRouterToggleDisplay(
    options = {}
) {

    const element =
        __haldoRouterGetDisplayElement();

    if (
        element
    ) {

        const hidden =
            element.hidden ||
            element.getAttribute(
                "aria-hidden"
            ) ===
            "true" ||
            element.classList.contains(
                "is-hidden"
            );

        if (
            hidden
        ) {

            return __haldoRouterShowDisplay(
                options
            );

        }

        return __haldoRouterHideDisplay(
            options
        );

    }

    const display =
        __haldoRouterGetDisplaySafe();

    if (
        display &&
        __haldoRouterIsFunction(
            display.toggle
        )
    ) {

        try {

            const result =
                await display.toggle(
                    options
                );

            return result !== false;

        } catch (exception) {

            __haldoRouterRecordError(
                exception
            );

        }

    }

    return false;

}


/* ============================================================
   178 — DISPLAY FULLSCREEN
   ============================================================ */

async function __haldoRouterEnterFullscreen(
    options = {}
) {

    const display =
        __haldoRouterGetDisplaySafe();

    const element =
        __haldoRouterGetDisplayElement();

    try {

        if (
            display &&
            __haldoRouterIsFunction(
                display.enterFullscreen
            )
        ) {

            return (
                await display.enterFullscreen(
                    options
                )
            ) !== false;

        }

        if (
            element &&
            __haldoRouterIsFunction(
                element.requestFullscreen
            )
        ) {

            await element.requestFullscreen();

            return true;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return false;

}


/* ============================================================
   179 — DISPLAY EXIT FULLSCREEN
   ============================================================ */

async function __haldoRouterExitFullscreen(
    options = {}
) {

    const display =
        __haldoRouterGetDisplaySafe();

    try {

        if (
            display &&
            __haldoRouterIsFunction(
                display.exitFullscreen
            )
        ) {

            return (
                await display.exitFullscreen(
                    options
                )
            ) !== false;

        }

        if (
            typeof document !==
            "undefined" &&
            __haldoRouterIsFunction(
                document.exitFullscreen
            )
        ) {

            await document.exitFullscreen();

            return true;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return false;

}


/* ============================================================
   180 — DISPLAY RESPONSIVE UPDATE
   ============================================================ */

function __haldoRouterUpdateResponsiveDisplay(
    options = {}
) {

    const element =
        __haldoRouterGetDisplayElement();

    if (
        !element
    ) {

        return false;

    }

    const width =
        Number.isFinite(
            options.width
        )
            ? options.width
            : (
                typeof window !==
                "undefined"
                    ? window.innerWidth
                    : null
            );

    const height =
        Number.isFinite(
            options.height
        )
            ? options.height
            : (
                typeof window !==
                "undefined"
                    ? window.innerHeight
                    : null
            );

    if (
        Number.isFinite(
            width
        )
    ) {

        element.style.setProperty(
            "--haldo-viewport-width",
            width + "px"
        );

    }

    if (
        Number.isFinite(
            height
        )
    ) {

        element.style.setProperty(
            "--haldo-viewport-height",
            height + "px"
        );

    }

    __haldoRouterEmitDisplayEvent(
        "responsive-update",
        {

            width,

            height

        }
    );

    return true;

}


/* ============================================================
   181 — DISPLAY RESPONSIVE LISTENER
   ============================================================ */

function __haldoRouterInstallResponsiveDisplayListener() {

    if (
        typeof window ===
        "undefined" ||
        typeof window.addEventListener !==
        "function"
    ) {

        return false;

    }

    if (
        window.__HALDO_ROUTER_RESPONSIVE_DISPLAY__
    ) {

        return true;

    }

    const handler =
        function handleResponsiveDisplay() {

            try {

                __haldoRouterUpdateResponsiveDisplay();

                const registry =
                    __haldoRouterGetWindowRegistry();

                for (
                    const [
                        appId,
                        state
                    ]
                    of registry.entries()
                ) {

                    if (
                        !state ||
                        state.visible !==
                        true
                    ) {

                        continue;

                    }

                    __haldoRouterApplyResponsiveWindowGeometry(
                        appId,
                        {

                            x:
                                state.x,

                            y:
                                state.y,

                            width:
                                state.width,

                            height:
                                state.height

                        },
                        {

                            viewportWidth:
                                window.innerWidth,

                            viewportHeight:
                                window.innerHeight

                        }
                    ).catch(
                        exception =>
                            __haldoRouterRecordError(
                                exception
                            )
                    );

                }

            } catch (exception) {

                __haldoRouterRecordError(
                    exception
                );

            }

        };

    window.addEventListener(
        "resize",
        handler,
        {
            passive:
                true
        }
    );

    window.__HALDO_ROUTER_RESPONSIVE_DISPLAY__ =
        handler;

    handler();

    return true;

}


__haldoRouterInstallResponsiveDisplayListener();


/* ============================================================
   182 — DISPLAY STATE
   ============================================================ */

function __haldoRouterGetDisplayState() {

    const display =
        __haldoRouterGetDisplaySafe();

    const element =
        __haldoRouterGetDisplayElement();

    const state = {

        available:
            !!(
                display ||
                element
            ),

        visible:
            element
                ? !(
                    element.hidden ||
                    element.getAttribute(
                        "aria-hidden"
                    ) ===
                    "true"
                )
                : null,

        fullscreen:
            typeof document !==
            "undefined"
                ? !!document.fullscreenElement
                : false,

        route:
            __haldoRouterGetCurrentRoute(),

        appId:
            __haldoRouterGetCurrentAppId()

    };

    if (
        display &&
        __haldoRouterIsFunction(
            display.getState
        )
    ) {

        try {

            state.service =
                __haldoRouterClone(
                    display.getState()
                );

        } catch (exception) {

            __haldoRouterRecordError(
                exception
            );

        }

    }

    return state;

}


/* ============================================================
   183 — END TEIL 15 / 16
   ============================================================ */
/* ============================================================
   HALDO AI OS 20
   APP ROUTER MASTER EXTENSION
   TEIL 16 / 16
   ============================================================ */


/* ============================================================
   184 — ROUTER AI ACCESS
   ============================================================ */

function __haldoRouterGetAICoreSafe() {

    const candidates = [

        typeof window !==
        "undefined"
            ? window.haldoAICore
            : null,

        typeof window !==
        "undefined"
            ? window.haldoAI
            : null,

        typeof window !==
        "undefined"
            ? window.HalDoAI
            : null,

        typeof globalThis !==
        "undefined"
            ? globalThis.haldoAICore
            : null,

        typeof globalThis !==
        "undefined"
            ? globalThis.haldoAI
            : null

    ];

    for (
        const candidate
        of candidates
    ) {

        if (
            candidate
        ) {

            return candidate;

        }

    }

    return null;

}


/* ============================================================
   185 — ROUTER AI EVENT
   ============================================================ */

function __haldoRouterEmitAIEvent(
    eventName,
    payload = {}
) {

    const normalizedName =
        String(
            eventName ||
            ""
        )
            .trim();

    if (
        !normalizedName
    ) {

        return false;

    }

    __haldoRouterEmit(
        "haldo:router:ai:" +
        normalizedName,
        {

            ...__haldoRouterClone(
                payload
            ),

            timestamp:
                new Date().toISOString()

        }
    );

    return true;

}


/* ============================================================
   186 — AI REQUEST
   ============================================================ */

async function __haldoRouterAIRequest(
    input,
    options = {}
) {

    const ai =
        __haldoRouterGetAICoreSafe();

    if (
        !ai
    ) {

        return {

            success:
                false,

            reason:
                "ai-core-unavailable"

        };

    }

    const request = {

        input:
            typeof input ===
            "string"
                ? input
                : __haldoRouterClone(
                    input
                ),

        route:
            __haldoRouterGetCurrentRoute(),

        appId:
            __haldoRouterGetCurrentAppId(),

        source:
            options.source ||
            "router",

        timestamp:
            new Date().toISOString()

    };

    const methods = [

        "request",
        "ask",
        "chat",
        "complete",
        "generate",
        "respond"

    ];

    try {

        for (
            const methodName
            of methods
        ) {

            if (
                !__haldoRouterIsFunction(
                    ai[
                        methodName
                    ]
                )
            ) {

                continue;

            }

            __haldoRouterEmitAIEvent(
                "request",
                request
            );

            const result =
                await ai[
                    methodName
                ](
                    request.input,
                    options
                );

            __haldoRouterEmitAIEvent(
                "response",
                {

                    request,
                    result:
                        __haldoRouterClone(
                            result
                        )

                }
            );

            return {

                success:
                    result !== false,

                method:
                    methodName,

                result:
                    __haldoRouterClone(
                        result
                    )

            };

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            request
        );

        __haldoRouterEmitAIEvent(
            "error",
            {

                request,

                error:
                    exception

            }
        );

        return {

            success:
                false,

            reason:
                "ai-request-error",

            error:
                exception

        };

    }

    return {

        success:
            false,

        reason:
            "ai-request-method-unavailable"

    };

}


/* ============================================================
   187 — AI ROUTER COMMAND
   ============================================================ */

async function __haldoRouterAICommand(
    command,
    payload = {},
    options = {}
) {

    const ai =
        __haldoRouterGetAICoreSafe();

    if (
        !ai
    ) {

        return {

            success:
                false,

            reason:
                "ai-core-unavailable"

        };

    }

    const commandName =
        String(
            command ||
            ""
        )
            .trim();

    if (
        !commandName
    ) {

        return {

            success:
                false,

            reason:
                "invalid-ai-command"

        };

    }

    const candidates = [

        "command",
        "execute",
        "run",
        "handleCommand"

    ];

    try {

        for (
            const methodName
            of candidates
        ) {

            if (
                !__haldoRouterIsFunction(
                    ai[
                        methodName
                    ]
                )
            ) {

                continue;

            }

            const result =
                await ai[
                    methodName
                ](
                    commandName,
                    payload,
                    options
                );

            __haldoRouterEmitAIEvent(
                "command",
                {

                    command:
                        commandName,

                    payload:
                        __haldoRouterClone(
                            payload
                        ),

                    result:
                        __haldoRouterClone(
                            result
                        )

                }
            );

            return {

                success:
                    result !== false,

                command:
                    commandName,

                result:
                    __haldoRouterClone(
                        result
                    )

            };

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception,
            {

                command:
                    commandName,

                payload

            }
        );

        return {

            success:
                false,

            reason:
                "ai-command-error",

            error:
                exception

        };

    }

    return {

        success:
            false,

        reason:
            "ai-command-method-unavailable"

    };

}


/* ============================================================
   188 — ROUTER VOICE ACCESS
   ============================================================ */

function __haldoRouterGetVoiceSafe() {

    const candidates = [

        typeof window !==
        "undefined"
            ? window.haldoVoice
            : null,

        typeof window !==
        "undefined"
            ? window.HalDoVoice
            : null,

        typeof globalThis !==
        "undefined"
            ? globalThis.haldoVoice
            : null

    ];

    for (
        const candidate
        of candidates
    ) {

        if (
            candidate
        ) {

            return candidate;

        }

    }

    return null;

}


/* ============================================================
   189 — VOICE SPEAK
   ============================================================ */

async function __haldoRouterSpeak(
    text,
    options = {}
) {

    const voice =
        __haldoRouterGetVoiceSafe();

    if (
        !voice
    ) {

        return {

            success:
                false,

            reason:
                "voice-service-unavailable"

        };

    }

    const value =
        String(
            text ||
            ""
        ).trim();

    if (
        !value
    ) {

        return {

            success:
                false,

            reason:
                "empty-speech"

        };

    }

    const methods = [

        "speak",
        "say",
        "synthesize"

    ];

    try {

        for (
            const methodName
            of methods
        ) {

            if (
                !__haldoRouterIsFunction(
                    voice[
                        methodName
                    ]
                )
            ) {

                continue;

            }

            __haldoRouterEmitAIEvent(
                "speaking-start",
                {

                    text:
                        value

                }
            );

            const result =
                await voice[
                    methodName
                ](
                    value,
                    options
                );

            __haldoRouterEmitAIEvent(
                "speaking-end",
                {

                    text:
                        value,

                    result:
                        __haldoRouterClone(
                            result
                        )

                }
            );

            return {

                success:
                    result !== false,

                method:
                    methodName,

                result:
                    __haldoRouterClone(
                        result
                    )

            };

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return {

        success:
            false,

        reason:
            "voice-speak-method-unavailable"

    };

}


/* ============================================================
   190 — ROUTER VOICE STOP
   ============================================================ */

async function __haldoRouterStopSpeaking(
    options = {}
) {

    const voice =
        __haldoRouterGetVoiceSafe();

    if (
        !voice
    ) {

        return false;

    }

    const methods = [

        "stop",
        "stopSpeaking",
        "cancel",
        "cancelSpeech"

    ];

    try {

        for (
            const methodName
            of methods
        ) {

            if (
                !__haldoRouterIsFunction(
                    voice[
                        methodName
                    ]
                )
            ) {

                continue;

            }

            const result =
                await voice[
                    methodName
                ](
                    options
                );

            __haldoRouterEmitAIEvent(
                "speaking-stop"
            );

            return result !== false;

        }

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    return false;

}


/* ============================================================
   191 — ROUTER GLOBAL API
   ============================================================ */

function __haldoRouterInstallGlobalAPI() {

    const target =
        typeof window !==
        "undefined"
            ? window
            : (
                typeof globalThis !==
                "undefined"
                    ? globalThis
                    : null
            );

    if (
        !target
    ) {

        return false;

    }

    const api = {

        version:
            "20.0-router-extension",

        navigate:
            __haldoRouterNavigate,

        back:
            __haldoRouterBack,

        forward:
            __haldoRouterForward,

        replace:
            __haldoRouterReplace,

        currentRoute:
            __haldoRouterGetCurrentRoute,

        currentApp:
            __haldoRouterGetCurrentAppId,

        launchApp:
            __haldoRouterLaunchApp,

        startApp:
            __haldoRouterStartApp,

        activateApp:
            __haldoRouterActivateAppSafe,

        resumeApp:
            __haldoRouterResumeApp,

        suspendApp:
            __haldoRouterSuspendApp,

        stopApp:
            __haldoRouterStopApp,

        closeApp:
            __haldoRouterCloseAppSafe,

        focusApp:
            __haldoRouterFocusApp,

        openAndFocusApp:
            __haldoRouterOpenAndFocusApp,

        openWindow:
            __haldoRouterOpenAppWindow,

        closeWindow:
            __haldoRouterCloseAppWindow,

        minimizeWindow:
            __haldoRouterMinimizeAppWindow,

        maximizeWindow:
            __haldoRouterMaximizeAppWindow,

        restoreWindow:
            __haldoRouterRestoreAppWindow,

        moveWindow:
            __haldoRouterMoveAppWindow,

        resizeWindow:
            __haldoRouterResizeAppWindow,

        toggleWindow:
            __haldoRouterToggleAppWindow,

        maximizeOrRestore:
            __haldoRouterMaximizeOrRestoreApp,

        showDisplay:
            __haldoRouterShowDisplay,

        hideDisplay:
            __haldoRouterHideDisplay,

        toggleDisplay:
            __haldoRouterToggleDisplay,

        enterFullscreen:
            __haldoRouterEnterFullscreen,

        exitFullscreen:
            __haldoRouterExitFullscreen,

        ai:
            __haldoRouterAIRequest,

        aiCommand:
            __haldoRouterAICommand,

        speak:
            __haldoRouterSpeak,

        stopSpeaking:
            __haldoRouterStopSpeaking,

        windowStates:
            __haldoRouterGetAllWindowStates

    };


    target.HalDoRouter =
        api;

    target.haldoRouter =
        api;

    return true;

}


/* ============================================================
   192 — ROUTER STARTUP RESTORE
   ============================================================ */

async function __haldoRouterStartupRestore() {

    try {

        await __haldoRouterRestoreWindowStates();

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    try {

        __haldoRouterInstallWindowStateSynchronization();

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    try {

        __haldoRouterInstallResponsiveDisplayListener();

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    try {

        __haldoRouterInstallGlobalAPI();

    } catch (exception) {

        __haldoRouterRecordError(
            exception
        );

    }

    __haldoRouterEmit(
        "haldo:router:ready",
        {

            route:
                __haldoRouterGetCurrentRoute(),

            appId:
                __haldoRouterGetCurrentAppId(),

            timestamp:
                new Date().toISOString()

        }
    );

    return true;

}


/* ============================================================
   193 — ROUTER DOM READY
   ============================================================ */

function __haldoRouterInstallStartupListener() {

    if (
        typeof document ===
        "undefined"
    ) {

        __haldoRouterStartupRestore();

        return true;

    }

    if (
        document.readyState ===
        "loading"
    ) {

        if (
            !document.__HALDO_ROUTER_STARTUP_LISTENER__
        ) {

            const handler =
                function handleRouterStartup() {

                    __haldoRouterStartupRestore()
                        .catch(
                            exception =>
                                __haldoRouterRecordError(
                                    exception
                                )
                        );

                };

            document.addEventListener(
                "DOMContentLoaded",
                handler,
                {
                    once:
                        true
                }
            );

            document.__HALDO_ROUTER_STARTUP_LISTENER__ =
                handler;

        }

        return true;

    }

    __haldoRouterStartupRestore();

    return true;

}


/* ============================================================
   194 — ROUTER EXTENSION EXPORT
   ============================================================ */

__haldoRouterInstallGlobalAPI();

__haldoRouterInstallStartupListener();


/* ============================================================
   195 — FINAL ROUTER EXTENSION STATUS
   ============================================================ */

__haldoRouterEmit(
    "haldo:router:extension-complete",
    {

        version:
            "20.0-router-extension",

        parts:
            16,

        lastSection:
            195,

        capabilities: [

            "navigation",
            "history",
            "app-lifecycle",
            "window-management",
            "window-state",
            "responsive-display",
            "fullscreen",
            "ai-routing",
            "voice-routing",
            "global-api",
            "persistent-window-state"

        ],

        timestamp:
            new Date().toISOString()

    }
);


/* ============================================================
   196 — END TEIL 16 / 16
   ============================================================ */
