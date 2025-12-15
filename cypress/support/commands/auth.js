import getHelper from '@support/helpers/GetHelper';
import general from '@support/routes/general';

Cypress.Commands.add('login', () => {
    // establish or restore the session (Cookies/Storage)
    cy.session('user_session', () => {
        cy.visit('/login');
        // get and assign user credentials
        const { username, password } = getHelper.get_user_credentials();

        cy.intercept('POST', '**/login').as('login');
        cy.intercept('GET', '**/home').as('home');

        cy.get("input[name='username']").type(username, { delay: 100 }).type('{enter}');
        cy.get("input[name='password']").type(password, { delay: 100, log: false }).type('{enter}');

        cy.wait('@login').its('response.statusCode').should('eq', 302);
        cy.wait('@home').its('response.statusCode').should('eq', 200);

        cy.url().should('include', '/home');
    });

    // ensures the page loads for tests that don't have their own cy.visit() to avoid blank page and resulting to an error
    cy.visit('/home');
});

Cypress.Commands.add('logout', () => {
    cy.url().then((url) => {
        if (!url.includes('/login')) {
            general.logout();
        }
    });

    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
        win.sessionStorage.clear();
    });

    // This removes the 'user_session' data saved by cy.session()
    Cypress.session.clearAllSavedSessions();

    // Verify user logged out successfuly
    cy.visit('/login', { retryOnStatusCodeFailure: false });
    cy.get('input[name="username"]', { timeout: 8000 }).should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
});