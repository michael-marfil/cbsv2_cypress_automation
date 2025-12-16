describe('Post Journal with 1303 level 1 userright role is not defined', () => {
    beforeEach(() => {
        cy.login();
    });

    it('set employee user right', () => {
        // navigate to user rights and update permissions
        cy.permissions({
            userPermissions: [ // set permissions here
                { permissionID: '1303', level: 1, hasAccess: false },
                { permissionID: '1303', level: 2, hasAccess: false },
                { permissionID: '1303', level: 3, hasAccess: false },
            ],
        });
    });

    it('should be able to Post Journal but with 1303 level 1 userright role not defined', () => {
        // navigate to Journal Posting with the updated permissions
        cy.journalPosting({});
    });

    after(() => {
        cy.logout();
    });
});