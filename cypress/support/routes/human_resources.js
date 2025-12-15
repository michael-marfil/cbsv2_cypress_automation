/**
 * ============================================================================
 * HUMAN RESOURCES MODULE
 * ============================================================================
 * 
 * This class provides navigation methods for the Human Resources module in CBS v2.
 * It serves as a centralized interface for accessing all human-resources-related pages while handling permissions and navigation logic.
 * 
 * @class humanresourcesmodule
 * @description Handles navigation to all humanresources module pages with permission checks
 * @author Michael
 * 
 * USAGE EXAMPLES:
 * --------------
 * import humanresourcesmodule from '@support/routes/humanresources';
 * 
 * // Basic navigation
 * humanresourcesmodule.goTo(path-to-page)();
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
class humanresourcesmodule {
    // SETTINGS

        // Holidays Mgmt
        goToNonFixedHolidays() { // Non-Fixed Holidays
            cy.navigateTo('humanresources.settings.holidays-mgmt.non-fixed-holidays');
            return this;
        }
}

export default new humanresourcesmodule();