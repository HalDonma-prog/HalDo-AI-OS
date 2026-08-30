// ================================================================
//  HALDO ÊZÎDÎ KEYBOARD — Êzîdî-Tastatur
//  TEIL 29/30
// ================================================================

var HalDoEzidiKeyboard = {
    // Êzîdî / Kurmanji Zeichensatz
    characters: {
        // Grundbuchstaben
        'a': 'a', 'b': 'b', 'c': 'c', 'ç': 'ç', 'd': 'd', 'e': 'e', 'ê': 'ê',
        'f': 'f', 'g': 'g', 'h': 'h', 'i': 'i', 'î': 'î', 'j': 'j', 'k': 'k',
        'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p', 'q': 'q', 'r': 'r',
        's': 's', 'ş': 'ş', 't': 't', 'u': 'u', 'û': 'û', 'v': 'v', 'w': 'w',
        'x': 'x', 'y': 'y', 'z': 'z',
        // Großbuchstaben
        'A': 'A', 'B': 'B', 'C': 'C', 'Ç': 'Ç', 'D': 'D', 'E': 'E', 'Ê': 'Ê',
        'F': 'F', 'G': 'G', 'H': 'H', 'I': 'I', 'Î': 'Î', 'J': 'J', 'K': 'K',
        'L': 'L', 'M': 'M', 'N': 'N', 'O': 'O', 'P': 'P', 'Q': 'Q', 'R': 'R',
        'S': 'S', 'Ş': 'Ş', 'T': 'T', 'U': 'U', 'Û': 'Û', 'V': 'V', 'W': 'W',
        'X': 'X', 'Y': 'Y', 'Z': 'Z'
    },

    // Tastatur-Layout (3 Zeilen)
    layout: [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'û', 'ê'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'î', 'ş', 'ç'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '?', '!', ' ']
    ],

    // Shift-Layout (Großbuchstaben)
    shiftLayout: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Û', 'Ê'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Î', 'Ş', 'Ç'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '?', '!', ' ']
    ],

    isActive: false,
    isShift: false,
    targetInput: null,
    keyboardElement: null,

    init: function() {
        console.log('[Ezidi] Êzîdî-Tastatur initialisiert');
        // Keyboard wird bei Bedarf erstellt
    },

    // ===== TASTATUR ÖFFNEN =====
    open: function(inputElement) {
        this.targetInput = inputElement;
        this.isActive = true;
        this.isShift = false;

        if (!this.keyboardElement) {
            this.createKeyboard();
        }

        this.keyboardElement.style.display = 'block';
        this.updateKeyboard();
        console.log('[Ezidi] Tastatur geöffnet');
    },

    // ===== TASTATUR SCHLIESSEN =====
    close: function() {
        this.isActive = false;
        if (this.keyboardElement) {
            this.keyboardElement.style.display = 'none';
        }
        console.log('[Ezidi] Tastatur geschlossen');
    },

    // ===== TASTATUR ERSTELLEN =====
    createKeyboard: function() {
        var self = this;
        var keyboard = document.createElement('div');
        keyboard.id = 'ezidi-keyboard';
        keyboard.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            background: rgba(10, 10, 30, 0.95);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            padding: 8px 4px;
            display: none;
            touch-action: manipulation;
            max-height: 240px;
            overflow-y: auto;
        `;

        // Header
        var header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 8px 6px 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        `;
        header.innerHTML = `
            <span style="color:#8899bb;font-size:0.7rem;">⌨️ Êzîdî Keyboard</span>
            <div>
                <button id="ezidi-shift" style="background:none;border:none;color:#8899bb;font-size:0.8rem;cursor:pointer;padding:2px 8px;">⇧</button>
                <button id="ezidi-close" style="background:none;border:none;color:#ff6666;font-size:1rem;cursor:pointer;padding:2px 8px;">✕</button>
            </div>
        `;
        keyboard.appendChild(header);

        // Tasten
        var keysContainer = document.createElement('div');
        keysContainer.id = 'ezidi-keys';
        keysContainer.style.cssText = `
            padding: 4px 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
        `;

        // Zeilen
        for (var row = 0; row < this.layout.length; row++) {
            var rowDiv = document.createElement('div');
            rowDiv.style.cssText = `
                display: flex;
                justify-content: center;
                gap: 4px;
            `;

            var keys = this.layout[row];
            for (var i = 0; i < keys.length; i++) {
                var key = document.createElement('button');
                var isSpace = keys[i] === ' ';
                key.textContent = keys[i];
                key.dataset.value = keys[i];
                key.style.cssText = `
                    padding: ${isSpace ? '8px 24px' : '8px 6px'};
                    min-width: ${isSpace ? '60px' : '32px'};
                    height: 38px;
                    background: rgba(255, 255, 255, 0.06);
                    border: none;
                    border-radius: 6px;
                    color: #e0e0ff;
                    font-size: ${isSpace ? '0.6rem' : '0.85rem'};
                    cursor: pointer;
                    touch-action: manipulation;
                    flex: ${isSpace ? '2' : '1'};
                    text-align: center;
                    transition: 0.1s;
                `;
                key.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    this.style.transform = 'scale(0.92)';
                    self.handleKeyPress(this.dataset.value);
                    setTimeout(function() {
                        this.style.transform = '';
                    }.bind(this), 150);
                }.bind(key));
                key.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    this.style.transform = 'scale(0.92)';
                    self.handleKeyPress(this.dataset.value);
                    setTimeout(function() {
                        this.style.transform = '';
                    }.bind(this), 150);
                }.bind(key));
                rowDiv.appendChild(key);
            }
            keysContainer.appendChild(rowDiv);
        }

        keyboard.appendChild(keysContainer);
        document.body.appendChild(keyboard);
        this.keyboardElement = keyboard;

        // Event Bindings
        document.getElementById('ezidi-close').addEventListener('click', function() {
            self.close();
        });

        document.getElementById('ezidi-shift').addEventListener('click', function() {
            self.isShift = !self.isShift;
            self.updateKeyboard();
        });

        // Klick außerhalb schließt Tastatur
        document.addEventListener('click', function(e) {
            if (self.isActive && self.keyboardElement && !self.keyboardElement.contains(e.target) &&
                e.target !== self.targetInput) {
                self.close();
            }
        });
    },

    // ===== TASTATUR AKTUALISIEREN =====
    updateKeyboard: function() {
        if (!this.keyboardElement) return;
        var keys = this.keyboardElement.querySelectorAll('#ezidi-keys button');
        var layout = this.isShift ? this.shiftLayout : this.layout;
        var idx = 0;

        for (var row = 0; row < layout.length; row++) {
            for (var i = 0; i < layout[row].length; i++) {
                if (idx < keys.length) {
                    keys[idx].textContent = layout[row][i];
                    keys[idx].dataset.value = layout[row][i];
                    idx++;
                }
            }
        }

        // Shift-Button Highlight
        var shiftBtn = document.getElementById('ezidi-shift');
        if (shiftBtn) {
            shiftBtn.style.background = this.isShift ? 'rgba(0,212,255,0.2)' : 'none';
            shiftBtn.style.color = this.isShift ? '#00d4ff' : '#8899bb';
        }
    },

    // ===== TASTENDRUCK VERARBEITEN =====
    handleKeyPress: function(value) {
        if (!this.targetInput) return;

        if (value === ' ') {
            this.insertText(' ');
            return;
        }

        // Zeichen einfügen
        this.insertText(value);

        // Shift zurücksetzen (nach einem Buchstaben)
        if (this.isShift && value !== ' ') {
            this.isShift = false;
            this.updateKeyboard();
        }
    },

    // ===== TEXT EINFÜGEN =====
    insertText: function(text) {
        if (!this.targetInput) return;

        var input = this.targetInput;
        var start = input.selectionStart || 0;
        var end = input.selectionEnd || 0;
        var value = input.value;

        // Text einfügen
        var newValue = value.substring(0, start) + text + value.substring(end);
        input.value = newValue;

        // Cursor setzen
        var newPos = start + text.length;
        input.selectionStart = newPos;
        input.selectionEnd = newPos;

        // Event auslösen
        var event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);

        // Fokus behalten
        input.focus();
    },

    // ===== ÊZÎDÎ TEXT KONVERTIEREN =====
    convertToEzidi: function(text) {
        // Einfache Konvertierung von lateinischen zu Êzîdî-Zeichen
        var map = {
            'e': 'ê', 'E': 'Ê',
            'i': 'î', 'I': 'Î',
            'u': 'û', 'U': 'Û',
            's': 'ş', 'S': 'Ş',
            'c': 'ç', 'C': 'Ç'
        };

        var result = '';
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            result += map[ch] || ch;
        }
        return result;
    },

    // ===== APP RENDERER =====
    render: function(body) {
        var self = this;

        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;">
                <h3 style="font-size:0.9rem;">⌨️ Êzîdî Tastatur</h3>
                <p style="color:#8899bb;font-size:0.75rem;">Êzîdî / Kurmanji Tastatur für HalDo OS 24</p>

                <div style="background:rgba(255,255,255,0.04);padding:10px;border-radius:8px;">
                    <div style="font-size:0.7rem;color:#8899bb;margin-bottom:4px;">📝 Text eingeben:</div>
                    <input type="text" id="ezidi-input" placeholder="Gib Text in Êzîdî ein ..." style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#fff;font-size:1rem;" />
                </div>

                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button id="ezidi-open-keyboard" style="flex:1;padding:8px 12px;">⌨️ Tastatur öffnen</button>
                    <button id="ezidi-convert" style="flex:1;padding:8px 12px;background:rgba(123,47,252,0.3);">🔄 Konvertieren</button>
                </div>

                <div style="background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;flex:1;overflow-y:auto;max-height:100px;">
                    <div style="font-size:0.65rem;color:#8899bb;margin-bottom:4px;">📋 Êzîdî-Zeichen:</div>
                    <div style="font-size:0.85rem;color:#e0e0ff;word-break:break-all;">
                        a b c ç d e ê f g h i î j k l m n o p q r s ş t u û v w x y z
                        <br>
                        A B C Ç D E Ê F G H I Î J K L M N O P Q R S Ş T U Û V W X Y Z
                    </div>
                </div>

                <div style="font-size:0.55rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;text-align:center;">
                    🟡 Êzîdî — Eine der ältesten monotheistischen Religionen
                </div>
            </div>
        `;

        // ===== EVENT BINDINGS =====
        var input = body.querySelector('#ezidi-input');

        body.querySelector('#ezidi-open-keyboard').addEventListener('click', function() {
            self.open(input);
        });

        body.querySelector('#ezidi-convert').addEventListener('click', function() {
            var text = input.value;
            var converted = self.convertToEzidi(text);
            input.value = converted;
            if (window.HalDoNotify) window.HalDoNotify('✅ Konvertiert: ' + converted.substring(0, 20) + '...',
                'success');
        });

        // Tastatur schließen wenn App geschlossen wird
        var win = window.HalDoState.windows.find(function(w) { return w.appId === 'ezidikeyboard'; });
        if (win && win.element) {
            // Speichern der close-Funktion
            var originalClose = window.HalDoWindow.close;
            window.HalDoWindow.close = function(winId) {
                if (winId === win.id) {
                    self.close();
                }
                originalClose(winId);
            };
        }
    },

    // ===== ÊZÎDÎ PHRASEN =====
    getPhrases: function() {
        return {
            'hello': 'Silav!',
            'goodbye': 'Bi xatirê!',
            'thanks': 'Spas!',
            'yes': 'Erê',
            'no': 'Na',
            'how are you': 'Tu çawa yî?',
            'fine': 'Baş im',
            'what is your name': 'Navê te çi ye?',
            'my name is': 'Navê min ... e',
            'please': 'Ji kerema xwe',
            'sorry': 'Bibore',
            'good morning': 'Beyanî baş',
            'good evening': 'Evare baş',
            'good night': 'Şev baş',
            'love': 'Evîn',
            'peace': 'Aştî',
            'freedom': 'Azadî',
            'justice': 'Dadî',
            'ezidi': 'Êzîdî',
            'kurdish': 'Kurmancî',
            'god': 'Xwedê',
            'sun': 'Roj',
            'moon': 'Heyv',
            'star': 'Stêrk'
        };
    }
};
