import lending from '@support/routes/lending';
import { action } from '@support/helpers/UIHelper';
import handleLoanDetailsTab from '@support/handlers/ClientDetails/handleLoanDetails';

Cypress.Commands.add('clientDetails', ({ client_data = {} }) => {
    const {
        clientid = null,
        data = {
            loan_details: []
        }
    } = client_data;

    const tabs = {
        clientInfo: "Client Info",
        laonDetails: "Loan Details",
        coMakership: "Comakership",
        savings: "Savings",
        insurance: "Insurance",
        files: "Files",
        riskRating: "Risk Rating"
    }

    // visit Client Details
    lending.goToClientDetails({ timeout: 20000 });

    // intercept client details
    cy.intercept('POST', '**/client-details/client-data').as('client-data');

    return cy.hasPageAccess().then(({ hasAccess}) => {
        if (!hasAccess) {
            cy.log('user has no page access.');
            return;
        }

        cy.get('.transaction-card.main-card:visible', { timeout: 5000 }).then(() => {
            cy.get('.container.pa-4:visible', { timeout: 5000 }).then(() => {
                cy.get('.container.my-0.py-0:visible', { timeout: 5000 }).then(() => {
                    cy.get('table tbody').then(() => {
                        cy.contains('td', 'Search Client: ', { timeout: 10000 })
                            .should('be.visible')
                            .parent('tr')
                            .within(() => {
                                action.autocomplete('input[type="text"]', clientid);
                            });
                    });
                });
            });
        }).then(() => {
            const LoanDetails = data.loan_details?.[0] || null;

            cy.get('body').then($body => {
                cy.wait('@client-data', { timeout: 20000 }).then(() => {
                    cy.get('.tabs.v-tabs:visible', { timeout: 10000 }).then(() => {
                        // ----------------------------------------
                        // LOAN DETAILS
                        // ----------------------------------------
                        if (LoanDetails) {
                            const loanDetailsTab = $body.find(`.v-tab:contains(${tabs.laonDetails})`).length > 0;
                            if (loanDetailsTab) {
                                cy.get(`a.v-tab:contains(${tabs.laonDetails})`, { timeout: 5000 }).then((client_details) => {
                                    cy.wrap(client_details).click({ force: true, timeout: 5000 }).wait(500);
                                });

                                handleLoanDetailsTab(LoanDetails);
                            } else {
                                cy.log('Skipping: Loan Details Tab not found.');
                            }
                        }
                    });
                });
            });
        });
    });
});