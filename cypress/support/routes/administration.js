/**
 * ============================================================================
 * ADMINISTRATION MODULE
 * ============================================================================
 * 
 * This class provides navigation methods for the Administration module in CBS v2.
 * It serves as a centralized interface for accessing all administration-related pages while handling permissions and navigation logic.
 * 
 * @class administrationmodule
 * @description Handles navigation to all administration module pages with permission checks
 * @author Michael
 * 
 * USAGE EXAMPLES:
 * --------------
 * import administrationmodule from '@support/routes/administration';
 * 
 * // Basic navigation
 * administrationmodule.goTo(path-to-page)();
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
class administrationmodule {
    // USER RIGHTS

    // User Rights Per Employee
    goToUserRightsPerEmployee() { cy.navigateTo('administration.userrights.userright-per-employee'); return this; }
}

export default new administrationmodule();