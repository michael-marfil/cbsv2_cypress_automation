import accounting from '@support/routes/accounting';

describe('1303 level 1 userright role is not defined ', () => {
    beforeEach(() => {
        cy.login();
    });
    it('set employee user right', () => {
        // navigate to user rights and update permissions
        cy.permissions({
            userPermissions: [
                { permissionID: '1303', level: 1, hasAccess: false },
                { permissionID: '1303', level: 2, hasAccess: false },
                { permissionID: '1303', level: 3, hasAccess: false },
            ],
        });
    });
    it('The user will check the user role restrictions to View and Edit Accounting Settings in RBSoftech,', () => {
        accounting.goToAccounting();
    });
    after(() => {
        cy.logout();
    });
});