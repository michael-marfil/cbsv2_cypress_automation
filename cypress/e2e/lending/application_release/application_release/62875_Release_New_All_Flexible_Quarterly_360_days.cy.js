import { db } from '@database';
import GetHelper from '@support/helpers/GetHelper';
import FormatHelper from '@support/helpers/FormatHelper';

describe('Release New - Default product settings (all flexible) - Quarterly (360 days in a year)', () => {
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
        db.savings_product('SP_LRA_016').then(products => { products ? (
            data.savingsProductId = products.productid,
            data.savingsProductName = products.productname,
            data.savingsProductCode = products.productcode,
            data.savingsProductFallback = false
        ) : data.savingsProductFallback = true });
        db.clients('FNAME_CL_LRA_016', 'MNAME_CL_LRA_016', 'LNAME_CL_LRA_016').then(clients => { clients ? (
            data.clientId = clients.clientid,
            data.accountName = clients.accountname,
            data.clientFallback = false
        ) : data.clientFallback = true });
        db.loan_product('LP_LRA_016').then(loan_product => { loan_product ? (
            data.loanProductId = loan_product.loanproductid,
            data.loanProductName = loan_product.name,
            data.loanProductCode = loan_product.shortname,
            data.loanProductFallback = false
        ) : data.loanProductFallback = true });
    });

    beforeEach(() => {
        cy.login();

        cy.wrap(data.savingsProductId).as('savingsproductid');
        cy.wrap(data.savingsProductName).as('savingsproductname');
        cy.wrap(data.savingsProductCode).as('savingsproductcode');
        cy.wrap(data.clientId).as('clientid');
        cy.wrap(data.accountName).as('accountname');
        cy.wrap(data.loanProductId).as('loanproductid');
        cy.wrap(data.loanProductName).as('loanproductname');
        cy.wrap(data.loanProductCode).as('loanproductcode');
        cy.wrap(data.pnid).as('pnid');

        cy.wrap(data.savingsProductFallback).as('isFallbackSavingsProduct');
        cy.wrap(data.clientFallback).as('isFallbackClient');
        cy.wrap(data.loanProductFallback).as('isFallbackLoanProduct');
    });

    it('Set user right permissions', () => {
        // set user right permission.
        cy.permissions({
            userPermissions: [
               { permissionID: "1401", level: 1, hasAccess: true },
                { permissionID: "1401", level: 2, hasAccess: true },
                { permissionID: "1401", level: 3, hasAccess: false },

                { permissionID: "1402", level: 1, hasAccess: true },
                { permissionID: "1402", level: 2, hasAccess: true },
                { permissionID: "1402", level: 3, hasAccess: false }, 
            ]
        });
    });

    it('Should seed savings product when using fallback', () => {
        cy.get('@isFallbackSavingsProduct').then(isFallback => {
            if (isFallback) {
                cy.log('Create New Savings Product.');
                cy.seedSavingsProduct({
                    productname: 'SP_LRA_016',
                    productcode: 'SP016'
                }).then(() => {
                    db.savings_product('SP_LRA_016').then(product => {
                        data.savingsProductId = product.productid;
                        data.savingsProductName = product.productname;
                        data.savingsProductCode = product.productcode;
                    });
                });
            } else {
                cy.log('Skipping: Savings Product Already Exist.');
            }
        }).then(() => {
            const userbranch = data.userbranch;
            const savingsproductid = data.savingsProductId;
            db.savings_product_to_use(userbranch, savingsproductid).then(savingsproducttouse => {
                if (savingsproducttouse) {
                    cy.log('Skipping: Savings Product Already in use.');
                } else {
                    return db.insert_savings_product_to_use(userbranch, savingsproductid);
                }
            });
        });
    });

    it('Should seed client when using fallback', () => {
        cy.get('@isFallbackClient').then(isFallback => {
            if (isFallback) {
                cy.log('Create New Client.');
                cy.seedClient({
                    lastName: 'LNAME_CL_LRA_016',
                    firstName: 'FNAME_CL_LRA_016',
                    middleName: 'MNAME_CL_LRA_016'
                }).then(() => {
                    db.clients('FNAME_CL_LRA_016', 'MNAME_CL_LRA_016', 'LNAME_CL_LRA_016').then(clients => clients
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
                cy.log('Create Loan Product');
                cy.seedLoanProduct({
                    general: {
                        productname: "LP_LRA_016",
                        productcode: "LP016",
                        description: "description for loan product test case 16",
                        termunit: "3",
                        termdefault: "36",
                        termDaysFixed: true,
                        proceedstypedefault: "2",
                        requirecoborrower: true
                    },
                    rates: {
                        interestrate: 20,
                        daysinayear: "360"
                    },
                    others: {
                        savings: {
                            savingsholdout: 10, savingsholdoutoption: "1", savingsproductid: data.savingsProductId
                        }
                    }
                }).then(() => {
                    db.loan_product('LP_LRA_016').then(loan_product => {
                        data.loanProductId = loan_product.loanproductid;
                        data.loanProductName = loan_product.name;
                        data.loanProductCode = loan_product.shortname;
                    });
                });
            } else {
                cy.log('Skipping: Loan Product Already Exist.');
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

    it('Should have an active savings account', () => {
        cy.get('@clientid').then(clientid => {
            cy.get('@accountname').then(accountname => {
                cy.get('@savingsproductid').then(productid => {
                    db.check_savings_account(productid, accountname).then(response => {
                        const hasActiveSavings = response.total > 0;

                        if (hasActiveSavings) {
                            cy.log(`Skipping Savings Account Creation for ${accountname}`);
                        } else {
                            cy.seedSavingsAccount(clientid, productid, {
                                accountname: accountname,
                                note1: 'test note SP016'
                            });
                        }
                    }).then(() => {
                        // fetch product code after checking/creating
                        return db.check_savings_account(productid, accountname).then(response => {
                            return db.savings_product(null, response.productid).then(product => {
                                data.savingsaccountcode = product.productcode;

                                const formattedAccountInfo = `SA# ${FormatHelper.formatSavingsID(response.savingsid)} ${response.accountname}`;
                                data.savingsaccount = formattedAccountInfo;
                            });
                        });
                    });
                });
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
                                loan_app_details: [{
                                    term: 12, termUnit: 'Quarters',
                                    interestRate: 20, interestRateUnit: 'Per Annum',
                                    interestComp: 'Diminishing'
                                }],
                                amort_details: [{
                                    fixedDaysofTerm: 1,
                                    diminishingOpt: "Equal Amort'n Computed Daily"
                                }],
                                general: [{
                                    loanDetails: {
                                        loanAmount: '80000'
                                    }
                                }],
                                other_details: [{
                                    releaseTag: 'New Loan',
                                    savingsAcct: [data.savingsaccount, data.savingsaccountcode],
                                    loanOfficer: data.loanofficer,
                                    coBorrower: data.coBorrower,
                                    coMaker1: data.coMaker,
                                    loanSecurity: data.loanSecurity,
                                    clientGroup: data.clientGroup,
                                    loanPurposeTxt: 'This is a sample purpose text',
                                    loanPurpose: data.loanpurposeid,
                                    salesLeadGen: 'Walk-In'
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
    })
});