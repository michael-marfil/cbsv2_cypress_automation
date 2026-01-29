export function performLogin(username, password) {
    return cy.session(['user_session', username], () => {
        cy.visit('/login');

        cy.intercept('POST', '**/login').as('login');
        cy.intercept('GET', '**/home').as('home');

        cy.get("input[name='username']").type(username, { delay: 100 }).type('{enter}');
        cy.get("input[name='password']").type(password, { delay: 100, log: false }).type('{enter}');

        cy.wait('@login', { timeout: 10000 }).its('response.statusCode').should('eq', 302);
        cy.wait('@home', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
        
        cy.url().should('include', '/home', { timeout: 10000 });
    }).then(() => {
        cy.visit('/home', { timeout: 10000 })
    });
}