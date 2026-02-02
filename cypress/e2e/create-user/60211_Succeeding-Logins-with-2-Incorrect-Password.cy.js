describe('Scenario : Succeeding Logins with 2 Incorrect Password',() => {
    it('should login with 2 attempts with incorrect password and last login with correct password', function () {
        cy.LoginSucceding2IncorrectPassword({
            incorrectPassword : 'Incorrect', // The example password is incorrect
        });
    });

    after(() => {
        cy.logout(); // Calls the logout global function
    });
});
