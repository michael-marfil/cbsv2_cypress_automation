import lending from '@support/routes/lending';

Cypress.Commands.add('loanApplication', () => {
    const loan_product = 'TS 51 (TS LRA 51)';
    const clientid = 110311218;
    const loanproductid = 32;
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
        cy.wait('@loan-app-details', { timeout: 20000 }).then(() => {
            cy.get('#amortOptions:visible', { timeout: 10000 }).then(() => {
                cy.get('div.v-data-table.py-1:visible', { timeout: 10000 }).eq(0).as('loan-application-details');
                cy.get('div.v-data-table.py-1:visible', { timeout: 10000 }).eq(1).as('amortization-details');

                cy.get('@loan-application-details').then(() => {
                    cy.log('loan application details');
                });

                cy.get('@amortization-details').then(() => {
                    cy.log('amortization details');
                });

            });

            cy.get('.tabContainer:visible', { timeout: 20000 }).then(() => {
                cy.log('entered tab container');
            });
        });
    });
});