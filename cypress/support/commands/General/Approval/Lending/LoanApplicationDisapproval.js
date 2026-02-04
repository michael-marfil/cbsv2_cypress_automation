import general from '@support/routes/general';

Cypress.Commands.add('disapproveLoanApplication', (clientid, productcode, rejectInfo = {}) => {
    // intercept the approval list POST request
    cy.intercept('POST', '**/lending/application/approve').as('getApprovals');
    cy.intercept('POST', '**/lending/application/approve/delete').as('Disapproved');

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
        const approvalFilter = latestToApprove.pn_approval_level;

        cy.log(`Target Approval Filter Level: ${approvalFilter}`);
        cy.log(`Targeting: ${clientname} | ${loanproduct} | ${pnid}`);

        // set the approval filter slider to the correct level
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
                        for (let i = 0; i < steps; i ++) {
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

        cy.get('@targetRow')
            .scrollIntoView({ offset: { top: -150, left: 0 }})
            .realHover()
            .within(() => {
                cy.get('.v-icon.mdi-close', { timeout: 5000 }).click({ force: true });
            }).then(() => {
                const { reasonType, reasonText } = rejectInfo;

                if (reasonType) {
                    cy.get('.v-input.custom-radio-group') // select from radio button
                        .contains('label', reasonType)
                        .click({ force: true })
                }

                if (reasonText) {
                    cy.get('textarea') // type reason in textbox
                        .clear()
                        .type(reasonText, { delay: 100 })
                }
            }).then(() => {
                cy.get('button')
                    .find('.v-btn__content')
                    .contains('Submit')
                    .click({ force: true });
            });

        return cy.wait('@Disapproved', { timeout: 10000 }).then((disapproval_response) => {
            expect(disapproval_response.response.statusCode).to.be.oneOf([200, 201]);

            return { pnid }
        });
    });
});