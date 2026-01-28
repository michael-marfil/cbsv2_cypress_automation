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
    input: (selector = 'input[type="text"]', value, clearInput = true) => {
        if (value !== undefined && value !== null) {
            cy.get(selector, { timeout: 10000 })
                .should('be.visible')
                .then($el => {
                    // skip if disabled or readonly
                    if ($el.is(':disabled') || $el.prop('readonly') || $el.attr('disabled') !== undefined) {
                        cy.log('skipping: element disable');
                        return;
                    }

                    // skip if value is already the same (only check when clearing)
                    if (clearInput) {
                        const currentValue = $el.val();
                        if (currentValue === String(value)) {
                            cy.log(`skipping: value already set to ${value}`);
                            return
                        }
                    }

                    // click input field
                    cy.wrap($el).click({ force: true });

                    // clear input if needed
                    if (clearInput) cy.wrap($el).type('{selectall}', { delay: 50 });

                    // type value
                    cy.wrap($el).type(value, { delay: 100 });
                });
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
                .then($el => {
                    // check if the select component is disabled
                    const $selectWrapper = $el.closest('.v-select');
                    if ($selectWrapper.hasClass('v-select input-readonly') || $selectWrapper.find('input').is(':disabled')) {
                        cy.log('skipping: element is disabled');
                        return;
                    }

                    // get current selected value
                    const currentText = $el.text().trim();
                    const targetValue = typeof value === 'string' ? value : null;

                    // skip if the same value is already selected (partial match)
                    if (targetValue) {
                        const partialTarget = targetValue.substring(0, 50);
                        if (currentText.includes(partialTarget)) {
                            cy.log(`skipping: value containing "${partialTarget}" already selected`);
                            return;
                        }
                    }

                    // otherwise, proceed
                    cy.wrap($el).click({ force: true });

                    // Select from menu (works outside .within() because we use cy.get from root)
                    cy.root().closest('body').within(() => {
                        cy.get('.v-menu__content:visible', { timeout: 10000 })
                            .should('be.visible')
                            .then($menu => {
                                const menuEl = $menu[0];

                                if (typeof value === 'number') {
                                    // Handle index-based selection
                                    cy.get('.v-list-item:visible')
                                        .should('have.length.greaterThan', 0)
                                        .then(() => {
                                            cy.get('.v-list-item:visible')
                                                .eq(value)
                                                .scrollIntoView({ easing: 'linear', duration: 500 })
                                                .click({ force: true });
                                        });
                                } else if (typeof value === 'string') {
                                    // Handle string-based selection with progressive scrolling
                                    const partialSearch = value.substring(0, 50);
                                    let lastScrollTop = -1;

                                    const scrollAndFind = (attempts = 0, maxAttempts = 20) => {
                                        if (attempts >= maxAttempts) {
                                            throw new Error(`Option '${partialSearch}' not found after ${maxAttempts} scroll attempts.`);
                                        }

                                        // check if reached the bottom (no more scrolling possible)
                                        if (lastScrollTop === menuEl.scrollTop && attempts > 0) {
                                            throw new Error(`Option '${partialSearch}' not found - reached end of list.`);
                                        }

                                        lastScrollTop = menuEl.scrollTop;

                                        // Check if item is currently visible in the DOM
                                        const $items = Cypress.$('.v-menu__content:visible .v-list-item');
                                        const found = $items.toArray().some(item => {
                                            const itemText = Cypress.$(item).text();
                                            return itemText.includes(partialSearch);
                                        });

                                        if (found) {
                                            // Item found, click it
                                            cy.get('.v-menu__content:visible')
                                                .contains('.v-list-item', partialSearch)
                                                .scrollIntoView({ easing: 'linear', duration: 500 })
                                                .click({ force: true });
                                        } else {
                                            // Not found yet, scroll down more
                                            menuEl.scrollTop += 300;
                                            cy.wait(200, { log: false }).then(() => {
                                                scrollAndFind(attempts + 1, maxAttempts);
                                            });
                                        }
                                    };

                                    // Start the progressive scroll search
                                    scrollAndFind();
                                } else {
                                    cy.log('Invalid value type.');
                                }
                            });
                    });

                    // Wait for menu to close before continuing
                    cy.get('.v-menu__content:visible', { timeout: 5000 }).should('not.exist');
                });
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
                .then($el => {
                    // skip if disabled
                    if ($el.is(':disabled') || $el.attr('disabled') !== undefined) {
                        cy.log('skipping: element is disabled');
                        return;
                    }

                    // determine desired state
                    const desiredChecked = Boolean(value);
                    const currentChecked = $el.is(':checked');

                    // skip if already in desired state
                    if (currentChecked === desiredChecked) {
                        cy.log(`skipping: checkbox already ${desiredChecked ? 'checked' : 'unchecked'}`);
                        return;
                    }

                    // otherwise, proceed
                    cy.wrap($el).click({ force: true });
                });
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
                .then($el => {
                    // skip if disabled or readonly
                    if ($el.is(':disabled') || $el.prop('readonly') || $el.attr('disabled') !== undefined) {
                        cy.log('skipping: element is disabled');
                        return;
                    }

                    // skip if value is already the same
                    const currentValue = $el.val();
                    if (currentValue === String(value)) {
                        cy.log(`skipping: value already set to ${value}`);
                        return;
                    }

                    // otherwise, proceed
                    cy.wrap($el)
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
                });
        }
    }


}