import Api from '@support/commands/api';
import { db } from '@database';

/**
 * Seeder: Savings Account
 * 
 * Creates a savings account for a client with a specific product, then automatically
 * approves it.
 * 
 * @param {number} clientid 
 * @param {number} savingsproductid
 * @param {Object} [overrides={}] - optional overrides for any payload field
 * @example - cy.seedSavingsAccount(clientid, 40, { note1: 'sample note' });
 * 
 * @author Michael
 */

Cypress.Commands.add('seedSavingsAccount', (clientid, productid, overrides = {}) => {
    const client = Number(clientid);
    cy.log(`Creating savings account for client ${client}`);

    const payload = {
        accountTempDetails: {
            productid: productid,
            savingscategory: overrides.savingscategory || 1,
            type: overrides.type || 11,
            corpclientid: overrides.corpclientid || null,
            client1id: client,
            client2id: overrides.client2id || null,
            client3id: overrides.client3id || null,
            client4id: overrides.client4id || null,
            opendate: overrides.opendate || new Date().toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            }),
            note1: overrides.note1 || `auto-generated savings account for client ${client}`,
            specialrate: overrides.specialrate || 0,
            aggregatorid: overrides.aggregatorid || null,
            renewaloption: overrides.renewaloption || 0,
            accountlinkid: overrides.accountlinkid || 0,
            autodebitsavingsid: overrides.autodebitsavingsid || 0,
            makerid: overrides.makerid,
            solicitorid: overrides.solicitorid || 0,
            ...overrides
        }
    };

    // step 1: create temporary account
    return Api.api_post('/savings-accounts-management/post-details', payload).then((createResponse) => {
        expect(createResponse.status).to.be.oneOf([200, 201]);
        cy.log(`Tempory savings account created.`);

        // fetch productcode using productid from payload
        return db.savings_product(null, payload.accountTempDetails.productid).then(product => {
            const product_code = product.productcode;

            // step 2: get pending account from approval list
            return Api.api_get('/approval/casa/new-accounts').then(approvalResponse => {
                const pendingAccount = approvalResponse.body.newAccounts?.find(
                    acct => acct.client1id === client && acct.productname === product_code
                );

                if (!pendingAccount) throw new Error(`could not find pending account for client ${client} and product ${productid}`);
                cy.log(`Approving account (tempid: ${pendingAccount.tempid})...`);

                // step 3: approve the account
                const approvalPayload = {
                    selectedAccounts: [pendingAccount.tempid]  // Array of tempids
                };

                return Api.api_post('/approval/casa/new-accounts/approve', approvalPayload).then((approvalResp) => {
                    cy.log(`Approval response status: ${approvalResp.status}`);
                    cy.log(`Approval response body: ${JSON.stringify(approvalResp.body)}`);
                    
                    if (approvalResp.status !== 200 && approvalResp.status !== 201) {
                        throw new Error(`Approval failed with status ${approvalResp.status}: ${JSON.stringify(approvalResp.body)}`);
                    }
                    
                    cy.log(`Savings Account approved successfully`);
                });
            });
        });
    });
});