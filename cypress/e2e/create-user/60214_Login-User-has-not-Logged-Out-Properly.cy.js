describe('User has not logged out properly or is currently logged in other terminal',() => {
    it('Prompt message shall appear and will be stayed to login page', function () {
        cy.LoginUserHasNotLoggedOutProperly();
    });
});
