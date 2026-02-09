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
     * Auto-detects matching strategy
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

                    // Auto-detect matching strategy based on string length
                    const usePartialMatch = typeof value === 'string' && value.length > 30;

                    // skip if the same value is already selected
                    if (typeof value === 'string') {
                        const isAlreadySelected = usePartialMatch 
                            ? currentText.includes(value.substring(0, 50))
                            : currentText === value;
                        
                        if (isAlreadySelected) {
                            cy.log(`skipping: value "${value}" already selected`);
                            return;
                        }
                    }

                    // otherwise, proceed
                    cy.wrap($el).click({ force: true });

                    // Select from menu
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
                                    // Auto-detect matching strategy
                                    const usePartialMatch = value.length > 30;
                                    const searchValue = usePartialMatch ? value.substring(0, 50) : value;
                                    
                                    cy.log(`Using ${usePartialMatch ? 'partial' : 'exact'} match for: "${searchValue}"`);
                                    
                                    let lastScrollTop = -1;

                                    const scrollAndFind = (attempts = 0, maxAttempts = 20) => {
                                        if (attempts >= maxAttempts) {
                                            throw new Error(`Option '${value}' not found after ${maxAttempts} scroll attempts.`);
                                        }

                                        // check if reached the bottom
                                        if (lastScrollTop === menuEl.scrollTop && attempts > 0) {
                                            throw new Error(`Option '${value}' not found - reached end of list.`);
                                        }

                                        lastScrollTop = menuEl.scrollTop;

                                        // Check if item is currently visible in the DOM
                                        const $items = Cypress.$('.v-menu__content:visible .v-list-item');
                                        const found = $items.toArray().some(item => {
                                            const itemText = Cypress.$(item).text().trim();
                                            return usePartialMatch 
                                                ? itemText.includes(searchValue)
                                                : itemText === value;
                                        });

                                        if (found) {
                                            // Item found, click it
                                            if (usePartialMatch) {
                                                cy.get('.v-menu__content:visible')
                                                    .contains('.v-list-item', searchValue)
                                                    .scrollIntoView({ easing: 'linear', duration: 500 })
                                                    .click({ force: true });
                                            } else {
                                                cy.get('.v-menu__content:visible .v-list-item')
                                                    .filter((index, item) => {
                                                        return Cypress.$(item).text().trim() === value;
                                                    })
                                                    .first()
                                                    .scrollIntoView({ easing: 'linear', duration: 500 })
                                                    .click({ force: true });
                                            }
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
    },

    /**
     * Selects date from an datepicker component
     * ---------------------------------------------------------
     * 
     * @param {string|number} date - given date from parameter to be selected
     * 
     */
    datepicker: (date) => {
        const months = [
            'Jan', 
            'Feb', 
            'Mar', 
            'Apr', 
            'May', 
            'Jun',
            'Jul', 
            'Aug', 
            'Sep', 
            'Oct', 
            'Nov', 
            'Dec'
        ];

        // Parse the date
        const [month, day, year] = date.split('/'); 
        const targetMonth = parseInt(month);        // target month
        const targetDay = parseInt(day);            // target day
        const targetYear = parseInt(year);          // target year

        const targetMonthName = months[targetMonth - 1];    // target month name
        cy.log(`Parsed - Month: ${targetMonth}, Day: ${targetDay}, Year: ${targetYear}`);

        // Wait for date picker to be visible
        cy.root().closest('body').within(() => {
            cy.get('.v-card.v-picker:visible', { timeout: 5000 })
            .should('be.visible')
            .then(() => {
                cy.get('.v-date-picker-header .v-date-picker-header__value:visible').as('date-picker-header')
                cy.get('@date-picker-header')
                    .find('button')
                    .wait(1000)
                    .click({ force: true }, { timeout: 50000 })
                    .then(() => {
                        cy.get('@date-picker-header')
                            .contains('button', /^\d{4}$/, { timeout: 50000 }) // ensure its clicking the button with 4 digit number (year)
                            .should('have.length', 1)
                            .click({ force: true }, { timeout: 50000 })
                            .then(() => {
                                cy.get('.v-card.v-picker .v-picker__body .v-date-picker-years:visible')
                                    .contains(targetYear)
                                    .scrollIntoView({ easing: 'linear', duration: 1000, offset: { top: -100 } })
                                    .wait(500)
                                    .click({ force: true });
                                cy.wait(1000);
                            })
                            .then(() => {
                                cy.get('.v-card.v-picker .v-picker__body .v-date-picker-table:visible').as('date-picker-table');
                                cy.get('@date-picker-table')
                                    .find('table', 'tbody', 'tr')
                                    .contains('td', targetMonthName).within(() => {
                                        cy.get('button', { timeout: 100000}).click({ force: true });
                                    });
                                cy.wait(1000);
                            })
                            .then(() => {
                                cy.get('@date-picker-table')
                                    .find('table', 'tbody', 'tr')
                                    .contains('td', targetDay).within(() => {
                                        cy.get('button', { timeout: 100000 }).click({ force: true });
                                    });
                                cy.wait(1000);
                            });
                    });
                cy.log(`Date successfully set to: ${date}`);
            });
        });
        
        return this;
    }

}