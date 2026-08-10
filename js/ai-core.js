/*
========================================================
HalDo AI OS 18
AI Core Service
Professional Ultimate Foundation
========================================================
*/

(function () {
  "use strict";

  const VERSION = "18.0.0";

  const state = {
    status: "idle",
    initialized: false,
    startedAt: null,
    requestCount: 0,
    lastRequest: null,
    lastResponse: null,
    errors: []
  };

  const listeners = new Map();

  const features = [
    "AI Assistant",
    "AI Engine",
    "Learning Engine",
    "Code Builder",
    "Knowledge System",
    "Memory System",
    "Language System",
    "Êzîdî Keyboard",
    "Voice Interface",
    "Speech Interface",
    "Command System",
    "Conversation State",
    "System Integration",
    "Storage Integration",
    "Live Light Interface"
  ];

  /* ====================================================
     EVENTS
  ==================================================== */

  function on(event, callback) {
    if (typeof callback !== "function") return () => {};

    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }

    listeners.get(event).add(callback);

    return () => off(event, callback);
  }

  function off(event, callback) {
    const set = listeners.get(event);
    if (!set) return;

    set.delete(callback);

    if (set.size === 0) {
      listeners.delete(event);
    }
  }

  function emit(event, payload = {}) {
    const set = listeners.get(event);
    if (!set) return;

    set.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        recordError(error);
      }
    });
  }

  /* ====================================================
     ERROR HANDLING
  ==================================================== */

  function recordError(error) {
    const entry = {
      message: error?.message || String(error),
      time: new Date().toISOString()
    };

    state.errors.push(entry);

    if (state.errors.length > 50) {
      state.errors.shift();
    }

    console.error("[HalDo AI Core]", entry.message);

    emit("error", entry);
  }

  /* ====================================================
     MODULE LOOKUP
  ==================================================== */

  function getModule(name) {
    if (!name) return null;

    const kernel = window.HalDoKernel;

    if (kernel && typeof kernel.getModule === "function") {
      try {
        const module = kernel.getModule(name);

        if (module) return module;
      } catch (error) {
        recordError(error);
      }
    }

    const os = window.HalDoOS;

    if (os && os[name]) {
      return os[name];
    }

    return null;
  }

  /* ====================================================
     SYSTEM CONNECTION
  ==================================================== */

  function notifyLight(mode) {
    try {
      if (
        window.HalDoLight &&
        typeof window.HalDoLight.setMode === "function"
      ) {
        window.HalDoLight.setMode(mode);
      }
    } catch (error) {
      recordError(error);
    }
  }

  /* ====================================================
     STORAGE
  ==================================================== */

  function saveConversation(request, response) {
    try {
      const memory =
        window.HalDoAIMemory ||
        getModule("ai-memory") ||
        getModule("memory");

      if (memory) {
        if (typeof memory.remember === "function") {
          memory.remember({
            type: "conversation",
            user: request,
            assistant: response,
            time: new Date().toISOString()
          });

          return true;
        }

        if (typeof memory.add === "function") {
          memory.add({
            type: "conversation",
            user: request,
            assistant: response,
            time: new Date().toISOString()
          });

          return true;
        }
      }

      const storage =
        window.HalDoStorage ||
        getModule("storage") ||
        getModule("storage-manager");

      if (storage) {
        const key = "haldo_ai_conversations";

        let conversations = [];

        if (typeof storage.get === "function") {
          conversations = storage.get(key) || [];
        } else {
          try {
            conversations = JSON.parse(
              localStorage.getItem(key) || "[]"
            );
          } catch {
            conversations = [];
          }
        }

        conversations.push({
          user: request,
          assistant: response,
          time: new Date().toISOString()
        });

        conversations = conversations.slice(-100);

        if (typeof storage.set === "function") {
          storage.set(key, conversations);
        } else {
          localStorage.setItem(
            key,
            JSON.stringify(conversations)
          );
        }

        return true;
      }
    } catch (error) {
      recordError(error);
    }

    return false;
  }

  /* ====================================================
     COMMAND CONNECTION
  ==================================================== */

  async function executeCommand(input) {
    const commands =
      window.HalDoAICommands ||
      getModule("ai-commands") ||
      getModule("commands");

    if (!commands) return null;

    try {
      if (typeof commands.execute === "function") {
        return await commands.execute(input);
      }

      if (typeof commands.handle === "function") {
        return await commands.handle(input);
      }

      if (typeof commands.run === "function") {
        return await commands.run(input);
      }
    } catch (error) {
      recordError(error);
    }

    return null;
  }

  /* ====================================================
     AI ENGINE CONNECTION
  ==================================================== */

  async function executeEngine(input, context = {}) {
    const engine =
      window.HalDoAIEngine ||
      getModule("ai-engine") ||
      getModule("engine");

    if (!engine) return null;

    try {
      if (typeof engine.process === "function") {
        return await engine.process(input, context);
      }

      if (typeof engine.generate === "function") {
        return await engine.generate(input, context);
      }

      if (typeof engine.ask === "function") {
        return await engine.ask(input, context);
      }

      if (typeof engine.respond === "function") {
        return await engine.respond(input, context);
      }
    } catch (error) {
      recordError(error);
    }

    return null;
  }

  /* ====================================================
     FALLBACK RESPONSE
  ==================================================== */

  function fallbackResponse(input) {
    const normalized = input.toLowerCase();

    if (
      normalized.includes("hallo") ||
      normalized.includes("hi") ||
      normalized.includes("hey")
    ) {
      return "Hallo! Ich bin HalDo AI. Wie kann ich dir helfen?";
    }

    if (
      normalized.includes("wer bist du") ||
      normalized.includes("was bist du")
    ) {
      return (
        "Ich bin HalDo AI, der zentrale KI-Dienst " +
        "des HalDo AI OS 18."
      );
    }

    if (
      normalized.includes("status") ||
      normalized.includes("system")
    ) {
      return (
        "HalDo AI OS 18 ist aktiv. " +
        "Der AI Core läuft und ist bereit."
      );
    }

    if (
      normalized.includes("hilfe") ||
      normalized.includes("help")
    ) {
      return (
        "Ich kann Gespräche führen, Befehle verarbeiten, " +
        "Systemmodule ansprechen, Wissen verwalten und " +
        "weitere HalDo AI Funktionen koordinieren."
      );
    }

    return (
      "HalDo AI hat deine Anfrage empfangen. " +
      "Der zentrale AI Core ist verbunden und bereit, " +
      "weitere AI-Module zu verwenden."
    );
  }

  /* ====================================================
     MAIN ASK
  ==================================================== */

  async function ask(message, context = {}) {
    const input = String(message || "").trim();

    if (!input) {
      return {
        success: false,
        input: "",
        response: "Bitte schreibe eine Anfrage.",
        source: "validation"
      };
    }

    state.requestCount++;
    state.lastRequest = input;
    state.status = "thinking";

    notifyLight("thinking");

    emit("request:start", {
      input,
      context
    });

    try {
      /*
       * 1. Command System
       */

      const commandResult =
        await executeCommand(input);

      if (commandResult !== null &&
          commandResult !== undefined) {

        const response =
          typeof commandResult === "string"
            ? commandResult
            : commandResult.response ||
              commandResult.message ||
              JSON.stringify(commandResult);

        return finishResponse(
          input,
          response,
          "command",
          context
        );
      }

      /*
       * 2. AI Engine
       */

      const engineResult =
        await executeEngine(
          input,
          context
        );

      if (engineResult !== null &&
          engineResult !== undefined) {

        const response =
          typeof engineResult === "string"
            ? engineResult
            : engineResult.response ||
              engineResult.message ||
              engineResult.text ||
              JSON.stringify(engineResult);

        return finishResponse(
          input,
          response,
          "engine",
          context
        );
      }

      /*
       * 3. Foundation fallback
       */

      return finishResponse(
        input,
        fallbackResponse(input),
        "foundation",
        context
      );

    } catch (error) {
      recordError(error);

      return finishResponse(
        input,
        "HalDo AI konnte die Anfrage nicht vollständig verarbeiten.",
        "error",
        context
      );
    }
  }

  /* ====================================================
     RESPONSE FINALIZATION
  ==================================================== */

  function finishResponse(
    input,
    response,
    source,
    context
  ) {
    const result = {
      success: true,
      input,
      response: String(response),
      source,
      context,
      time: new Date().toISOString()
    };

    state.lastResponse = result;
    state.status = "answering";

    saveConversation(
      input,
      result.response
    );

    emit("request:complete", result);

    notifyLight("answering");

    window.setTimeout(() => {
      state.status = "idle";
      notifyLight("idle");

      emit("status", getStatus());
    }, 350);

    return result;
  }

  /* ====================================================
     START / STOP
  ==================================================== */

  function start() {
    if (state.initialized) {
      state.status = "running";

      return getStatus();
    }

    state.initialized = true;
    state.startedAt = new Date().toISOString();
    state.status = "running";

    emit("start", getStatus());

    console.log(
      "HalDo AI Core 18.0.0 gestartet"
    );

    return getStatus();
  }

  function stop() {
    state.status = "stopped";

    emit("stop", getStatus());

    return getStatus();
  }

  /* ====================================================
     STATUS
  ==================================================== */

  function getStatus() {
    return {
      name: "HalDo AI Core",
      version: VERSION,
      status: state.status,
      initialized: state.initialized,
      startedAt: state.startedAt,
      requestCount: state.requestCount,
      lastRequest: state.lastRequest,
      lastResponse: state.lastResponse,
      errorCount: state.errors.length,
      features: [...features]
    };
  }

  /* ====================================================
     DIAGNOSTICS
  ==================================================== */

  function diagnostics() {
    return {
      core: getStatus(),

      modules: {
        engine: !!(
          window.HalDoAIEngine ||
          getModule("ai-engine")
        ),

        memory: !!(
          window.HalDoAIMemory ||
          getModule("ai-memory")
        ),

        commands: !!(
          window.HalDoAICommands ||
          getModule("ai-commands")
        ),

        language: !!(
          window.HalDoAILanguage ||
          getModule("ai-language")
        ),

        speech: !!(
          window.HalDoAISpeech ||
          getModule("ai-speech")
        ),

        voice: !!(
          window.HalDoAIVoice ||
          getModule("ai-voice")
        ),

        storage: !!(
          window.HalDoStorage ||
          getModule("storage")
        ),

        system: !!(
          window.HalDoSystem ||
          getModule("system")
        )
      },

      browser: {
        online: navigator.onLine,
        localStorage: !!window.localStorage,
        speechRecognition:
          !!(
            window.SpeechRecognition ||
            window.webkitSpeechRecognition
          ),
        speechSynthesis:
          "speechSynthesis" in window
      },

      time: new Date().toISOString()
    };
  }

  /* ====================================================
     PUBLIC API
  ==================================================== */

  const HalDoAICore = {

    name: "HalDo AI Core",

    version: VERSION,

    features,

    start,

    stop,

    ask,

    getStatus,

    diagnostics,

    on,

    off,

    emit,

    getModule
  };

  /*
   * Global AI API
   */

  window.HalDoAICore = HalDoAICore;

  /*
   * OS namespace
   */

  window.HalDoOS =
    window.HalDoOS || {};

  window.HalDoOS.ai =
    HalDoAICore;

  /*
   * Automatic initialization
   */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      () => start(),
      { once: true }
    );

  } else {

    start();

  }

})();