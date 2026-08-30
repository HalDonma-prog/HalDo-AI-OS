// ================================================================
//  HALDO CHAT — Private Messaging App
//  TEIL 15/30
// ================================================================

var HalDoChat = {
    state: {
        contacts: [],
        messages: {},
        activeChat: null
    },

    init: function() {
        // Lade gespeicherte Chats
        var saved = localStorage.getItem('haldo_chat');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {}
        }

        // Demo-Kontakte wenn leer
        if (this.state.contacts.length === 0) {
            this.addDemoContacts();
        }

        console.log('[Chat] Initialisiert mit ' + this.state.contacts.length + ' Kontakten');
    },

    addDemoContacts: function() {
        this.state.contacts = [
            { id: 'c1', name: 'Max Mustermann', status: 'online', avatar: '👤', lastSeen: 'gerade' },
            { id: 'c2', name: 'Ella Schmidt', status: 'offline', avatar: '👩', lastSeen: 'vor 2 Stunden' },
            { id: 'c3', name: 'HalDo AI', status: 'online', avatar: '🤖', lastSeen: 'gerade' },
            { id: 'c4', name: 'Dr. Weber', status: 'abwesend', avatar: '👨‍⚕️', lastSeen: 'vor 1 Stunde' },
            { id: 'c5', name: 'Prof. Kaya', status: 'online', avatar: '👩‍🏫', lastSeen: 'vor 5 Minuten' }
        ];

        // Demo-Nachrichten
        this.state.messages = {
            'c1': [
                { from: 'c1', text: 'Hallo! Wie geht es dir?', time: '10:30' },
                { from: 'me', text: 'Hallo Max! Mir geht es gut, danke!', time: '10:32' },
                { from: 'c1', text: 'Super! Hast du schon HalDo OS 24 getestet?', time: '10:35' }
            ],
            'c3': [
                { from: 'c3', text: '👋 Hallo! Ich bin HalDo AI. Wie kann ich dir helfen?', time: '09:00' },
                { from: 'me', text: 'Hallo! Erzähl mir etwas über Êzîdî.', time: '09:02' },
                { from: 'c3', text: '🟡 Êzîdî ist eine der ältesten monotheistischen Religionen...', time: '09:05' }
            ]
        };

        this.save();
    },

    save: function() {
        try {
            localStorage.setItem('haldo_chat', JSON.stringify(this.state));
        } catch (e) {}
    },

    addContact: function(name, avatar) {
        avatar = avatar || '👤';
        var contact = {
            id: 'c' + Date.now(),
            name: name,
            status: 'online',
            avatar: avatar,
            lastSeen: 'gerade'
        };
        this.state.contacts.push(contact);
        this.save();
        return contact;
    },

    sendMessage: function(contactId, text) {
        if (!this.state.messages[contactId]) {
            this.state.messages[contactId] = [];
        }
        var msg = {
            from: 'me',
            text: text,
            time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        };
        this.state.messages[contactId].push(msg);
        this.save();

        // Simuliere Antwort (nur bei HalDo AI)
        if (contactId === 'c3') {
            setTimeout(function() {
                var response = HalDoAIEnhanced.getResponse(text);
                var reply = {
                    from: 'c3',
                    text: response,
                    time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
                };
                this.state.messages[contactId].push(reply);
                this.save();
                // Re-render Chat
                var win = window.HalDoState.windows.find(function(w) { return w.appId === 'messages'; });
                if (win && win.element) {
                    var b = win.element.querySelector('.window-body');
                    this.render(b);
                }
            }.bind(this), 800);
        }

        return msg;
    },

    getContact: function(id) {
        for (var i = 0; i < this.state.contacts.length; i++) {
            if (this.state.contacts[i].id === id) {
                return this.state.contacts[i];
            }
        }
        return null;
    },

    getMessages: function(contactId) {
        return this.state.messages[contactId] || [];
    },

    // App Renderer
    render: function(body) {
        var self = this;
        var contacts = this.state.contacts;
        var activeChat = this.state.activeChat;

        var html = `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;">
                <div style="display:flex;gap:6px;margin-bottom:4px;">
                    <input type="text" id="chat-search" placeholder="🔍 Kontakt suchen ..." style="flex:1;" />
                    <button id="chat-new" style="padding:6px 12px;">➕</button>
                </div>
                <div style="flex:1;overflow-y:auto;max-height:280px;" id="chat-list">
        `;

        if (contacts.length === 0) {
            html += '<div style="color:#8899bb;text-align:center;padding:20px;">👤 Keine Kontakte</div>';
        } else {
            for (var i = 0; i < contacts.length; i++) {
                var c = contacts[i];
                var statusColor = c.status === 'online' ? '#44ff88' : c.status === 'abwesend' ? '#ffcc00' : '#8899bb';
                var isActive = (activeChat === c.id) ? 'background:rgba(0,212,255,0.08);border-left:3px solid var(--primary);' :
                    '';
                var lastMsg = '';
                var msgs = this.state.messages[c.id] || [];
                if (msgs.length > 0) {
                    lastMsg = msgs[msgs.length - 1].text.substring(0, 30) + (msgs[msgs.length - 1].text.length > 30 ?
                        '...' : '');
                }

                html += `
                    <div style="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;margin:4px 0;cursor:pointer;${isActive}" 
                         onclick="HalDoChat.openChat('${c.id}')">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="font-size:1.5rem;">${c.avatar}</span>
                                <div>
                                    <div style="font-weight:600;font-size:0.85rem;">${c.name}</div>
                                    <div style="font-size:0.65rem;color:#8899bb;">
                                        <span style="color:${statusColor};display:inline-block;width:8px;height:8px;border-radius:50%;background:${statusColor};"></span>
                                        ${c.status} · ${c.lastSeen}
                                    </div>
                                </div>
                            </div>
                            <div style="font-size:0.7rem;color:#8899bb;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                ${lastMsg}
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        html += `
                </div>
                <div style="font-size:0.6rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;display:flex;justify-content:space-between;">
                    <span>💬 ${contacts.length} Kontakte</span>
                    <span>🟢 ${contacts.filter(function(c){return c.status==='online';}).length} online</span>
                </div>
            </div>
        `;

        body.innerHTML = html;

        // Event Bindings
        body.querySelector('#chat-search').addEventListener('input', function(e) {
            var q = e.target.value.toLowerCase();
            var items = body.querySelectorAll('#chat-list > div');
            for (var i = 0; i < items.length; i++) {
                var name = items[i].querySelector('.window-title')?.textContent?.toLowerCase() || '';
                // Einfache Suche über Text
                var text = items[i].textContent.toLowerCase();
                items[i].style.display = text.includes(q) ? '' : 'none';
            }
        });

        body.querySelector('#chat-new').addEventListener('click', function() {
            var name = prompt('👤 Kontaktname:');
            if (name) {
                var avatar = prompt('🎭 Avatar (z.B. 👤, 👩, 🧑):') || '👤';
                var contact = self.addContact(name, avatar);
                if (window.HalDoNotify) window.HalDoNotify('👤 ' + name + ' hinzugefügt');
                // Re-render
                var win = window.HalDoState.windows.find(function(w) { return w.appId === 'messages'; });
                if (win && win.element) {
                    var b = win.element.querySelector('.window-body');
                    self.render(b);
                }
            }
        });
    },

    openChat: function(contactId) {
        this.state.activeChat = contactId;
        var contact = this.getContact(contactId);
        if (!contact) return;

        var messages = this.getMessages(contactId);

        // Detailansicht in neuer App
        var self = this;
        var detailId = 'chat-detail-' + contactId;

        if (window.HalDoAppLoader) {
            window.HalDoAppLoader.register(detailId, {
                title: '💬 ' + contact.name,
                icon: contact.avatar || '💬',
                render: function(body) {
                    var statusColor = contact.status === 'online' ? '#44ff88' : contact.status === 'abwesend' ?
                        '#ffcc00' : '#8899bb';

                    var html = `
                        <div style="display:flex;flex-direction:column;height:100%;gap:8px;">
                            <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                                <span style="font-size:1.5rem;">${contact.avatar}</span>
                                <div>
                                    <div style="font-weight:600;font-size:0.85rem;">${contact.name}</div>
                                    <div style="font-size:0.65rem;color:#8899bb;">
                                        <span style="color:${statusColor};display:inline-block;width:8px;height:8px;border-radius:50%;background:${statusColor};"></span>
                                        ${contact.status}
                                    </div>
                                </div>
                                <button id="chat-back" style="margin-left:auto;padding:4px 12px;background:rgba(255,255,255,0.06);border:none;border-radius:8px;color:#fff;cursor:pointer;">✕</button>
                            </div>
                            <div style="flex:1;overflow-y:auto;max-height:280px;padding:4px 0;" id="chat-messages">
                    `;

                    if (messages.length === 0) {
                        html += '<div style="color:#8899bb;text-align:center;padding:20px;">💬 Keine Nachrichten</div>';
                    } else {
                        for (var i = 0; i < messages.length; i++) {
                            var msg = messages[i];
                            var isMe = msg.from === 'me';
                            var sender = isMe ? 'Du' : contact.name;
                            var style = isMe ?
                                'text-align:right;background:rgba(0,212,255,0.1);border-radius:12px 12px 4px 12px;padding:6px 12px;margin:4px 0;display:inline-block;max-width:80%;float:right;clear:both;' :
                                'text-align:left;background:rgba(123,47,252,0.1);border-radius:12px 12px 12px 4px;padding:6px 12px;margin:4px 0;display:inline-block;max-width:80%;float:left;clear:both;';
                            html += `
                                <div style="${style}">
                                    <div style="font-size:0.75rem;">${msg.text}</div>
                                    <div style="font-size:0.55rem;color:#8899bb;margin-top:2px;">${msg.time}</div>
                                </div>
                            `;
                        }
                    }

                    html += `
                            </div>
                            <div style="display:flex;gap:6px;border-top:1px solid rgba(255,255,255,0.04);padding-top:8px;">
                                <input type="text" id="chat-input" placeholder="Nachricht ..." style="flex:1;" />
                                <button id="chat-send">📤 Senden</button>
                            </div>
                        </div>
                    `;

                    body.innerHTML = html;

                    // Chat scrolen
                    var msgContainer = body.querySelector('#chat-messages');
                    if (msgContainer) {
                        msgContainer.scrollTop = msgContainer.scrollHeight;
                    }

                    // Send
                    body.querySelector('#chat-send').addEventListener('click', function() {
                        var input = body.querySelector('#chat-input');
                        var text = input.value.trim();
                        if (!text) return;

                        self.sendMessage(contactId, text);
                        input.value = '';

                        // Re-render
                        var win = window.HalDoState.windows.find(function(w) {
                            return w.appId === detailId;
                        });
                        if (win && win.element) {
                            var b = win.element.querySelector('.window-body');
                            // Re-render mit aktualisierten Nachrichten
                            messages = self.getMessages(contactId);
                            // Einfacher: Neu rendern
                            var app = window.HalDoState.apps[detailId];
                            if (app && app.render) {
                                app.render(b);
                            }
                        }

                        // Auch Haupt-Chat aktualisieren
                        var win2 = window.HalDoState.windows.find(function(w2) {
                            return w2.appId === 'messages';
                        });
                        if (win2 && win2.element) {
                            var b2 = win2.element.querySelector('.window-body');
                            self.render(b2);
                        }
                    });

                    body.querySelector('#chat-input').addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') {
                            body.querySelector('#chat-send').click();
                        }
                    });

                    body.querySelector('#chat-back').addEventListener('click', function() {
                        var w = window.HalDoState.windows.find(function(win) {
                            return win.appId === detailId;
                        });
                        if (w) HalDoWindow.close(w.id);
                        // Haupt-Chat aktualisieren
                        var win2 = window.HalDoState.windows.find(function(w2) {
                            return w2.appId === 'messages';
                        });
                        if (win2 && win2.element) {
                            var b2 = win2.element.querySelector('.window-body');
                            self.render(b2);
                        }
                    });
                }
            });

            if (window.HalDoWindow) {
                window.HalDoWindow.launch(detailId);
            }
        }

        this.save();
    }
};
