import { action } from '@support/helpers/UIHelper';

export default function handleGeneralTab(generalDetails, triggerSubmit) {
    cy.get('.tabContainer:visible', { timeout: 10000 }).then(() => {
        cy.get('.v-window-item.tab-content:visible', { timeout: 10000 }).within(() => {
            cy.get('div.v-data-table:visible', { timeout: 10000 }).eq(0).as('loan-details');
            cy.get('div.v-data-table:visible', { timeout: 10000 }).eq(1).as('deductions');
        });

        const loanDetails = generalDetails.loanDetails || {};
        const deductions = generalDetails.deductions || {};
        // check first if trigger submit is true before actual process
        if (triggerSubmit) cy.get('.v-btn__content:visible').contains('submit').click({ force: true });

        // helper function to safely interact with a field
        const field = (label, callback, waitTime = 500) => {
            // Always wait a bit by default to let UI settle
            cy.wait(waitTime, { log: false });

            cy.get('body').then($body => {
                // Check if any td or label contains exactly this text
                const allElements = $body[0].querySelectorAll('td, td label');
                const found = Array.from(allElements).some(el => 
                    el.innerText && el.innerText.trim() === label
                );
                
                if (found) {
                    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    cy.contains('td', new RegExp(`^\\s*${escapedLabel}\\s*$`)).parent('tr').then($row => {
                        if ($row.is(':visible')) {
                            callback();
                        } else {
                            cy.log(`Skipping: ${label} field is not visible.`);
                        }
                    });
                } else {
                    cy.log(`Skipping: ${label} field not found in DOM.`);
                }
            });
        }

        cy.get('@loan-details').then(() => {
            // Loan Amount
            if (loanDetails.loanAmount) {
                field('Loan Amount', () => {
                    cy.contains('td', 'Loan Amount').parent('tr').within(() => {
                        action.input('input.currency-field', loanDetails.loanAmount);
                    });
                });
            }

            // Maturity Date
            if (loanDetails.maturityDate) {
                field('Maturity', () => {
                    cy.contains('td', 'Maturity').parent('tr').within(() => {
                        cy.get('td.datepicker-component', { timeout: 5000 }).within(() => {
                            cy.get('input[type="text"]', { timeout: 5000 }).click({ force: true }).then(() => {
                                action.datepicker(loanDetails.maturityDate);
                            });
                        });
                    });
                });
            }
        });

        cy.get('@deductions').then(() => {
            //Service Charge
            if (deductions.serviceCharge) {
                field('Service Charge', () => {
                    cy.contains('td', 'Service Charge').parent('tr').within(() => {
                        action.input('input.currency-field', deductions.serviceCharge);
                    });
                });
            }
        });
    });
}