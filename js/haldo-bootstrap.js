/*
 * ================================================================
 * HalDo AI OS 20
 * js/haldo-bootstrap.js
 *
 * ÄNDERUNG:
 * KOMPLETT ERSETZEN
 *
 * Aufgabe:
 * - kontrollierter OS-Start
 * - Verbindung der Core-Systeme
 * - Verbindung zur Shell
 * - Runtime-Erkennung
 * - Registry-Erkennung
 * - App-Manager-Erkennung
 * - Router-Erkennung
 * - Window-Manager-Erkennung
 * - automatische Registrierung der HalDo-System-Apps
 * - kein Fake-"App geöffnet"
 * - kein endloses "wird vorbereitet"
 * ================================================================
 */

(function (window, document) {
  "use strict";

  const VERSION = "20.0.0";

  const state = {
    started: false,
    ready: false,
    starting: false,
    failed: false,
    startTime: null,
    errors: [],
    warnings: [],
    systems: {},
    appsRegistered: 0
  };

  const events = Object.create(null);

  function on(name, handler) {
    if (typeof handler !== "function") return function () {};

    if (!events[name]) {
      events[name] = new Set();
    }

    events[name].add(handler);

    return function unsubscribe() {
      events[name]?.delete(handler);
    };
  }

  function emit(name, detail) {
    const listeners = events[name];

    if (listeners) {
      listeners.forEach(function (handler) {
        try {
          handler(detail);
        } catch (error) {
          console.error(
            "[HalDo Bootstrap] Event handler error:",
            error
          );
        }
      });
    }

    try {
      window.dispatchEvent(
        new CustomEvent("haldo:" + name, {
          detail: detail
        })
      );
    } catch (_) {
      /* CustomEvent fallback is intentionally silent. */
    }
  }

  function log(...args) {
    console.info("[HalDo AI OS 20]", ...args);
  }

  function warn(...args) {
    console.warn("[HalDo AI OS 20]", ...args);
    state.warnings.push(args.map(String).join(" "));
  }

  function fail(message, error) {
    const entry = {
      message: String(message),
      error: error || null,
      time: Date.now()
    };

    state.errors.push(entry);

    console.error(
      "[HalDo AI OS 20]",
      message,
      error || ""
    );

    emit("error", entry);
  }

  function setStatus(text) {
    if (
      window.HalDoShell &&
      typeof window.HalDoShell.setStatus === "function"
    ) {
      window.HalDoShell.setStatus(text);
    }

    const element =
      document.getElementById("haldo-system-status");

    if (element) {
      element.textContent = text;
    }

    emit("status", {
      text: text
    });
  }

  /*
   * ------------------------------------------------------------
   * GLOBAL OS OBJECT
   * ------------------------------------------------------------
   */

  const HalDoBootstrap = {
    version: VERSION,

    state,

    on,
    emit,

    log,
    warn,
    fail,

    setStatus,

    getState() {
      return {
        ...state,
        systems: {
          ...state.systems
        },
        errors: state.errors.slice(),
        warnings: state.warnings.slice()
      };
    },

    isReady() {
      return state.ready === true;
    },

    isStarted() {
      return state.started === true;
    }
  };

  window.HalDoBootstrap = HalDoBootstrap;

  /*
   * ------------------------------------------------------------
   * HALDO OS ROOT
   * ------------------------------------------------------------
   */

  if (!window.HalDoOS) {
    window.HalDoOS = {};
  }

  window.HalDoOS.bootstrap = HalDoBootstrap;

  /*
   * ------------------------------------------------------------
   * SYSTEM LOOKUP
   *
   * Verschiedene ältere/neuere Implementierungen werden
   * nicht blind überschrieben.
   * ------------------------------------------------------------
   */

  function findKernel() {
    return (
      window.HalDoKernel ||
      window.HalDoOS?.kernel ||
      null
    );
  }

  function findRuntime() {
    return (
      window.HalDoRuntime ||
      window.HalDoOS?.runtime ||
      window.HalDoAppRuntime ||
      null
    );
  }

  function findRegistry() {
    return (
      window.HalDoAppRegistry ||
      window.HalDoOS?.appRegistry ||
      window.HalDoRegistry ||
      null
    );
  }

  function findManager() {
    return (
      window.HalDoAppManager ||
      window.HalDoOS?.appManager ||
      null
    );
  }

  function findRouter() {
    return (
      window.HalDoAppRouter ||
      window.HalDoOS?.appRouter ||
      window.HalDoRouter ||
      null
    );
  }

  function findWindowManager() {
    return (
      window.HalDoWindowManager ||
      window.HalDoOS?.windowManager ||
      null
    );
  }

  /*
   * ------------------------------------------------------------
   * SYSTEM REGISTRATION
   * ------------------------------------------------------------
   */

  function registerSystem(name, object) {
    state.systems[name] = {
      available: !!object,
      object: object || null
    };

    if (object) {
      log(name + " verbunden.");
    } else {
      warn(name + " ist momentan noch nicht verfügbar.");
    }

    emit("system:detected", {
      name,
      available: !!object
    });

    return object;
  }

  /*
   * ------------------------------------------------------------
   * APP DEFINITIONS
   *
   * Diese Liste ist die zentrale App-Grundlage.
   * Die eigentlichen inneren App-Module kommen anschließend
   * über Runtime/Registry.
   * ------------------------------------------------------------
   */

  const SYSTEM_APPS = [
    {
      id: "haldo-ai",
      name: "HalDo AI",
      category: "AI",
      icon: "✦",
      description:
        "Zentrale künstliche Intelligenz von HalDo AI OS.",
      priority: 1,
      system: true,
      capabilities: [
        "chat",
        "conversation",
        "ai",
        "voice",
        "context",
        "assistant"
      ]
    },

    {
      id: "haldo-browser",
      name: "HalDo Browser",
      category: "Internet",
      icon: "◉",
      description:
        "Webbrowser und Internet-Arbeitsbereich.",
      priority: 2,
      capabilities: [
        "web",
        "tabs",
        "history",
        "bookmarks",
        "downloads"
      ]
    },

    {
      id: "haldo-app-store",
      name: "HalDo App Store",
      category: "System",
      icon: "▣",
      description:
        "Apps suchen, installieren, aktualisieren und verwalten.",
      priority: 3,
      capabilities: [
        "apps",
        "install",
        "update",
        "remove"
      ]
    },

    {
      id: "haldo-files",
      name: "HalDo Dateien",
      category: "Produktivität",
      icon: "▱",
      description:
        "Dateien und Ordner verwalten.",
      priority: 4,
      capabilities: [
        "filesystem",
        "folders",
        "files",
        "search"
      ]
    },

    {
      id: "haldo-settings",
      name: "HalDo Einstellungen",
      category: "System",
      icon: "⚙",
      description:
        "System-, App-, Theme-, Sprach- und AI-Einstellungen.",
      priority: 5,
      system: true,
      capabilities: [
        "settings",
        "themes",
        "language",
        "privacy",
        "system"
      ]
    },

    {
      id: "haldo-gallery",
      name: "HalDo Galerie",
      category: "Medien",
      icon: "▧",
      description:
        "Bilder und visuelle Inhalte verwalten.",
      priority: 10
    },

    {
      id: "haldo-music",
      name: "HalDo Musik",
      category: "Medien",
      icon: "♫",
      description:
        "Musik und Audio.",
      priority: 11
    },

    {
      id: "haldo-videos",
      name: "HalDo Videos",
      category: "Medien",
      icon: "▶",
      description:
        "Videoinhalte verwalten und wiedergeben.",
      priority: 12
    },

    {
      id: "haldo-calendar",
      name: "HalDo Kalender",
      category: "Produktivität",
      icon: "▦",
      description:
        "Termine und Kalender.",
      priority: 20
    },

    {
      id: "haldo-notes",
      name: "HalDo Notizen",
      category: "Produktivität",
      icon: "✎",
      description:
        "Notizen erstellen und speichern.",
      priority: 21
    },

    {
      id: "haldo-calculator",
      name: "HalDo Rechner",
      category: "Werkzeuge",
      icon: "⌗",
      description:
        "Rechner und mathematische Werkzeuge.",
      priority: 22
    },

    {
      id: "haldo-driving-school",
      name: "HalDo Fahrschule",
      category: "Lernen",
      icon: "🚗",
      description:
        "Lern- und Übungsumgebung für Fahrschulthemen.",
      priority: 23
    },

    {
      id: "haldo-translator",
      name: "HalDo Übersetzer",
      category: "Sprache",
      icon: "文",
      description:
        "Mehrsprachige Übersetzung.",
      priority: 24
    },

    {
      id: "haldo-language",
      name: "HalDo Sprache",
      category: "Sprache",
      icon: "A",
      description:
        "Sprach- und Eingabeeinstellungen.",
      priority: 25
    },

    {
      id: "haldo-chat",
      name: "HalDo Chat",
      category: "Kommunikation",
      icon: "◌",
      description:
        "Kommunikation und Nachrichten.",
      priority: 30
    },

    {
      id: "haldo-contacts",
      name: "HalDo Kontakte",
      category: "Kommunikation",
      icon: "♙",
      description:
        "Kontakte verwalten.",
      priority: 31
    },

    {
      id: "haldo-mail",
      name: "HalDo Mail",
      category: "Kommunikation",
      icon: "✉",
      description:
        "E-Mail-Arbeitsbereich.",
      priority: 32
    },

    {
      id: "haldo-weather",
      name: "HalDo Wetter",
      category: "Information",
      icon: "☁",
      description:
        "Wetterinformationen.",
      priority: 40
    },

    {
      id: "haldo-maps",
      name: "HalDo Karten",
      category: "Navigation",
      icon: "⌖",
      description:
        "Karten und Navigation.",
      priority: 41
    },

    {
      id: "haldo-clock",
      name: "HalDo Uhr",
      category: "Werkzeuge",
      icon: "◷",
      description:
        "Uhr, Timer und Zeitfunktionen.",
      priority: 42
    },

    {
      id: "haldo-tasks",
      name: "HalDo Aufgaben",
      category: "Produktivität",
      icon: "✓",
      description:
        "Aufgaben und To-do-Listen.",
      priority: 43
    },

    {
      id: "haldo-documents",
      name: "HalDo Dokumente",
      category: "Produktivität",
      icon: "▤",
      description:
        "Dokumente erstellen und verwalten.",
      priority: 44
    },

    {
      id: "haldo-downloads",
      name: "HalDo Downloads",
      category: "System",
      icon: "↓",
      description:
        "Heruntergeladene Dateien.",
      priority: 45
    },

    {
      id: "haldo-system",
      name: "HalDo System",
      category: "System",
      icon: "◈",
      description:
        "Systemstatus und Diagnose.",
      priority: 50,
      system: true
    },

    {
      id: "haldo-update",
      name: "HalDo Update",
      category: "System",
      icon: "↻",
      description:
        "System- und App-Updates.",
      priority: 51,
      system: true
    },

    {
      id: "haldo-backup",
      name: "HalDo Backup",
      category: "System",
      icon: "▰",
      description:
        "Sicherung und Wiederherstellung.",
      priority: 52,
      system: true
    },

    {
      id: "haldo-migration",
      name: "HalDo Migration",
      category: "System",
      icon: "⇄",
      description:
        "Datenmigration zwischen Versionen.",
      priority: 53,
      system: true
    },

    {
      id: "haldo-rollback",
      name: "HalDo Rollback",
      category: "System",
      icon: "↶",
      description:
        "Sichere Rückkehr zu einem vorherigen Systemstand.",
      priority: 54,
      system: true
    },

    {
      id: "haldo-pwa",
      name: "HalDo Installation",
      category: "System",
      icon: "＋",
      description:
        "PWA-Installation und Geräteintegration.",
      priority: 55,
      system: true
    },

    {
      id: "haldo-themes",
      name: "HalDo Themes",
      category: "Personalisierung",
      icon: "✧",
      description:
        "Darstellung und Themes.",
      priority: 56
    },

    {
      id: "haldo-cosmic-world",
      name: "HalDo Cosmic World",
      category: "HalDo",
      icon: "✦",
      description:
        "Die lebendige kosmische Welt von HalDo.",
      priority: 57
    },

    {
      id: "haldo-voice",
      name: "HalDo Voice",
      category: "AI",
      icon: "◉",
      description:
        "Spracheingabe und Sprachausgabe.",
      priority: 58
    }
  ];

  /*
   * ------------------------------------------------------------
   * REGISTRY ADAPTER
   *
   * Unterstützt verschiedene mögliche API-Namen.
   * ------------------------------------------------------------
   */

  function registerAppWithRegistry(app) {
    const registry = findRegistry();

    if (!registry) {
      return false;
    }

    const methods = [
      "register",
      "registerApp",
      "add",
      "addApp"
    ];

    for (const method of methods) {
      if (typeof registry[method] !== "function") {
        continue;
      }

      try {
        registry[method](app);
        return true;
      } catch (error) {
        /*
         * Ein bereits registriertes App-Objekt darf den Start
         * nicht zerstören.
         */
        warn(
          "Registry konnte " +
          app.id +
          " über " +
          method +
          " nicht registrieren.",
          error
        );
      }
    }

    return false;
  }

  /*
   * ------------------------------------------------------------
   * APP MANAGER ADAPTER
   * ------------------------------------------------------------
   */

  function registerAppWithManager(app) {
    const manager = findManager();

    if (!manager) {
      return false;
    }

    const methods = [
      "register",
      "registerApp",
      "add",
      "addApp"
    ];

    for (const method of methods) {
      if (typeof manager[method] !== "function") {
        continue;
      }

      try {
        manager[method](app);
        return true;
      } catch (error) {
        warn(
          "App Manager konnte " +
          app.id +
          " über " +
          method +
          " nicht registrieren.",
          error
        );
      }
    }

    return false;
  }

  /*
   * ------------------------------------------------------------
   * RUNTIME APP REGISTRATION
   * ------------------------------------------------------------
   */

  function registerAppWithRuntime(app) {
    const runtime = findRuntime();

    if (!runtime) {
      return false;
    }

    const methods = [
      "registerApp",
      "register",
      "defineApp",
      "addApp"
    ];

    for (const method of methods) {
      if (typeof runtime[method] !== "function") {
        continue;
      }

      try {
        runtime[method](app);
        return true;
      } catch (error) {
        warn(
          "Runtime konnte " +
          app.id +
          " über " +
          method +
          " nicht registrieren.",
          error
        );
      }
    }

    return false;
  }

  /*
   * ------------------------------------------------------------
   * APP MENU
   *
   * Die index.html bekommt hier die echte App-Liste.
   * ------------------------------------------------------------
   */

  function renderAppMenu() {
    const list =
      document.getElementById("haldo-app-list");

    if (!list) {
      warn("App-Menü-Liste nicht gefunden.");
      return;
    }

    list.innerHTML = "";

    const apps = SYSTEM_APPS
      .slice()
      .sort(function (a, b) {
        return (
          (a.priority || 999) -
          (b.priority || 999)
        );
      });

    apps.forEach(function (app) {
      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "haldo-app-item";
      button.dataset.appId = app.id;

      button.innerHTML = `
        <span class="haldo-app-item__icon">
          ${escapeHTML(app.icon || "•")}
        </span>

        <span>
          <span class="haldo-app-item__name">
            ${escapeHTML(app.name)}
          </span>

          <span class="haldo-app-item__description">
            ${escapeHTML(app.description || "")}
          </span>
        </span>
      `;

      button.addEventListener(
        "click",
        function () {
          openApp(app.id);
        }
      );

      list.appendChild(button);
    });

    state.appsRegistered = apps.length;

    emit("apps:menu-rendered", {
      count: apps.length
    });
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /*
   * ------------------------------------------------------------
   * APP SEARCH
   * ------------------------------------------------------------
   */

  function initializeAppSearch() {
    const input =
      document.getElementById("haldo-app-search");

    const list =
      document.getElementById("haldo-app-list");

    if (!input || !list) {
      return;
    }

    input.addEventListener(
      "input",
      function () {
        const query =
          input.value
            .trim()
            .toLocaleLowerCase();

        list
          .querySelectorAll(".haldo-app-item")
          .forEach(function (button) {
            const app =
              SYSTEM_APPS.find(function (item) {
                return (
                  item.id ===
                  button.dataset.appId
                );
              });

            if (!app) {
              button.hidden = true;
              return;
            }

            const haystack = [
              app.id,
              app.name,
              app.category,
              app.description
            ]
              .join(" ")
              .toLocaleLowerCase();

            button.hidden =
              query.length > 0 &&
              !haystack.includes(query);
          });
      }
    );
  }

  /*
   * ------------------------------------------------------------
   * OPEN APP
   *
   * Hier wird bewusst KEINE Fake-Meldung erzeugt.
   * ------------------------------------------------------------
   */

  function openApp(appId) {
    const app =
      SYSTEM_APPS.find(function (item) {
        return item.id === appId;
      });

    if (!app) {
      fail(
        "Unbekannte App: " +
        String(appId)
      );
      return false;
    }

    emit("app:open-request", {
      id: app.id,
      app: app
    });

    const manager = findManager();

    if (
      manager &&
      typeof manager.open === "function"
    ) {
      try {
        manager.open(app.id);
        closeMenu();
        return true;
      } catch (error) {
        fail(
          "App Manager konnte " +
          app.id +
          " nicht öffnen.",
          error
        );
      }
    }

    const runtime = findRuntime();

    if (
      runtime &&
      typeof runtime.openApp === "function"
    ) {
      try {
        runtime.openApp(app.id);
        closeMenu();
        return true;
      } catch (error) {
        fail(
          "Runtime konnte " +
          app.id +
          " nicht öffnen.",
          error
        );
      }
    }

    const router = findRouter();

    if (
      router &&
      typeof router.navigate === "function"
    ) {
      try {
        router.navigate(app.id);
        closeMenu();
        return true;
      } catch (error) {
        fail(
          "Router konnte " +
          app.id +
          " nicht öffnen.",
          error
        );
      }
    }

    /*
     * Falls die nachfolgenden Runtime-Dateien noch nicht
     * ersetzt wurden, bleibt die App registriert.
     * Es wird keine falsche "geöffnet"-Meldung angezeigt.
     */
    warn(
      "App " +
      app.id +
      " ist registriert, aber die Öffnungs-Runtime " +
      "ist noch nicht vollständig verbunden."
    );

    setStatus(
      app.name +
      " wartet auf die App Runtime."
    );

    return false;
  }

  function closeMenu() {
    if (
      window.HalDoShell &&
      typeof window.HalDoShell.closeAppMenu ===
        "function"
    ) {
      window.HalDoShell.closeAppMenu();
    }
  }

  /*
   * ------------------------------------------------------------
   * REGISTER ALL SYSTEM APPS
   * ------------------------------------------------------------
   */

  function registerAllApps() {
    let registered = 0;

    SYSTEM_APPS.forEach(function (app) {
      let success = false;

      /*
       * Runtime zuerst.
       */
      if (registerAppWithRuntime(app)) {
        success = true;
      }

      /*
       * Registry zusätzlich.
       */
      if (registerAppWithRegistry(app)) {
        success = true;
      }

      /*
       * Manager zusätzlich.
       */
      if (registerAppWithManager(app)) {
        success = true;
      }

      if (success) {
        registered++;
      }
    });

    state.appsRegistered =
      SYSTEM_APPS.length;

    emit("apps:registered", {
      total: SYSTEM_APPS.length,
      connected: registered
    });

    return registered;
  }

  /*
   * ------------------------------------------------------------
   * SYSTEM DETECTION
   * ------------------------------------------------------------
   */

  function detectSystems() {
    registerSystem(
      "kernel",
      findKernel()
    );

    registerSystem(
      "runtime",
      findRuntime()
    );

    registerSystem(
      "registry",
      findRegistry()
    );

    registerSystem(
      "appManager",
      findManager()
    );

    registerSystem(
      "router",
      findRouter()
    );

    registerSystem(
      "windowManager",
      findWindowManager()
    );

    registerSystem(
      "shell",
      window.HalDoShell || null
    );
  }

  /*
   * ------------------------------------------------------------
   * KERNEL CONNECTION
   * ------------------------------------------------------------
   */

  function connectKernel() {
    const kernel = findKernel();

    if (!kernel) {
      warn(
        "Kein HalDoKernel gefunden. " +
        "Der bestehende Kernel bleibt unangetastet."
      );
      return;
    }

    try {
      if (
        typeof kernel.on === "function"
      ) {
        kernel.on(
          "app:open",
          function (event) {
            emit("kernel:app-open", event);
          }
        );
      }

      if (
        typeof kernel.emit === "function"
      ) {
        kernel.emit(
          "bootstrap:ready",
          {
            version: VERSION
          }
        );
      }

      log("Kernel verbunden.");
    } catch (error) {
      fail(
        "Fehler bei der Kernel-Verbindung.",
        error
      );
    }
  }

  /*
   * ------------------------------------------------------------
   * WINDOW MANAGER CONNECTION
   * ------------------------------------------------------------
   */

  function connectWindowManager() {
    const manager = findWindowManager();

    if (!manager) {
      warn(
        "Window Manager noch nicht verfügbar."
      );
      return;
    }

    /*
     * Shell Window Layer bekanntgeben.
     */
    const layer =
      document.getElementById(
        "haldo-window-layer"
      );

    if (
      layer &&
      typeof manager.setContainer ===
        "function"
    ) {
      try {
        manager.setContainer(layer);
      } catch (error) {
        warn(
          "Window Manager Container konnte nicht gesetzt werden.",
          error
        );
      }
    }

    emit("window-manager:connected", {
      manager
    });
  }

  /*
   * ------------------------------------------------------------
   * BOOTSTRAP SEQUENCE
   * ------------------------------------------------------------
   */

  async function start() {
    if (state.ready) {
      return HalDoBootstrap;
    }

    if (state.starting) {
      return HalDoBootstrap;
    }

    state.starting = true;
    state.startTime = Date.now();

    try {
      setStatus(
        "HalDo AI OS 20 wird initialisiert …"
      );

      emit("boot:start", {
        version: VERSION
      });

      /*
       * 1. Bestehende Systeme erkennen.
       */
      detectSystems();

      /*
       * 2. Kernel verbinden.
       */
      setStatus(
        "Kernel wird verbunden …"
      );

      connectKernel();

      /*
       * 3. Window Manager verbinden.
       */
      setStatus(
        "Fenstersystem wird verbunden …"
      );

      connectWindowManager();

      /*
       * 4. Apps registrieren.
       */
      setStatus(
        "HalDo Apps werden registriert …"
      );

      registerAllApps();

      /*
       * 5. Menü erzeugen.
       */
      setStatus(
        "HalDo App-Menü wird aufgebaut …"
      );

      renderAppMenu();
      initializeAppSearch();

      /*
       * 6. Öffentliche Runtime-Brücken.
       */
      window.HalDoOS.apps =
        SYSTEM_APPS.slice();

      window.HalDoOS.openApp =
        openApp;

      window.HalDoOS.getApps =
        function () {
          return SYSTEM_APPS.slice();
        };

      /*
       * 7. Zustand fertig.
       */
      state.started = true;
      state.ready = true;
      state.starting = false;
      state.failed = false;

      setStatus(
        "HalDo AI OS 20 ist bereit."
      );

      emit("boot:ready", {
        version: VERSION,
        apps: SYSTEM_APPS.length,
        duration:
          Date.now() - state.startTime
      });

      /*
       * Shell-Bootscreen entfernen.
       */
      if (
        typeof window.HalDoShellReady ===
        "function"
      ) {
        window.HalDoShellReady();
      }

      log(
        "HalDo AI OS 20 erfolgreich initialisiert.",
        SYSTEM_APPS.length + " Apps erkannt."
      );

      return HalDoBootstrap;

    } catch (error) {
      state.starting = false;
      state.failed = true;

      fail(
        "HalDo AI OS 20 konnte nicht vollständig gestartet werden.",
        error
      );

      setStatus(
        "HalDo AI OS 20 läuft im Wiederherstellungsmodus."
      );

      /*
       * Die Shell bleibt benutzbar.
       * Wir zerstören nicht den gesamten Desktop.
       */
      try {
        if (
          typeof window.HalDoShellReady ===
          "function"
        ) {
          window.HalDoShellReady();
        }
      } catch (_) {}

      return HalDoBootstrap;
    }
  }

  /*
   * ------------------------------------------------------------
   * PUBLIC API
   * ------------------------------------------------------------
   */

  HalDoBootstrap.start = start;

  HalDoBootstrap.openApp = openApp;

  HalDoBootstrap.getApps = function () {
    return SYSTEM_APPS.slice();
  };

  HalDoBootstrap.getApp = function (id) {
    return (
      SYSTEM_APPS.find(function (app) {
        return app.id === id;
      }) || null
    );
  };

  /*
   * ------------------------------------------------------------
   * GLOBAL EVENT BRIDGES
   * ------------------------------------------------------------
   */

  window.addEventListener(
    "haldo:app-open",
    function (event) {
      const id =
        event.detail?.id ||
        event.detail?.appId;

      if (id) {
        openApp(id);
      }
    }
  );

  window.addEventListener(
    "haldo:open-app",
    function (event) {
      const id =
        event.detail?.id ||
        event.detail?.appId;

      if (id) {
        openApp(id);
      }
    }
  );

  /*
   * ------------------------------------------------------------
   * ERROR PROTECTION
   * ------------------------------------------------------------
   */

  window.addEventListener(
    "error",
    function (event) {
      if (
        event &&
        event.error &&
        event.error.__haldoHandled
      ) {
        return;
      }

      state.errors.push({
        message:
          event.message ||
          "Unbekannter JavaScript-Fehler",
        source: event.filename || null,
        line: event.lineno || null,
        column: event.colno || null,
        time: Date.now()
      });
    }
  );

  window.addEventListener(
    "unhandledrejection",
    function (event) {
      state.errors.push({
        message:
          "Unhandled Promise Rejection",
        reason:
          event.reason || null,
        time: Date.now()
      });
    }
  );

  /*
   * ------------------------------------------------------------
   * START AFTER DOM READY
   * ------------------------------------------------------------
   */

  function boot() {
    /*
     * Ein kleiner defer verhindert, dass die Shell
     * während des initialen DOM-Aufbaus blockiert.
     */
    window.setTimeout(function () {
      start();
    }, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      {
        once: true
      }
    );
  } else {
    boot();
  }

})(window, document);
