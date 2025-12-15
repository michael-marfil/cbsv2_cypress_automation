import { beforeEnter } from '@support/navigation_guard/ValidatePageAccess';
/**
 * ============================================================================
 * ACCOUNTING MODULE
 * ============================================================================
 * 
 * This class provides navigation methods for the Accounting module in CBS v2.
 * It serves as a centralized interface for accessing all accounting-related pages while handling permissions and navigation logic.
 * 
 * @class accountingmodule
 * @description Handles navigation to all accounting module pages with permission checks
 * @author Michael
 * 
 * USAGE EXAMPLES:
 * --------------
 * import accountingmodule from '@support/routes/accounting';
 * 
 * // Basic navigation
 * accountingmodule.goTo(path-to-page)();
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
class accountingmodule {
    // JOURNALS
    goToJournalPosting() {
        beforeEnter('1303-1').then(() => {
            cy.navigateTo('accounting.journals.journal-posting'); 
        });
        return this;
    }
    goToJournalPostingAutomatic() {
        // beforeEnter('permission-here').then(() => {
            cy.navigateTo('accounting.journals.auto-journal');
        // });
        return this;
    }
    goToJournalUpload() {
        beforeEnter('1303-2').then(() => {
            cy.navigateTo('accounting.journals.journal-upload'); 
        });
        return this;
    }
    goToJournalForTheDay() {
        beforeEnter('1303-1').then(() => {
            cy.navigateTo('accounting.journals.for-the-day'); 
        });
        return this;
    }
    goToDeletedJournals() {
        // beforeEnter('permission-here').then(() => {
            cy.navigateTo('accounting.journals.deleted-journal');
        // });
        return this;
    }

    // REPORTS

    // FINANCIAL REPORTS
        // Financial Statement
        goToFinancialStatement() {
            // beforeEnter('permission-here').then(() => {
                cy.navigateTo('accounting.reports.financialReports.financial-stmt');
            // });
            return this;
        }

    // GENERAL LEDGERS
        // Individual GL
        goToIndividualGL() {
            cy.navigateTo('accounting.reports.generalLedgers.individual-gl');
            return this;
        }

    // CHECKWRITER
    goToCheckwriterSettings() {
        // beforeEnter('permission-here').then(() => {
            cy.navigateTo('accounting.checkwriter.checkwriter-settings');
        // });
        return this;
    }
    goToCheckwriterSingle() {
        // beforeEnter('permission-here').then(() => {
            cy.navigateTo('accounting.checkwriter.checkwriter-single');
        // });
        return this;
    }
    goToCheckwriterMultiple() {
        // beforeEnter('permission-here').then(() => {
            cy.navigateTo('accounting.checkwriter.checkwriter-multiple');
        // });
        return this;
    }

    // SETTINGS

    // GL ACCOUNTS
        // GL Accounts Mgm't
        goToGLAcctsMgmt() {
            beforeEnter('1301-1').then(() => {
                cy.navigateTo('accounting.settings.glAccounts.gl-acct-mgmt');
            });
            return this;
        }

    // COST CENTERS
        // Cost Centers Mgmt
        goToCostCentersMgmt() {
            cy.navigateTo('accounting.settings.costCenters.cost-center-mgmt');
            return this;
        }

        // Cost Center to Use
        goToCostCenterToUse() {
            cy.navigateTo('accounting.settings.costCenters.cost-center-to-use');
            return this;
        }

    // ACCOUNTING SETTINGS
        // Settings Management
        goToSettingsMgmt() {
            cy.navigateTo('accounting.settings.accountingSettings.settings-mgmt');
            return this;
        }

}

export default new accountingmodule();