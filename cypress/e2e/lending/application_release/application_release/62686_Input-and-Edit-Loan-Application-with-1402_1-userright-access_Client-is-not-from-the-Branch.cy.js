import { db } from '@database';
import FormatHelper from '@support/helpers/FormatHelper';

describe('Input and Edit Loan Application with 1402 [1] userright access (Client is not from the Branch)', () => {
    let data = {};

    before(() => {
        db.loan_product().then(loan_product => { 
            data.loanproductid = loan_product?.loanproductid ?? null;
            data.loanproductname = loan_product?.name ?? null;
            data.loanproductcode = loan_product?.shortname ?? null;
        });
        db.clients().then(client => { data.clientid = client?.clientid ?? null; });
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
            { permissionID: '1402', level: 2, hasAccess: true },
            { permissionID: '1402', level: 3, hasAccess: false },
            ],
        });
    });

    it ('Should be able to input and edit loan application', () => {
        const loan_application_data = {
            loanproductid: data.loanproductid,
            loan_product: FormatHelper.formatLoanProductName(data.loanproductcode, data.loanproductname),
            clientid: data.clientid
        }

        cy.loanApplication({ loan_application_data });
    });

    after(() => {
        cy.logout();
    });
});