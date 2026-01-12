import lending from '@support/routes/lending';
import { action } from '@support/helpers/UIHelper';
import handleAmortOptions from '@support/handlers/Application-Release/handleAmortOptions';
import handleGeneralTab from '@support/handlers/Application-Release/handleGeneral';
import handleOtherDetailsTab from '@support/handlers/Application-Release/handleOtherDetails';

Cypress.Commands.add('loanRelease', ({ loan_release_data = {} }) => {
    const {
        clientid = null,
        loanproductid = null,
        pnid = null
    } = loan_release_data;

    // intercept the application/release page
    cy.intercept('GET', '**/lending/application-release/initial-data').as('app-release');
    cy.intercept('GET', '**/vue-autocomplete/clients/loan-release*').as('to-release');
    cy.intercept({
        method: 'GET',
        pathname: '**/lending/application/release/details',
        query: {
            process: 'release1',
            clientid: clientid.toString(),
            loanproductid: loanproductid.toString(),
            pnid: pnid.toString()
        }
    }).as('loan-release-details');
    
    // visit Application/Release
    lending.goToApplicationRelease({ timeout: 20000 });

    cy.wait('@app-release', { timeout: 60000 }).then(() => {
        cy.get('.transaction-card.v-card:visible', { timeout: 5000 }).then(() => {
            cy.get('.v-form:visible', { timeout: 5000 }).then(() => {
                cy.contains('strong', 'RELEASE APPROVED LOANS')
                    .closest('tr')
                    .as('LoanApplicationRow');

                // Client Name
                cy.get('@LoanApplicationRow').next('tr').contains('Client Name')
                    .parents('tr')
                    .find('input[type="text"]')
                    .type(clientid.toString(), { delay: 100 });

                    cy.wait('@to-release', { timeout: 20000 }).then((interception) => {
                        const loan_release = interception.response.body;
                        cy.log(`total loans: ${loan_release.length}`);

                        const targetIndex = loan_release.findIndex(loan => loan.pnid === pnid);

                        cy.log(`${pnid} is at index ${targetIndex}`);
                        if (targetIndex != -1) {
                            cy.log(`selecting loan: ${JSON.stringify(loan_release[targetIndex])}`)
                            cy.get('.v-menu__content .v-list-item:visible', { timeout: 5000 })
                                .eq(targetIndex)
                                .should('be.visible')
                                .click({ force: true });
                        } else {
                            throw new Error(`Loan with PNID ${pnid} not found in dropdown.`);
                        }
                    });
            });
        });
    }).then(() => {
        cy.get('body').then($body => {
            cy.wait('@loan-release-details', { timeout: 20000 }).then(() => {
                cy.log('goods');
            });
        });
    });
});