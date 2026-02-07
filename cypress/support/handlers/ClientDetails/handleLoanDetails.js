export default function handleLoanDetailsTab(loanDetails) {
    cy.get('.container.container--fluid:visible', { timeout: 5000 }).then(() => {
        const LoanDetails = loanDetails || {};

        cy.get('.v-data-table:visible', { timeout: 10000 }).then(() => {
            cy.get('tbody').should('be.visible').within(() => {
                cy.contains('td', LoanDetails.pnid).then($td => {
                    // Check if this td contains an <a> tag
                    if ($td.find('a').length > 0) {
                        // Click the link
                        cy.wrap($td.find('a')).click();
                    } else {
                        // Hover the parent row
                        cy.wrap($td).parent('tr').realHover();
                    }
                });
            });
        });
    });
}