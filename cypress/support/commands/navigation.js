/**
 * Route Registry ( central reference for navigation paths )
 * 
 * Register new pages here to make them available for automated navigation.
 * 
 * Properties:
 * - category: Main module name (e.g., 'Accounting', 'Lending', etc.)
 * - submenu: Sub-section within module
 * - nav: Display name in navigation menu
 * - url: Target route to navigate to
 * - expectedUrl: URL(s) expected after navigation (string or array)
 * 
 * @author Michael
 */

import { navigation_step } from '@support/navigation_guard/NavigationStep';

Cypress.Commands.add('navigateTo', (path, options = {}) => {
    const navigationTree = {
        /**
         * ============================================================================
         * ACCOUNTING MODULE
         * ============================================================================
         */
        accounting: {
            category: 'Accounting',
            children: {
                // Journals
                journals: {
                    submenu: 'Journals',
                    children: {
                        'journal-posting': {
                            nav: 'Journal Posting',
                            url: '/accounting/journals/journal-posting',
                            expectedUrl: '/accounting/journals/journal-posting'
                        },
                        'auto-journal': {
                            nav: 'Journal Posting (Automatic)',
                            url: '/accounting/journals/auto-journal',
                            expectedUrl: '/accounting/journals/auto-journal'
                        },
                        'journal-upload': {
                            nav: 'Journal Upload',
                            url: '/accounting/journals/journal-upload',
                            expectedUrl: '/accounting/journals/journal-upload'
                        },
                        'for-the-day': {
                            nav: 'Journals for the day',
                            url: '/accounting/journals/for-the-day',
                            expectedUrl: '/accounting/journals/for-the-day'
                        },
                        'deleted-journal': {
                            nav: 'Deleted Journals',
                            url: '/accounting/journals/deleted-journals',
                            expectedUrl: '/accounting/journals/deleted-journals'
                        }
                    }
                },
                // Reports
                reports: {
                    submenu: 'Reports',
                    children: {
                        // Financial Reports
                        financialReports: {
                            submenu: 'Financial Reports',
                            children: {
                                'financial-stmt': {
                                    nav: 'Financial Statement',
                                    url: '/accounting/reports/financial-statement',
                                    expectedUrl: '/accounting/reports/financial-statement'
                                },
                            }
                        },
                        // General Ledgers
                        generalLedgers: {
                            submenu: 'General Ledgers',
                            children: {
                                'individual-gl': {
                                    nav: 'Individual GL',
                                    url: '/accounting/gl/individual-gl/1',
                                    expectedUrl: '/accounting/gl/individual-gl/1'
                                }
                            }
                        }
                    }
                },
                // Checkwriter
                checkwriter: {
                    submenu: 'Checkwriter',
                    children: {
                        'checkwriter-settings': {
                            nav: 'Checkwriter Settings',
                            url: '/accounting/checkwriter-settings',
                            expectedUrl: [
                                '/accounting/checkwriter-settings',
                                '/accounting/checkwriter-create'
                            ]
                        },
                        'checkwriter-single': {
                            nav: 'Checkwriter - Single',
                            url: '/accounting/checkwriter-single',
                            expectedUrl: [
                                '/accounting/checkwriter-single',
                                '/accounting/checkwriter-create'
                            ]
                        },
                        'checkwriter-multiple': {
                            nav: 'Checkwriter - Multiple',
                            url: '/accounting/checkwriter-multiple',
                            expectedUrl: [
                                '/accounting/checkwriter-multiple',
                                '/accounting/checkwriter-create'
                            ]
                        }
                    }
                },
                // Settings
                settings: {
                    submenu: 'Settings',
                    children: {
                        // GL Accounts
                        glAccounts: {
                            submenu: 'GL Accounts',
                            children: {
                                'gl-acct-mgmt': {
                                    nav: "GL Accounts Mgm't",
                                    url: '/accounting/settings/glaccounts-management/index',
                                    expectedUrl: '/accounting/settings/glaccounts-management/index'
                                }
                            }
                        },
                        // Cost Centers
                        costCenters: {
                            submenu: 'Cost Centers',
                            children: {
                                'cost-center-mgmt': {
                                    nav: 'Cost Centers Mgmt',
                                    url: '/accounting/settings/cost-center/management/index',
                                    expectedUrl: '/accounting/settings/cost-center/management/index'
                                },
                                'cost-center-to-use': {
                                    nav: 'Cost Center to Use',
                                    url: '/accounting/settings/cost-center/to-use/index',
                                    expectedUrl: '/accounting/settings/cost-center/to-use/index'
                                }
                            }
                        },
                        // Accounting Settings
                        accountingSettings: {
                            submenu: 'Accounting Settings',
                            children: {
                                'settings-mgmt': {
                                    nav: 'Settings Management',
                                    url: '/accounting/settings/mgmt',
                                    expectedUrl: '/accounting/settings/mgmt'
                                }
                            }
                        }
                    }
                },
            }
        },

        /**
         * ============================================================================
         * LENDING MODULE
         * ============================================================================
         */
        lending: {
            category: 'Lending',
            children: {
                // Application / Release
                applicationRelease: {
                    submenu: 'Application / Release',
                    children: {
                        'app-release': {
                            nav: 'Application / Release',
                            url: '/lending/loan-releases/module',
                            expectedUrl: '/lending/loan-releases/module'
                        },
                        'delete-loan-releases': {
                            nav: 'Delete Loan Releases',
                            url: '/lending/loan-releases/delete',
                            expectedUrl: '/lending/loan-releases/delete'
                        },
                        'pending-loan-applications': {
                            nav: 'Pending Loan Applications',
                            url: '/lending/loan-releases/pending',
                            expectedUrl: '/lending/loan-releases/pending'
                        }
                    }
                },
                // Reports
                reports: {
                    submenu: 'Reports',
                    children: {
                        // Transaction for the Day
                        transaction_for_the_day: {
                            submenu: 'Transaction for the Day',
                            children: {
                                'loan-payments': {
                                    nav: 'Loan Payments',
                                    url: '/lending/reports/transactions-for-the-day/loan-payments-for-the-day',
                                    expectedUrl: '/lending/reports/transactions-for-the-day/loan-payments-for-the-day'
                                }
                            }
                        },
                        'client-details': {
                            nav: 'Client Details',
                            url: '/general/reports/client-details',
                            expectedUrl: '/general/reports/client-details'
                        },
                        // Listings
                        listings: {
                            submenu: 'Listings',
                            children: {
                                'loan-listings': {
                                    nav: 'Loan Listing',
                                    url: '/lending/reports/listings/loan-listings',
                                    expectedUrl: '/lending/reports/listings/loan-listings'
                                }
                            }
                        },
                        'loan-payment': {
                            submenu: 'Loan Payment',
                            children: {
                                'payment-posting': {
                                    submenu: 'Payment Posting',
                                    children: {
                                        'post-payments': {
                                            nav: 'Post Payment',
                                            url: '/lending/loan-payments/payment-posting/post-payment/menu',
                                            expectedUrl: '/lending/loan-payments/payment-posting/post-payment/menu'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                // Management
                management: {
                    submenu: 'Management',
                    children: {
                        'clients-mgmt': {
                            nav: 'Clients Management',
                            url: '/general/management/clients-management',
                            expectedUrl: '/general/management/clients-management'
                        },
                        'center-mgmt': {
                            nav: 'Center Management',
                            url: '/lending/management/center-management',
                            expectedUrl: '/lending/management/center-management'
                        },
                        'office-mgmt': {
                            nav: 'Office Management',
                            url: '/lending/management/office-management',
                            expectedUrl: '/lending/management/office-management'
                        }
                    }
                },
                // Settings
                settings: {
                    submenu: 'Settings',
                    children: {
                        // Loan Product
                        loanProduct: {
                            submenu: 'Loan Product',
                            children: {
                                'loan-product-settings': {
                                    nav: 'Loan Product Settings',
                                    url: '/lending/loan-product/settings/product-settings',
                                    expectedUrl: '/lending/loan-product/settings/product-settings'
                                },
                                'loan-product-to-use': {
                                    nav: 'Loan Product to Use',
                                    url: '/lending/settings/loan-product/loan-products-to-use',
                                    expectedUrl: '/lending/settings/loan-product/loan-products-to-use'
                                }
                            }
                        },
                        // Loan Classification
                        loanClassification: {
                            submenu: 'Loan Classification',
                            children: {
                                'loan-class-management': {
                                    nav: 'Loan Class Management',
                                    url: '/lending/settings/loan-class-management',
                                    expectedUrl: '/lending/settings/loan-class-management'
                                }
                            }
                        },
                        // Lending Settings
                        lendingSettings: {
                            submenu: 'Lending Settings',
                            children: {
                                'settings-mgmt': {
                                    nav: 'Settings Mgmt.',
                                    url: '/lending/settings/lending-settings/settings-mgmt',
                                    expectedUrl: '/lending/settings/lending-settings/settings-mgmt'
                                }
                            }
                        }
                    }
                },
                creditScoring: {
                    submenu: 'Credit Scoring',
                    children: {
                        'credit-scoring-mgmt': {
                            nav: 'Credit Scoring Mgmt.',
                            url: '/lending/credit_scoring/creditscoring-mgmt-client',
                            expectedUrl: '/lending/credit_scoring/creditscoring-mgmt-client'
                        },
                        'credit-scoring-report': {
                            nav: 'Credit Scoring Report',
                            url: '/lending/credit_scoring/creditscoring-report',
                            expectedUrl: '/lending/credit_scoring/creditscoring-report'
                        },
                        'credit-scoring-settings': {
                            nav: 'Credit Scoring Settings',
                            url: '/lending/credit_scoring/creditscoring-settings',
                            expectedUrl: '/lending/credit_scoring/creditscoring-settings'
                        }
                    }
                }, // Add comma here
                creditLine: {
                    submenu: 'Credit Line',
                    children: {
                        'credit-line-settings': {
                            nav: 'Credit Line Settings',
                            url: '/lending/creditline/creditlinesettings',
                            expectedUrl: '/lending/creditline/creditlinesettings'
                        },
                        'credit-line-management': {
                            nav: 'Credit Line Mgmt.',
                            url: '/lending/credit-line/credit-line-management',
                            expectedUrl: '/lending/credit-line/credit-line-management'
                        }
                    }
                }
            }
        },

        /**
         * ============================================================================
         * CASA MODULE
         * ============================================================================
         */
        casa: {
            category: 'C A S A',
            children: {
                'posting': {
                    nav: 'Posting',
                    url: '/casa/posting',
                    expectedUrl: '/casa/posting'
                },

                reports: {
                    submenu: 'Reports',
                    children: {
                        'client-details': {
                            submenu: 'Client Details',
                            children: {
                                'statement-of-account': {
                                    nav: 'Statement of Account',
                                    url: '/casa/reports/client-details/statement-of-account',
                                    expectedUrl: '/casa/reports/client-details/statement-of-account'
                                }
                            }
                        }
                    }
                },
                management: {
                    submenu: 'Management',
                    children: {
                        savings: {
                            nav: 'Savings Account Management',
                            url: '/casa/management/savings-accounts-management',
                            expectedUrl: '/casa/management/savings-accounts-management'
                        },
                        accountChanges: {
                            submenu: 'Account Changes',
                            children: {
                                'freeze-acct': {
                                    nav: 'Freeze Account',
                                    url: '/casa/management/freeze-account',
                                    expectedUrl: '/casa/management/freeze-account'
                                }
                            }
                        }
                    }
                },
                settings: {
                    submenu: 'Settings',
                    children: {
                        productMgmt: {
                            submenu: 'Product Management',
                            children: {
                                'product-settings': {
                                    nav: 'Product Settings',
                                    url: '/casa/settings/product-settings',
                                    expectedUrl: '/casa/settings/product-settings'
                                }
                            }
                        },
                        savingsSettings: {
                            submenu: 'Savings Settings',
                            children: {
                                'settings-mgmt': {
                                    nav: 'Settings Mgmt.',
                                    url: '/casa/settings/savings-settings',
                                    expectedUrl: '/casa/settings/savings-settings'
                                }
                            }
                        }
                    }
                }
            }
        },

        /**
         * ============================================================================
         * TELLERING MODULE
         * ============================================================================
         */
        tellering: {
            category: 'Tellering',
            children: {
                transactions: {
                    submenu: 'Transactions',
                    children: {
                        'cash-blotter-posting': {
                            nav: 'Cash Blotter Posting',
                            url: '/tellering/transactions/cash-blotter-posting/index',
                            expectedUrl: '/tellering/transactions/cash-blotter-posting/index'
                        },
                        'loan-proceeds-release': {
                            nav: 'Loan Proceeds Release',
                            url: '/tellering/transactions/loan-proceeds',
                            expectedUrl: '/tellering/transactions/loan-proceeds'
                        },
                        'loan-payment-OR-issuance': {
                            nav: 'Loan Payment OR Issuance',
                            url: '/tellering/transactions/orissuance/index',
                            expectedUrl: '/tellering/transactions/orissuance/index'
                        },
                        'expense-posting': {
                            nav: 'Expense Posting',
                            url: '/tellering/transactions/expense-posting/index',
                            expectedUrl: '/tellering/transactions/expense-posting/index'
                        }
                    }
                },
                reports: {
                    submenu: 'Reports',
                    children: {
                        'cash-blotter-report': {
                            nav: 'Cash Blotter Report',
                            url: '/tellering/reports/blotter/initial',
                            expectedUrl: '/tellering/reports/blotter/initial'
                        }
                    }
                },
                settings: {
                    submenu: 'Settings',
                    children: {
                        'or-print-coordinates': {
                            nav: 'OR Print Coordinates Mgmt.',
                            url: '/tellering/settings/or-print-coordinates/index',
                            expectedUrl: '/tellering/settings/or-print-coordinates/index'
                        },
                        'print-or-after-payment-mgmt': {
                            nav: 'Print OR After Payment Mgmt.',
                            url: '/tellering/settings/print-or-after-payment/index',
                            expectedUrl: '/tellering/settings/print-or-after-payment/index'
                        }
                    }
                }
            }
        },

        /**
         * ============================================================================
         * HUMAN RESOURCES MODULE
         * ============================================================================
         */
        humanresources: {
            category: 'Human Resources',
            children: {
                settings: {
                    submenu: 'Settings',
                    children: {
                        // Holidays Mgmt
                        'holidays-mgmt': {
                            submenu: 'Holidays Mgmt',
                            children: {
                                'non-fixed-holidays': {
                                    nav: 'Non-Fixed Holidays',
                                    url: '/hr/settings/holidays-management/non-fixed-holidays',
                                    expectedUrl: '/hr/settings/holidays-management/non-fixed-holidays'
                                }
                            }
                        }
                    }
                }
            }
        },

        /**
         * ============================================================================
         * RISK MANAGEMENT MODULE
         * ============================================================================
         */
        riskmanagement: {
            category: 'Risk Management',
            children: {
                monitoring: {
                    submenu: 'Monitoring',
                    children: {
                        reports: {
                            submenu: 'Reports',
                            children: {
                                lending: {
                                    submenu: 'Lending',
                                    children: {
                                        redflags: {
                                            submenu: 'Red Flags',
                                            children: {
                                                'deleted-loan-releases': {
                                                    nav: 'Deleted Loan Releases',
                                                    url: '/rm/monitoring/reports/lending/red-flag/deleted-loan-releases',
                                                    expectedUrl: '/rm/monitoring/reports/lending/red-flag/deleted-loan-releases'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        /**
         * ============================================================================
         * ADMINISTRATION MODULE
         * ============================================================================
         */
        administration: {
            category: 'Administration',
            children: {
                userrights: {
                    submenu: 'User Rights',
                    children: {
                        'userright-per-employee': {
                            nav: 'User Rights per Employee',
                            url: 'administration/userright/per-employee',
                            expectedUrl: 'administration/userright/per-employee'
                        }
                    }
                }
            }
        },

        /**
         * ============================================================================
         * GENERAL MODULE
         * ============================================================================
         */
        general: {
            category: 'General',
            children: {
                approval: {
                    nav: 'Approval',
                    url: '/general/approval/main-page',
                    expectedUrl: '/general/approval/main-page'
                },
                logout: {
                    nav: 'Logout',
                    expectedUrl: '/login'
                }
            }
        }
    };

    // call function to perform page navigation
    return navigation_step(navigationTree, path, options);
});