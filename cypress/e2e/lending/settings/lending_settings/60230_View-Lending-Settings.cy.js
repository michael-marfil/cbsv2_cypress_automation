describe('View Lending Settings', () => {
    beforeEach(() => {
        cy.login();
    });

    it('should view Lending Settings', () => {
        // navigate to user rights and update permissions
        cy.permissions({
            userPermissions: [
                { permissionID: '1401', level: 1, hasAccess: true },
                { permissionID: '1401', level: 2, hasAccess: false },
                { permissionID: '1401', level: 3, hasAccess: false },
            ]
        });

        // navigate to Lending Settings with the updated permissions
        cy.lendingSettings({});
    });

    after(() => {
        cy.logout();
    });
});