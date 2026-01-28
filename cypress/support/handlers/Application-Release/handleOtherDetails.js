import { action } from '@support/helpers/UIHelper';
import { db } from '@database';

export default function handleOtherDetailsTab(otherDetails, triggerSubmit) {
    cy.get('.tabContainer:visible', { timeout: 10000 }).then(() => {
        cy.get('.v-form.form-section:visible', { timeout: 10000 }).then(() => {
            
            const OtherDetails = otherDetails || {};
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
                        cy.contains('td', new RegExp(`^\\s*${escapedLabel}\\s*$`), { log: false }).parent('tr').then($row => {
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

                // Savings Acct
                if(OtherDetails.savingsAcct) {
                    const [savingsid, productcode] = OtherDetails.savingsAcct;

                    field(`${productcode} Savings Acct`, () => {
                        cy.contains('td', `${productcode} Savings Acct`).parent('tr').within(() => {
                            action.select(undefined, savingsid);
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
                        db.client_group(OtherDetails.clientGroup).then(response => {
                            const clientgroupname = response.name;
                            const clientgroupid = String(OtherDetails.clientGroup).padStart(4, '0');
                            cy.contains('td', 'Client Group').parent('tr').within(() => {
                                action.autocomplete(undefined, clientgroupid, clientgroupname);
                            });
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
                    db.loan_class(OtherDetails.loanPurpose).then(response => {
                        field('Loan Purpose', () => {
                            const loanpurposename = response.purpose_name;
                            const loanpurposeid = String(OtherDetails.loanPurpose).padStart(4, '0');
                            cy.contains('td', /^\sLoan Purpose\s$/).parent('tr').within(() => {
                                action.autocomplete('input[type="text"]', loanpurposeid, loanpurposename);
                            });
                        });

                        // Loan Classification
                        field('Loan Classification', () => {
                            cy.contains('td', 'Loan Classification').parent('tr').within(() => {
                                const className = response.classification_name;
                                const loanClass = OtherDetails.loanClass;

                                const toUse = loanClass ? loanClass : className;

                                action.select(undefined, toUse);
                            });
                        });

                        // Industry
                        field('Industry', () => {
                            cy.contains('td', 'Industry').parent('tr').within(() => {
                                const industryName = response.industry_name;
                                const industry = OtherDetails.industry;

                                const toUse = industry ? industry : industryName;

                                action.select(undefined, toUse);
                            });
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

                // Proceeds Type
                if (OtherDetails.proceedsType) {
                    field('Proceeds Type', () => {
                        cy.contains('td', 'Proceeds Type').parent('tr').within(() => {
                            action.select(undefined, OtherDetails.proceedsType);
                        });
                    });
                    
                    cy.then(() => {
                        switch (OtherDetails.proceedsType) {
                            case 'Cash / CC':
                                field('Cashier`s Check No.', () => {
                                    cy.contains('td', 'Cashier`s Check No.').parent('tr').within(() => {
                                        const randomCheckNo = Math.floor(10000 + Math.random() * 90000).toString();
                                        action.input(undefined, randomCheckNo, false);
                                    });
                                });
                                break;
                            case 'Credit Memo - Linked Account':
                                field('Credit Memo Ref.', () => {
                                    cy.contains('td', 'Credit Memo Ref.').parent('tr').within(() => {
                                        cy.log('Linked Account selected. Saving Acct automatically selected.');
                                    });
                                });
                                break;
                            case 'Credit Memo - Other Account':
                                field('Proceeds Account', () => {
                                    cy.contains('td', 'Proceeds Account').parent('tr').within(() => {
                                        cy.get('.v-select__selections').click({ force: true });
                                    });
                                    
                                    // Wait for dropdown to be visible
                                    cy.get('.v-menu__content:visible', { timeout: 10000 }).should('be.visible');
                                    
                                    // Try to click without scrolling first
                                    cy.get('.v-menu__content:visible')
                                        .find('.v-list-item')
                                        .contains(OtherDetails.proceedsAcct)
                                        .then($el => {
                                            // Check if element is visible in viewport
                                            const isVisible = Cypress.dom.isVisible($el[0]);
                                            
                                            if (!isVisible) {
                                                // Only scroll if not visible
                                                cy.log('Element not fully visible, scrolling...');
                                                cy.wrap($el)
                                                    .scrollIntoView({ offset: { top: -50, left: 0 }, easing: 'linear', duration: 500 })
                                                    .should('be.visible')
                                                    .click();
                                            } else {
                                                // Click normally if already visible
                                                cy.wrap($el)
                                                    .scrollIntoView({ easing: 'linear', duration: 500 })
                                                    .click();
                                            }
                                        });
                                    
                                    cy.get('.v-menu__content:visible', { timeout: 5000 }).should('not.exist');
                                });

                                field('Credit Memo Ref.', () => {
                                    cy.contains('td', 'Credit Memo Ref.').parent('tr').within(() => {
                                        cy.log('Other Account selected. Savings Acct automatically selected.');
                                    });
                                });
                                break;
                            case 'Check/COCI':
                                field('Check No.', () => {
                                    cy.contains('td', 'Check No.').parent('tr').within(() => {
                                        const randomCheckNo = Math.floor(10000 + Math.random() * 90000).toString();
                                        action.input(undefined, randomCheckNo, false);
                                    });
                                });
                                break;
                        }
                    });
                }

            });

        });
    });
}