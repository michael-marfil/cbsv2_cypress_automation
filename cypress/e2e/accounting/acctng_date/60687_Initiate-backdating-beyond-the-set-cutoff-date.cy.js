describe('Initiate backdating beyond the set cutoff date', () => {
    const futureDays = 28;
    beforeEach(() => {
        cy.login();
    });

    it('set employee user right', () => {
        // navigate to user rights and update permissions
        cy.permissions({
            userPermissions: [
                { permissionID: '1302', level: 1, hasAccess: true },
                { permissionID: '1302', level: 2, hasAccess: true },
                { permissionID: '1302', level: 3, hasAccess: false },
            ],
        });
    });
    it('The user will check if the system prevents backdating beyond the set value in RBSoftech,', () => {
        // Update the 'backdatedaysallowed' setting in the database to a specific value (e.g., 5)
        cy.selectFutureDateInPicker(futureDays)
    });
     after(() => {
        cy.logout();
    });
});