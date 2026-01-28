describe('Scenario : First-time user to login (Password is incorrect)', () => {
    it('should create a user and attempt login with incorrect password', () => {
        cy.LoginInvalidCredentials({
            firstname: 'John',
            middlename: 'Doe',
            lastname: 'Kurtney',
            incorrectPassword: 'rb@12345' //The system will only accept at least Normal Strength type of password.
        });
    });
});