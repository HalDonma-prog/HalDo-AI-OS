// ================================================================
//  HALDO MAIL — E-Mail App
//  TEIL 14/30
// ================================================================

var HalDoMail = {
    state: {
        inbox: [],
        sent: [],
        drafts: [],
        spam: [],
        trash: [],
        archive: [],
        folders: {}
    },

    init: function() {
        // Lade gespeicherte Mails
        var saved = localStorage.getItem('haldo_mail');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {}
        }

        // Demo-Mails wenn leer
        if (this.state.inbox.length === 0) {
            this.addDemoMails();
        }

        console.log('[Mail] Initialisiert mit ' + this.state.inbox.length + ' Nachrichten');
    },

    addDemoMails: function() {
        var now = new Date();
        var today = now.toLocaleDateString('de-DE');
        var yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        var yesterdate = yesterday.toLocaleDateString('de-DE');

        this.state.inbox = [
            { id: 'm1', from: 'info@haldo.ai', subject: 'Willkommen bei HalDo Mail!', body: 'Dein neues HalDo Mail-Konto ist bereit. Du kannst jetzt E-Mails senden und empfangen. Viel Spaß mit HalDo AI OS 24!', date: today,
                read: false, starred: false },
            { id: 'm2', from: 'system@haldo.ai', subject: 'HalDo OS 24 Update verfügbar', body: 'Eine neue Version von HalDo AI OS 24 ist verfügbar. Bitte führe das Update durch, um die neuesten Funktionen zu erhalten.', date: yesterdate,
                read: true, starred: true },
            { id: 'm3', from: 'community@haldo.ai', subject: 'HalDo Community Newsletter', body: 'Willkommen in der HalDo Community! Hier findest du Tipps, Tricks und Neuigkeiten rund um HalDo AI OS.', date: yesterdate,
                read: false, starred: false }
        ];

        this.save();
    },

    save: function() {
        try {
            localStorage.setItem('haldo_mail', JSON.stringify(this.state));
        } catch (e) {}
    },

    send: function(to, subject, body) {
        var mail = {
            id: 'm' + Date.now(),
            from: 'user@haldo.ai',
            to: to,
            subject: subject,
            body: body,
            date: new Date().toLocaleDateString('de-DE'),
            read: true,
            starred: false
        };
        this.state.sent.push(mail);
        this.save();
        return mail;
    },

    getInbox: function() {
        return this.state.inbox;
    },

    getSent: function() {
        return this.state.sent;
    },

    getDrafts: function() {
        return this.state.drafts;
    },

    markRead: function(id) {
        for (var i = 0; i < this.state.inbox.length; i++) {
            if (this.state.inbox[i].id === id) {
                this.state.inbox[i].read = true;
                this.save();
                return true;
            }
        }
        return false;
    },

    deleteMail: function(id, folder) {
        folder = folder || 'inbox';
        var list = this.state[folder] || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                var mail = list.splice(i, 1)[0];
                this.state.trash.push(mail);
                this.save();
                return true;
            }
        }
        return false;
    },

    starMail: function(id, folder) {
        folder = folder || 'inbox';
        var list = this.state[folder] || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                list[i].starred = !list[i].starred;
                this.save();
                return list[i].starred;
            }
        }
        return false;
    },

    // App Renderer
    render: function(body) {
        var self = this;
        var inbox = this.state.inbox;

        var html = `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;">
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button id="mail-inbox" style="flex:1;background:var(--primary);">📥 Posteingang (${inbox.length})</button>
                    <button id="mail-sent" style="flex:1;background:rgba(255,255,255,0.06);">📤 Gesendet (${this.state.sent.length})</button>
                    <button id="mail-drafts" style="flex:1;background:rgba(255,255,255,0.06);">📝 Entwürfe (${this.state.drafts.length})</button>
                    <button id="mail-new" style="flex:1;background:var(--secondary);">✏️ Neu</button>
                </div>
                <div style="flex:1;overflow-y:auto;max-height:280px;" id="mail-list">
        `;

        if (inbox.length === 0) {
            html += '<div style="color:#8899bb;text-align:center;padding:20px;">📭 Keine Nachrichten</div>';
        } else {
            for (var i = 0; i < inbox.length; i++) {
                var m = inbox[i];
                var isRead = m.read ? 'opacity:0.6;' : 'font-weight:600;';
                var isStarred = m.starred ? '⭐' : '☆';
                html += `
                    <div style="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;margin:4px 0;cursor:pointer;border-left:3px solid ${m.read ? '#8899bb' : 'var(--primary)'};${isRead}" 
                         onclick="HalDoMail.openMail('${m.id}')">
                        <div style="display:flex;justify-content:space-between;font-size:0.8rem;">
                            <span style="font-weight:600;">${m.from}</span>
                            <span style="color:#8899bb;font-size:0.7rem;">${m.date}</span>
                        </div>
                        <div style="font-size:0.85rem;">${m.subject}</div>
                        <div style="font-size:0.7rem;color:#8899bb;display:flex;justify-content:space-between;">
                            <span>${m.body.substring(0, 60)}${m.body.length > 60 ? '...' : ''}</span>
                            <span style="cursor:pointer;" onclick="event.stopPropagation();HalDoMail.starMail('${m.id}')">${isStarred}</span>
                        </div>
                    </div>
                `;
            }
        }

        html += `
                </div>
                <div style="font-size:0.6rem;color:#8899bb;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;display:flex;justify-content:space-between;">
                    <span>📊 ${inbox.length} Nachrichten</span>
                    <span>✉️ user@haldo.ai</span>
                </div>
            </div>
        `;

        body.innerHTML = html;

        // Event Bindings
        body.querySelector('#mail-new').addEventListener('click', function() {
            var to = prompt('📧 Empfänger (z.B. max@haldo.ai):');
            if (to) {
                var subject = prompt('📝 Betreff:');
                if (subject !== null) {
                    var text = prompt('✍️ Nachricht:');
                    if (text !== null) {
                        self.send(to, subject, text);
                        // Re-render
                        var win = window.HalDoState.windows.find(function(w) { return w.appId === 'email'; });
                        if (win && win.element) {
                            var b = win.element.querySelector('.window-body');
                            self.render(b);
                        }
                        if (window.HalDoNotify) window.HalDoNotify('✅ E-Mail gesendet!', 'success');
                    }
                }
            }
        });

        body.querySelector('#mail-inbox').addEventListener('click', function() {
            if (window.HalDoNotify) window.HalDoNotify('📥 Posteingang: ' + self.state.inbox.length + ' Nachrichten');
        });

        body.querySelector('#mail-sent').addEventListener('click', function() {
            if (window.HalDoNotify) window.HalDoNotify('📤 Gesendet: ' + self.state.sent.length + ' Nachrichten');
        });

        body.querySelector('#mail-drafts').addEventListener('click', function() {
            if (window.HalDoNotify) window.HalDoNotify('📝 Entwürfe: ' + self.state.drafts.length + ' Entwürfe');
        });
    },

    openMail: function(id) {
        var mail = null;
        for (var i = 0; i < this.state.inbox.length; i++) {
            if (this.state.inbox[i].id === id) {
                mail = this.state.inbox[i];
                break;
            }
        }
        if (!mail) return;

        this.markRead(id);

        if (window.HalDoNotify) {
            window.HalDoNotify('📧 ' + mail.subject + ' von ' + mail.from + '\n\n' + mail.body, 'info');
        }

        // Detailansicht in neuer App
        var self = this;
        if (window.HalDoAppLoader) {
            // Temporäre App für Detailansicht
            var detailId = 'mail-detail-' + id;
            window.HalDoAppLoader.register(detailId, {
                title: '📧 ' + mail.subject,
                icon: '✉️',
                render: function(body) {
                    body.innerHTML = `
                        <div style="display:flex;flex-direction:column;gap:10px;height:100%;">
                            <div style="border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:8px;">
                                <div style="font-size:0.9rem;font-weight:600;">${mail.subject}</div>
                                <div style="font-size:0.8rem;color:#8899bb;">Von: ${mail.from}</div>
                                <div style="font-size:0.7rem;color:#8899bb;">Datum: ${mail.date}</div>
                            </div>
                            <div style="flex:1;overflow-y:auto;font-size:0.85rem;line-height:1.6;padding:4px 0;">
                                ${mail.body.replace(/\n/g, '<br>')}
                            </div>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,0.04);padding-top:8px;">
                                <button id="mail-reply" style="flex:1;">↩️ Antworten</button>
                                <button id="mail-forward" style="flex:1;">↪️ Weiterleiten</button>
                                <button id="mail-delete" style="flex:1;background:#ff4444;">🗑️ Löschen</button>
                                <button id="mail-close" style="flex:1;background:rgba(255,255,255,0.06);">✕ Schließen</button>
                            </div>
                        </div>
                    `;

                    body.querySelector('#mail-reply').addEventListener('click', function() {
                        var reply = prompt('✍️ Antwort an ' + mail.from + ':');
                        if (reply) {
                            self.send(mail.from, 'Re: ' + mail.subject, reply);
                            if (window.HalDoNotify) window.HalDoNotify('✅ Antwort gesendet!', 'success');
                            // Schließen
                            var w = window.HalDoState.windows.find(function(win) {
                                return win.appId === detailId;
                            });
                            if (w) HalDoWindow.close(w.id);
                        }
                    });

                    body.querySelector('#mail-forward').addEventListener('click', function() {
                        var to = prompt('📧 Weiterleiten an:');
                        if (to) {
                            self.send(to, 'Fwd: ' + mail.subject, mail.body);
                            if (window.HalDoNotify) window.HalDoNotify('✅ Weitergeleitet!', 'success');
                            var w = window.HalDoState.windows.find(function(win) {
                                return win.appId === detailId;
                            });
                            if (w) HalDoWindow.close(w.id);
                        }
                    });

                    body.querySelector('#mail-delete').addEventListener('click', function() {
                        if (confirm('Diese E-Mail wirklich löschen?')) {
                            self.deleteMail(id);
                            if (window.HalDoNotify) window.HalDoNotify('🗑️ E-Mail gelöscht');
                            var w = window.HalDoState.windows.find(function(win) {
                                return win.appId === detailId;
                            });
                            if (w) HalDoWindow.close(w.id);
                            // Inbox neu laden
                            var win2 = window.HalDoState.windows.find(function(w2) {
                                return w2.appId === 'email';
                            });
                            if (win2 && win2.element) {
                                var b = win2.element.querySelector('.window-body');
                                self.render(b);
                            }
                        }
                    });

                    body.querySelector('#mail-close').addEventListener('click', function() {
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
    }
};
