import { db } from '@database';
import GetHelper from '@support/helpers/GetHelper';
import FormatHelper from '@support/helpers/FormatHelper';

describe('Release New - (Weekly) All fixed but no deduction (365 days in a year)', () => {
    let data = {};

    before(() => {
        GetHelper.userbranch().then(userbranch => { data.userbranch = userbranch });
        // prerequisites data need for loan release
        db.loan_officer().then(loanofficer => { data.loanofficer = loanofficer.employeeid });
        db.co_maker().then(coMaker => { data.coMaker = coMaker.clientid });
        db.co_borrower().then(coBorrower => { data.coBorrower = coBorrower.clientid });
        db.loan_security().then(loanSecurity => { data.loanSecurity = loanSecurity.name });
        db.client_group().then(clientGroup => { data.clientGroup = clientGroup.clientgroupid });
        db.loan_purpose().then(loanpurpose => { data.loanpurposeid = loanpurpose.loanpurposeid });
        db.clients('FNAME_CL_LRA_006', 'MNAME_CL_LRA_006', 'LNAME_CL_LRA_006').then(clients => { clients ? (
            data.clientId = clients.clientid,
            data.clientFallback = false
        ) : data.clientFallback = true });
        db.loan_product('LP_LRA_006').then(loan_product => { loan_product ? (
            data.loanProductId = loan_product.loanproductid,
            data.loanProductName = loan_product.name,
            data.loanProductCode = loan_product.shortname,
            data.loanProductFallback = false
        ) : data.loanProductFallback = true });
    });

    beforeEach(() => {
        cy.login();

        cy.wrap(data.clientId).as('clientid');
        cy.wrap(data.loanProductId).as('loanproductid');
        cy.wrap(data.loanProductName).as('loanproductname');
        cy.wrap(data.loanProductCode).as('loanproductcode');
        cy.wrap(data.pnid).as('pnid');

        cy.wrap(data.clientFallback).as('isFallbackClient');
        cy.wrap(data.loanProductFallback).as('isFallbackLoanProduct');
    });

    it('Set user right permissions', () => {
        // set user right permission.
        cy.permissions({
            userPermissions: [
                { permissionID: '1401', level: 1, hasAccess: true },
                { permissionID: '1401', level: 2, hasAccess: true },
                { permissionID: '1401', level: 3, hasAccess: false },

                { permissionID: '1402', level: 1, hasAccess: true },
                { permissionID: '1402', level: 2, hasAccess: true },
                { permissionID: '1402', level: 3, hasAccess: false },
            ]
        });
    });

    it('Should seed client when using fallback', () => {
        cy.get('@isFallbackClient').then(isFallback => {
            if (isFallback) {
                cy.log('Create New Client.');
                cy.seedClient({
                    lastName: 'LNAME_CL_LRA_006',
                    firstName: 'FNAME_CL_LRA_006',
                    middleName: 'MNAME_CL_LRA_006'
                }).then(() => {
                    db.clients('FNAME_CL_LRA_006', 'MNAME_CL_LRA_006', 'LNAME_CL_LRA_006').then(clients => clients
                        ? (data.clientId) : (() => { throw new Error('Client not found after creation.'); })()
                    );
                });
            } else {
                cy.log('Skipping: Client Already Exist.');
            }
        });
    });

    it('Should seed loan product when using fallback', () => {
        cy.get('@isFallbackLoanProduct').then(isFallback => {
            if (isFallback) {
                cy.log('Create Loan Product.');
                cy.seedLoanProduct({
                    general: {
                        productname: 'LP_LRA_006',
                        productcode: 'LP006',
                        description: 'description for loan product test case 6',
                        termunit: '2',
                        termdefault: '25',
                        termmaximun: '60',
                        borrowertypedefault: 40,
                        requiresecurity: '1',
                        requirecoborrower: true
                    },
                    rates: {
                        interestcomputationbasis: '0',
                        interestcomputation: '0'
                    },
                    amortization: {
                        amortDays: { includeDays: { Sat: 1 } },
                    }
                }).then(() => {
                    db.loan_product('LP_LRA_006').then(loan_product => {
                        data.loanProductId = loan_product.loanproductid;
                        data.loanProductName = loan_product.name;
                        data.loanProductCode = loan_product.shortname;
                    });
                });
            } else {
                cy.log('Skipping: Loan Product Already Exists!');
            }
        }).then(() => {
            const userbranch = data.userbranch;
            const loanproductid = data.loanProductId;
            db.loan_product_to_use(userbranch, loanproductid).then(loanproducttouse => {
                if (loanproducttouse) {
                    cy.log('Skipping: Loan Product already in use.');
                } else {
                    return db.insert_loan_product_to_use(userbranch, loanproductid);
                }
            });
        });
    });

    it('Should perform Loan Application', () => {
        cy.get('@clientid').then(clientid => {
            cy.get('@loanproductid').then(loan_product_id => {
                cy.get('@loanproductname').then(loan_product => {
                    cy.get('@loanproductcode').then(loan_product_code => {
                        const loan_application_data = {
                            loanproductid: loan_product_id,
                            loan_product: FormatHelper.formatLoanProductName(loan_product_code, loan_product),
                            clientid: clientid,
                            triggerSubmit: {
                                other_details: true
                            },
                            data: {
                                general: [{
                                    loanDetails: {
                                        loanAmount: '10000'
                                    }
                                }],
                                other_details: [{
                                    releaseTag: 'New Loan',
                                    loanOfficer: data.loanofficer,
                                    coBorrower: data.coBorrower,
                                    coMaker1: data.coMaker,
                                    loanSecurity: data.loanSecurity,
                                    clientGroup: data.clientGroup,
                                    loanPurposeTxt: 'This is a sample purpose text',
                                    loanPurpose: data.loanpurposeid,
                                    salesLeadGen: 'Walk In'
                                }]
                            }
                        }
                        cy.loanApplication({ loan_application_data });
                    });
                });
            });
        });
    });

    it('Should approve Loan Application', () => {
        cy.get('@clientid').then(clientid => {
            cy.get('@loanproductcode').then(productcode => {
                cy.approveLoanApplication(clientid, productcode).then((approval_data) => {
                    data.pnid = approval_data.pnid;
                });
            });
        });
    });

    it('Should perform Loan Release', () => {
        cy.get('@pnid').then(to_release_PNID => {
            cy.get('@clientid').then(clientid => {
                cy.get('@loanproductid').then(loanproductid => {
                    const loan_release_data = {
                        clientid: clientid,
                        loanproductid: loanproductid,
                        pnid: to_release_PNID,
                        data: {
                            other_details: [{
                                proceedsType: 'Cash / CC'
                            }]
                        }
                    }
                    cy.loanRelease({ loan_release_data });
                });
            });
        });
    });

    after(() => {
        cy.logout();
    });
});