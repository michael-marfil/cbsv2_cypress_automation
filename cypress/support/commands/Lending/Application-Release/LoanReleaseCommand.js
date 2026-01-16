import lending from '@support/routes/lending';
import handleAmortOptions from '@support/handlers/Application-Release/handleAmortOptions';
import handleGeneralTab from '@support/handlers/Application-Release/handleGeneral';
import handleOtherDetailsTab from '@support/handlers/Application-Release/handleOtherDetails';

Cypress.Commands.add('loanRelease', ({ loan_release_data = {} } = {}) => {
    const {
        clientid = null,
        loanproductid = null,
        pnid = null,
        visitGeneralTab = true,
        visitAmortizationTab = true,
        visitOtherDetailsTab = true,
        visitSummaryTab = true,
        triggerSubmit = {
            general: false,
            amortization: false,
            other_details: false,
            summary: false
        },
        finalSubmit = true,
        data = {
            loan_release_details: [],
            amort_details: [],
            general: [],
            other_details: []
        }
    } = loan_release_data;

    // check if loan data is present
    const hasLoanData = clientid && pnid;

    // visit Application/Release
    lending.goToApplicationRelease({ timeout: 20000 });

    // intercept the application/release page
    cy.intercept('GET', '**/lending/application-release/initial-data').as('app-release');
    
    if (hasLoanData) {
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
    }
    
    return cy.hasPageAccess().then(({ hasAccess }) => {
        if (!hasAccess) {
            cy.log('user has no page access.');
            return;
        }

        if (!hasLoanData) {
            cy.log('No loan data provided.');
            return;
        }

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
            const LoanReleaseDetails = data.loan_release_details?.[0] || null;
            const AmortDetails = data.amort_details?.[0] || null;
            const GeneralDetails = data.general?.[0] || null;
            const OtherDetails = data.other_details?.[0] || null;

            cy.get('body').then($body => {
                cy.wait('@loan-release-details', { timeout: 20000 }).then(() => {
                    // ----------------------------------------
                    // AMORT OPTIONS
                    // ----------------------------------------
                    if (LoanReleaseDetails || AmortDetails) {
                        handleAmortOptions(LoanReleaseDetails, AmortDetails);
                    }

                    cy.get('.relative:visible', { timeout: 20000 }).then(() => {
                        // ----------------------------------------
                        // GENERAL TAB
                        // ----------------------------------------
                        if (visitGeneralTab && GeneralDetails) {
                            handleGeneralTab(GeneralDetails, triggerSubmit.general);
                        }

                        // ----------------------------------------
                        // AMORTIZATION TAB
                        // ----------------------------------------
                        if (visitAmortizationTab) {
                            const AmortTab = $body.find('.v-tab:contains("Amortization")').length > 0;
                            if (AmortTab) {
                                cy.get('.v-tab.amortization:visible', { timeout: 5000 }).then((amort) => {
                                    cy.wrap(amort).click({ force: true, timeout: 5000 }).wait(500);
                                });
                            } else {
                                cy.log('Skipping: Amortization Tab not found.');
                            }
                        }

                        // ----------------------------------------
                        // OTHER DETAILS TAB
                        // ----------------------------------------
                        if (visitOtherDetailsTab && OtherDetails) {
                            const OtherDetailsTab = $body.find('.v-tab:contains("Other Details")').length > 0;
                            if (OtherDetailsTab) {
                                cy.get('.v-tab.other-details:visible', { timeout: 5000 }).then((other_details) => {
                                    cy.wrap(other_details).click({ force: true, timeout: 5000 }).wait(500);
                                });

                                handleOtherDetailsTab(OtherDetails, triggerSubmit.other_details);
                            } else {
                                cy.log('Skipping: Other Details Tab not found.');
                            }
                        }
                        
                        // ----------------------------------------
                        // SUMMARY TAB
                        // ----------------------------------------
                        if (visitSummaryTab) {
                            const Summ = $body.find('.v-tab:contains("Summary")').length > 0;
                            if (Summ) {
                                cy.get('.v-tab.summary:visible', { timeout: 5000 }).then((summary) => {
                                    cy.wrap(summary).click({ force: true, timeout: 5000 }).wait(500);
                                });
                            } else {
                                cy.log('Skipping: Summary Tab not found.');
                            }
                        }
                    });
                });
            });
        }).then(() => {
            // submit loan application
            cy.get('body', { timeout: 10000 }).then($body => {
                const submitBtn = $body.find('.v-btn__content:contains("Release Loan")', { timeout: 5000 });

                if (finalSubmit && submitBtn.length > 0) {
                    // check if submit button is disable
                    if (submitBtn.is(':disabled')) cy.log(`submit button is disabled.`);

                    // otherwise, click it
                    cy.wrap(submitBtn)
                        .should('be.visible')
                        .click({ force: true });
                }
            });
        });
    });
});