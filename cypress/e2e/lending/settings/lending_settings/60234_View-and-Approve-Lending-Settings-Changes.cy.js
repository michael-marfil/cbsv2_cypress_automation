describe('View and Approve Lending Settings', () => {
    beforeEach(() => {
        cy.login();
    });

    it('should be able to view and approve the lending settings changes but could not edit the settings', () => {
        // navigate to user rights and update permissions
        cy.permissions({
            userPermissions: [
                { permissionID: '1401', level: 1, hasAccess: true },
                { permissionID: '1401', level: 2, hasAccess: false },
                { permissionID: '1401', level: 3, hasAccess: true },
            ],
        });

        cy.approveLendingSettings({});
    });

    after(() => {
        cy.logout();
    });
});