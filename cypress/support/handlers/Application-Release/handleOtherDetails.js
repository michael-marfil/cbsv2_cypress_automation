import { action } from '@support/helpers/UIHelper';

export default function handleOtherDetailsTab(data) {
    cy.get('.tabContainer:visible', { timeout: 10000 }).then(() => {
        cy.get('.v-form.form-section:visible', { timeout: 10000 }).then(() => {
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

            cy.get('table:visible', { timeout: 10000 }).then(() => {
                // Release Tag
                if (data.releaseTag) {
                    field('Release Tag', () => {
                        cy.contains('td', 'Release Tag').parent('tr').within(() => {
                            action.select(undefined, data.releaseTag);
                        });
                    });
                }

                // Loan Officer
                if (data.loanOfficer) {
                    field('Loan Officer', () => {
                        cy.contains('td', 'Loan Officer').parent('tr').within(() => {
                            action.autocomplete(undefined, data.loanOfficer);
                        });
                    });
                }

                // Co Borrower
                if (data.coBorrower) {
                    field('Co Borrower', () => {
                        cy.contains('td', 'Co Borrower').parent('tr').within(() => {
                            action.autocomplete(undefined, data.coBorrower);
                        });
                    });   
                }

                // Co-Maker 1
                if (data.coMaker1) {
                    field('Co-Maker 1', () => {
                        cy.contains('td', 'Co-Maker 1').parent('tr').within(() => {
                            action.autocomplete(undefined, data.coMaker1);
                        });
                    });
                }

                // Loan Security
                if (data.loanSecurity) {
                    field('Loan Security', () => {
                        cy.contains('td', 'Loan Security').parent('tr').within(() => {
                            action.select(undefined, data.loanSecurity);
                        });
                    });
                }

                // Borrower Type
                if (data.borrowerType) {
                    field('Borrower Type', () => {
                        cy.contains('td', 'Borrower Type').parent('tr').within(() => {
                            action.autocomplete(undefined, data.borrowerType);
                        });
                    });
                }

                // Client Group
                if (data.clientGroup) {
                    field('Client Group', () => {
                        cy.contains('td', 'Client Group').parent('tr').within(() => {
                            action.autocomplete(undefined, data.clientGroup);
                        });
                    });
                }

                // Loan Purpose Text
                if (data.loanPurposeTxt) {
                    field('Loan Purpose Text', () => {
                        cy.contains('td', /^\sLoan Purpose Text\s$/).parent('tr').within(() => {
                            action.input(undefined, data.loanPurposeTxt);
                        });
                    });
                }

                // Loan Purpose
                if (data.loanPurpose) {
                    field('Loan Purpose', () => {
                        cy.contains('td', /^\sLoan Purpose\s$/).parent('tr').within(() => {
                            action.autocomplete(undefined, data.loanPurpose);
                        });
                    });
                }

                // Loan Classification
                if (data.loanPurpose && data.loanClass) {
                    field('Loan Classification', () => {
                        cy.contains('td', 'Loan Classification').parent('tr').within(() => {
                            action.select(undefined, data.loanClass);
                        });
                    });
                }

                // Industry
                if (data.industry) {
                    field('Industry', () => {
                        cy.contains('td', 'Industry').parent('tr').within(() => {
                            action.select(undefined, data.industry);
                        });
                    });
                }

                // Sales Lead Generation
                if (data.salesLeadGen) {
                    field('Sales Lead Generation', () => {
                        cy.contains('td', 'Sales Lead Generation').parent('tr').within(() => {
                            action.select(undefined, data.salesLeadGen);
                        });
                    }); 
                }


            });

        });
    });
}