import { action } from '@support/helpers/UIHelper';

export default function handleOtherDetailsTab(data) {
    cy.get('.tabContainer:visible', { timeout: 10000 }).then(() => {
        cy.get('.v-form.form-section:visible', { timeout: 10000 }).then(() => {
            // helper function to safely interact with a field
            const field = (label, callback) => {
                cy.get('body').then($body => {
                    // Check if any td or label contains exactly this text
                    const allElements = $body[0].querySelectorAll('td, td label');
                    const found = Array.from(allElements).some(el => 
                        el.textContent.trim() === label
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
                field('Release Tag', () => {
                    cy.contains('td', 'Release Tag').parent('tr').within(() => {
                        if (data.releaseTag) action.select(undefined, data.releaseTag);
                    });
                });

                // Loan Officer
                field('Loan Officer', () => {
                    cy.contains('td', 'Loan Officer').parent('tr').within(() => {
                        if (data.loanOfficer) action.autocomplete(undefined, data.loanOfficer);
                    });
                });

                // Co Borrower
                field('Co Borrower', () => {
                    cy.contains('td', 'Co Borrower').parent('tr').within(() => {
                        if (data.coBorrower) action.autocomplete(undefined, data.coBorrower);
                    });
                });

                // Co-Maker 1
                field('Co-Maker 1', () => {
                    cy.contains('td', 'Co-Maker 1').parent('tr').within(() => {
                        if (data.coMaker1) action.autocomplete(undefined, data.coMaker1);
                    });
                });

                // Loan Security
                field('Loan Security', () => {
                    cy.contains('td', 'Loan Security').parent('tr').within(() => {
                        if (data.loanSecurity) action.select(undefined, data.loanSecurity);
                    });
                });

                // Borrower Type
                field('Borrower Type', () => {
                    cy.contains('td', 'Borrower Type').parent('tr').within(() => {
                        if (data.borrowerType) action.autocomplete(undefined, data.borrowerType);
                    });
                });

                // Client Group
                field('Client Group', () => {
                    cy.contains('td', 'Client Group').parent('tr').within(() => {
                        if (data.clientGroup) action.autocomplete(undefined, data.clientGroup);
                    });
                });

                // Loan Purpose Text
                field('Loan Purpose Text', () => {
                    cy.contains('td', 'Loan Purpose Text').parent('tr').within(() => {
                        if (data.loanPurposeTxt) action.input(undefined, data.loanPurposeTxt);
                    });
                });

                // Loan Purpose
                field('Loan Purpose', () => {
                    cy.contains('td', 'Loan Purpose').parent('tr').within(() => {
                        if (data.loanPurpose) action.autocomplete(undefined, data.loanPurpose);
                    });
                });

                // Loan Classification
                field('Loan Classification', () => {
                    cy.contains('td', 'Loan Classification').parent('tr').within(() => {
                        if (data.loanClass) action.select(undefined, data.loanClass);
                    });
                });

                // Sales Lead Generation
                field('Sales Lead Generation', () => {
                    cy.contains('td', 'Sales Lead Generation').parent('tr').within(() => {
                        if (data.salesLeadGen) action.select(undefined, data.salesLeadGen);
                    });
                });    


            });

        });
    });
}