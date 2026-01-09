/**
 * UIHelper
 * ----------------------------------------------------------------------
 * Purpose:
 * A collection of reusable Cypress commands for interacting with common UI elements.
 * These actions handle waiting, visibility checks, and common interaction patterns
 * to make test code more concise and reliable.
 *
 * @author Michael
 */
export const action = {
    /**
     * Inputs text into a text field
     * -----------------------------
     * @param {string} [selector='input[type="text"]'] - CSS selector for the input element
     * @param {string|number} value - Text value to input into the field
     * 
     */
    input: (selector = 'input[type="text"]', value) => {
        if (value !== undefined && value !== null) {
            cy.get(selector, { timeout: 10000 })
                .should('be.visible')
                .click({ force: true })
                .type('{selectall}', { delay: 50 })
                .type(value, { delay: 100 });
        }
    },

    /**
     * Selects an option from a Vuetify dropdown/select component
     * ----------------------------------------------------------
     * @param {string} [selector='.v-select__selections'] - CSS selector for the select element
     * @param {number|string} value - Index (0-based) or exact text of the option to select
     * 
     */
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
                                .scrollIntoView({ easing: 'linear', duration: 500 })
                                .click({ force: true });
                        } else if (typeof value === 'string') {
                            cy.get('.v-list-item:visible')
                                .filter((i, el) => el.innerText.trim() === value)
                                .scrollIntoView({ easing: 'linear', duration: 500 })
                                .click({ force: true });
                        } else {
                            cy.log('Invalid value type.');
                        }
                    });
            });

            // Wait for menu to close before continuing
            cy.get('.v-menu__content:visible', { timeout: 5000 }).should('not.exist');
        }
    },

    /**
     * Clicks on a checkbox to toggle its checked state
     * ------------------------------------------------
     * @param {string} [selector='input[type="checkbox"]'] - CSS selector for the checkbox element
     * @param {any} value - Any truthy value to trigger the click action
     * 
     */
    check: (selector = 'input[type="checkbox"]', value) => {
        if (value !== undefined && value !== null) {
            cy.get(selector, { timeout: 10000 })
                .should('be.visible')
                .click({ force: true });
        }
    },

    /**
     * Selects an option from an autocomplete/combobox component
     * ---------------------------------------------------------
     * Types into an autocomplete field and selects a matching option from the dropdown menu.
     * Uses partial matching (first 50 characters) to handle long option texts.
     * 
     * @param {string} [selector='input[type="text"]'] - CSS selector for the autocomplete input
     * @param {string|number} value - Text to type into the autocomplete field
     * @param {string} [search] - Optional override for the search term used to match dropdown items.
     *                            If not provided, uses the value parameter.
     * 
     */
    autocomplete: (selector = 'input[type="text"]', value, search) => {
        // determine and convert to String the data to be used
        const toSearch = search ? String(search) : String(value);

        if (value !== undefined && value !== null) {
            cy.get(selector, { timeout: 10000 })
                .should('be.visible')
                .type(value, { delay: 100, timeout: 5000 })
                .then(() => {
                    cy.root().closest('body').within(() => {
                        // Use partial match - first 50 characters or less
                        const partialSearch = toSearch.substring(0, 50);
                        cy.get('.v-menu__content .v-list-item:visible', { timeout: 5000 })
                            .contains(partialSearch)
                            .scrollIntoView({ easing: 'linear', duration: 500 })
                            .click({ force: true });
                    });
                });

            // Wait for menu to close before continuing
            cy.get('.v-menu__content:visible', { timeout: 5000 }).should('not.exist');
        }
    }


}