export function handleJournalEntries({ entries, toDelete, invalidDescription }) {
    function deleteRow(index, totalToDelete, dataLength) { // delete a row or data
        if (index >= totalToDelete) return;

        const targetIndex = dataLength - index;
        cy.log(targetIndex);
        cy.wait(2000);

        cy.get('.v-data-table')
            .eq(1)
            .find('table tr')
            .eq(targetIndex)
            .within(() => {
                cy.get('td').eq(0)
                    .should('be.visible')
                    .trigger('mouseover');

                cy.get('.v-icon.mdi-close')
                    .should('be.visible')
                    .click({ force: true });
            })
            .wait(2000)
            .then(() => {
                deleteRow(index + 1, totalToDelete, dataLength);
            });

        cy.wait(2000);
    }
    if (!Array.isArray(entries)) return;

    cy.get('.v-data-table').eq(1).find('table tr').first().find('td').then(($tds) => {
        const colIndexMap = {
            gl: 1,      // GL ACCOUNT
            debit: 2,   // DEBIT 
            credit: 3,  // CREDIT
            subsidiary: 4, // SUBSIDIARY
        };

        entries.forEach((entry, index) => {
            cy.get('.v-data-table')
                .eq(1)
                .find('table tr')
                .eq(index + 1)
                .then($row => {
                    // GL ACCOUNT
                    if (entry.glAccount) {
                        cy.wrap($row).find('td').eq(colIndexMap.gl).find('input').first()
                            .clear()
                            .type(entry.glAccount, { delay: 100 })
                            .wait(5000)
                            .type('{enter}');

                        cy.wait(2000);
                    }

                    // DEBIT
                    if (entry.debit) {
                        cy.wrap($row).find('td').eq(colIndexMap.debit).find('input').first()
                            .clear()
                            .type(entry.debit, { delay: 100 });

                        cy.wait(2000);
                    }

                    // CREDIT
                    if (entry.credit) {
                        cy.wrap($row).find('td').eq(colIndexMap.credit).find('input').first()
                            .clear()
                            .type(entry.credit, { delay: 100 });

                        cy.wait(2000);
                    }

                    // SUBSIDIARY
                    if (entry.subsidiary !== undefined && entry.subsidiary !== null) {
                        const input = cy.wrap($row).find('td').eq(colIndexMap.subsidiary).find('input').first();
                        input.clear();

                        if (entry.subsidiary === '    ') {
                            input.type('    ', { delay: 100 }).wait(3000);

                            cy.get('.v-menu__content.menuable__content__active', { timeout: 10000 })
                                .should('be.visible')
                                .within(() => {
                                    cy.get('.v-list-item__title').then($options => {
                                        if ($options.length > 0) {
                                            cy.log('Data found. Continue...');
                                            const randomIndex = Math.floor(Math.random() * $options.length);
                                            cy.wrap($options[randomIndex]).click({ force: true });
                                        } else {
                                            cy.log(`No subsidiary options found. Skipping...`);
                                        }
                                    });
                                });

                            cy.wait(2000);
                        } else {
                            input.type(entry.subsidiary, { delay: 100 })
                                .wait(3000)
                                .type('{enter}');
                            cy.wait(2000);
                        }
                    }

                });
        });

        if (toDelete > 0 && Array.isArray(entries) && entries.length >= toDelete) {
            deleteRow(0, toDelete, entries.length);
        }

        if (invalidDescription) {
            cy.contains('Journal Description')
                .parent()
                .find('textarea')
                .should('be.visible')
                .invoke('val')
                .then((text) => {
                    const excess = (text?.length || 0) - 9;
                    if (excess > 0) {
                        const textarea = cy.get('textarea').first();

                        Cypress._.times(excess, (i) => {
                            textarea.type('{backspace}', { delay: 100 });
                        });
                    }
                });

            cy.wait(1000);
        }

        cy.then(() => {
            cy.get('.v-card.transaction-card')
                .find('button')
                .contains('SUBMIT')
                .should('be.visible')
                .click();

            cy.wait(2000);
        });
    });
}