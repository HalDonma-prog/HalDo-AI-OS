// ================================================================
//  HALDO LOGO FIX — Logo wird überall angezeigt
//  TEIL 13/30
// ================================================================

var HalDoLogo = {
    logoPath: 'assets/logo.png',
    fallbackText: '⟡ HalDo',

    init: function() {
        this.updateAllLogos();
        this.watchForNewLogos();
        console.log('[Logo] Logo-System initialisiert');
    },

    updateAllLogos: function() {
        // Boot-Logo
        var bootLogo = document.querySelector('#boot-logo img');
        if (bootLogo) {
            bootLogo.src = this.logoPath;
            bootLogo.alt = 'HalDo Logo';
            bootLogo.onerror = function() {
                this.style.display = 'none';
                var parent = this.parentElement;
                if (parent) {
                    parent.textContent = '⟡ HalDo';
                    parent.style.fontSize = 'clamp(3rem, 12vw, 5rem)';
                    parent.style.fontWeight = '900';
                    parent.style.background = 'linear-gradient(135deg, #00d4ff, #7b2ffc)';
                    parent.style.webkitBackgroundClip = 'text';
                    parent.style.webkitTextFillColor = 'transparent';
                }
            };
        }

        // Topbar Logo
        var topbarLogo = document.querySelector('#topbar-left .haldo-icon img');
        if (topbarLogo) {
            topbarLogo.src = this.logoPath;
            topbarLogo.alt = 'HalDo';
            topbarLogo.onerror = function() {
                this.style.display = 'none';
            };
        }

        // Menü Logo (links)
        var menuLogo = document.querySelector('#haldo-menu-left .menu-item[data-menu="system"] img');
        if (menuLogo) {
            menuLogo.src = this.logoPath;
            menuLogo.alt = 'HalDo';
            menuLogo.onerror = function() {
                this.style.display = 'none';
                var parent = this.parentElement;
                if (parent) {
                    parent.textContent = '⟡';
                    parent.style.fontSize = '1.8rem';
                }
            };
        }

        // Alle anderen Logo-Images
        var allLogos = document.querySelectorAll('img[src*="logo"], img[alt*="HalDo"]');
        for (var i = 0; i < allLogos.length; i++) {
            var img = allLogos[i];
            if (img.src && img.src.indexOf('logo') !== -1) {
                img.src = this.logoPath;
                img.onerror = function() {
                    this.style.display = 'none';
                };
            }
        }

        console.log('[Logo] Alle Logos aktualisiert');
    },

    watchForNewLogos: function() {
        // Überwache DOM-Änderungen für neue Logos
        var observer = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var addedNodes = mutations[i].addedNodes;
                for (var j = 0; j < addedNodes.length; j++) {
                    var node = addedNodes[j];
                    if (node.nodeType === 1) {
                        // Prüfe ob neues Logo-Element
                        var logos = node.querySelectorAll ? node.querySelectorAll('img[src*="logo"], img[alt*="HalDo"]') :
                            [];
                        if (node.tagName === 'IMG' && (node.src && node.src.indexOf('logo') !== -1)) {
                            logos = [node];
                        }
                        for (var k = 0; k < logos.length; k++) {
                            var img = logos[k];
                            img.src = this.logoPath;
                            img.onerror = function() {
                                this.style.display = 'none';
                            };
                        }
                    }
                }
            }
        }.bind(this));

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    // Hilfsfunktion für manuelles Setzen
    setLogo: function(element) {
        if (!element) return;
        if (element.tagName === 'IMG') {
            element.src = this.logoPath;
            element.onerror = function() {
                this.style.display = 'none';
            };
        } else {
            element.innerHTML = '<img src="' + this.logoPath + '" alt="HalDo Logo" style="width:100%;height:auto;" onerror="this.style.display=\'none\';">';
        }
    }
};
