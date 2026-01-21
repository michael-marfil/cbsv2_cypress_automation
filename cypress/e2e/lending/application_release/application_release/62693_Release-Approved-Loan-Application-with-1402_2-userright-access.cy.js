describe('Release Approved Loan Application with 1402 [2] userright access', () => {
    beforeEach(() => {
        cy.login();
    });

    it('Should not be able to access loan application page', () => {
        // set user right permission.
        cy.permissions({
            userPermissions: [
                { permissionID: '1401', level: 1, hasAccess: false },
                { permissionID: '1401', level: 2, hasAccess: true },
                { permissionID: '1401', level: 3, hasAccess: false },

                { permissionID: '1402', level: 1, hasAccess: false },
                { permissionID: '1402', level: 2, hasAccess: true },
                { permissionID: '1402', level: 3, hasAccess: false },
            ],
        });

        // try to access Application/Release page
        cy.then(() => {
            cy.loanApplication();
        });
    });

    after(() => {
        cy.logout();
    });
});