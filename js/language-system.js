/*
========================================================

HalDo AI OS 18
Language System

Professional Ultimate Foundation

Version:
18.0.0

Aufgaben:
- Zentrale Sprachverwaltung
- Deutsch
- Kurdî
- Êzîdî
- Englisch
- Arabisch
- Türkisch
- Französisch
- Spanisch
- Italienisch
- Portugiesisch
- Russisch
- Persisch
- UI-Übersetzungen
- AI-Sprache
- Voice-Sprache
- Tastatur-Sprache
- Speicherung der Auswahl

========================================================
*/

(function (window, document) {

    "use strict";


    const HalDoLanguage = {


        /* ==================================================
           GRUNDINFORMATIONEN
           ================================================== */

        name:
            "HalDo Language System",

        version:
            "18.0.0",

        status:
            "ready",


        /* ==================================================
           STANDARDSPRACHE
           ================================================== */

        defaultLanguage:
            "de",


        currentLanguage:
            "de",


        /* ==================================================
           VERFÜGBARE SPRACHEN
           ================================================== */

        languages: {


            de: {
                code: "de",
                locale: "de-DE",
                name: "Deutsch",
                nativeName: "Deutsch",
                direction: "ltr"
            },


            ku: {
                code: "ku",
                locale: "ku",
                name: "Kurdisch",
                nativeName: "Kurdî",
                direction: "ltr"
            },


            ez: {
                code: "ez",
                locale: "ku-Latn",
                name: "Êzîdî",
                nativeName: "Êzîdî",
                direction: "ltr"
            },


            en: {
                code: "en",
                locale: "en-US",
                name: "English",
                nativeName: "English",
                direction: "ltr"
            },


            ar: {
                code: "ar",
                locale: "ar-SA",
                name: "Arabisch",
                nativeName: "العربية",
                direction: "rtl"
            },


            tr: {
                code: "tr",
                locale: "tr-TR",
                name: "Türkisch",
                nativeName: "Türkçe",
                direction: "ltr"
            },


            fr: {
                code: "fr",
                locale: "fr-FR",
                name: "Französisch",
                nativeName: "Français",
                direction: "ltr"
            },


            es: {
                code: "es",
                locale: "es-ES",
                name: "Spanisch",
                nativeName: "Español",
                direction: "ltr"
            },


            it: {
                code: "it",
                locale: "it-IT",
                name: "Italienisch",
                nativeName: "Italiano",
                direction: "ltr"
            },


            pt: {
                code: "pt",
                locale: "pt-PT",
                name: "Portugiesisch",
                nativeName: "Português",
                direction: "ltr"
            },


            ru: {
                code: "ru",
                locale: "ru-RU",
                name: "Russisch",
                nativeName: "Русский",
                direction: "ltr"
            },


            fa: {
                code: "fa",
                locale: "fa-IR",
                name: "Persisch",
                nativeName: "فارسی",
                direction: "rtl"
            }

        },


        /* ==================================================
           ÜBERSETZUNGEN
           ================================================== */

        translations: {


            de: {

                welcome:
                    "Willkommen bei HalDo AI",

                mainMenu:
                    "Hauptmenü",

                dashboard:
                    "Dashboard",

                aiCore:
                    "AI Core",

                modules:
                    "Module",

                apps:
                    "Apps",

                settings:
                    "Einstellungen",

                systemStatus:
                    "System Status",

                health:
                    "Health Center",

                microphone:
                    "Mikrofon",

                listening:
                    "HalDo AI hört zu...",

                thinking:
                    "HalDo AI denkt nach...",

                answering:
                    "HalDo AI antwortet...",

                speaking:
                    "HalDo AI spricht...",

                write:
                    "Schreibe mit HalDo AI...",

                send:
                    "Senden",

                language:
                    "Sprache",

                keyboard:
                    "Tastatur",

                save:
                    "Speichern",

                cancel:
                    "Abbrechen"

            },


            ku: {

                welcome:
                    "Bi xêr hatî HalDo AI",

                mainMenu:
                    "Menuya Sereke",

                dashboard:
                    "Dashboard",

                aiCore:
                    "AI Core",

                modules:
                    "Modul",

                apps:
                    "Sepan",

                settings:
                    "Mîheng",

                systemStatus:
                    "Rewşa Sîstemê",

                health:
                    "Navenda Tenduristiyê",

                microphone:
                    "Mîkrofon",

                listening:
                    "HalDo AI guhdarî dike...",

                thinking:
                    "HalDo AI difikire...",

                answering:
                    "HalDo AI bersiv dide...",

                speaking:
                    "HalDo AI diaxive...",

                write:
                    "Bi HalDo AI re binivîse...",

                send:
                    "Bişîne",

                language:
                    "Ziman",

                keyboard:
                    "Klavyeyê",

                save:
                    "Tomar bike",

                cancel:
                    "Betal bike"

            },


            ez: {

                welcome:
                    "Bi xêr hatî bo HalDo AI",

                mainMenu:
                    "Menuya Serî",

                dashboard:
                    "Dashboard",

                aiCore:
                    "AI Core",

                modules:
                    "Modul",

                apps:
                    "Sepan",

                settings:
                    "Mîheng",

                systemStatus:
                    "Rewşa Sîstemê",

                health:
                    "Navenda Tenduristiyê",

                microphone:
                    "Mîkrofon",

                listening:
                    "HalDo AI guhdarî dike...",

                thinking:
                    "HalDo AI difikire...",

                answering:
                    "HalDo AI bersiv dide...",

                speaking:
                    "HalDo AI diaxive...",

                write:
                    "Bi HalDo AI re binivîse...",

                send:
                    "Bişîne",

                language:
                    "Ziman",

                keyboard:
                    "Klavyeyê",

                save:
                    "Tomar bike",

                cancel:
                    "Betal bike"

            },


            en: {

                welcome:
                    "Welcome to HalDo AI",

                mainMenu:
                    "Main Menu",

                dashboard:
                    "Dashboard",

                aiCore:
                    "AI Core",

                modules:
                    "Modules",

                apps:
                    "Apps",

                settings:
                    "Settings",

                systemStatus:
                    "System Status",

                health:
                    "Health Center",

                microphone:
                    "Microphone",

                listening:
                    "HalDo AI is listening...",

                thinking:
                    "HalDo AI is thinking...",

                answering:
                    "HalDo AI is answering...",

                speaking:
                    "HalDo AI is speaking...",

                write:
                    "Write with HalDo AI...",

                send:
                    "Send",

                language:
                    "Language",

                keyboard:
                    "Keyboard",

                save:
                    "Save",

                cancel:
                    "Cancel"

            },


            tr: {

                welcome:
                    "HalDo AI'ya hoş geldiniz",

                mainMenu:
                    "Ana Menü",

                dashboard:
                    "Kontrol Paneli",

                aiCore:
                    "AI Core",

                modules:
                    "Modüller",

                apps:
                    "Uygulamalar",

                settings:
                    "Ayarlar",

                systemStatus:
                    "Sistem Durumu",

                health:
                    "Sağlık Merkezi",

                microphone:
                    "Mikrofon",

                listening:
                    "HalDo AI dinliyor...",

                thinking:
                    "HalDo AI düşünüyor...",

                answering:
                    "HalDo AI cevaplıyor...",

                speaking:
                    "HalDo AI konuşuyor...",

                write:
                    "HalDo AI ile yaz...",

                send:
                    "Gönder",

                language:
                    "Dil",

                keyboard:
                    "Klavye",

                save:
                    "Kaydet",

                cancel:
                    "İptal"

            },


            ar: {

                welcome:
                    "مرحباً بك في HalDo AI",

                mainMenu:
                    "القائمة الرئيسية",

                dashboard:
                    "لوحة التحكم",

                aiCore:
                    "نواة الذكاء الاصطناعي",

                modules:
                    "الوحدات",

                apps:
                    "التطبيقات",

                settings:
                    "الإعدادات",

                systemStatus:
                    "حالة النظام",

                health:
                    "المركز الصحي",

                microphone:
                    "الميكروفون",

                listening:
                    "HalDo AI يستمع...",

                thinking:
                    "HalDo AI يفكر...",

                answering:
                    "HalDo AI يجيب...",

                speaking:
                    "HalDo AI يتحدث...",

                write:
                    "اكتب مع HalDo AI...",

                send:
                    "إرسال",

                language:
                    "اللغة",

                keyboard:
                    "لوحة المفاتيح",

                save:
                    "حفظ",

                cancel:
                    "إلغاء"

            },


            fr: {

                welcome:
                    "Bienvenue sur HalDo AI",

                mainMenu:
                    "Menu principal",

                dashboard:
                    "Tableau de bord",

                aiCore:
                    "AI Core",

                modules:
                    "Modules",

                apps:
                    "Applications",

                settings:
                    "Paramètres",

                systemStatus:
                    "État du système",

                health:
                    "Centre de santé",

                microphone:
                    "Microphone",

                listening:
                    "HalDo AI écoute...",

                thinking:
                    "HalDo AI réfléchit...",

                answering:
                    "HalDo AI répond...",

                speaking:
                    "HalDo AI parle...",

                write:
                    "Écrivez avec HalDo AI...",

                send:
                    "Envoyer",

                language:
                    "Langue",

                keyboard:
                    "Clavier",

                save:
                    "Enregistrer",

                cancel:
                    "Annuler"

            },


            es: {

                welcome:
                    "Bienvenido a HalDo AI",

                mainMenu:
                    "Menú principal",

                dashboard:
                    "Panel",

                aiCore:
                    "AI Core",

                modules:
                    "Módulos",

                apps:
                    "Aplicaciones",

                settings:
                    "Configuración",

                systemStatus:
                    "Estado del sistema",

                health:
                    "Centro de salud",

                microphone:
                    "Micrófono",

                listening:
                    "HalDo AI está escuchando...",

                thinking:
                    "HalDo AI está pensando...",

                answering:
                    "HalDo AI está respondiendo...",

                speaking:
                    "HalDo AI está hablando...",

                write:
                    "Escribe con HalDo AI...",

                send:
                    "Enviar",

                language:
                    "Idioma",

                keyboard:
                    "Teclado",

                save:
                    "Guardar",

                cancel:
                    "Cancelar"

            },


            it: {

                welcome:
                    "Benvenuto in HalDo AI",

                mainMenu:
                    "Menu principale",

                dashboard:
                    "Dashboard",

                aiCore:
                    "AI Core",

                modules:
                    "Moduli",

                apps:
                    "App",

                settings:
                    "Impostazioni",

                systemStatus:
                    "Stato del sistema",

                health:
                    "Centro salute",

                microphone:
                    "Microfono",

                listening:
                    "HalDo AI sta ascoltando...",

                thinking:
                    "HalDo AI sta pensando...",

                answering:
                    "HalDo AI sta rispondendo...",

                speaking:
                    "HalDo AI sta parlando...",

                write:
                    "Scrivi con HalDo AI...",

                send:
                    "Invia",

                language:
                    "Lingua",

                keyboard:
                    "Tastiera",

                save:
                    "Salva",

                cancel:
                    "Annulla"

            },


            pt: {

                welcome:
                    "Bem-vindo ao HalDo AI",

                mainMenu:
                    "Menu principal",

                dashboard:
                    "Painel",

                aiCore:
                    "AI Core",

                modules:
                    "Módulos",

                apps:
                    "Aplicações",

                settings:
                    "Definições",

                systemStatus:
                    "Estado do sistema",

                health:
                    "Centro de saúde",

                microphone:
                    "Microfone",

                listening:
                    "HalDo AI está a ouvir...",

                thinking:
                    "HalDo AI está a pensar...",

                answering:
                    "HalDo AI está a responder...",

                speaking:
                    "HalDo AI está a falar...",

                write:
                    "Escreva com HalDo AI...",

                send:
                    "Enviar",

                language:
                    "Idioma",

                keyboard:
                    "Teclado",

                save:
                    "Guardar",

                cancel:
                    "Cancelar"

            },


            ru: {

                welcome:
                    "Добро пожаловать в HalDo AI",

                mainMenu:
                    "Главное меню",

                dashboard:
                    "Панель управления",

                aiCore:
                    "AI Core",

                modules:
                    "Модули",

                apps:
                    "Приложения",

                settings:
                    "Настройки",

                systemStatus:
                    "Состояние системы",

                health:
                    "Центр здоровья",

                microphone:
                    "Микрофон",

                listening:
                    "HalDo AI слушает...",

                thinking:
                    "HalDo AI думает...",

                answering:
                    "HalDo AI отвечает...",

                speaking:
                    "HalDo AI говорит...",

                write:
                    "Пишите с HalDo AI...",

                send:
                    "Отправить",

                language:
                    "Язык",

                keyboard:
                    "Клавиатура",

                save:
                    "Сохранить",

                cancel:
                    "Отмена"

            },


            fa: {

                welcome:
                    "به HalDo AI خوش آمدید",

                mainMenu:
                    "منوی اصلی",

                dashboard:
                    "داشبورد",

                aiCore:
                    "هسته هوش مصنوعی",

                modules:
                    "ماژول‌ها",

                apps:
                    "برنامه‌ها",

                settings:
                    "تنظیمات",

                systemStatus:
                    "وضعیت سیستم",

                health:
                    "مرکز سلامت",

                microphone:
                    "میکروفون",

                listening:
                    "HalDo AI در حال گوش دادن است...",

                thinking:
                    "HalDo AI در حال فکر کردن است...",

                answering:
                    "HalDo AI در حال پاسخ دادن است...",

                speaking:
                    "HalDo AI در حال صحبت است...",

                write:
                    "با HalDo AI بنویسید...",

                send:
                    "ارسال",

                language:
                    "زبان",

                keyboard:
                    "صفحه‌کلید",

                save:
                    "ذخیره",

                cancel:
                    "لغو"

            }

        },


        /* ==================================================
           SPRACHE SETZEN
           ================================================== */

        setLanguage:
            function (code) {


                if (
                    !this.languages[code]
                ) {


                    console.warn(
                        "HalDo Language: unbekannte Sprache:",
                        code
                    );


                    return false;

                }


                this.currentLanguage =
                    code;


                const language =
                    this.languages[code];


                /*
                 * HTML-Sprache
                 */

                document.documentElement.lang =
                    language.locale;


                /*
                 * Schreibrichtung
                 */

                document.documentElement.dir =
                    language.direction;


                /*
                 * AI Core
                 */

                if (
                    window.HalDoAICore &&
                    typeof window.HalDoAICore.setLanguage ===
                        "function"
                ) {


                    window.HalDoAICore.setLanguage(
                        language.name
                    );


                }


                /*
                 * Voice
                 */

                if (
                    window.HalDoVoice &&
                    typeof window.HalDoVoice.setLanguage ===
                        "function"
                ) {


                    window.HalDoVoice.setLanguage(
                        language.locale
                    );


                }


                /*
                 * Speichern
                 */

                this.saveLanguage(
                    code
                );


                /*
                 * UI aktualisieren
                 */

                this.updateUI();


                /*
                 * Event
                 */

                this.dispatch(
                    "language-change",
                    {
                        code:
                            code,

                        language:
                            language
                    }
                );


                return true;

            },


        /* ==================================================
           ÜBERSETZUNG ABRUFEN
           ================================================== */

        t:
            function (key) {


                const dictionary =
                    this.translations[
                        this.currentLanguage
                    ];


                if (
                    dictionary &&
                    dictionary[key]
                ) {


                    return dictionary[key];

                }


                /*
                 * Fallback Deutsch
                 */

                if (
                    this.translations.de[key]
                ) {


                    return this.translations.de[key];

                }


                return key;

            },


        /* ==================================================
           UI AKTUALISIEREN
           ================================================== */

        updateUI:
            function () {


                const elements =
                    document.querySelectorAll(
                        "[data-i18n]"
                    );


                elements.forEach(
                    function (element) {


                        const key =
                            element.getAttribute(
                                "data-i18n"
                            );


                        const translated =
                            this.t(
                                key
                            );


                        if (
                            translated
                        ) {


                            element.textContent =
                                translated;


                        }


                    }.bind(this)
                );


                /*
                 * Placeholder
                 */

                const inputs =
                    document.querySelectorAll(
                        "[data-i18n-placeholder]"
                    );


                inputs.forEach(
                    function (input) {


                        const key =
                            input.getAttribute(
                                "data-i18n-placeholder"
                            );


                        input.placeholder =
                            this.t(
                                key
                            );


                    }.bind(this)
                );


            },


        /* ==================================================
           SPRACHLISTE
           ================================================== */

        getLanguages:
            function () {


                return Object.values(
                    this.languages
                );

            },


        /* ==================================================
           AKTUELLE SPRACHE
           ================================================== */

        getCurrentLanguage:
            function () {


                return this.languages[
                    this.currentLanguage
                ];

            },


        /* ==================================================
           SPEICHERN
           ================================================== */

        saveLanguage:
            function (code) {


                try {


                    localStorage.setItem(
                        "haldo-language",
                        code
                    );


                } catch (
                    error
                ) {


                    console.warn(
                        "HalDo Language konnte nicht gespeichert werden.",
                        error
                    );


                }

            },


        /* ==================================================
           LADEN
           ================================================== */

        loadLanguage:
            function () {


                try {


                    const saved =
                        localStorage.getItem(
                            "haldo-language"
                        );


                    if (
                        saved &&
                        this.languages[saved]
                    ) {


                        this.currentLanguage =
                            saved;


                        return saved;

                    }


                } catch (
                    error
                ) {


                    console.warn(
                        "HalDo Language konnte nicht geladen werden.",
                        error
                    );


                }


                this.currentLanguage =
                    this.defaultLanguage;


                return this.currentLanguage;

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
                            "haldo-language-" +
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
                        "HalDo Language Event Fehler:",
                        error
                    );


                }

            },


        /* ==================================================
           INITIALISIERUNG
           ================================================== */

        init:
            function () {


                this.status =
                    "running";


                const saved =
                    this.loadLanguage();


                this.setLanguage(
                    saved
                );


                console.log(
                    "HalDo Language System bereit:",
                    saved
                );


                return true;

            }

    };


    /* ======================================================
       GLOBAL
       ====================================================== */

    window.HalDoLanguage =
        HalDoLanguage;


    /* ======================================================
       START
       ====================================================== */

    function initialize() {


        HalDoLanguage.init();


    }


    if (
        document.readyState ===
        "loading"
    ) {


        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once:
                    true
            }
        );


    } else {


        initialize();


    }


})(window, document);