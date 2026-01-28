describe('Scenario : First-time user to login (Valid Credentials)',() => {
    it('should create a user and login with correct password', () => {
        cy.fixture('create-user-credential/userCredentials.json').then((data) => {
            // cy.LoginValidCredentials(data.validUser);
            cy.LoginValidCredentials();
        });
    });
});
