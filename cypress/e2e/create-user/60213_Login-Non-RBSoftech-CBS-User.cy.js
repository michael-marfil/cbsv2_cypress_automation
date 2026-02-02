describe('Login with Non-RBSoftech User',() => {
    it('Prompt message shall appear and will be stayed to login page', function () {
        cy.LoginNonRBSoftTechCBSUser({
            noneUsername : 'JZSmith', // The example username is non-RBSoftech user
            nonePassword : 'Incorrect' // The example password is incorrect
        });
    });
});
