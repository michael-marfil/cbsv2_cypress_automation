/**
 * ============================================================================
 * RISK MANAGEMENT MODULE
 * ============================================================================
 * 
 * This class provides navigation methods for the Risk Management module in CBS v2.
 * It serves as a centralized interface for accessing all risk-management-related pages while handling permissions and navigation logic.
 * 
 * @class riskmanagementmodule
 * @description Handles navigation to all riskmanagement module pages with permission checks
 * @author Michael
 * 
 * USAGE EXAMPLES:
 * --------------
 * import riskmanagementmodule from '@support/routes/riskmanagement';
 * 
 * // Basic navigation
 * riskmanagementmodule.goTo(path-to-page)();
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
class riskmanagementmodule {
    goToDeletedLoanReleases() {
        cy.navigateTo('riskmanagement.monitoring.reports.lending.redflags.deleted-loan-releases');
    }
}

export default new riskmanagementmodule();