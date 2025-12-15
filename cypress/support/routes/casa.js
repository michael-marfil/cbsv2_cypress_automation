import { beforeEnter } from '@support/navigation_guard/ValidatePageAccess';
/**
 * ============================================================================
 * CASA MODULE
 * ============================================================================
 * 
 * This class provides navigation methods for the Casa module in CBS v2.
 * It serves as a centralized interface for accessing all casa-related pages while handling permissions and navigation logic.
 * 
 * @class casamodule
 * @description Handles navigation to all casa module pages with permission checks
 * @author Michael
 * 
 * USAGE EXAMPLES:
 * --------------
 * import casamodule from '@support/routes/casa';
 * 
 * // Basic navigation
 * casamodule.goTo(path-to-page)();
 * 
 * PERMISSION SYSTEM:
 * -----------------
 * Each navigation method can include permission checks using beforeEnter()
 * Format: beforeEnter('permission_id-level') 
 * Example: beforeEnter('1303-1') checks permission 1303 level 1
 * 
 * REGISTER NAVIGATION FORMAT:
 * ---------------------------
 * goTo(name of page to visit ) {
 *  beforeEnter('permission').then(() => {
 *      cy.navigateTo('module.submodule.page-to-visit');
 *  });
 *  return this;
 * }
 */
class casamodule {
    // POSTING
        goToPosting() { cy.navigateTo('casa.posting'); return this; }
    // REPORTS

        // CLIENT DETAILS

        // Statement of Account
        goToStatementOfAccount() { cy.navigateTo('casa.reports.client-details.statement-of-account'); return this; }
        
    // MANAGEMENT
    goToSavingsAccountMgmt() { cy.navigateTo('casa.management.savings'); return this; }

        // ACCOUNT CHANGES

        // Freeze Account
        goToFreezeAccount() { cy.navigateTo('casa.management.accountChanges.freeze-acct'); return this; }

    // SETTINGS

        // PRODUCT MANAGEMENT

        // Product Settings
        goToProductSettings() { 
            beforeEnter('1501-1').then(() => {
                cy.navigateTo('casa.settings.productMgmt.product-settings');
            });
            return this; 
        }

        // SAVINGS SETTINGS 

        // Settings Mgmt.
        goToSettingsMgmt() {
            beforeEnter('1401-1').then(() => {
                cy.navigateTo('casa.settings.savingsSettings.settings-mgmt');
            });
            return this;
        }
}

export default new casamodule();