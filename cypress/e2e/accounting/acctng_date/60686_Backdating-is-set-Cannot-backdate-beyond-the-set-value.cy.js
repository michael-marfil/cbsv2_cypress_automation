describe('Backdating is set - Cannot backdate beyond the set value', () => {
    const initialDbSetting = 5; // The initial allowed backdate days
    const daysToAttemptBackdate = 8; // The days to attempt to backdate in the UI
    const finalDbSetting = 365; // The value to reset backdatedaysallowed to (or 365 if that's the standard reset)

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

    it('should prevent backdating beyond the set value', () => {
        cy.attemptBackdateBeyondAllowed(initialDbSetting, daysToAttemptBackdate, finalDbSetting);
    });

     after(() => {
        cy.logout();
    });
});