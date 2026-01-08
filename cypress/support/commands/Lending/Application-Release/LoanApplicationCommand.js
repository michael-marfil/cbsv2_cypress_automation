import lending from '@support/routes/lending';
import handleAmortOptions from '@support/handlers/Application-Release/handleAmortOptions';
import handleGeneralTab from '@support/handlers/Application-Release/handleGeneral';
import handleOtherDetailsTab from '@support/handlers/Application-Release/handleOtherDetails';

Cypress.Commands.add('loanApplication', ({ loan_application_data = {} }) => {
    const {
        loanproductid = null,
        loan_product = null,
        clientid = null,
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
            loan_app_details: [],
            amort_details: [],
            general: [],
            other_details: []
        }
    } = loan_application_data;
    
    // intercept the application/release page
    cy.intercept('GET', '**/lending/application-release/initial-data').as('app-release');
    cy.intercept({
        method: 'GET',
        pathname: '**/lending/application/release/details',
        query: {
            process: 'apply1',
            clientid: clientid.toString(),
            loanproductid: loanproductid.toString(),
            pnid: '0'
        }
    }).as('loan-app-details');

    // visit Application/Release
    lending.goToApplicationRelease({ timeout: 20000 });

    cy.wait('@app-release', { timeout: 60000 }).then((interception) => {
        const products = interception.response.body.products;
        const productExists = products.find(p => p.loanproductname === loan_product);

        if (!productExists) {
            throw new Error(`Loan product "${loan_product}" not found in available products`);
        }

        cy.log(`found product: ${JSON.stringify(productExists)}`);

        cy.get('.transaction-card.v-card:visible', { timeout: 5000 }).then(() => {
            cy.get('.v-form:visible', { timeout: 5000 }).then(() => {
                cy.contains('strong', 'LOAN APPLICATION')
                    .closest('tr')
                    .nextUntil('tr:has(hr)')
                    .as('LoanApplicationRow');

                // target specific fields withing the row
                // Loan Product
                cy.get('@LoanApplicationRow')
                    .contains('Loan Product')
                    .parents('tr')
                    .find('.v-select__selections', { timeout: 5000 })
                    .click({ force: true });

                    cy.get('.v-menu__content:visible', { timeout: 5000 }).then($menu => {
                        const menuEl = $menu[0];
                        let lastScrollTop = -1;

                        const scrollAndFind = (attempts = 0, maxAttempts = 20) => {
                            if (attempts >= maxAttempts) throw new Error(`Loan Product '${loan_product}' not found after ${maxAttempts} scroll attempts.`);

                            // check if reached the bottom (no more scrolling possible)
                            if (lastScrollTop === menuEl.scrollTop && attempts > 0) {
                                throw new Error(`Loan Product '${loan_product}' not found - reached end of list.`);
                            }

                            lastScrollTop = menuEl.scrollTop;

                            // scroll down by a chunk
                            menuEl.scrollTop += 300;

                            cy.wait(200, { log: false }).then(() => {
                                // check if item exists
                                const $items = Cypress.$('.v-menu__content:visible .v-list-item__content');
                                const found = $items.toArray().some(item => item.textContent.includes(loan_product) );

                                if (found) {
                                    // item found, click it
                                    cy.get('.v-menu__content:visible', { timeout: 5000 })
                                        .contains('.v-list-item__content', loan_product)
                                        .scrollIntoView({ easing: 'linear', duration: 500 })
                                        .click({ force: true });
                                } else {
                                    // not found yet, scroll more
                                    scrollAndFind(attempts + 1, maxAttempts);
                                }
                            });
                        }
                        
                        scrollAndFind();
                    });

                // Client Name
                cy.get('@LoanApplicationRow')
                    .contains('Client Name')
                    .parents('tr')
                    .find('input[type="text"]', { timeout: 5000 })
                    .type(clientid, { delay: 100, timeout: 5000 })
                    .then(() => {
                        cy.get('.v-menu__content .v-list :visible', { timeout: 5000 }).contains(clientid).click({ force: true });
                    });
            });
        });
    }).then(() => {
        const LoanAppDetails = data.loan_app_details?.[0] || null;
        const AmortDetails = data.amort_details?.[0] || null;
        const GeneralDetails = data.general?.[0] || null;
        const OtherDetails = data.other_details?.[0] || null;
        
        cy.get('body').then($body => {
            cy.wait('@loan-app-details', { timeout: 20000 }).then(() => {
                // ----------------------------------------
                // AMORT OPTIONS
                // ----------------------------------------
                if (LoanAppDetails || AmortDetails) {
                    handleAmortOptions(LoanAppDetails, AmortDetails);
                }

                cy.get('.relative:visible', { timeout: 20000 }).then(() => {
                    cy.log('entered tab container');
                    // ----------------------------------------
                    // GENERAL TAB
                    // ----------------------------------------
                    if (visitGeneralTab && GeneralDetails) {
                        cy.log('general');
                        if (triggerSubmit.general) cy.contains('.v-btn__content', 'submit').click({ force: true });

                        handleGeneralTab(GeneralDetails);
                    }

                    // ----------------------------------------
                    // AMORTIZATION TAB
                    // ----------------------------------------
                    if (visitAmortizationTab) {
                        cy.log('amortization');
                        const AmortTab = $body.find('.v-tab:contains("Amortization")').length > 0;
                        if (AmortTab) {
                            cy.get('.v-tab.amortization:visible', { timeout: 5000 }).then((amort) => {
                                cy.wrap(amort).click({ force: true, timeout: 5000 });
                            });

                            if (triggerSubmit.amortization) cy.contains('.v-btn__content', 'submit').click({ force: true });
                        } else {
                            cy.log('Skipping: Amortization Tab not found.');
                        }
                    }

                    // ----------------------------------------
                    // OTHER DETAILS TAB
                    // ----------------------------------------
                    if (visitOtherDetailsTab && OtherDetails) {
                        cy.log('other details');
                        const OtherDetailsTab = $body.find('.v-tab:contains("Other Details")').length > 0;
                        if (OtherDetailsTab) {
                            cy.get('.v-tab.other-details:visible', { timeout: 5000 }).then((other_details) => {
                                cy.wrap(other_details).click({ force: true, timeout: 5000 });
                            });

                            if (triggerSubmit.other_details) {
                                cy.contains('.v-btn__content', 'submit').click({ force: true });
                            }

                            handleOtherDetailsTab(OtherDetails);
                        } else {
                            cy.log('Skipping: Other Details Tab not found.');
                        }
                    }

                    // ----------------------------------------
                    // SUMMARY TAB
                    // ----------------------------------------
                    if (visitSummaryTab) {
                        cy.log('summary');
                        const Summ = $body.find('.v-tab:contains("Summary")').length > 0;
                        if (Summ) {
                            cy.get('.v-tab.summary:visible', { timeout: 5000 }).then((summary) => {
                                cy.wrap(summary).click({ force: true, timeout: 5000 });
                            });

                            if (triggerSubmit.summary) cy.contains('.v-btn__content', 'submit').click({ force: true });
                        } else {
                            cy.log('Skipping: Summary Tab not found.');
                        }
                    }
                });
            });
        });
    });
});