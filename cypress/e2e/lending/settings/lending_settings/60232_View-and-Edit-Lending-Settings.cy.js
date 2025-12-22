describe('View and Edit Leding Settings', () => {
    beforeEach(() => {
        cy.login();
    });

    it('update user right permissions', () => {
        // navigate to user rights and update permissions
        cy.permissions({
            userPermissions: [ // set permissions here
                { permissionID: '1401', level: 1, hasAccess: true },
                { permissionID: '1401', level: 2, hasAccess: true },
                { permissionID: '1401', level: 3, hasAccess: false },
            ],
        });
    });

    it('should be able to view Lending Settings and can Edit (but cannot approve the lending settings changes)', () => {
        // navigate to Lending Settings with the updated permissions
        cy.lendingSettings({
            toEdit: [
                // "guide to the values needed for editing lending settings"

                // amort1name (value to be defined)
                // amort2name (value to be defined)
                // cicprovidercode (institution id code for cic)
                // deduction1isfinancecharge (deduction1 is finance charge or not, 0=No 1=Yes)
                // deduction1name (value to be defined)
                // deduction2isfinancecharge (deduction2 is finance charge or not, 0=No 1=Yes)
                // deduction2name (value to be defined)
                // deduction3isfinancecharge (deduction3 is finance charge or not, 0=No 1=Yes)
                // deduction3name (value to be defined)
                // deduction3value (value to be defined)
                // deduction4isfinancecharge (deduction4 is finance charge or not, 0=No 1=Yes)
                // deduction4name (value to be defined)
                // deduction5isfinancecharge (deduction5 is finance charge or not, 0=No 1=Yes)
                // deduction5name (value to be defined)
                // deduction6isfinancecharge (deduction6 is finance charge or not, 0=No 1=Yes)
                // deduction6name (value to be defined)
                // deduction6savingsformat (centerfund savings format, 0=No savings account; 1=Name of center; 2=Name of authotized signatories)
                // deduction7isfinancecharge (deduction7 is finance charge or not, 0=No 1=Yes)
                // deduction7name (value to be defined)
                // deduction8isfinancecharge (deduction8 is finance charge or not, 0=No 1=Yes)
                // deduction8name (value to be defined)
                // deduction9isfinancecharge (deduction9 is finance charge or not, 0=No 1=Yes)
                // deduction9name (value to be defined)
                // discountIncomeRecognition (Method of Loan Discount Income Recognition for amortized loans. 1=Based on equal principal 2=Based on equal amortization)
                // idvalidity (Number of months ID is valid.)
                // insurancesource (1-Insurance is based on the settings in loan product 2-Insurance Source is based on the loan product adjustments)
                // microcentersavingsproductdefault (Default savings product of Microfinance Center Savings Accounts)      
                // printapplicationform (Option to print loan application form after encoding)
                // requireborrowertype (1-Require borrower type 0-Dont require borrower type)
                // SBL_amount (Single Borrowers Limit for a client.)
                // taxname (Tax for income from lending (interest and service charge) )
                // taxrate_interest (Percentage as GRT for interest income)
                // taxrate_sc (Percentage as GRT for servicecharge income)
                // tracksolicitor (Option to track loan solicitor.)
                // useclientgroup (Client Grouping; 0-not used; 1-used;)
                // usefirmsize (This will be used in reporting the asset sizes of borrowers)
                // useloansecurity (will enable/disable the feature of this system to monitor the security of loans)


                // define first here the variable to edit and the value 
                { variable: 'amort1name', value: 'Amort1' },
                { variable: 'deduction1isfinancecharge', value: 1 },
                { variable: 'deduction6savingsformat', value: 2 }
            ]
        });
    });

    after(() => {
        cy.logout();
    });
});