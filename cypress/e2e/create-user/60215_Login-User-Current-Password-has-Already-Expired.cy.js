describe('User Current Password has Already Expired',() => {
    it('User account has already expired and shall requires a password update', function () {
        cy.LoginUserCurrentPasswordHasAlreadyExpired();
    });

    after(() => {
        cy.logout(); // Calls the logout global function
    });
});