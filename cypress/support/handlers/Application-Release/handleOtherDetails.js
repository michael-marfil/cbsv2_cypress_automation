import { action } from '@support/helpers/UIHelper';

export default function handleOtherDetailsTab(otherDetails) {
    cy.get('.tabContainer:visible', { timeout: 10000 }).then(() => {
        cy.get('.v-form.form-section:visible', { timeout: 10000 }).then(() => {
            
            const OtherDetails = otherDetails;

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
                if (OtherDetails.releaseTag) {
                    field('Release Tag', () => {
                        cy.contains('td', 'Release Tag').parent('tr').within(() => {
                            action.select(undefined, OtherDetails.releaseTag);
                        });
                    });
                }

                // Loan Officer
                if (OtherDetails.loanOfficer) {
                    field('Loan Officer', () => {
                        cy.contains('td', 'Loan Officer').parent('tr').within(() => {
                            action.autocomplete(undefined, OtherDetails.loanOfficer);
                        });
                    });
                }

                // Co Borrower
                if (OtherDetails.coBorrower) {
                    field('Co Borrower', () => {
                        cy.contains('td', 'Co Borrower').parent('tr').within(() => {
                            action.autocomplete(undefined, OtherDetails.coBorrower);
                        });
                    });   
                }

                // Co-Maker 1
                if (OtherDetails.coMaker1) {
                    field('Co-Maker 1', () => {
                        cy.contains('td', 'Co-Maker 1').parent('tr').within(() => {
                            action.autocomplete(undefined, OtherDetails.coMaker1);
                        });
                    });
                }

                // Loan Security
                if (OtherDetails.loanSecurity) {
                    field('Loan Security', () => {
                        cy.contains('td', 'Loan Security').parent('tr').within(() => {
                            action.select(undefined, OtherDetails.loanSecurity);
                        });
                    });
                }

                // Borrower Type
                if (OtherDetails.borrowerType) {
                    field('Borrower Type', () => {
                        cy.contains('td', 'Borrower Type').parent('tr').within(() => {
                            action.autocomplete(undefined, OtherDetails.borrowerType);
                        });
                    });
                }

                // Client Group
                if (OtherDetails.clientGroup) {
                    field('Client Group', () => {
                        cy.contains('td', 'Client Group').parent('tr').within(() => {
                            action.autocomplete(undefined, OtherDetails.clientGroup);
                        });
                    });
                }

                // Loan Purpose Text
                if (OtherDetails.loanPurposeTxt) {
                    field('Loan Purpose Text', () => {
                        cy.contains('td', /^\sLoan Purpose Text\s$/).parent('tr').within(() => {
                            action.input(undefined, OtherDetails.loanPurposeTxt);
                        });
                    });
                }

                // Loan Purpose
                if (OtherDetails.loanPurpose) {
                    field('Loan Purpose', () => {
                        cy.contains('td', /^\sLoan Purpose\s$/).parent('tr').within(() => {
                            action.autocomplete(undefined, OtherDetails.loanPurpose);
                        });
                    });
                }

                // Loan Classification
                if (OtherDetails.loanPurpose && OtherDetails.loanClass) {
                    field('Loan Classification', () => {
                        cy.contains('td', 'Loan Classification').parent('tr').within(() => {
                            action.select(undefined, OtherDetails.loanClass);
                        });
                    });
                }

                // Industry
                if (OtherDetails.industry) {
                    field('Industry', () => {
                        cy.contains('td', 'Industry').parent('tr').within(() => {
                            action.select(undefined, OtherDetails.industry);
                        });
                    });
                }

                // Sales Lead Generation
                if (OtherDetails.salesLeadGen) {
                    field('Sales Lead Generation', () => {
                        cy.contains('td', 'Sales Lead Generation').parent('tr').within(() => {
                            action.select(undefined, OtherDetails.salesLeadGen);
                        });
                    }); 
                }


            });

        });
    });
}