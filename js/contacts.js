// ================================================================
//  HALDO CONTACTS — Kontaktverwaltung
//  TEIL 16/30
// ================================================================

var HalDoContacts = {
    state: {
        contacts: [],
        groups: ['Familie', 'Freunde', 'Arbeit', 'Studium']
    },

    init: function() {
        // Lade gespeicherte Kontakte
        var saved = localStorage.getItem('haldo_contacts');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {}
        }

        // Demo-Kontakte wenn leer
        if (this.state.contacts.length === 0) {
            this.addDemoContacts();
        }

        console.log('[Contacts] Initialisiert mit ' + this.state.contacts.length + ' Kontakten');
    },

    addDemoContacts: function() {
        this.state.contacts = [
            { id: 'c1', name: 'Max Mustermann', email: 'max@haldo.ai', phone: '+49 123 456789', group: 'Freunde',
                avatar: '👤', notes: 'Studienkollege' },
            { id: 'c2', name: 'Ella Schmidt', email: 'ella@haldo.ai', phone: '+49 987 654321', group: 'Arbeit',
                avatar: '👩', notes: 'Projektmanagerin' },
            { id: 'c3', name: 'HalDo AI', email: 'ai@haldo.ai', phone: '-', group: 'System', avatar: '🤖',
                notes: 'Künstliche Intelligenz' },
            { id: 'c4', name: 'Dr. Weber', email: 'weber@uni.de', phone: '+49 555 123456', group: 'Studium',
                avatar: '👨‍⚕️', notes: 'Dozent für Informatik' },
            { id: 'c5', name: 'Prof. Kaya', email: 'kaya@uni.de', phone: '+49 555 654321', group: 'Studium',
                avatar: '👩‍🏫', notes: 'Professorin für KI' },
            { id: 'c6', name: 'Familie Yılmaz', email: 'yilmaz@email.de', phone: '+49 777 888999', group: 'Familie',
                avatar: '👨‍👩‍👧‍👦', notes: 'Cousins' }
        ];
        this.save();
    },

    save: function() {
        try {
            localStorage.setItem('haldo_contacts', JSON.stringify(this.state));
        } catch (e) {}
    },

    add: function(name, email, phone, group, avatar, notes) {
        var contact = {
            id: 'c' + Date.now(),
            name: name || 'Unbekannt',
            email: email || '',
            phone: phone || '',
            group: group || 'Allgemein',
            avatar: avatar || '👤',
            notes: notes || ''
        };
        this.state.contacts.push(contact);
        this.save();
        return contact;
    },

    delete: function(id) {
        for (var i = 0; i < this.state.contacts.length; i++) {
            if (this.state.contacts[i].id === id) {
                this.state.contacts.splice(i, 1);
                this.save();
                return true;
            }
        }
        return false;
    },

    update: function(id, data) {
        for (var i = 0; i < this.state.contacts.length; i++) {
            if (this.state.contacts[i].id === id) {
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        this.state.contacts[i][key] = data[key];
                    }
                }
                this.save();
                return this.state.contacts[i];
            }
        }
        return null;
    },

    get: function(id) {
        for (var i = 0; i < this.state.contacts.length; i++) {
            if (this.state.contacts[i].id === id) {
                return this.state.contacts[i];
            }
        }
        return null;
    },

    getByGroup: function(group) {
        var result = [];
        for (var i = 0; i < this.state.contacts.length; i++) {
            if (this.state.contacts[i].group === group) {
                result.push(this.state.contacts[i]);
            }
        }
        return result;
    },

    search: function(query) {
        query = query.toLowerCase();
        var result = [];
        for (var i = 0; i < this.state.contacts.length; i++) {
            var c = this.state.contacts[i];
            if (c.name.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query) ||
                c.phone.includes(query) ||
                c.group.toLowerCase().includes(query)) {
                result.push(c);
            }
        }
        return result;
    },

    // App Renderer
    render: function(body) {
        var self = this;
        var contacts = this.state.contacts;
        var groups = this.state.groups;

        var html = `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;">
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
                    <input type="text" id="contacts-search" placeholder="🔍 Suche ..." style="flex:2;min-width:100px;" />
                    <button id="contacts-add" style="padding:6px 12px;">➕</button>
                    <select id="contacts-filter" style="flex:1;padding:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#fff;">
                        <option value="all">📋 Alle</option>
        `;

        for (var g = 0; g < groups.length; g++) {
            html += '<option value="' + groups[g] + '">' + groups[g] + '</option>';
        }

        html += `
                    </select>
                </div>
                <div style="flex:1;overflow-y:auto;max-height:280px;" id="contacts-list">
        `;

        if (contacts.length === 0) {
            html += '<div style="color:#8899bb;text-align:center;padding:20px;">👤 Keine Kontakte</div>';
        } else {
            for (var i = 0; i < contacts.length; i++) {
                var c = contacts[i];
                html += `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;margin:4px 0;cursor:pointer;" 
                         onclick="HalDoContacts.openContact('${c.id}')">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:1.8rem;">${c.avatar}</span>
                            <div>
                                <div style="font-weight:600;font-size:0.85rem;">${c.name}</div>
                                <div style="font-size:0.65rem;color:#8899bb;">${c.email} · ${c.phone}</div>
                                <div style="font-size:0.55rem;color:#8899bb;background:rgba(255,255,255,0.04);padding:1px 6px;border-radius:4px;display:inline-block;">${c.group}</div>
                            </div>
                        </div>
                        <div style="display:flex;gap:4px;">
                            <button onclick="event.stopPropagation();HalDoContacts.deleteContact('${c.id}')" style="background:none;border:none;color:#ff6666;cursor:pointer;font-size:0.9rem;">✕</button>
                        </div>
                    </div>
                `;
            }
        }

        html += `
                </div>
                <div style="font-size:0.6rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;display:flex;justify-content:space-between;">
                    <span>👤 ${contacts.length} Kontakte</span>
                    <span>📋 ${groups.length} Gruppen</span>
                </div>
            </div>
        `;

        body.innerHTML = html;

        // Event Bindings
        body.querySelector('#contacts-search').addEventListener('input', function(e) {
            var q = e.target.value;
            var results = self.search(q);
            var list = body.querySelector('#contacts-list');
            list.innerHTML = '';
            if (results.length === 0) {
                list.innerHTML = '<div style="color:#8899bb;text-align:center;padding:20px;">🔍 Keine Ergebnisse</div>';
            } else {
                for (var i = 0; i < results.length; i++) {
                    var c = results[i];
                    list.innerHTML += `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;margin:4px 0;cursor:pointer;" 
                             onclick="HalDoContacts.openContact('${c.id}')">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:1.8rem;">${c.avatar}</span>
                                <div>
                                    <div style="font-weight:600;font-size:0.85rem;">${c.name}</div>
                                    <div style="font-size:0.65rem;color:#8899bb;">${c.email} · ${c.phone}</div>
                                    <div style="font-size:0.55rem;color:#8899bb;background:rgba(255,255,255,0.04);padding:1px 6px;border-radius:4px;display:inline-block;">${c.group}</div>
                                </div>
                            </div>
                            <div style="display:flex;gap:4px;">
                                <button onclick="event.stopPropagation();HalDoContacts.deleteContact('${c.id}')" style="background:none;border:none;color:#ff6666;cursor:pointer;font-size:0.9rem;">✕</button>
                            </div>
                        </div>
                    `;
                }
            }
        });

        body.querySelector('#contacts-filter').addEventListener('change', function(e) {
            var filter = e.target.value;
            var list = body.querySelector('#contacts-list');
            list.innerHTML = '';
            var results = filter === 'all' ? self.state.contacts : self.getByGroup(filter);
            if (results.length === 0) {
                list.innerHTML = '<div style="color:#8899bb;text-align:center;padding:20px;">📋 Keine Kontakte in dieser Gruppe</div>';
            } else {
                for (var i = 0; i < results.length; i++) {
                    var c = results[i];
                    list.innerHTML += `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;margin:4px 0;cursor:pointer;" 
                             onclick="HalDoContacts.openContact('${c.id}')">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:1.8rem;">${c.avatar}</span>
                                <div>
                                    <div style="font-weight:600;font-size:0.85rem;">${c.name}</div>
                                    <div style="font-size:0.65rem;color:#8899bb;">${c.email} · ${c.phone}</div>
                                    <div style="font-size:0.55rem;color:#8899bb;background:rgba(255,255,255,0.04);padding:1px 6px;border-radius:4px;display:inline-block;">${c.group}</div>
                                </div>
                            </div>
                            <div style="display:flex;gap:4px;">
                                <button onclick="event.stopPropagation();HalDoContacts.deleteContact('${c.id}')" style="background:none;border:none;color:#ff6666;cursor:pointer;font-size:0.9rem;">✕</button>
                            </div>
                        </div>
                    `;
                }
            }
        });

        body.querySelector('#contacts-add').addEventListener('click', function() {
            var name = prompt('👤 Name:');
            if (name) {
                var email = prompt('✉️ E-Mail:') || '';
                var phone = prompt('📞 Telefon:') || '';
                var group = prompt('📋 Gruppe:') || 'Allgemein';
                var avatar = prompt('🎭 Avatar:') || '👤';
                var notes = prompt('📝 Notizen:') || '';
                self.add(name, email, phone, group, avatar, notes);
                if (window.HalDoNotify) window.HalDoNotify('👤 ' + name + ' hinzugefügt', 'success');
                // Re-render
                var win = window.HalDoState.windows.find(function(w) { return w.appId === 'contacts'; });
                if (win && win.element) {
                    var b = win.element.querySelector('.window-body');
                    self.render(b);
                }
            }
        });
    },

    openContact: function(id) {
        var contact = this.get(id);
        if (!contact) return;

        var self = this;
        var detailId = 'contact-detail-' + id;

        if (window.HalDoAppLoader) {
            window.HalDoAppLoader.register(detailId, {
                title: '👤 ' + contact.name,
                icon: contact.avatar || '👤',
                render: function(body) {
                    body.innerHTML = `
                        <div style="display:flex;flex-direction:column;gap:10px;height:100%;">
                            <div style="text-align:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                                <div style="font-size:3rem;">${contact.avatar}</div>
                                <div style="font-size:1.1rem;font-weight:600;">${contact.name}</div>
                                <div style="font-size:0.8rem;color:#8899bb;">${contact.group}</div>
                            </div>
                            <div style="flex:1;overflow-y:auto;font-size:0.85rem;line-height:1.8;padding:4px 0;">
                                <div><span style="color:#8899bb;">✉️</span> ${contact.email || '-'}</div>
                                <div><span style="color:#8899bb;">📞</span> ${contact.phone || '-'}</div>
                                <div><span style="color:#8899bb;">📋</span> ${contact.group}</div>
                                <div style="border-top:1px solid rgba(255,255,255,0.04);padding-top:8px;margin-top:4px;">
                                    <span style="color:#8899bb;">📝</span> ${contact.notes || 'Keine Notizen'}
                                </div>
                            </div>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,0.04);padding-top:8px;">
                                <button id="contact-edit" style="flex:1;">✏️ Bearbeiten</button>
                                <button id="contact-chat" style="flex:1;">💬 Chat</button>
                                <button id="contact-mail" style="flex:1;">✉️ Mail</button>
                                <button id="contact-close" style="flex:1;background:rgba(255,255,255,0.06);">✕ Schließen</button>
                            </div>
                        </div>
                    `;

                    body.querySelector('#contact-edit').addEventListener('click', function() {
                        var name = prompt('👤 Name:', contact.name) || contact.name;
                        var email = prompt('✉️ E-Mail:', contact.email) || contact.email;
                        var phone = prompt('📞 Telefon:', contact.phone) || contact.phone;
                        var group = prompt('📋 Gruppe:', contact.group) || contact.group;
                        var avatar = prompt('🎭 Avatar:', contact.avatar) || contact.avatar;
                        var notes = prompt('📝 Notizen:', contact.notes) || contact.notes;
                        self.update(id, { name, email, phone, group, avatar, notes });
                        if (window.HalDoNotify) window.HalDoNotify('✅ Kontakt aktualisiert', 'success');
                        // Re-render
                        var win = window.HalDoState.windows.find(function(w) { return w.appId === detailId; });
                        if (win && win.element) {
                            var b = win.element.querySelector('.window-body');
                            var app = window.HalDoState.apps[detailId];
                            if (app && app.render) {
                                app.render(b);
                            }
                        }
                        // Haupt-Contacts aktualisieren
                        var win2 = window.HalDoState.windows.find(function(w2) { return w2.appId ===
                            'contacts'; });
                        if (win2 && win2.element) {
                            var b2 = win2.element.querySelector('.window-body');
                            self.render(b2);
                        }
                    });

                    body.querySelector('#contact-chat').addEventListener('click', function() {
                        if (window.HalDoWindow) {
                            // Chat mit diesem Kontakt öffnen
                            if (window.HalDoChat) {
                                // Prüfen ob Kontakt in Chat existiert
                                var chatContact = null;
                                for (var i = 0; i < window.HalDoChat.state.contacts.length; i++) {
                                    if (window.HalDoChat.state.contacts[i].name === contact.name) {
                                        chatContact = window.HalDoChat.state.contacts[i];
                                        break;
                                    }
                                }
                                if (!chatContact) {
                                    // Kontakt zu Chat hinzufügen
                                    var newContact = window.HalDoChat.addContact(contact.name, contact.avatar);
                                    chatContact = newContact;
                                }
                                window.HalDoChat.openChat(chatContact.id);
                                // Detail schließen
                                var w = window.HalDoState.windows.find(function(win) {
                                    return win.appId === detailId;
                                });
                                if (w) HalDoWindow.close(w.id);
                            }
                        }
                    });

                    body.querySelector('#contact-mail').addEventListener('click', function() {
                        if (contact.email && contact.email !== '-') {
                            if (window.HalDoMail) {
                                var mailWin = window.HalDoState.windows.find(function(w) { return w
                                        .appId === 'email'; });
                                if (!mailWin) {
                                    if (window.HalDoWindow) HalDoWindow.launch('email');
                                }
                                // Mail-App mit Empfänger öffnen
                                if (window.HalDoNotify) window.HalDoNotify('✉️ E-Mail an ' + contact.email +
                                    ' wird vorbereitet');
                                // Detail schließen
                                var w = window.HalDoState.windows.find(function(win) {
                                    return win.appId === detailId;
                                });
                                if (w) HalDoWindow.close(w.id);
                            }
                        } else {
                            if (window.HalDoNotify) window.HalDoNotify('❌ Keine E-Mail-Adresse vorhanden',
                                'error');
                        }
                    });

                    body.querySelector('#contact-close').addEventListener('click', function() {
                        var w = window.HalDoState.windows.find(function(win) {
                            return win.appId === detailId;
                        });
                        if (w) HalDoWindow.close(w.id);
                    });
                }
            });

            if (window.HalDoWindow) {
                window.HalDoWindow.launch(detailId);
            }
        }
    },

    deleteContact: function(id) {
        var contact = this.get(id);
        if (!contact) return;
        if (confirm('Kontakt "' + contact.name + '" wirklich löschen?')) {
            this.delete(id);
            if (window.HalDoNotify) window.HalDoNotify('🗑️ ' + contact.name + ' gelöscht');
            // Re-render
            var win = window.HalDoState.windows.find(function(w) { return w.appId === 'contacts'; });
            if (win && win.element) {
                var b = win.element.querySelector('.window-body');
                this.render(b);
            }
        }
    }
};
