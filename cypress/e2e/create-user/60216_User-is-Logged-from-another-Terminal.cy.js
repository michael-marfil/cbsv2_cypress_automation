describe('User is logged in from another terminal',() => {
    it('Prompt message shall appear and will be stayed to login page', function () {
        cy.LoginUserIsLoggedFromAnotherTerminal();
    });
});
