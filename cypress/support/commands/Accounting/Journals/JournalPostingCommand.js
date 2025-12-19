import { handleJournalEntries } from '@handler/Journals/journal_posting/journalEntries';
import accounting from '@support/routes/accounting';

// ** JOURNAL POSTING ** //
Cypress.Commands.add('journalPosting', ({
    journalToPost
}) => {
    accounting.goToJournalPosting(); // navigate to Journal Posting page

    if (journalToPost && Array.isArray(journalToPost)) {
        journalToPost.forEach((item) => {
            if (item.variable && item.value?.toString().trim()) {
                cy.contains(item.variable)
                    .parent()
                    .find('input, textarea')
                    .should('be.visible')
                    .clear()
                    .type(item.value, { delay: 100 });
            }

            if (item.dataToAdd) {
                handleJournalEntries({ entries: item.dataToAdd, toDelete: item.toDelete, invalidDescription: item.invalidDescription });
            }
        });
    }
});

// ** JOURNAL EDITING ** //
Cypress.Commands.add("journalEditing", ({
    journalToEdit,
    journalId
}) => {
    accounting.goToJournalForTheDay(); // navigate to Journals For The Day page

    // if journalId is provided, scroll to it regardless of journalToEdit
    if (journalId) {
        const formattedJournalId = `JE# ${journalId}`;
        cy.log('Scrolling to journal ID: ', formattedJournalId);

        cy.waitForPageLoad().then(() => {
            cy.get('.v-card.table-card')
                .contains('td', formattedJournalId)
                .scrollIntoView({ duration: 1000 })
                .should('be.visible')
                .parent('tr')
                .realHover()
                .within(() => {
                    if (journalToEdit && Array.isArray(journalToEdit)) {
                        cy.log('to edit')
                        cy.get('.v-icon.mdi-pencil')
                            .should('be.visible')
                            .click({ force: true });
                    }
                });
        });
    }

    // then handle entries if journalToEdit exists
    if (journalToEdit && Array.isArray(journalToEdit)) {
        journalToEdit.forEach((item) => {
            if (item.dataToEdit) {
                handleJournalEntries({ entries: item.dataToEdit });
            }
        });
    }
});

// ** JOURNAL DELETING ** //
Cypress.Commands.add("journalDeleting", ({
    journalId
}) => {
    accounting.goToJournalForTheDay(); // navigate to Journals For The Day page

    // if journalId is provided, scroll to it regardless of journalToEdit
    if (journalId) {
        const formattedJournalId = `JE# ${journalId}`;
        cy.log('Scrolling to journal ID: ', formattedJournalId);

        cy.waitForPageLoad().then(() => {
            cy.avoidWindowOpen().then(() => {
                cy.get('.v-card.table-card')
                    .contains('td', formattedJournalId)
                    .scrollIntoView({ duration: 1000 })
                    .should('be.visible')
                    .parent('tr')
                    .find('.v-icon.mdi-close')
                    .should('be.visible')
                    .click({ force: true });

                cy.wait(1000);

                cy.get('.v-card.transaction-card', { timeout: 2000 })
                    .find('button')
                    .should('be.visible')
                    .as('v-card-transaction')

                cy.get('@v-card-transaction', { timeout: 2000 })
                    .contains('Submit')
                    .should('be.visible')
                    .click();
            });
        });
    }
});