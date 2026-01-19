import GetHelper from '@support/helpers/GetHelper';
import general from '@support/routes/general';

Cypress.Commands.add('approveLoanApplication', (clientid, productcode) => {
    const { password } = GetHelper.get_user_credentials();

    // intercept the approval list POST request
    cy.intercept('POST', '**/lending/application/approve').as('getApprovals');
    cy.intercept('POST', '**/lending/application/approve/approve').as('Approved');

    // visit Approve Loan Application
    general.goToApproval({ timeout: 20000 });
    cy.get('td').contains('Approve Loan Application').click({ force: true });

    cy.wait('@getApprovals', { timeout: 60000 }).then((interception) => {
        const pns = interception.response.body.loan_applications.pns;

        const latestToApprove = pns
            .filter(item => 
                item.clientid === clientid &&
                item.loanproductname === productcode
            )
            .sort((a, b) => b.pnid - a.pnid)[0];
        
        expect(latestToApprove, 'No loan found for test client.').to.exist;

        const pnid = latestToApprove.pnid;
        const clientname = latestToApprove.clientname.trim();
        const loanproduct = latestToApprove.loanproductname;
        const isDisabled = latestToApprove.approval.disabled_checkbox;
        const approvalFilter = latestToApprove.pn_approval_level;

        cy.log(`Target Approval Filter Level: ${approvalFilter}`);
        cy.log(`Targeting: ${clientname} | ${loanproduct} | ${pnid}`);

        // Set the approval filter slider to the correct level
        cy.get('.transaction-card.v-card:visible', { timeout: 5000 }).then(() => {
            cy.get('.v-slider').then(() => {
                cy.get('div[role="slider"]', { timeout: 5000 }).then($slider => {
                    const currentValue = parseInt($slider.attr('aria-valuenow'));
                    const targetValue  = parseInt(approvalFilter);

                    if (currentValue !== targetValue) {
                        cy.log(`adjusting slider from ${currentValue} to ${targetValue}`);

                        const difference = currentValue - targetValue;
                        cy.get('.v-slider__thumb.primary', { timeout: 5000 }).click({ force: true });
                        
                        // determine which arrow key to press
                        // ArrowDown decrease the value, ArrowUp increases it (just to be sure)
                        const key = difference > 0 ? 'ArrowDown' : 'ArrowUp';
                        const steps = Math.abs(difference);

                        // press the arrow key the required number of times
                        for (let i = 0; i < steps; i ++ ) {
                            cy.realPress(key, { log: false });
                        }

                        cy.wait(1000);
                    } else {
                        cy.log(`Already at correct level: Level ${targetValue}`);
                    }
                });
            });
        });

        cy.get('table tbody tr')
            .filter(`:contains("${clientname}")`)
            .filter(`:contains("${loanproduct}")`)
            .last()
            .as('targetRow');

        if (isDisabled) {
            cy.get('@targetRow')
                .scrollIntoView({ offset: { top: -150, left: 0 }})
                .within(() => {
                    cy.log(`Checkbox disabled for ${clientname} — skipping approval`);
                    cy.get('input[type="checkbox"]')
                        .realHover({ timeout: 10000 });
                });
        } else {
            cy.get('@targetRow')
                .scrollIntoView({ offset: { top: -150, left: 0 }})
                .realHover()
                .within(() => {
                    cy.get('input[type="checkbox"]')
                        .check({ force: true })
                        .should('be.checked');

                    cy.log(`checked latest row of client ${clientname}`);
                });
            
            cy.get('input[type="password"]', { timeout: 10000 })
                .clear()
                .type(password, { delay: 100, log: false });

            cy.contains('button', 'Submit', { matchCase: false })
                .should('be.enabled')
                .click({ force: true });

            cy.wait('@Approved', { timeout: 10000 })
                .its('response.statusCode')
                .should('be.oneOf', [200, 201]);

            cy.log(`approved loan application for client ${clientname}`);

            // return pnid to be used in Loan Release
            cy.wrap({ pnid });
        }
    });
});