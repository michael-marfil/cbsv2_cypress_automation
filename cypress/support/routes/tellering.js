/**
 * ============================================================================
 * TELLERING MODULE
 * ============================================================================
 * 
 * This class provides navigation methods for the Tellering module in CBS v2.
 * It serves as a centralized interface for accessing all tellering-related pages while handling permissions and navigation logic.
 * 
 * @class telleringmodule
 * @description Handles navigation to all tellering module pages with permission checks
 * @author Michael
 * 
 * USAGE EXAMPLES:
 * --------------
 * import telleringmodule from '@support/routes/tellering';
 * 
 * // Basic navigation
 * telleringmodule.goTo(path-to-page)();
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
class telleringmodule {
    // TRANSACTIONS

        // Cash Blotter Posting
        goToCashBlotterPosting() {
            cy.navigateTo('tellering.transactions.cash-blotter-posting');
            return this;
        }
    
        // Loan Proceeds Release
        goToLoanProceedsRelease() { 
            cy.navigateTo('tellering.transactions.loan-proceeds-release');
            return this;
        }

        // Loan Payment OR Issuance
        goToLoanPaymentORIssuance() { 
            cy.navigateTo('tellering.transactions.loan-payment-OR-issuance'); 
            return this; 
        }

        // Expense Posting
        goToExpensePosting() {
            cy.navigateTo('tellering.transactions.expense-posting');
            return this;
        }

    // REPORTS

    // Cash Blotter Report
    goToCashBlotterReport() { cy.navigateTo('tellering.reports.cash-blotter-report'); return this; }

    // SETTINGS

    // OR Print Coordinates Management
    goToORPrintCoordinatesMgmt() { cy.navigateTo('tellering.settings.or-print-coordinates'); return this; }

    // Print OR After Payment Management
    goToPrintORAfterPaymentMgmt() { cy.navigateTo('tellering.settings.print-or-after-payment-mgmt'); return this; }
    
}

export default new telleringmodule();