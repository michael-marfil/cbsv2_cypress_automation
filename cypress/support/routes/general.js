/**
 * ============================================================================
 * GENERAL MODULE
 * ============================================================================
 * 
 * This class provides navigation methods for the General module in CBS v2.
 * It serves as a centralized interface for accessing all general-related pages while handling permissions and navigation logic.
 * 
 * @class generalmodule
 * @description Handles navigation to all general module pages with permission checks
 * @author Michael
 * 
 * USAGE EXAMPLES:
 * --------------
 * import generalmodule from '@support/routes/general';
 * 
 * // Basic navigation
 * generalmodule.goTo(path-to-page)();
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
class generalmodule {
    // APPROVAL
    goToApproval() { cy.navigateTo('general.approval'); return this; }

    // LOGOUT
    logout() { cy.navigateTo('general.logout'); return this; }
}

export default new generalmodule();