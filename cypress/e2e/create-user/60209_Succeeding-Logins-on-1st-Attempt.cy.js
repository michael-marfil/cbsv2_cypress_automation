describe('Scenario : 1st attempt to login (Valid Credentials)',() => {
    it('should create a user and login with correct password', function () {
        cy.LoginSuccedingOn1stAttempt();
    });

    after(() => {
        cy.logout(); // Calls the logout global function
    });
});
