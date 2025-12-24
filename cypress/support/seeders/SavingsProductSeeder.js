import Api from '@support/commands/api';
import { db } from '@database';

/**
 * Seeder: Savings Product
 * 
 * fetches 2 random GL Accounts (for glcode and ieglcode) from the database,
 * build a full payload with defaults, applies overrides if provided, and posts it.
 * 
 * @param {Object} [overrides={}] - optional overrides for any payload field
 * @example - cy.seedSavingsProduct({ productname: 'sample name' });
 * 
 * @author Michael
 */

Cypress.Commands.add('seedSavingsProduct', (overrides = {}) => {
    return db.glaccounts(2).should('be.an', 'array').and('have.length', 2).then((accounts) => ({
        glcode: accounts[0].glcode,
        ieglcode: accounts[1].glcode,
    })).then((glCodes) => {
        const payload = {
            product: {
                details: {
                    productname: overrides.productname,
                    productcode: overrides.productcode,
                    glcode: glCodes.glcode,
                    savingscategory: 1,
                    savingsType: 11,
                    daysinayear: 365,
                    closeonzerobalance: 0,
                    daysinactive: "0",
                    printvalidation: 0,
                    printpassbook: 0,
                    status: 1,
                    ismicro: 0,
                    dormancy: {
                        personal: { dormancyP: 0, dormancychargeP: 0, dormancychargeglcodeP: "" },
                        nonpersonal: { dormancyNP: 0, dormancychargeNP: 0, dormancychargeglcodeNP: "" },
                        dormantglcode: "",
                        dormantdebitoption: 0
                    },
                    savingsproductcategory: {
                        isTD: "0",
                        ssaallownoncash: "0",
                        timedepositflag: { tdDSTexpenseGlcode: "", tdDSTpayableGlcode: "" }
                    },
                    ...overrides.details
                },
                ratesBalances: {
                    wTaxComputation: 0,
                    interestcrediting: 1,
                    interestcreditingbasis: 1,
                    interestRates: {
                        ieglcode: glCodes.ieglcode,
                        rates: { rate1: 0, rate2: 0, rate3: 0, rate4: 0, rate5: 0 },
                        ratebrackets: { rateBracket1: null, rateBracket2: null, rateBracket3: null, rateBracket4: null }
                    },
                    withdrawallimits: {
                        withdrawalLimit1: null, withdrawalLimit2: null, withdrawalLimit3: null,
                        withdrawalLimit4: null, withdrawalLimit5: null, withdrawalLimit6: null
                    },
                    minimumbalance: {
                        personal: { balancetoearn: 0, balancemin: 0, balancemincharge: 0, balanceminchargeglcode: "", chargegraceperiod: 0 },
                        nonpersonal: { balancetoearn2: 0, balancemin2: 0, balancemincharge2: 0, balanceminchargeglcode2: "", chargegraceperiod2: 0 }
                    },
                    closecount: { closecountfee: 0, closeaccountfeeglcode: "", closeaccountfee2: 0, closeaccountfeeglcode2: "" },
                    ...overrides.ratesBalances
                },
                clientTypeSMSSettings: {
                    checkbox11: 1, checkbox21: 0, checkbox22: 0, checkbox31: 0, checkbox32: 0,
                    checkbox41: 0, checkbox51: 0, checkbox61: 0, checkbox71: 0,
                    checkbox81: 0, checkbox82: 0,
                    sms: { smsLanguage: 1, smsFreeADB: 0, sms_showbalance: 0 },
                    ...overrides.clientTypeSMSSettings
                },
                checking: {
                    requireautodebitaccount: 0,
                    checkBookletCost: { bookletCostPer: 0, bookletCostCom: 0, bookletcostglcode: "" },
                    returnedCheckCharges: {
                        daif: { chargedaif1: 0, chargedaif2: 0, chargedaifper: 0, chargedaifovernight: 0 },
                        daud: { chargedaud1: 0, chargedaud2: 0, chargedaudper: 0, chargedaudovernight: 0 },
                        chargeholdout: 0,
                        chargespoclearing: 0,
                        chargespoposting: 0,
                        chargedeficient: 0,
                        chargealteration: 0,
                        chargeinvaliddate: 0,
                        chargeinvalidsignature: 0,
                        clearingchargeglcode: ""
                    },
                    ...overrides.checking
                },
                coordinates: {
                    checkClearedReflect: 0,
                    passbook: {
                        accountname: { accountname_x: 0, accountname_y: 0 },
                        accountno: { savingsid_x: 0, savingsid_y: 0 },
                        barcode: { barcode_x: 0, barcode_y: 0 },
                        branchname: { branchname_x: 0, branchname_y: 0 },
                        savingsproduct: { productname_x: 0, productname_y: 0 },
                        cpnumber: { cpno_x: 0, cpno_y: 0 },
                        reference_maxchar: 0
                    },
                    passbookprinting: {
                        totallines: 0, y_topstart: 0, skiplinestart: 0, skiplineend: 0,
                        charmask: "", transchar: 0, balancechar: 0,
                        x_date: 0, x_debit: 0, x_credit: 0, x_balance1: 0, x_balance2: 0,
                        x_transcode: 0, x_user: 0
                    },
                    validation: {
                        depositslip1: { deposit1_x: 0, deposit1_y: 0 },
                        depositslip2: { deposit2_x: 0, deposit2_y: 0 },
                        withdrawalslip: { withdrawal_x: 0, withdrawal_y: 0 },
                        checkencashment: { chkencash_x: 0, chkencash_y: 0 },
                        creditmemo: { cm_x: 0, cm_y: 0 },
                        debitmemo: { dm_x: 0, dm_y: 0 },
                        returncheck: { rc_x: 0, rc_y: 0 },
                        bankcharge: { bc_x: 0, bc_y: 0 },
                        errorcorrect: { erc_x: 0, erc_y: 0 }
                    },
                    ...overrides.coordinates
                }
            }
        };

        return Api.api_post('/casa/settings/product-management/product-settings/post_product', payload).then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);

            const productName = payload.product.details.productname;
            const productCode = payload.product.details.productcode;

            cy.log(`Created Savings Product: "${productName}" (Code: ${productCode})`);
            cy.wrap(productName).as('createdSavingsProductName');
            cy.wrap(productCode).as('createdSavingsProductCode');
            cy.wrap(response.body).as('createdSavingsProductResponse');
        });
    });
});