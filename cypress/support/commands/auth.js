import GetHelper from '@support/helpers/GetHelper';
import general from '@support/routes/general';
import { performLogin } from '@support/sessions/LoginSession';

Cypress.Commands.add('login', () => {
    cy.then(() => {
        const resolution = GetHelper.resolveCredentials();

        // CASE 1: env has a user identity → lookup DB
        if (resolution.source === 'env') {
            const { firstname, middlename, lastname, password } = resolution.newUser;

            return GetHelper.getUsernameByFullName({ firstname, middlename, lastname }).then(({ username }) => 
                performLogin(username, password)
            );
        }

        // CASE 2: use credentials from config
        const username = Cypress.env('username');
        const password = Cypress.env('password');

        if (username && password) return performLogin(username, password);

        // CASE 3: fallback
        const { username: defaultUsername, password: defaultPassword } = GetHelper.getDefaultCredentials();
        return performLogin(defaultUsername, defaultPassword);
    });
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