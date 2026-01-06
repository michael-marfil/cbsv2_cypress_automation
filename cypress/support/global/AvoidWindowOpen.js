Cypress.Commands.add('avoidWindowOpen', () => {
    cy.window({ log: false }).then((win) => {
        win.__prevUrl__ = win.location.href;

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
            Cypress.on('window:before:load', (childWin) => {
                childWin.__prevUrl__ = childWin.location.href;

                childWin.open = function(url) {
                    try { 
                        childWin.location.href = url; 
                    } catch (_) {}
                    return childWin;
                };

                // Override window.close
                childWin.close = () => {
                    try {
                        if (childWin.history && childWin.history.length > 0) {
                            childWin.history.back();
                        } else if (childWin.__prevUrl__) {
                            childWin.location.assign(childWin.__prevUrl__);
                        }
                    } catch (_) {}
                };

                // Remove target attributes from links
                const observer = new MutationObserver(() => {
                    childWin.document.querySelectorAll('a[target="_blank"], a[target="_new"]').forEach((a) => {
                        a.removeAttribute('target');
                    });
                });

                childWin.addEventListener('DOMContentLoaded', () => {
                    if (childWin.document.body) {
                        observer.observe(childWin.document.body, {
                            childList: true,
                            subtree: true
                        });

                        // Initial cleanup
                        childWin.document.querySelectorAll('a[target="_blank"], a[target="_new"]').forEach((a) => {
                            a.removeAttribute('target');
                        });
                    }
                });

                // Handle clicks
                childWin.addEventListener('click', (e) => {
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