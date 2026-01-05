Cypress.Commands.add('avoidWindowOpen', () => {
    cy.window({ log: false }).then((win) => {
        win.__preventUrl__ = win.location.href;

        if (!win.open.__stubbed__) {
            cy.stub(win, 'open')
                .callsFake((url/*, target, features*/) => {
                    try { win.location.assign(url); } catch (_) {}
                    return win;
                }).as('winOpen');
            win.open.__stubbed__ = true;
        }

        const installCloseShim = (w) => {
            try {
                w.close = () => {
                    try {
                        if (w.history && w.history.length > 0) {
                            w.history.back();
                        } else if (w.__prevUrl__) {
                            w.location.assign(w.__prevUrl__);
                        }
                    } catch (_) {}
                }
            } catch (_) {}
        };
        installCloseShim(win);

        cy.document({ log: false }).then((doc) => {
            doc.querySelectorAll('a[target="_blank"], a[target="_new"]').forEach((a) => {
                a.removeAttribute('target');
            });
        });

        if (!win.__stripTargetOnClick__) {
            win.addEventListener('click', (e) => {
                const a = e.target && e.target.closest ? e.target.closest('a[target]') : null;
                if (a && a.getAttribute('target')) a.removeAttribute('target');
            }, true);
            win.__stripTargetOnClick__ = true;
        }

        if (!Cypress.__avoidWinPatched__) {
            Cypress.on('window:before:load', (win) => {
                win.__preventUrl__ = win.location.href;

                // Stub window.open
                cy.stub(win, 'open')
                    .callsFake((url) => {
                        try { 
                            win.location.href = url; 
                        } catch (_) {}
                        return win;
                    })
                    .as('windowOpen');

                // Override window.close
                win.close = () => {
                    try {
                        if (win.history && win.history.length > 0) {
                            win.history.back();
                        }
                    } catch (_) {}
                };

                // Remove target attributes from links
                const observer = new MutationObserver(() => {
                    win.document.querySelectorAll('a[target="_blank"], a[target="_new"]').forEach((a) => {
                        a.removeAttribute('target');
                    });
                });

                win.addEventListener('DOMContentLoaded', () => {
                    observer.observe(win.document.body, {
                        childList: true,
                        subtree: true
                    });

                    // Initial cleanup
                    win.document.querySelectorAll('a[target="_blank"], a[target="_new"]').forEach((a) => {
                        a.removeAttribute('target');
                    });
                });

                // Handle clicks
                win.addEventListener('click', (e) => {
                    const a = e.target?.closest('a[target]');
                    if (a) {
                        a.removeAttribute('target');
                    }
                }, true);
            });
            Cypress.__avoidWinPatched__ = true;
        }
    });
});