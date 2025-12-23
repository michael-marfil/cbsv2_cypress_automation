describe('Edit and Approve Lending Settings with Incomplete User Rights Access', () => {
    beforeEach(() => {
        cy.login();
    });

    it('should be able to Edit and Approve the lending settings (but with incomplete userright access)', () => {
        // navigate to user rights and update permissions
        cy.permissions({
            userPermissions: [ // set permissions here
                { permissionID: '1401', level: 1, hasAccess: false },
                { permissionID: '1401', level: 2, hasAccess: true },
                { permissionID: '1401', level: 3, hasAccess: true },
            ],
        });

        
        // navigate to Lending Settings with the updated permissions
        cy.lendingSettings({});
    });

    after(() => {
        cy.logout();
    });
});