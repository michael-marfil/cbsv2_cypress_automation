import lending from '@support/routes/lending';

/** SETTINGS MGMT. */
Cypress.Commands.add('lendingSettings', ({ toEdit }) => {
    lending.goToSettingsMgmt(); // navigate to Settings Mgmt.

    // intercept the settings mgmt list
    cy.intercept('GET', '**/lending-settings').as('settingsMgmt');
    
    return cy.hasPageAccess().then(({ hasAccess }) => {
        if (!hasAccess) {
            cy.log('user has no page access.');
            return;
        }

        const results = [];
        // IMPORTANT: return a Cypress chain that resolves when all edits finish
        cy.wait('@settingsMgmt', { timeout: 10000 }).its('response.statusCode').should('eq', 200);

        // Return a chain that resolves with results when all operations complete
        return cy.wrap(toEdit || []).each(({ variable, value, approve = true }) => {
            // find the correct row by text
            cy.contains('tr', variable, { timeout: 10000 }).then($tr => {
                if (!$tr || !$tr.length) {
                    results.push({ variable, status: 'not-found' });
                    return;
                }

                // record old value
                const $valueCell = $tr.find('td').eq(1);
                const oldValueText = $valueCell.text().trim();

                // For dropdowns, the displayed text might not match the internal value exactly,
                // but in most cases it's safe to compare as strings. Adjust if needed.
                const oldValue = oldValueText;

                // try to find edit (pencil) icon inside the row
                const $icon = $tr.find('.v-btn .v-btn__content .v-icon', { timeout: 5000 });
                if (!$icon.length) {
                    results.push({ variable, status: 'no-permission-or-locked' });
                    return;
                }

                // click edit
                cy.wrap($icon).click();

                cy.get('.v-dialog > .transaction-card', { timeout: 10000 }).should('exist');

                cy.get('.v-dialog > .transaction-card td', { timeout: 10000 })
                    .contains('Value')
                    .parent('tr')
                    .find('td')
                    .eq(1)
                    .as('valueField');

                // Set the new value
                cy.get('@valueField').then($field => {
                    if ($field.find('.v-select').length > 0) {
                        cy.wrap($field).find('.v-select').click();
                        cy.get('.v-menu__content.menuable__content__active').within(() => {
                            if (typeof value === 'number') {
                                cy.get('.v-list-item__title').eq(value).click({ force: true });
                            } else {
                                cy.contains('.v-list-item__title', String(value)).click({ force: true });
                            }
                        });
                    } else if ($field.find('input').length > 0) {
                        cy.wrap($field).find('input')
                            .clear()
                            .type(String(value), { delay: 100 });
                    }
                });

                // Determine if the value actually changed
                const newValueStr = String(value);
                const isChanged = oldValue !== newValueStr;

                const status = isChanged ? 'edited' : 'unchanged';

                // Only approve if actually changed
                const shouldApprove = approve && isChanged;

                // Click save
                cy.get('.v-btn').contains('Edit Settings').click({ force: true });

                // Push result
                results.push({
                    variable,
                    oldValue,
                    newValue: value,
                    status,
                    approved: shouldApprove ? 'pending' : 'skipped',
                });
            });
        }).then(() => {
            // Return the collected results when all iterations complete
            return cy.wrap(results);
        });
    });
});