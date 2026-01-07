export const action = {
    input: (selector = 'input[type="text"]', value) => {
        if (value !== undefined && value !== null) {
            cy.get(selector, { timeout: 10000 })
                .should('be.visible')
                .click({ force: true })
                .type('{selectall}', { delay: 50 })
                .type(value, { delay: 100 });
        }
    },

    select: (selector = '.v-select__selections', value) => {
        if (value !== undefined && value !== null) {
            cy.get(selector, { timeout: 10000 })
                .should('be.visible')
                .click({ force: true });

            // Select from menu (works outside .within() because we use cy.get from root)
            cy.root().closest('body').within(() => {
                cy.get('.v-menu__content:visible .v-list-item', { timeout: 10000 })
                    .should('have.length.greaterThan', 0)
                    .then(() => {
                        if (typeof value === 'number') {
                            cy.get('.v-list-item:visible')
                                .eq(value)
                                .click({ force: true });
                        } else if (typeof value === 'string') {
                            cy.get('.v-list-item:visible')
                                .filter((i, el) => el.innerText.trim() === value)
                                .click({ force: true });
                        } else {
                            cy.log('Invalid value type.');
                        }
                    });
            });
        }
    },

    check: (selector = 'input[type="checkbox"]', value) => {
        if (value !== undefined && value !== null) {
            cy.get(selector, { timeout: 10000 })
                .should('be.visible')
                .click({ force: true });
        }
    },

    autocomplete: (selector = 'input[type="text"]', value) => {
        if (value !== undefined && value !== null) {
            cy.get(selector, { timeout: 10000 })
                .should('be.visible')
                .type(value, { delay: 100, timeout: 5000 })
                .then(() => {
                    cy.root().closest('body').within(() => {
                        cy.get('.v-menu__content .v-list-item:visible', { timeout: 5000 })
                            .contains(value)
                            .click({ force: true });
                    });
                });
        }
    }


}