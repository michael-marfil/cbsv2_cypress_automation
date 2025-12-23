import lending from '@support/routes/lending';

describe('Approve Lending Settings', () => {
    beforeEach(() => {
        cy.login();
    });

    it('should be able to approve the lending settings except view and edit features', () => {
        // navigate to user rights and update permissions
        cy.permissions({
            userPermissions: [ // set permissions here
                { permissionID: '1401', level: 1, hasAccess: false },
                { permissionID: '1401', level: 2, hasAccess: false },
                { permissionID: '1401', level: 3, hasAccess: true },
            ],
        });

        // navigate to settings mgmt and lending settings approval with the updated permissions
        lending.goToSettingsMgmt();
        cy.approveLendingSettings({});
    });

    after(() => {
        cy.logout();
    });
});