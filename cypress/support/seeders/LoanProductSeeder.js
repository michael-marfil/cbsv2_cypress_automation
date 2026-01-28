import Api from '@support/commands/api';
import { db } from '@database';

/**
 * Seeder: Loan Product
 * 
 * Fetches random GL Accounts from the database, builds a full payload with defaults,
 * applies overrides if provided, and posts it to create a loan product.
 * 
 * @param {Object} [overrides={}] - optional overrides for any payload field
 * @example - cy.seedLoanProduct({ general: { productname: 'My Loan Product' } });
 * 
 * @author Michael
 */

Cypress.Commands.add('seedLoanProduct', (overrides = {}) => {
    return db.glaccounts(10).should('be.an', 'array').and('have.length.at.least', 5).then((accounts) => ({
        interestdiscountedglcode: accounts[0]?.glcode || "",
        interestamortizedglcode: accounts[1]?.glcode || "",
        pdinterestglcode: accounts[2]?.glcode || "",
        penaltyglcode: accounts[3]?.glcode || "",
        taxglcode: accounts[4]?.glcode || "",
        insuranceglcode: accounts[5]?.glcode || "",
        currentglcode: accounts[6]?.glcode || "",
        pastdueglcode: accounts[7]?.glcode || "",
        nonperfglcode: accounts[8]?.glcode || "",
        provisionglcode: accounts[9]?.glcode || "",
    })).then((glCodes) => {
        const payload = {
            loanProduct: {
                general: {
                    productname: overrides.general?.productname,
                    productcode: overrides.general?.productcode,
                    status: "1",
                    description: overrides.general?.description,
                    loanType: "1",
                    usepnform: "0",
                    loanamountmaximum: 15000000,
                    loanproductceiling: 50000000,
                    loancountmaximum: 100,
                    grouping: "1",
                    groupby: "0",
                    defaultcostcenter: 2,
                    borrowertypedefault: 40,
                    clientgroupdefault: "0",
                    requiresecurity: "1",
                    proceedstypedefault: "1",
                    enabledeedofassignment: "0",
                    requireworkersemployed: false,
                    requirecoborrower: false,
                    requiredcomakers: "0",
                    isEmployeeLoan: "0",
                    termunit: "1",
                    termunitflexibility: true,
                    weekadjuster: "0",
                    termDaysFixed: false,
                    termDaysFixedFlex: true,
                    termdefault: "24",
                    termflexibility: true,
                    termmaximum: 60,
                    ...overrides.general
                },
                rates: {
                    interestrate: 15,
                    interestrateflexibility: true,
                    interestRecompute: false,
                    interestcomputationbasis: "0",
                    interestcomputationbasisflexibility: true,
                    interestcomputation: "0",
                    interestcomputationflexibility: true,
                    balloonoption: false,
                    diminishing_option: "0",
                    interestrateminimum: 0,
                    daysinayear: "365",
                    interestdiscountbooking: "1",
                    interestdiscountedglcode: glCodes.interestdiscountedglcode,
                    interestamortizedglcode: glCodes.interestamortizedglcode,
                    pdinterestglcode: glCodes.pdinterestglcode,
                    matured_interestrate: null,
                    penaltyglcode: glCodes.penaltyglcode,
                    approval_data: {
                        amount: {
                            "0": { "1": 1000, "2": 3000, "3": 5000, "4": 7000, "5": 9000, "6": null, "7": null, "8": null, "9": null, "10": null },
                            "1": { "1": 2000, "2": 4000, "3": 6000, "4": 8000, "5": 10000, "6": null, "7": null, "8": null, "9": null, "10": null }
                        },
                        approver: {
                            "0": { "1": "1", "2": "1", "3": "1", "4": "1", "5": "1", "6": "1", "7": "1", "8": "1", "9": "1", "10": "1" },
                            "1": { "1": "1", "2": "1", "3": "1", "4": "1", "5": "1", "6": "1", "7": "1", "8": "1", "9": "1", "10": "1" }
                        }
                    },
                    approvalRow: {
                        securedL2: false, securedL3: false, securedL4: false, securedL5: false, securedL6: false,
                        unSecuredL2: false, unSecuredL3: false, unSecuredL4: false, unSecuredL5: false, unSecuredL6: false
                    },
                    penaltybasis_amort: "0",
                    penaltyfixrate_amort: null,
                    penaltyfixamt_amort: null,
                    penaltyrunrate_amort: null,
                    penaltygraceperiod_amort: null,
                    graceperiod_consideration: "0",
                    penaltyfixrate_matured: null,
                    penaltyfixamt_matured: null,
                    penaltyrunrate_matured: null,
                    matured_penaltygraceperiod: null,
                    penaltybasis_matured: "0",
                    penaltyDueInclude: false,
                    interestbasis_matured: "0",
                    penaltygraceperiod_matured: null,
                    preterm_fixrate: null,
                    preterm_fixamt: null,
                    matured_interest_fixedamt: null,
                    matured_interestratebasis: "0",
                    amortizedpenalty_inclusion: 0,
                    ...overrides.rates
                },
                deductions: {
                    serviceCharge: {
                        scdiscounteduse: "0", scdiscountedname: "", scbracketoption: "0",
                        scdiscountedMaxDays2Prorate: "0", scrateoption: "0",
                        scdiscountedflexibility: false, scdiscountedglcode: ""
                    },
                    savings: {
                        savingsdiscounteduse: "0", savingsdiscountedname: "",
                        savingsdiscounted: 0, savingsdiscountedoption: 0, savingsdiscountedflexibility: false
                    },
                    tax: {
                        taxuse: "0", taxflexibility: false, taxglcode: glCodes.taxglcode
                    },
                    insurance: {
                        useinsurance: "0", insurancename: "", insuranceflexibility: false,
                        insuranceproviderid: "", useinsurancetable: "0", enableprintingofinsurance: "0",
                        insuranceglcode: glCodes.insuranceglcode, insuranceproductid: "0"
                    },
                    ...Array.from({ length: 9 }, (_, i) => {
                        const num = i + 1;
                        return {
                            [`deduction${num}`]: {
                                [`deduction${num}use`]: "0",
                                [`deduction${num}name`]: "",
                                [`deduction${num}flexibility`]: false,
                                [`deduction${num}MaxDays2Prorate`]: "0",
                                [`deduction${num}bracketoption`]: "",
                                [`deduction${num}dpyear`]: "0",
                                [`deduction${num}rateoption`]: "0",
                                [`deduction${num}glcode`]: ""
                            }
                        };
                    }).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
                    ...overrides.deductions
                },
                amortization: {
                    serviceCharge: {
                        scamortuse: "0", scamortname: "", scamortflexibility: false,
                        scamortvalue: 0, scamortoption: "1", scamortglcode: ""
                    },
                    savings: {
                        savingsamortizeduse: "0", savingsamortizedname: "", savingsamortizedflexibility: false,
                        savingsamortized: 0, savingsamortizedoption: "1", amortrounding: "0", savingsexcess: false
                    },
                    amort1: {
                        amort1use: "0", amort1name: "", amort1flexibility: false,
                        amort1isFinCharge: "0", amort1value: 0, amort1option: "0", amort1glcode: ""
                    },
                    amort2: {
                        amort2use: "0", amort2name: "", amort2flexibility: false, amort2destination: "0",
                        amort2isFinCharge: "0", amort2value: 0, amort2option: "0", amort2glcode: ""
                    },
                    amortOptions: {
                        amortoption: "0", adjustonholidays: "0", amortgraceperiod: "0", autodebitAmort: false
                    },
                    amortDays: {
                        includeDays: { Sun: 0, Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true }
                    },
                    ...overrides.amortization
                },
                others: {
                    savings: {
                        savingsholdout: 0, savingsholdoutoption: "1", savingsproductid: 0
                    },
                    glcodes: {
                        currentglcode: glCodes.currentglcode,
                        pastdueglcode: glCodes.pastdueglcode,
                        nonperfglcode: glCodes.nonperfglcode,
                        inlitigationglcode: "",
                        provisionglcode: glCodes.provisionglcode
                    },
                    cureperiods: {
                        cureperiod1: 0, cureperiod2: 0, cureperiod3: 0, cureperiod4: 0,
                        cureperiod5: 0, cureperiod6: 0, cureperiod7: 0, cureperiod8: 0,
                        enable_individual_cureperiod: false
                    },
                    otherOptions: {
                        micro_nplcomputeoption: false, isTellerDisbursed: false,
                        isCashDisburesedValidated: false, disbursementValidation_x: 0,
                        disbursementValidation_y: 0, securityDependentPN: false,
                        acl_exempted: false, aclAssessment: "", comakerLimit: 0,
                        is_offbook: false, creditscore_template_id: 0
                    },
                    collectionSheet: {
                        collectionlistOrientation: "1", collectionlistLoanBalance: "0",
                        collectionlistDateGranted: false, collectionlistLoanAmt: false,
                        collectionlistSavingsBal: false, collectionlistDuedate: false,
                        collectionlistSignature: false, reflectAllActiveLoans: false
                    },
                    sms: {
                        smsLanguage: "1", smsFreeAmt: "0", smsUnpaidAmorts: false
                    },
                    ...overrides.others
                }
            }
        };

        return Api.api_post('/lending/settings/post-product-details', payload).then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);
            
            cy.log(`Loan Product Added Successfully!`);
        });
    });
});