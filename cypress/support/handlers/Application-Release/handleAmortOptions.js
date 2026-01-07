import { action } from '@support/helpers/UIHelper';

export default function handleAmortOptions(loanDetails, amortDetails) {
    cy.get('#amortOptions:visible', { timeout: 10000 }).then(() => {
        cy.get('div.v-data-table.py-1:visible', { timeout: 10000 }).eq(0).as('loan-application-details');
        cy.get('div.v-data-table.py-1:visible', { timeout: 10000 }).eq(1).as('amortization-details');

        const LoanAppDetails = loanDetails;
        const AmortDetails = amortDetails;
        
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

        // ----------------------------------------
        // LOAN APPLICATION DETAILS
        // ----------------------------------------
        cy.get('@loan-application-details').then(() => {
            // Term
            if (LoanAppDetails.term || LoanAppDetails.termUnit) {
                field('Term', () => {
                    cy.contains('td', 'Term').parent('tr').within(() => {
                        if (LoanAppDetails.term) action.input('input.currency-field', LoanAppDetails.term);
                        if (LoanAppDetails.termUnit) action.select(undefined, LoanAppDetails.termUnit);
                    });
                });
            }

            // Interest Rate
            if (LoanAppDetails.interestRate || LoanAppDetails.interestRateUnit) {
                field('Interest Rate', () => {
                    cy.contains('td', 'Interest Rate').parent('tr').within(() => {
                        if (LoanAppDetails.interestRate) action.input('input.currency-field', LoanAppDetails.interestRate);
                        if (LoanAppDetails.interestRateUnit) action.select(undefined, LoanAppDetails.interestRateUnit);
                    });
                });
            }

            // Interest Computation
            if (LoanAppDetails.interestComp) {
                field('Interest Computation', () => {
                    cy.contains('td', 'Interest Computation').parent('tr').within(() => {
                        action.select(undefined, LoanAppDetails.interestComp);
                    });
                });   
            }
        });

        // ----------------------------------------
        // AMORTIZATION DETAILS
        // ----------------------------------------
        cy.get('@amortization-details').then(() => {
            // Fixed Days of Term
            if (AmortDetails.fixedDaysofTerm) {
                field('Fixed Days of Term', () => {
                    cy.contains('td', 'Fixed Days of Term').parent('tr').within(() => {
                        action.check(undefined, AmortDetails.fixedDaysofTerm);
                    });
                });
            }

            // Diminishing Option
            if (AmortDetails.diminishingOpt) {
                field('Diminishing Option', () => {
                    cy.contains('td', 'Diminishing Option').parent('tr').within(() => {
                        action.select(undefined, AmortDetails.diminishingOpt);
                    });
                });
            }

            // Amortization Days
            if (AmortDetails.amortDays) {
                field('Amortization Days', () => {
                    cy.contains('td', 'Amortization Days').parent('tr').within(() => {
                        action.select(undefined, AmortDetails.amortDays);
                    });
                });
            }

            // Principal Interval
            if (AmortDetails.principalInterval) {
                field('Principal Interval', () => {
                    cy.contains('td', 'Principal Interval').parent('tr').within(() => {
                        action.select(undefined, AmortDetails.principalInterval);
                    });
                });
            }

            // Principal Graceperiod
            if (AmortDetails.principalGracePeriod) {
                field('Principal Graceperiod', () => {
                    cy.contains('td', 'Principal Graceperiod').parent('tr').within(() => {
                        action.select(undefined, AmortDetails.principalGracePeriod);
                    });
                });
            }

            // Fixed Principal Amort
            if (AmortDetails.fixedPrincipalAmort) {
                field('Fixed Principal Amort', () => {
                    cy.contains('td', 'Fixed Principal Amort').parent('tr').within(() => {
                        action.input(undefined, AmortDetails.fixedPrincipalAmort);
                    });
                });   
            }

            // Irregular Principal Amort
            if (AmortDetails.irregPrincipalAmort) {
                field('Irregular Prncpl Amort', () => {
                    cy.contains('td', 'Irregular Prncpl Amort').parent('tr').within(() => {
                        action.input(undefined, AmortDetails.irregPrincipalAmort);
                    });
                });
            }

            // ----------------------------------------
            // PARTIAL DEDUCTIONS
            // ----------------------------------------
            // Interest Amortized
            if (AmortDetails.interestAmort) {
                field('Interest Amortized', () => {
                    cy.contains('td', 'Interest Amortized').parent('tr').within(() => {
                        action.select(undefined, AmortDetails.interestAmort);
                    });
                });
            }

            // S.C. Amortized
            if (AmortDetails.scAmort) {
                field('S.C. Amortized', () => {
                    cy.contains('td', 'S.C. Amortized').parent('tr').within(() => {
                        action.select(undefined, AmortDetails.scAmort);
                    });
                });
            }
        });
    });
}