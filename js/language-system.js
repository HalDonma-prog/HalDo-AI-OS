/*
==========================================
HalDo AI OS 18
Central Language System

Professional Ultimate Foundation
Version 18.0.0
==========================================
*/

(function () {

    "use strict";

    const HalDoLanguageSystem = {

        version: "18.0.0",

        current: "de",

        fallback: "de",

        ready: false,

        languages: {

            de: {
                id: "de",
                name: "Deutsch",
                native: "Deutsch",
                voice: "de-DE",
                direction: "ltr"
            },

            en: {
                id: "en",
                name: "English",
                native: "English",
                voice: "en-US",
                direction: "ltr"
            },

            ku: {
                id: "ku",
                name: "Kurdî",
                native: "Kurmancî",
                voice: "ku",
                direction: "ltr"
            },

            ez: {
                id: "ez",
                name: "Êzîkî",
                native: "Êzîkî",
                voice: "ku",
                direction: "ltr"
            },

            tr: {
                id: "tr",
                name: "Türkçe",
                native: "Türkçe",
                voice: "tr-TR",
                direction: "ltr"
            },

            ar: {
                id: "ar",
                name: "العربية",
                native: "العربية",
                voice: "ar-SA",
                direction: "rtl"
            },

            fr: {
                id: "fr",
                name: "Français",
                native: "Français",
                voice: "fr-FR",
                direction: "ltr"
            },

            es: {
                id: "es",
                name: "Español",
                native: "Español",
                voice: "es-ES",
                direction: "ltr"
            },

            it: {
                id: "it",
                name: "Italiano",
                native: "Italiano",
                voice: "it-IT",
                direction: "ltr"
            },

            pt: {
                id: "pt",
                name: "Português",
                native: "Português",
                voice: "pt-PT",
                direction: "ltr"
            },

            nl: {
                id: "nl",
                name: "Nederlands",
                native: "Nederlands",
                voice: "nl-NL",
                direction: "ltr"
            },

            pl: {
                id: "pl",
                name: "Polski",
                native: "Polski",
                voice: "pl-PL",
                direction: "ltr"
            },

            uk: {
                id: "uk",
                name: "Українська",
                native: "Українська",
                voice: "uk-UA",
                direction: "ltr"
            },

            ru: {
                id: "ru",
                name: "Русский",
                native: "Русский",
                voice: "ru-RU",
                direction: "ltr"
            },

            hi: {
                id: "hi",
                name: "हिन्दी",
                native: "हिन्दी",
                voice: "hi-IN",
                direction: "ltr"
            },

            fa: {
                id: "fa",
                name: "فارسی",
                native: "فارسی",
                voice: "fa-IR",
                direction: "rtl"
            },

            zh: {
                id: "zh",
                name: "中文",
                native: "中文",
                voice: "zh-CN",
                direction: "ltr"
            },

            ja: {
                id: "ja",
                name: "日本語",
                native: "日本語",
                voice: "ja-JP",
                direction: "ltr"
            },

            ko: {
                id: "ko",
                name: "한국어",
                native: "한국어",
                voice: "ko-KR",
                direction: "ltr"
            },

            el: {
                id: "el",
                name: "Ελληνικά",
                native: "Ελληνικά",
                voice: "el-GR",
                direction: "ltr"
            }

        },

        translations: {

            de: {
                menu: "Hauptmenü",
                dashboard: "Dashboard",
                aiCore: "AI Core",
                modules: "Module",
                apps: "Apps",
                settings: "Einstellungen",
                status: "System Status",
                health: "Health Center",
                language: "Sprache",
                voice: "Stimme",
                microphone: "Mikrofon",
                send: "Senden",
                speak: "Vorlesen",
                back: "Zurück",
                welcome: "Willkommen bei HalDo AI OS",
                ready: "Bereit",
                loading: "Wird geladen...",
                online: "Online",
                offline: "Offline"
            },

            en: {
                menu: "Main Menu",
                dashboard: "Dashboard",
                aiCore: "AI Core",
                modules: "Modules",
                apps: "Apps",
                settings: "Settings",
                status: "System Status",
                health: "Health Center",
                language: "Language",
                voice: "Voice",
                microphone: "Microphone",
                send: "Send",
                speak: "Read aloud",
                back: "Back",
                welcome: "Welcome to HalDo AI OS",
                ready: "Ready",
                loading: "Loading...",
                online: "Online",
                offline: "Offline"
            },

            ku: {
                menu: "Menuya Sereke",
                dashboard: "Panoya kontrolê",
                aiCore: "AI Core",
                modules: "Modûl",
                apps: "Sepan",
                settings: "Mîheng",
                status: "Rewşa Sîstemê",
                health: "Navenda Tenduristiyê",
                language: "Ziman",
                voice: "Deng",
                microphone: "Mîkrofon",
                send: "Şandin",
                speak: "Bi deng bixwîne",
                back: "Vegere",
                welcome: "Bi xêr hatî HalDo AI OS",
                ready: "Amade",
                loading: "Tê barkirin...",
                online: "Girêdayî",
                offline: "Ne girêdayî"
            },

            ez: {
                menu: "Menu",
                dashboard: "Panoya kontrolê",
                aiCore: "AI Core",
                modules: "Modûl",
                apps: "Sepan",
                settings: "Mîheng",
                status: "Rewşa Sîstemê",
                health: "Navenda Tenduristiyê",
                language: "Ziman",
                voice: "Deng",
                microphone: "Mîkrofon",
                send: "Şandin",
                speak: "Bi deng bixwîne",
                back: "Vegere",
                welcome: "Bi xêr hatî HalDo AI OS",
                ready: "Amade",
                loading: "Tê barkirin...",
                online: "Girêdayî",
                offline: "Ne girêdayî"
            },

            tr: {
                menu: "Ana Menü",
                dashboard: "Kontrol Paneli",
                aiCore: "AI Core",
                modules: "Modüller",
                apps: "Uygulamalar",
                settings: "Ayarlar",
                status: "Sistem Durumu",
                health: "Sağlık Merkezi",
                language: "Dil",
                voice: "Ses",
                microphone: "Mikrofon",
                send: "Gönder",
                speak: "Sesli Oku",
                back: "Geri",
                welcome: "HalDo AI OS'ye Hoş Geldiniz",
                ready: "Hazır",
                loading: "Yükleniyor...",
                online: "Çevrimiçi",
                offline: "Çevrimdışı"
            },

            ar: {
                menu: "القائمة الرئيسية",
                dashboard: "لوحة التحكم",
                aiCore: "نواة الذكاء الاصطناعي",
                modules: "الوحدات",
                apps: "التطبيقات",
                settings: "الإعدادات",
                status: "حالة النظام",
                health: "مركز الصحة",
                language: "اللغة",
                voice: "الصوت",
                microphone: "الميكروفون",
                send: "إرسال",
                speak: "قراءة بصوت عالٍ",
                back: "رجوع",
                welcome: "مرحباً بك في HalDo AI OS",
                ready: "جاهز",
                loading: "جارٍ التحميل...",
                online: "متصل",
                offline: "غير متصل"
            },

            fr: {
                menu: "Menu principal",
                dashboard: "Tableau de bord",
                aiCore: "AI Core",
                modules: "Modules",
                apps: "Applications",
                settings: "Paramètres",
                status: "État du système",
                health: "Centre de santé",
                language: "Langue",
                voice: "Voix",
                microphone: "Microphone",
                send: "Envoyer",
                speak: "Lire à voix haute",
                back: "Retour",
                welcome: "Bienvenue dans HalDo AI OS",
                ready: "Prêt",
                loading: "Chargement...",
                online: "En ligne",
                offline: "Hors ligne"
            },

            es: {
                menu: "Menú principal",
                dashboard: "Panel",
                aiCore: "AI Core",
                modules: "Módulos",
                apps: "Aplicaciones",
                settings: "Configuración",
                status: "Estado del sistema",
                health: "Centro de salud",
                language: "Idioma",
                voice: "Voz",
                microphone: "Micrófono",
                send: "Enviar",
                speak: "Leer en voz alta",
                back: "Volver",
                welcome: "Bienvenido a HalDo AI OS",
                ready: "Listo",
                loading: "Cargando...",
                online: "En línea",
                offline: "Sin conexión"
            },

            it: {
                menu: "Menu principale",
                dashboard: "Dashboard",
                aiCore: "AI Core",
                modules: "Moduli",
                apps: "App",
                settings: "Impostazioni",
                status: "Stato del sistema",
                health: "Centro salute",
                language: "Lingua",
                voice: "Voce",
                microphone: "Microfono",
                send: "Invia",
                speak: "Leggi ad alta voce",
                back: "Indietro",
                welcome: "Benvenuto in HalDo AI OS",
                ready: "Pronto",
                loading: "Caricamento...",
                online: "Online",
                offline: "Offline"
            },

            pt: {
                menu: "Menu principal",
                dashboard: "Painel",
                aiCore: "AI Core",
                modules: "Módulos",
                apps: "Aplicativos",
                settings: "Configurações",
                status: "Estado do sistema",
                health: "Centro de saúde",
                language: "Idioma",
                voice: "Voz",
                microphone: "Microfone",
                send: "Enviar",
                speak: "Ler em voz alta",
                back: "Voltar",
                welcome: "Bem-vindo ao HalDo AI OS",
                ready: "Pronto",
                loading: "Carregando...",
                online: "Online",
                offline: "Offline"
            },

            nl: {
                menu: "Hoofdmenu",
                dashboard: "Dashboard",
                aiCore: "AI Core",
                modules: "Modules",
                apps: "Apps",
                settings: "Instellingen",
                status: "Systeemstatus",
                health: "Gezondheidscentrum",
                language: "Taal",
                voice: "Stem",
                microphone: "Microfoon",
                send: "Versturen",
                speak: "Voorlezen",
                back: "Terug",
                welcome: "Welkom bij HalDo AI OS",
                ready: "Gereed",
                loading: "Laden...",
                online: "Online",
                offline: "Offline"
            },

            pl: {
                menu: "Menu główne",
                dashboard: "Panel",
                aiCore: "AI Core",
                modules: "Moduły",
                apps: "Aplikacje",
                settings: "Ustawienia",
                status: "Stan systemu",
                health: "Centrum zdrowia",
                language: "Język",
                voice: "Głos",
                microphone: "Mikrofon",
                send: "Wyślij",
                speak: "Czytaj na głos",
                back: "Wstecz",
                welcome: "Witamy w HalDo AI OS",
                ready: "Gotowy",
                loading: "Ładowanie...",
                online: "Online",
                offline: "Offline"
            },

            uk: {
                menu: "Головне меню",
                dashboard: "Панель",
                aiCore: "AI Core",
                modules: "Модулі",
                apps: "Застосунки",
                settings: "Налаштування",
                status: "Стан системи",
                health: "Центр здоров'я",
                language: "Мова",
                voice: "Голос",
                microphone: "Мікрофон",
                send: "Надіслати",
                speak: "Прочитати вголос",
                back: "Назад",
                welcome: "Ласкаво просимо до HalDo AI OS",
                ready: "Готово",
                loading: "Завантаження...",
                online: "Онлайн",
                offline: "Офлайн"
            },

            ru: {
                menu: "Главное меню",
                dashboard: "Панель",
                aiCore: "AI Core",
                modules: "Модули",
                apps: "Приложения",
                settings: "Настройки",
                status: "Состояние системы",
                health: "Центр здоровья",
                language: "Язык",
                voice: "Голос",
                microphone: "Микрофон",
                send: "Отправить",
                speak: "Прочитать вслух",
                back: "Назад",
                welcome: "Добро пожаловать в HalDo AI OS",
                ready: "Готово",
                loading: "Загрузка...",
                online: "Онлайн",
                offline: "Офлайн"
            },

            hi: {
                menu: "मुख्य मेनू",
                dashboard: "डैशबोर्ड",
                aiCore: "AI Core",
                modules: "मॉड्यूल",
                apps: "ऐप्स",
                settings: "सेटिंग्स",
                status: "सिस्टम स्थिति",
                health: "स्वास्थ्य केंद्र",
                language: "भाषा",
                voice: "आवाज़",
                microphone: "माइक्रोफ़ोन",
                send: "भेजें",
                speak: "ज़ोर से पढ़ें",
                back: "वापस",
                welcome: "HalDo AI OS में आपका स्वागत है",
                ready: "तैयार",
                loading: "लोड हो रहा है...",
                online: "ऑनलाइन",
                offline: "ऑफ़लाइन"
            },

            fa: {
                menu: "منوی اصلی",
                dashboard: "داشبورد",
                aiCore: "هسته هوش مصنوعی",
                modules: "ماژول‌ها",
                apps: "برنامه‌ها",
                settings: "تنظیمات",
                status: "وضعیت سیستم",
                health: "مرکز سلامت",
                language: "زبان",
                voice: "صدا",
                microphone: "میکروفون",
                send: "ارسال",
                speak: "بلندخوانی",
                back: "بازگشت",
                welcome: "به HalDo AI OS خوش آمدید",
                ready: "آماده",
                loading: "در حال بارگذاری...",
                online: "آنلاین",
                offline: "آفلاین"
            },

            zh: {
                menu: "主菜单",
                dashboard: "仪表板",
                aiCore: "AI 核心",
                modules: "模块",
                apps: "应用",
                settings: "设置",
                status: "系统状态",
                health: "健康中心",
                language: "语言",
                voice: "语音",
                microphone: "麦克风",
                send: "发送",
                speak: "朗读",
                back: "返回",
                welcome: "欢迎使用 HalDo AI OS",
                ready: "就绪",
                loading: "加载中...",
                online: "在线",
                offline: "离线"
            },

            ja: {
                menu: "メインメニュー",
                dashboard: "ダッシュボード",
                aiCore: "AI Core",
                modules: "モジュール",
                apps: "アプリ",
                settings: "設定",
                status: "システム状態",
                health: "ヘルスセンター",
                language: "言語",
                voice: "音声",
                microphone: "マイク",
                send: "送信",
                speak: "読み上げ",
                back: "戻る",
                welcome: "HalDo AI OSへようこそ",
                ready: "準備完了",
                loading: "読み込み中...",
                online: "オンライン",
                offline: "オフライン"
            },

            ko: {
                menu: "메인 메뉴",
                dashboard: "대시보드",
                aiCore: "AI Core",
                modules: "모듈",
                apps: "앱",
                settings: "설정",
                status: "시스템 상태",
                health: "헬스 센터",
                language: "언어",
                voice: "음성",
                microphone: "마이크",
                send: "보내기",
                speak: "소리 내어 읽기",
                back: "뒤로",
                welcome: "HalDo AI OS에 오신 것을 환영합니다",
                ready: "준비됨",
                loading: "로드 중...",
                online: "온라인",
                offline: "오프라인"
            },

            el: {
                menu: "Κύριο μενού",
                dashboard: "Πίνακας ελέγχου",
                aiCore: "AI Core",
                modules: "Μονάδες",
                apps: "Εφαρμογές",
                settings: "Ρυθμίσεις",
                status: "Κατάσταση συστήματος",
                health: "Κέντρο υγείας",
                language: "Γλώσσα",
                voice: "Φωνή",
                microphone: "Μικρόφωνο",
                send: "Αποστολή",
                speak: "Εκφώνηση",
                back: "Πίσω",
                welcome: "Καλώς ήρθατε στο HalDo AI OS",
                ready: "Έτοιμο",
                loading: "Φόρτωση...",
                online: "Σε σύνδεση",
                offline: "Εκτός σύνδεσης"
            }

        },

        init() {

            const saved =
                localStorage.getItem(
                    "haldo_language"
                );

            if (
                saved &&
                this.languages[saved]
            ) {

                this.current = saved;

            }

            this.apply();

            this.ready = true;

            console.log(
                "🌍 HalDo Language System bereit:",
                this.current
            );

        },

        setLanguage(id) {

            if (
                !this.languages[id]
            ) {

                console.warn(
                    "Unbekannte Sprache:",
                    id
                );

                return false;

            }

            this.current = id;

            localStorage.setItem(
                "haldo_language",
                id
            );

            this.apply();

            this.syncVoice();

            return true;

        },

        getLanguage() {

            return this.languages[
                this.current
            ];

        },

        getLanguages() {

            return Object.values(
                this.languages
            );

        },

        translate(key) {

            const active =
                this.translations[
                    this.current
                ];

            const fallback =
                this.translations[
                    this.fallback
                ];

            return (
                active?.[key] ||
                fallback?.[key] ||
                key
            );

        },

        apply() {

            const language =
                this.getLanguage();

            document.documentElement
                .lang =
                this.current;

            document.documentElement
                .dir =
                language.direction;

            document
                .querySelectorAll(
                    "[data-i18n]"
                )
                .forEach(element => {

                    const key =
                        element.dataset.i18n;

                    element.textContent =
                        this.translate(key);

                });

            document
                .querySelectorAll(
                    "[data-i18n-placeholder]"
                )
                .forEach(element => {

                    const key =
                        element.dataset
                            .i18nPlaceholder;

                    element.placeholder =
                        this.translate(key);

                });

        },

        syncVoice() {

            const language =
                this.getLanguage();

            if (
                window.HalDoVoice
            ) {

                HalDoVoice.setLanguage(
                    language.voice
                );

            }

            if (
                window.HalDoSpeech
            ) {

                HalDoSpeech.setLanguage(
                    language.voice
                );

            }

            if (
                window.HalDoAI
            ) {

                HalDoAI.setLanguage(
                    this.current
                );

            }

        }

    };

    window.HalDoLanguageSystem =
        HalDoLanguageSystem;

    window.addEventListener(
        "DOMContentLoaded",
        function () {

            HalDoLanguageSystem.init();

        }
    );

})();