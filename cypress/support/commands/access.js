Cypress.Commands.add('hasPageAccess', () => {
    cy.intercept('POST', '**/check-access').as('checkAccess');

    return cy.wait('@checkAccess', { timeout: 5000 }).then((interception) => {
        const { response } = interception;
        const isDenied = response?.body === false || response?.body === 'false';

        if (isDenied) {
            cy.log('access denied by /check-access API');
            return cy.wrap({ hasAccess: false });
        }

        cy.log('access granted by /check-access API');
        return cy.wrap({ hasAccess: true });
    });
});