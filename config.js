// ================================================================
//  HALDO AI OS 24 – KONFIGURATION
// ================================================================

var CONFIG = {
    version: '24.6.0',
    build: '2026.08.31',
    kernel: '5.3.0',
    apiKey: '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',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-70b-8192',
    language: 'de',
    maxHistory: 50,
    notificationDuration: 3000,
    languages: {
        de: { name: 'Deutsch', code: 'de', flag: '🇩🇪' },
        en: { name: 'English', code: 'en', flag: '🇬🇧' },
        ku: { name: 'Kurmancî', code: 'ku', flag: '🇰🇲' },
        ezidi: { name: 'Êzîdî', code: 'ezidi', flag: '𒀭' },
        tr: { name: 'Türkçe', code: 'tr', flag: '🇹🇷' },
        ar: { name: 'العربية', code: 'ar', flag: '🇸🇦' },
        fr: { name: 'Français', code: 'fr', flag: '🇫🇷' },
        es: { name: 'Español', code: 'es', flag: '🇪🇸' }
    },
    categories: {
        'core': '⚡ Core',
        'productivity': '📊 Produktivität',
        'learning': '📚 Lernen',
        'entertainment': '🎮 Unterhaltung',
        'system': '🔧 System',
        'communication': '💬 Kommunikation',
        'creative': '🎨 Kreativ',
        'tools': '🔨 Werkzeuge',
        'media': '🎬 Medien',
        'office': '📄 Office',
        'language': '🌍 Sprache',
        'knowledge': '🧠 Wissen',
        'business': '💼 Business'
    }
};