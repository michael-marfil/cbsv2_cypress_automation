import { beforeEnter } from '@support/navigation_guard/ValidatePageAccess';
/**
 * ============================================================================
 * LENDING MODULE
 * ============================================================================
 * 
 * This class provides navigation methods for the Lending module in CBS v2.
 * It serves as a centralized interface for accessing all lending-related pages while handling permissions and navigation logic.
 * 
 * @class lendingmodule
 * @description Handles navigation to all lending module pages with permission checks
 * @author Michael
 * 
 * USAGE EXAMPLES:
 * --------------
 * import lendingmodule from '@support/routes/lending';
 * 
 * // Basic navigation
 * lendingmodule.goTo(path-to-page)();
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
class lendingmodule {
    // APPLICATION / RELEASE 

        // Application / Release
        goToApplicationRelease() { 
            beforeEnter('1402-1').then(() => {
                cy.navigateTo('lending.applicationRelease.app-release'); 
            });
            return this;
        }

        // Delete Loan Releases
        goToDeleteLoanReleases() {
            beforeEnter('1402-3').then(() => {
                cy.navigateTo('lending.applicationRelease.delete-loan-releases');
            });
            return this;
        }

        // Pending Loan Applications
        goToPendingLoanApplications() { 
            beforeEnter('1402-1').then(() => {
                cy.navigateTo('lending.applicationRelease.pending-loan-applications');
            });
        }
    
    // REPORTS
        // Transaction for the Day
            // Loan Payments
            goToLoanPayments() {
                cy.navigateTo('lending.reports.transaction_for_the_day.loan-payments');
                return this;
            }

        //Listings 
            //Loan Listings
            goToLoanListing() { cy.navigateTo('lending.reports.listings.loan-listings'); return this; }

    // Client Details
    goToClientDetails() { cy.navigateTo('lending.reports.client-details'); return this; }

    // MANAGEMENT

    // Clients Management
    goToClientsManagement() {
        beforeEnter('1011-1').then(() => {
            cy.navigateTo('lending.management.clients-mgmt'); 
        });
        return this; 
    }

    // Center Management
    goToCenterManagement() { 
        beforeEnter('1407-1').then(() => {
            cy.navigateTo('lending.management.center-mgmt');
        });
        return this; 
    }

    // Office Management
    goToOfficeManagement() { 
        beforeEnter('1407-1').then(() => {
            cy.navigateTo('lending.management.office-mgmt');
        });
        return this;
    }

    // SETTINGS

    // LOAN PRODUCT

        // Loan Product Settings
        goToLoanProductSettings() { 
            beforeEnter('1401-1').then(() => {
                cy.navigateTo('lending.settings.loanProduct.loan-product-settings');
            });
            return this; 
        }
        // Loan Product to Use
        goToLoanProductToUse() { 
            beforeEnter('1401-1').then(() => {
                cy.navigateTo('lending.settings.loanProduct.loan-product-to-use');
            });
            return this; 
        }

    // LOAN CLASSIFICATION
    
        // Loan Class Management
        goToLoanClassManagement() {
            cy.navigateTo('lending.settings.loanClassification.loan-class-management'); return this;
        }

    // LENDING SETTINGS

        // Settings Mgmt.
        goToSettingsMgmt() { 
            beforeEnter('1401-1').then(() => {
                cy.navigateTo('lending.settings.lendingSettings.settings-mgmt');
            });
            return this; 
        }

    // CREDIT LINE

        // Credit Line Settings
        goToCreditLineSettings() { 
            cy.navigateTo('lending.creditLine.credit-line-settings');
            return this; 
        }

        // Credit Line Management
        goToCreditLineManagement() { 
            cy.navigateTo('lending.creditLine.credit-line-management');
            return this; 
        }

    // CREDIT SCORING

        // Credit Scoring Settings
        goToCreditScoringSettings() { 
            beforeEnter('1011-1').then(() => {
                cy.navigateTo('lending.creditScoring.credit-scoring-settings');
            });
            return this; 
        }

}

export default new lendingmodule();