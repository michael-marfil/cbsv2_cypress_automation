describe('Succeeding Logins with 3 Incorrect Password',() => {
    it('User account will be blocked due to four failed attempts', function () {
        cy.LoginSucceding3IncorrectPassword({
            incorrectPassword : 'Incorrect', // The example password is incorrect
        });
    });
});
