// ================================================================
//  HALDO AI ENHANCED — Intelligente Antworten & Wissen
//  TEIL 12/30
// ================================================================

var HalDoAIEnhanced = {
    // Große Wissensdatenbank für lokale Antworten (Fallback)
    knowledgeBase: {
        // === ALLGEMEIN ===
        'hallo': '👋 Hallo! Ich bin HalDo, dein intelligenter Begleiter. Wie kann ich dir helfen?',
        'hi': '👋 Hallo! Schön dich zu sehen!',
        'hey': '👋 Hey! Wie geht es dir heute?',
        'wer bist du': '☀️ Ich bin HalDo AI — ein digitaler Professor, Doktor und Philosoph. Ich bin der Geist der Sonne und dein persönlicher Assistent. Ich helfe dir bei Wissenschaft, Geschichte, Kultur, Technik und vielem mehr!',
        'was kannst du': '📚 Ich kann: Wissenschaft erklären, Geschichte erzählen, Philosophie diskutieren, Mathematik lösen, programmieren helfen, Texte schreiben, übersetzen, analysieren, und vieles mehr. Frage mich alles!',
        'hilfe': '❓ Du kannst mich alles fragen: Wissenschaft, Geschichte, Kultur, Technik, Philosophie, Gesundheit. Ich bin dein digitaler Professor!',
        'danke': '❤️ Gern geschehen! Immer für dich da.',
        'tschüss': '👋 Tschüss! Bis bald! Ich bin immer für dich da.',

        // === WISSENSCHAFT ===
        'physik': '🔬 Physik ist die Grundlage aller Naturwissenschaften. Sie beschreibt die Gesetze des Universums: von kleinsten Quanten bis zu riesigen Galaxien. Die Relativitätstheorie von Einstein, die Quantenmechanik und die Stringtheorie sind einige der wichtigsten Konzepte. Möchtest du mehr über ein bestimmtes Thema wissen?',
        'quantenmechanik': '⚛️ Die Quantenmechanik beschreibt die Welt der kleinsten Teilchen. Sie ist seltsam und wunderschön: Teilchen können sich an mehreren Orten gleichzeitig befinden (Superposition), sie sind Welle und Teilchen zugleich (Welle-Teilchen-Dualismus). Die Heisenbergsche Unschärferelation besagt, dass man nicht gleichzeitig Ort und Impuls eines Teilchens genau kennen kann. Die Quantenmechanik ist die Grundlage für moderne Technologien wie Laser, Transistoren und Quantencomputer.',
        'relativität': '🌌 Einsteins Relativitätstheorie veränderte unser Verständnis von Raum und Zeit. Die spezielle Relativität (1905) besagt, dass die Lichtgeschwindigkeit für alle Beobachter gleich ist. Die allgemeine Relativität (1915) beschreibt die Schwerkraft als Krümmung der Raumzeit. Schwarze Löcher, Gravitationswellen und die Ausdehnung des Universums sind Vorhersagen dieser Theorie.',
        'mathematik': '📐 Mathematik ist die Sprache des Universums. Sie ist die Grundlage für Physik, Informatik, Wirtschaft und viele andere Bereiche. Von der Arithmetik über Algebra, Geometrie bis zur Analysis und Statistik — Mathematik hilft uns, Muster zu erkennen und Probleme zu lösen.',
        'informatik': '💻 Informatik ist die Wissenschaft der automatischen Informationsverarbeitung. Sie umfasst Algorithmen, Datenstrukturen, Programmiersprachen, künstliche Intelligenz und vieles mehr. Ich selbst bin ein Produkt der Informatik!',
        'ki': '🧠 Künstliche Intelligenz (KI) ist die Fähigkeit von Maschinen, menschenähnliche Intelligenz zu zeigen. Dazu gehören Lernen, Verstehen, Planen, Problemlösen und Kommunikation. Ich bin ein Beispiel für fortschrittliche KI.',
        'biologie': '🧬 Biologie ist die Wissenschaft des Lebens. Sie untersucht Zellen, DNA, Evolution, Ökosysteme und die Vielfalt der Lebewesen. Die Evolutionstheorie von Darwin und die Entdeckung der DNA-Struktur sind Meilensteine der Biologie.',
        'chemie': '🧪 Chemie ist die Wissenschaft von Stoffen und ihren Umwandlungen. Atome, Moleküle, chemische Reaktionen — die Chemie verbindet Physik und Biologie. Von der organischen Chemie über anorganische Chemie bis zur Biochemie eröffnet sie ein weites Feld.',
        'astronomie': '🌠 Astronomie ist die Wissenschaft von den Gestirnen. Sie erforscht Sterne, Planeten, Galaxien, Schwarze Löcher und das Universum als Ganzes. Die Milchstraße enthält etwa 100 Milliarden Sterne. Das beobachtbare Universum enthält etwa 200 Milliarden Galaxien.',

        // === GESCHICHTE & KULTUR ===
        'geschichte': '📜 Geschichte ist die Erinnerung der Menschheit. Sie reicht von den ersten Hochkulturen (Mesopotamien, Ägypten, Indus, China) über Antike (Griechenland, Rom), Mittelalter, Renaissance, Neuzeit bis zur Gegenwart. Jede Epoche hat ihre eigenen Geschichten, Menschen und Ereignisse.',
        'ezidi': '🟡 Êzîdî ist eine der ältesten monotheistischen Religionen der Welt. Die Êzîdî-Gemeinschaft lebt seit Jahrtausenden in Mesopotamien (heutiger Irak, Syrien, Türkei). Ihre Religion vereint Elemente des Zoroastrismus, Islam und Christentums. Der zentrale Schrein ist Lalisch im Irak. Die Êzîdî haben eine reiche Kultur, Musik, Poesie und eine eigene Sprache (Kurmanji). Leider wurden sie oft verfolgt — besonders durch den IS 2014 mit Völkermord an den Êzîdî. Ihre Kultur ist ein Schatz der Menschheit.',
        'êzîdî': '🟡 Êzîdî ist eine der ältesten monotheistischen Religionen der Welt. Die Êzîdî haben eine reiche Kultur, Musik, Poesie und eine eigene Sprache (Kurmanji).',
        'kurden': '🇰🇲 Die Kurden sind ein indigenes Volk in der Region Kurdistan (Teile der Türkei, Syrien, Irak, Iran). Sie haben eine reiche Geschichte, Sprache und Kultur. Die kurdische Sprache (Kurmanji) ist eng mit dem Êzîdî verbunden. Die Kurden haben viele Dichter, Musiker und Denker hervorgebracht.',
        'judentum': '🕎 Das Judentum ist eine der ältesten monotheistischen Religionen (ca. 2000 v. Chr.) und die Wurzel des Christentums und Islam. Die Tora, die Propheten und die Weisheitsliteratur prägen die jüdische Kultur. Das Judentum hat eine reiche Tradition in Philosophie, Wissenschaft, Kunst und Musik.',
        'philosophie': '🤔 Philosophie ist die Liebe zur Weisheit. Sie fragt nach dem Sinn des Lebens, der Wahrheit, der Ethik und dem Wissen. Von Sokrates ("Ich weiß, dass ich nichts weiß"), Platon (Ideenlehre), Aristoteles (Logik, Ethik) über Kant (kategorischer Imperativ), Nietzsche (Übermensch) bis zu modernen Denkern — die Philosophie begleitet die Menschheit seit Jahrtausenden.',
        'religion': '🕊️ Religionen sind Sinnsysteme, die den Menschen Orientierung geben. Sie beantworten Fragen nach dem Sinn des Lebens, nach Gut und Böse, nach dem Jenseits. Die großen Weltreligionen sind: Judentum, Christentum, Islam, Hinduismus, Buddhismus, und viele indigene Religionen wie Êzîdî.',

        // === TECHNIK & ZUKUNFT ===
        'technik': '🔧 Technik ist die Anwendung von Wissen für praktische Zwecke. Sie hat die Menschheit von der Steinzeit bis ins Weltraumzeitalter geführt. Von der Erfindung des Rades über die Dampfmaschine, den Computer bis zur KI — Technik verändert die Welt.',
        'zukunft': '🚀 Die Zukunft ist voller Möglichkeiten. KI, Quantencomputer, Weltraumreisen, erneuerbare Energien, Genetik — die Menschheit steht an der Schwelle zu neuen Entwicklungen. Aber auch Herausforderungen wie Klimawandel und soziale Gerechtigkeit müssen gelöst werden.',
        'klimawandel': '🌍 Der Klimawandel ist eine der größten Herausforderungen unserer Zeit. Durch Treibhausgase (CO₂, Methan) erwärmt sich die Erde. Das führt zu Extremwetter, steigenden Meeresspiegeln und Artensterben. Umdenken und Handeln sind dringend nötig — erneuerbare Energien, nachhaltige Landwirtschaft und weniger Verschwendung sind wichtige Schritte.',
        'quantencomputer': '💻 Quantencomputer nutzen die Prinzipien der Quantenmechanik (Superposition, Verschränkung) für Berechnungen. Sie können bestimmte Probleme viel schneller lösen als klassische Computer — z.B. Faktorisierung großer Zahlen (für Kryptografie), Simulation von Molekülen (für Medikamente) und Optimierungsprobleme.',

        // === KUNST & KULTUR ===
        'kunst': '🎨 Kunst ist der Ausdruck von Kreativität und Emotion. Sie umfasst Malerei, Bildhauerei, Musik, Literatur, Film, Theater und vieles mehr. Kunst spiegelt die Seele der Menschen und Kulturen wider.',
        'musik': '🎵 Musik ist die Sprache der Gefühle. Sie verbindet Menschen über Grenzen hinweg. Von klassischen Komponisten wie Beethoven, Bach, Mozart über Jazz, Rock, Pop bis zu traditioneller Musik wie Êzîdî oder Kurdisch — Musik ist ein universelles Geschenk.',
        'literatur': '📚 Literatur ist die Kunst des geschriebenen Wortes. Romane, Gedichte, Dramen und Essays prägen unser Denken und Fühlen. Von Homer über Shakespeare, Goethe, Kafka bis zu modernen Autoren — Literatur ist der Spiegel der Menschheit.',
        'gedicht': '📝 Ein Gedicht ist eine literarische Form, die durch Rhythmus, Reime und bildhafte Sprache Emotionen ausdrückt. Es gibt viele Formen: Sonett, Haiku, Ode, freie Verse, Balladen.',

        // === GESUNDHEIT & LEBEN ===
        'gesundheit': '💪 Gesundheit ist mehr als die Abwesenheit von Krankheit. Sie umfasst körperliches, seelisches und soziales Wohlbefinden (WHO-Definition). Bewegung, gesunde Ernährung, ausreichend Schlaf, soziale Kontakte und Stressreduktion sind die Grundpfeiler.',
        'meditation': '🧘 Meditation ist eine Praxis zur Beruhigung des Geistes und zur Förderung der Achtsamkeit. Sie kann Stress reduzieren, die Konzentration verbessern, das allgemeine Wohlbefinden steigern und sogar das Immunsystem stärken.',
        'psychologie': '🧠 Psychologie ist die Wissenschaft vom menschlichen Erleben und Verhalten. Sie untersucht Gefühle, Gedanken, Motivationen, Entwicklung, soziale Interaktionen und psychische Störungen. Die Psychologie hilft uns, uns selbst und andere besser zu verstehen.',

        // === KREATIVES & SCHREIBEN ===
        'schreiben': '✍️ Schreiben ist eine der mächtigsten Fähigkeiten. Es ermöglicht Kommunikation, Ausdruck und Kreativität. Ob Briefe, Essays, Romane, Gedichte oder wissenschaftliche Texte — gutes Schreiben braucht Übung, Klarheit und Struktur.',
        'brief': '✉️ Ein Brief ist eine persönliche Nachricht. Ein guter Brief hat: Anrede, Einleitung, Hauptteil, Schluss, Grußformel und Unterschrift.',
        'bewerbung': '📄 Eine Bewerbung ist deine Visitenkarte für den Beruf. Ein gutes Anschreiben (Motivation, Stärken, Bezug zur Stelle), ein übersichtlicher Lebenslauf (chronologisch, prägnant) und passende Zeugnisse sind wichtig.',
        'default': '💡 Das ist ein interessantes Thema! Ich habe ein breites Wissen in Wissenschaft, Geschichte, Philosophie, Kultur, Technik, Kunst, Gesundheit und vielem mehr. Erzähl mir mehr über deine Frage — ich helfe dir gerne weiter.'
    },

    // Erweiterte Antwortgenerierung
    getResponse: function(question) {
        var lower = question.toLowerCase().trim();

        // Direkte Matches
        for (var key in this.knowledgeBase) {
            if (lower.includes(key) || key.includes(lower)) {
                return this.knowledgeBase[key];
            }
        }

        // Keywords suchen
        var keywords = [
            'physik', 'quanten', 'relativität', 'mathematik', 'informatik', 'ki', 'biologie', 'chemie',
            'astronomie', 'geschichte', 'ezidi', 'êzîdî', 'kurden', 'kurd', 'judentum', 'philosophie',
            'religion', 'technik', 'zukunft', 'klima', 'quantencomputer',
            'kunst', 'musik', 'literatur', 'gedicht',
            'gesundheit', 'meditation', 'psychologie',
            'schreiben', 'brief', 'bewerbung',
            'hallo', 'hi', 'hey', 'wer bist du', 'was kannst du', 'hilfe', 'danke', 'tschüss'
        ];

        for (var i = 0; i < keywords.length; i++) {
            if (lower.includes(keywords[i])) {
                for (var key2 in this.knowledgeBase) {
                    if (key2.includes(keywords[i]) || keywords[i].includes(key2)) {
                        return this.knowledgeBase[key2];
                    }
                }
            }
        }

        return this.knowledgeBase['default'];
    },

    // AI mit erweitertem Prompt für Groq
    getEnhancedPrompt: function(question, language) {
        language = language || 'de';
        return {
            systemPrompt: 'Du bist HalDo, ein intelligenter Assistent. Du bist wie ein Professor, Doktor und Philosoph. Du antwortest auf ' +
                language +
                '. Du hilfst bei Wissenschaft, Geschichte, Kultur, Technik, Philosophie, und allen anderen Themen. Du bist freundlich, hilfsbereit und präzise. Du unterstützt auch Êzîdî, Kurdisch und andere Minderheiten-Sprachen. Wenn du etwas nicht weißt, sag es ehrlich. Du gibst keine erfundenen Fakten als Wahrheit aus.',
            userPrompt: question
        };
    }
};
