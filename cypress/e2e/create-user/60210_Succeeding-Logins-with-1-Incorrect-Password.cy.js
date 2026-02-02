describe('Scenario : Succeeding Logins with 1 Incorrect Password',() => {
    it('should login with 1 attempt with incorrect password and last login with correct password', function () {
        cy.LoginSucceding1IncorrectPassword({
            incorrectPassword : 'Incorrect', // The example password is incorrect
        });
    });

    after(() => {
        cy.logout(); // Calls the logout global function
    });
});
