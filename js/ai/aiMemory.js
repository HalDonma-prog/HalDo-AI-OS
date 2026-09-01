/**
 * HALDO AI OS 24.6 – AI MEMORY
 * Kurzzeit- und Langzeitgedächtnis
 */

const AIMemory = {
    shortTerm: [],
    longTerm: [],
    maxShortTerm: 20,

    init() {
        console.log('🧠 AI Memory initialisiert');
        this.longTerm = Storage.get('ai_long_term_memory', []);
        return this;
    },

    add(entry) {
        this.shortTerm.push({
            ...entry,
            timestamp: Date.now()
        });

        if (this.shortTerm.length > this.maxShortTerm) {
            // Älteste ins Langzeitgedächtnis verschieben
            const oldest = this.shortTerm.shift();
            this.longTerm.push(oldest);
            this.compressLongTerm();
        }

        // Speichern
        Storage.set('ai_long_term_memory', this.longTerm);
        return this;
    },

    addMessage(role, content, metadata = {}) {
        this.add({
            role,
            content,
            metadata
        });
        return this;
    },

    getShortTerm() {
        return [...this.shortTerm];
    },

    getLongTerm(limit = 50) {
        return this.longTerm.slice(-limit);
    },

    getContext(limit = 10) {
        const all = [...this.shortTerm, ...this.longTerm.slice(-20)];
        return all.slice(-limit);
    },

    search(query, limit = 10) {
        const q = query.toLowerCase();
        const results = [];
        const all = [...this.shortTerm, ...this.longTerm];
        for (const entry of all) {
            if (entry.content.toLowerCase().includes(q)) {
                results.push(entry);
                if (results.length >= limit) break;
            }
        }
        return results;
    },

    compressLongTerm() {
        if (this.longTerm.length > 200) {
            // Älteste löschen
            this.longTerm = this.longTerm.slice(-200);
            Storage.set('ai_long_term_memory', this.longTerm);
        }
    },

    clearShortTerm() {
        this.shortTerm = [];
        return this;
    },

    clearLongTerm() {
        this.longTerm = [];
        Storage.set('ai_long_term_memory', []);
        EventBus.emit('ai:memory-cleared');
        return this;
    },

    getStats() {
        return {
            shortTermCount: this.shortTerm.length,
            longTermCount: this.longTerm.length,
            maxShortTerm: this.maxShortTerm
        };
    },

    formatForPrompt(limit = 10) {
        const context = this.getContext(limit);
        return context.map(entry =>
            `${entry.role === 'user' ? 'User' : 'HalDo'}: ${entry.content}`
        ).join('\n');
    }
};

window.AIMemory = AIMemory;
