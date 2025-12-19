import lending from '@support/routes/lending';
import general from '@support/routes/general';

/** SETTINGS MGMT. */
Cypress.Commands.add('lendingSettings', ({ toEdit }) => {
    lending.goToSettingsMgmt(); // navigate to Settings Mgmt.

    // intercept the settings mgmt list
    cy.intercept('GET', '**/lending-settings').as('settingsMgmt');

    const results = [];
    // IMPORTANT: return a Cypress chain that resolves when all edits finish
    cy.wait('@settingsMgmt', { timeout: 5000 }).its('response.statusCode').should('eq', 200);
    return cy.wrap(toEdit || []).each(({ variable, value, approve = true }) => {
        // find the correct row by text
        cy.contains('tr', variable, { timeout: 5000 }).then($tr => {
            if (!$tr || !$tr.length) {
                results.push({ variable, status: 'not-found' });
                return;
            }

            // record old value
            const $valueCell = $tr.find('td').eq(1);
            const oldValue = $valueCell.text().trim();
 
            // try to find edit (pencil) icon inside the row
            const $icon = $tr.find('.v-btn .v-btn__content .v-icon', { timeout: 5000 });
            if (!$icon.length) {
                results.push({ variable, status: 'no-permission-or-locked' });
                return;
            }

            // click edit
            cy.wrap($icon).click();

            // edit dialog
            cy.get('.v-dialog > .transaction-card', { timeout: 5000 }).should('exist');

            cy.get('.v-dialog > .transaction-card td', { timeout: 5000 })
                .contains('Value')
                .parent('tr')
                .find('td')
                .eq(1)
                .then($field => {
                    if ($field.find('.v-select', { timeout: 5000 }).length > 0) {
                        // dropdown handling
                        cy.wrap($field).find('.v-select', { timeout: 5000 }).click();
                        cy.get('.v-menu__content.menuable__content__active', { timeout: 5000 }).should('be.visible').within(() => {
                            // allow value to be either an index (number) or visible text
                            if (typeof value === 'number') {
                                cy.get('.v-list-item__title', { timeout: 5000 }).eq(value).click({ force: true });
                            } else {
                                cy.contains('.v-list-item__title', String(value), { timeout: 5000 }).click({ force: true });
                            }
                        });
                    } else if ($field.find('input', { timeout: 5000 }).length > 0) {
                        // input handling
                        cy.wrap($field).find('input', { timeout: 5000 })
                            .clear()
                            .type(String(value), { delay: 100 });
                    }
                });
            
            // save
            cy.get('.v-btn', { timeout: 5000 }).contains('Edit Settings').should('be.visible').click({ force: true });

            // record success for this variable
            results.push({ variable, oldValue, value, approve, status: 'edited' });
        });
    }).then(() => results);
});