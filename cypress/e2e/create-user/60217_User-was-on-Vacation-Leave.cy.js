describe('User was on vacation leave',() => {
    it('Login user account is blocked due to vacation leave', function () {
        cy.LoginUserIsOnVacationLeave();
    });
});
