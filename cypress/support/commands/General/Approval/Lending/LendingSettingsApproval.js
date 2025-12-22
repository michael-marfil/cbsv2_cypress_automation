import GetHelper from '@support/helpers/GetHelper';
import general from '@support/routes/general';

Cypress.Commands.add('approveLendingSettings', ({ toApprove = [] } = {}) => {
    // normalize input
    const normItem = (e) => {
        if (Array.isArray(e)) return { variable: String(e[0]), value: e[1], approve: e[2] !== false };
        if (typeof e === 'string') return { variable: e, value: undefined, approve: true };
        return { variable: String(e.variable), value: e.value, approve: e.approve !== false };
    };

    const requested_to_approve = (toApprove || []).map(normItem).filter(p => p.approve);

    const escapeRegExp = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // intercept and get credentials
    cy.intercept('POST', '**/lending-settings-report').as('getApprovals');
    const { username, password } = GetHelper.get_user_credentials();
    const categoryid = '1401';

    GetHelper.has_level_permission(username, categoryid, '2').then((hasAccess) => {
        cy.wrap(hasAccess).as('hasLevel2Access');
    });

    GetHelper.has_level_permission(username, categoryid, '3').then((hasAccess) => {
        cy.wrap(hasAccess).as('hasLevel3Access');
    });

    cy.get('@hasLevel2Access').then(hasLevel2Access => {
        cy.get('@hasLevel3Access').then(hasLevel3Access => {
            cy.log('has level 2 access:', hasLevel2Access);
            cy.log('has level 3 access:', hasLevel3Access);

            let final_to_approve;

            const isL3Only = hasLevel3Access && !hasLevel2Access;

            if (requested_to_approve.length > 0) {
                // if something was requested, limit to first one if L3-only
                final_to_approve = isL3Only ? requested_to_approve.slice(0, 1) : requested_to_approve;
            } else if (isL3Only) {
                // if nothing requested AND user is L3-only → approve the first row in the table
                final_to_approve = [{ variable: '', value: undefined }]; // dummy item to trigger "select first row"
            } else {
                // nothing requested and not L3-only → do nothing
                cy.log('approveLendingSettings: nothing to approve.');
                return;
            }

            // navigate to page
            general.goToApproval({ timeout: 20000 });
            cy.get('td').contains('Lending Settings').click({ force: true });

            cy.wait('@getApprovals', { timeout: 60000 }).then(() => {
                cy.get('.v-card.transaction-card:visible', { timeout: 50000 }).should('be.visible');
                cy.get('.v-data-table:visible tbody', { timeout: 50000 }).should('exist');

                cy.wrap(final_to_approve).each(({ variable, value }) => {
                    if (variable === '' && value === undefined) {
                        // special case: approve the very first row (fallback for L3-only with no input)
                        cy.get('tbody tr:visible').first().as('targetRow');
                    } else {
                        // normal case: find row by variable name
                        const valuePattern = new RegExp(`\\b${escapeRegExp(variable)}\\b`, 'i');
                        cy.contains('tbody tr', valuePattern, { timeout: 20000 })
                            .should('be.visible')
                            .as('targetRow');
                    }

                    cy.get('@targetRow').then($row => {
                        // if value was specified, verify it exists in row
                        if (value !== undefined) {
                            const rowText = $row.text().replace(/\s+/g, ' ').trim();
                            const valuePattern = new RegExp(`\\b${escapeRegExp(String(value))}\\b`);
                            if (!valuePattern.test(rowText)) {
                                cy.log(`Skipping "${variable}": expected value ${value} not present.`);
                                return;
                            }
                        }

                        // click checkbox
                        cy.wrap($row)
                            .find('.v-input--selection-controls__ripple:visible', { timeout: 10000 })
                            .click({ force: true });
                    });
                }).then(() => {
                    // submit with password
                    cy.get('.password-field:visible', { timeout: 20000 })
                        .find('input[type="password"]')
                        .type(password, { delay: 100 });

                    cy.get('.v-btn:visible')
                        .contains('Submit')
                        .click({ force: true });
                });
            });
        });
    });
});