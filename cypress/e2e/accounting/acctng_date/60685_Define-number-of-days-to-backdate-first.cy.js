describe('User should have 1301 level 2 userright role to Edit Accounting Settings',() => {
    beforeEach(() => {
        cy.login();
    });
    it('set employee user right', () => {
        // navigate to user rights and update permissions
        cy.permissions({
            userPermissions: [
                { permissionID: '1301', level: 1, hasAccess: true },
                { permissionID: '1301', level: 2, hasAccess: true },
                { permissionID: '1301', level: 3, hasAccess: false },
            ],
        });
    });
    it('The user will check if the page is accessible based on user permissions on Accounting Date in RBSoftech,', () => {
        const backdateValue = 3;
        cy.editBackdateAndCheckApproval(backdateValue);
    });
    after(() => {
        cy.logout();
    });
});