// ================================================================
//  HALDO AI ENGINE — Groq API
//  TEIL 4/30
// ================================================================

var HalDoAI = {
    apiKey: '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',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-70b-8192',

    ask: function(question, language) {
        language = language || 'de';
        var self = this;
        return new Promise(function(resolve, reject) {
            fetch(self.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + self.apiKey
                },
                body: JSON.stringify({
                    model: self.model,
                    messages: [
                        { role: 'system',
                            content: 'Du bist HalDo, ein intelligenter Assistent. Du bist wie ein Professor, Doktor und Philosoph. Du antwortest auf ' +
                            language +
                            '. Du hilfst bei Wissenschaft, Geschichte, Kultur, Technik, Philosophie, und allen anderen Themen. Du bist freundlich, hilfsbereit und präzise. Du unterstützt auch Êzîdî, Kurdisch und andere Minderheiten-Sprachen.'
                            },
                        { role: 'user', content: question }
                    ],
                    temperature: 0.7,
                    max_tokens: 600
                })
            }).then(function(response) {
                if (!response.ok) {
                    return response.text().then(function(err) {
                        reject(new Error('API-Fehler: ' + response.status + ' - ' + err));
                    });
                }
                return response.json();
            }).then(function(data) {
                resolve(data.choices[0].message.content);
            }).catch(function(error) {
                reject(error);
            });
        });
    },

    getFallbackResponse: function(question) {
        var lower = question.toLowerCase();
        if (lower.includes('hallo') || lower.includes('hi')) {
            return '👋 Hallo! Ich bin HalDo. Leider konnte die Verbindung zur KI-API nicht hergestellt werden. Bitte prüfe deine Internetverbindung.';
        }
        if (lower.includes('ezidi') || lower.includes('êzîdî')) {
            return '🟡 Êzîdî ist eine der ältesten monotheistischen Religionen. Die Êzîdî haben eine reiche Kultur, Musik und Sprache (Kurmanji).';
        }
        return '💡 Ich habe verstanden: "' + question +
            '". Leider konnte ich keine Verbindung zur KI-API herstellen. Bitte prüfe deine Internetverbindung.';
    }
};
