import GetHelper from '@support/helpers/GetHelper';
import lending from '@support/routes/lending';
import { db } from '@database';

describe('Input and Edit Loan Application with 1402 [1] userright access (No Loan Product To User Defined)', () => {
    let data = {};
    let backup = [];

    before(() => {
        GetHelper.userbranch().then(userbranch => { 
            data.userbranch = userbranch;

            // track: backup the data
            db.loan_product_to_use(data.userbranch).then(response => {
                backup = response;
            });
        });
    });

    beforeEach(() => {
        cy.login();
    });

    it('Set user right permissions', () => {
        // set user right permission.
        cy.permissions({
            userPermissions: [
                { permissionID: '1401', level: 1, hasAccess: true },
                { permissionID: '1401', level: 2, hasAccess: false },
                { permissionID: '1401', level: 3, hasAccess: false },
                
                { permissionID: '1402', level: 1, hasAccess: true },
                { permissionID: '1402', level: 2, hasAccess: false },
                { permissionID: '1402', level: 3, hasAccess: false },
            ],
        });
    });

    it('Should not be able to view loan release application page but Available in the sidenav', () => {
        db.delete_loan_product_to_use(data.userbranch).then(() => {
            cy.log(`successfully deleted records.`);

            // visit Application/Release
            lending.goToApplicationRelease({ timeout: 20000 });
        });
    });

    after(() => {
        // restore all data back
        if (backup && backup.length > 0) {
            // const values = backup.map(row => `(${row.branchid}, ${row.loanproductid})`).join(', ');
            cy.log(`Restoring ${backup.length} rows. Please wait...`);

            cy.wrap(backup, { log: false }).each((row) => {
                db.insert_loan_product_to_use(row.branchid, row.loanproductid);
            }).then(() => { cy.log(`Successfully restored ${backup.length} rows `); });
        }

        cy.logout();
    });
});