import Api from '@support/commands/api';
import { db } from '@database';

/**
 * Seeder: Loan Application/Release
 * 
 * Creates a loan application/release for client for client with specific product, then automatically
 * apply, approve and releases it.
 * 
 * @param {number} clientid
 * @param {number} loanproductid
 * @param {number} amount - loan amount
 * @param {Object} [overrides={}] - optional overrides for any payload field
 * @example - cy.seedLoanApplicationRelease(clientid, loanproductid, etc...)
 * 
 * @author Michael
 */

Cypress.Commands.add('seedLoanApplicationRelease', (clientid, loanproductid, loanamount, overrides = {}) => {
    const clientId = String(clientid);
    const loanProductId = String(loanproductid);
    const loanAmount = Number(loanamount);

    // loan application
    const applicationPayload = {
        process: 'apply1',
        pnid: '0',
        clientid: clientId,
        loanproductid: loanProductId,
        termunit: overrides.termunit || 4,
        term: overrides.term || 12,
        amount: loanAmount,
        interestrate: overrides.interestrate || 15,
        interestcomputation: overrides.interestcomputation || 1,
        interestcomputationbasis: overrides.interestcomputationbasis || 1,
        insurance: overrides.insurance || 0,
        tax: overrides.tax || 0,
        deduction1: overrides.deduction1 || 0,
        deduction2: overrides.deduction2 || 0,
        deduction3: overrides.deduction3 || 0,
        deduction4: overrides.deduction4 || 0,
        deduction5: overrides.deduction5 || 0,
        deduction6: overrides.deduction6 || 0,
        deduction7: overrides.deduction7 || 0,
        deduction8: overrides.deduction8 || 0,
        deduction9: overrides.deduction9 || 0,
        proceeds: overrides.proceeds || 8500,
        proceedstype: overrides.proceedstype || 0,
        proceedsreference: overrides.proceedsreference || '',
        coborrowerid: overrides.coborrowerid || 0,
        comaker1id: overrides.comaker1id || 0,
        comaker2id: overrides.comaker2id || 0,
        comaker3id: overrides.comaker3id || 0,
        comaker4id: overrides.comaker4id || 0,
        comaker5id: overrides.comaker5id || 0,
        industryid: overrides.industryid || 1,
        loanclassid: overrides.loanclassid || 210,
        loanpurposeid: overrides.loanpurposeid || 6,
        loanpurpose: overrides.loanpurpose || `auto-generated loan purpose for client ${clientid}`,
        securityid: overrides.securityid || 0,
        borrowertypeid: overrides.borrowertypeid || 3,
        clientgroupid: overrides.clientgroupid || 7,
        autodebitAmort: overrides.autodebitAmort || 0,
        savingsid: overrides.savingsid || 0,
        cureperiod: overrides.cureperiod || '',
        loanofficerid: overrides.loanofficerid || 3,
        releasetag: overrides.releasetag || 1,
        workersemployed: overrides.workersemployed || '',
        amortday_monthly: overrides.amortday_monthly || 2,
        amortday_annual: overrides.amortday_annual || 0,
        amortday_lumpsum: overrides.amortday_lumpsum || '',
        amortday_onmaturity: overrides.amortday_onmaturity || '',
        amortday_quarterly: overrides.amortday_quarterly || 0,
        amortday_semiannual: overrides.amortday_semiannual || 0,
        amortday_semimonthly: overrides.amortday_semimonthly || 0,
        amortday_weekly: overrides.amortday_weekly || 4,
        graceperiod: overrides.graceperiod || 0,
        graceperiod_annual: overrides.graceperiod_annual || 0,
        graceperiod_daily: overrides.graceperiod_daily || 0,
        graceperiod_monthly: overrides.graceperiod_monthly || 0,
        graceperiod_quarterly: overrides.graceperiod_quarterly || 0,
        graceperiod_semiannual: overrides.graceperiod_semiannual || 0,
        graceperiod_semimonthly: overrides.graceperiod_semimonthly || 0,
        graceperiod_weekly: overrides.graceperiod_weekly || 0,
        solicitortype: overrides.solicitortype || 1,
        solicitorid: overrides.solicitorid || '',
        loantopaypnid_array2: overrides.loantopaypnid_array2 || [],
        collateral_array2: overrides.collateral_array2 || [],
        diminishing_option: overrides.diminishing_option || 2,
        servicechargediscountedflex: overrides.servicechargediscountedflex || null,
        savingsdiscountedflex: overrides.savingsdiscountedflex || null,
        insuranceflex: overrides.insuranceflex || null,
        taxflex: overrides.taxflex || null,
        deduction1flex: overrides.deduction1flex || null,
        deduction2flex: overrides.deduction2flex || null,
        deduction3flex: overrides.deduction3flex || null,
        deduction4flex: overrides.deduction4flex || null,
        deduction5flex: overrides.deduction5flex || null,
        deduction6flex: overrides.deduction6flex || null,
        deduction7flex: overrides.deduction7flex || null,
        deduction8flex: overrides.deduction8flex || null,
        deduction9flex: overrides.deduction9flex || null,
        scamortvalue: overrides.scamortvalue || 0,
        amort1value: overrides.amort1value || '0.00',
        amort2value: overrides.amort2value || '0.00',
        principalInterval: overrides.principalInterval || 1,
        principalIntervalAdjustment: overrides.principalIntervalAdjustment || 0,
        principalIntervalIrregular: overrides.principalIntervalIrregular || '',
        savingsamortized: overrides.savingsamortized || 0,
        amortFixed: overrides.amortFixed || '',
        partialInt: overrides.partialInt || '',
        partialIntLumpsum: overrides.partialIntLumpsum || '',
        partialSC: overrides.partialSC || '',
        partialSCLumpsum: overrides.partialSCLumpsum || '',
        amort_day: overrides.amort_day || 2,
        termDaysFixed: overrides.termDaysFixed !== undefined ? overrides.termDaysFixed : true,
        servicechargediscounted: overrides.servicechargediscounted || 0,
        savingsdiscounted: overrides.savingsdiscounted || 0,
        ...overrides
    };

    // post loan application
    return Api.api_post('/lending/application/release/application', applicationPayload).then((application_response) => {
        expect(application_response.status).to.be.oneOf([200, 201]);
        cy.log(`Loan Application created successfully`);

        // query data to get pnid
        return db.loan_details(clientid, loanproductid, loanamount).then(result => {
            if (!result || result.length === 0) {
                throw new Error(`Could not find loan for client ${clientid}, product ${loanproductid}, amount ${loanAmount}`);
            }

            const pnid = result.pnid;
            cy.log(`Retrieved pnid: ${pnid}`);

            const approvalPayload = {
                selectedPnid: {
                    [pnid]: pnid
                },
                branchid: overrides.branchid || 1,
                process: 'approve'
            };

            return Api.api_post('/lending/application/approve/approve', approvalPayload).then((approval_response) => {
                expect(approval_response.status).to.be.oneOf([200, 201]);
                
                // The response body might be null/empty on success, so we just check status
                cy.log(`Loan application approved successfully (pnid: ${pnid})`);

                // loan release
                const releasePayload = {
                    process: 'release1',
                    pnid: String(pnid),
                    clientid: clientId,
                    loanproductid: loanProductId,
                    termunit: applicationPayload.termunit,
                    term: applicationPayload.term,
                    amount: loanAmount,
                    interestrate: applicationPayload.interestrate,
                    interestcomputation: applicationPayload.interestcomputation,
                    interestcomputationbasis: applicationPayload.interestcomputationbasis,
                    insurance: applicationPayload.insurance,
                    tax: applicationPayload.tax,
                    deduction1: applicationPayload.deduction1,
                    deduction2: applicationPayload.deduction2,
                    deduction3: applicationPayload.deduction3,
                    deduction4: applicationPayload.deduction4,
                    deduction5: applicationPayload.deduction5,
                    deduction6: applicationPayload.deduction6,
                    deduction7: applicationPayload.deduction7,
                    deduction8: applicationPayload.deduction8,
                    deduction9: applicationPayload.deduction9,
                    proceeds: overrides.release_proceeds || applicationPayload.proceeds,
                    proceedstype: overrides.release_proceedstype || 1,
                    proceedsreference: overrides.release_proceedsreference || `CC# ${Date.now()}`,
                    coborrowerid: applicationPayload.coborrowerid === 0 ? 'NONE' : String(applicationPayload.coborrowerid),
                    comaker1id: applicationPayload.comaker1id === 0 ? 'NONE' : String(applicationPayload.comaker1id),
                    comaker2id: applicationPayload.comaker2id === 0 ? 'NONE' : String(applicationPayload.comaker2id),
                    comaker3id: applicationPayload.comaker3id === 0 ? 'NONE' : String(applicationPayload.comaker3id),
                    comaker4id: applicationPayload.comaker4id === 0 ? 'NONE' : String(applicationPayload.comaker4id),
                    comaker5id: applicationPayload.comaker5id === 0 ? 'NONE' : String(applicationPayload.comaker5id),
                    industryid: applicationPayload.industryid,
                    loanclassid: applicationPayload.loanclassid,
                    loanpurposeid: applicationPayload.loanpurposeid,
                    loanpurpose: applicationPayload.loanpurpose,
                    securityid: applicationPayload.securityid,
                    borrowertypeid: applicationPayload.borrowertypeid,
                    clientgroupid: applicationPayload.clientgroupid,
                    autodebitAmort: applicationPayload.autodebitAmort,
                    savingsid: applicationPayload.savingsid || null,
                    cureperiod: applicationPayload.cureperiod,
                    loanofficerid: applicationPayload.loanofficerid,
                    releasetag: applicationPayload.releasetag,
                    workersemployed: applicationPayload.workersemployed || 0,
                    amortday_monthly: applicationPayload.amortday_monthly,
                    amortday_annual: overrides.release_amortday_annual || 2,
                    amortday_lumpsum: applicationPayload.amortday_lumpsum,
                    amortday_onmaturity: applicationPayload.amortday_onmaturity,
                    amortday_quarterly: overrides.release_amortday_quarterly || 2,
                    amortday_semiannual: overrides.release_amortday_semiannual || 2,
                    amortday_semimonthly: overrides.release_amortday_semimonthly || 2,
                    amortday_weekly: applicationPayload.amortday_weekly,
                    graceperiod: applicationPayload.graceperiod,
                    graceperiod_annual: applicationPayload.graceperiod_annual,
                    graceperiod_daily: applicationPayload.graceperiod_daily,
                    graceperiod_monthly: applicationPayload.graceperiod_monthly,
                    graceperiod_quarterly: applicationPayload.graceperiod_quarterly,
                    graceperiod_semiannual: applicationPayload.graceperiod_semiannual,
                    graceperiod_semimonthly: applicationPayload.graceperiod_semimonthly,
                    graceperiod_weekly: applicationPayload.graceperiod_weekly,
                    solicitortype: applicationPayload.solicitortype,
                    solicitorid: applicationPayload.solicitorid || 'null',
                    loantopaypnid_array2: applicationPayload.loantopaypnid_array2,
                    collateral_array2: applicationPayload.collateral_array2,
                    diminishing_option: applicationPayload.diminishing_option,
                    servicechargediscountedflex: applicationPayload.servicechargediscountedflex,
                    savingsdiscountedflex: applicationPayload.savingsdiscountedflex,
                    insuranceflex: applicationPayload.insuranceflex,
                    taxflex: applicationPayload.taxflex,
                    deduction1flex: applicationPayload.deduction1flex,
                    deduction2flex: applicationPayload.deduction2flex,
                    deduction3flex: applicationPayload.deduction3flex,
                    deduction4flex: applicationPayload.deduction4flex,
                    deduction5flex: applicationPayload.deduction5flex,
                    deduction6flex: applicationPayload.deduction6flex,
                    deduction7flex: applicationPayload.deduction7flex,
                    deduction8flex: applicationPayload.deduction8flex,
                    deduction9flex: applicationPayload.deduction9flex,
                    scamortvalue: applicationPayload.scamortvalue,
                    amort1value: overrides.release_amort1value || '',
                    amort2value: overrides.release_amort2value || '0.00',
                    principalInterval: applicationPayload.principalInterval,
                    principalIntervalAdjustment: applicationPayload.principalIntervalAdjustment,
                    principalIntervalIrregular: applicationPayload.principalIntervalIrregular,
                    savingsamortized: applicationPayload.savingsamortized,
                    amortFixed: applicationPayload.amortFixed,
                    partialInt: applicationPayload.partialInt,
                    partialIntLumpsum: applicationPayload.partialIntLumpsum,
                    partialSC: applicationPayload.partialSC,
                    partialSCLumpsum: applicationPayload.partialSCLumpsum,
                    amort_day: applicationPayload.amort_day,
                    termDaysFixed: overrides.release_termDaysFixed || 0,
                    servicechargediscounted: applicationPayload.servicechargediscounted,
                    savingsdiscounted: applicationPayload.savingsdiscounted,
                    pnid2: overrides.pnid2 || '',
                    interestdiscounted: overrides.interestdiscounted || 1487.5,
                    ornumber: overrides.ornumber || '',
                    proceeds_savingsid: overrides.proceeds_savingsid || 0
                };

                // release loan
                return Api.api_post('/lending/application/release/loan-release', releasePayload).then((release_response) => {
                    expect(release_response.status).to.be.oneOf([200, 201]);
                    cy.log(`Loan released successfully (pnid: ${pnid})`);

                    // return loan details
                    return cy.wrap({
                        pnid: pnid,
                        clientid: clientid,
                        loanproductid: loanproductid
                    });
                });
            });
        });
    });
});