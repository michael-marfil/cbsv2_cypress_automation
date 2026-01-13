import Api from '@support/commands/api';

/**
 * Seeder: Client
 * 
 * Creates a new client with default values and optional overrides
 * 
 * @param {Object} [overrides={}] - optional overrides for any payload field
 * @example - cy.seedClient({ lastName: 'Doe', firstName: 'John' });
 * @example - cy.seedClient({ birthDate: '05/15/1995', genderType: 2 });
 * 
 * @author Michael
 */

Cypress.Commands.add('seedClient', (overrides = {}) => {
    const defaultBarangay = {
        addressid: 17843,
        code: "050502035",
        name: "Salugan",
        town: "Camalig",
        province: "Albay",
        region: "V Bicol",
        addresscomplete: "Salugan, Camalig, Albay",
        level: 4,
        parent: 17811,
        level_psgc: "b",
        code_parent: "050502000",
        zipcode: "4502",
        isHighRisk: 0
    };

    const riskProfileArray = {  
        "1": {
            index: 1,
            criteria: "RESIDENCE",
            low: "Within the bank service area/near the branch OR adjacent municipalities less than 30 km away from the branch",
            normal: "Adjacent municipalities more than 30 km away from the branch",
            high: "High-risk areas (as defined by FATF or local authorities)",
            extreme: "Unknown"
        },
        "2": {
            index: 2,
            criteria: "NATIONALITY/COUNTRY OF ORIGIN",
            low: "Philippines",
            normal: "Other countries",
            high: "Countries with significant AML concerns, including sanctioned countries, countries with high corruption indices, or countries with weak AML controls",
            extreme: "Unknown"
        },
        "3": {
            index: 3,
            criteria: "BUSINESS ACTIVITIES",
            low: "Corporate Accounts like Banking Institutions, GOCCs, and Micro Businesses",
            normal: "Small and Medium Enterprises",
            high: "Online Gaming, Gambling Entities, Pawnshops, Money Changers, Foreign Exchange Dealers, Remittance Agents, NGOs, Non-Profit or Civic Organizations, Foundations",
            extreme: "Unknown"
        },
        "4": {
            index: 4,
            criteria: "SOURCE OF FUND",
            low: "Retirement pay, personal savings, payroll accounts, pensioners, accounts with expected low balance and slow-moving transactions",
            normal: "Business",
            high: "Unknown or inconsistent sources, large cash deposits, or sources linked to high-risk activities",
            extreme: "Unknown"
        },
        "5": {
            index: 5,
            criteria: "POLITICALLY EXPOSED PERSONS (PEPS)",
            low: "Elected officials below the level of Governor/Not a Public Official",
            normal: "",
            high: "Elected officials at the level of Governor up, and Heads of Government Departments and Offices",
            extreme: "Unknown"
        },
        "6": {
            index: 6,
            criteria: "AMOUNT OF TRANSACTIONS",
            low: "< P500,000.00",
            normal: ">P500,000.00 to P10,000,000.00",
            high: ">P10,000,000.00",
            extreme: "Unknown"
        },
        "7": {
            index: 7,
            criteria: "LINKED ACCOUNTS",
            low: "None",
            normal: "With 1 link",
            high: "With 2 or more links",
            extreme: "Unknown"
        },
        "8": {
            index: 8,
            criteria: "WATCHLIST",
            low: "None",
            normal: "",
            high: "Listed individuals and entities",
            extreme: "Unknown"
        },
        "9": {
            index: 9,
            criteria: "PRODUCT OR SERVICES",
            low: "Savings, SSA, E-money or Cash Cards",
            normal: "Current Account/s",
            high: "International Wire Transfer, E-Banking Services (Accounts managed by Partners)",
            extreme: "Unknown"
        }
    };

    const payload = {
        data: {
            clientType: 1,
            riskProfile: null,
            lastName: overrides.lastName,
            firstName: overrides.firstName,
            middleName: overrides.middleName,
            birthDate: overrides.birthDate || "01/01/1990",
            birthPlace: overrides.birthPlace || "camalig",
            genderType: overrides.genderType || 1,
            civilStatusType: overrides.civilStatusType || 1,
            nationality: overrides.nationality || "608",
            cpNumber1: overrides.cpNumber1 || "",
            cpNumber2: overrides.cpNumber2 || "",
            presentAddress: {
                barangay: overrides.presentAddress?.barangay || defaultBarangay
            },
            permanentAddress: {
                barangay: overrides.permanentAddress?.barangay || defaultBarangay
            },
            emergencyContacts: overrides.emergencyContacts || {},
            mandatoryID: {
                type: 0,
                ...overrides.mandatoryID
            },
            secondaryID: overrides.secondaryID || {},
            riskCategoryType: overrides.riskCategoryType || 1,
            vip: overrides.vip !== undefined ? overrides.vip : true,
            otherInfo: {
                sourceOfFund: 0,
                spouse: {},
                ...overrides.otherInfo
            },
            beneficiaries: {
                beneficiariesData: [],
                insuredRelatives: [
                    {
                        birthDate: null,
                        skip: true
                    }
                ],
                ...overrides.beneficiaries
            },
            loanInfoSms: {
                enrollAutoSMS: false,
                assetSize: 1,
                ...overrides.loanInfoSms
            },
            riskProfileArray: overrides.riskProfileArray || riskProfileArray,
            riskProfileDetails: {
                details: {
                    "1": 0,
                    "2": 0,
                    "3": 0,
                    "4": 0,
                    "5": 0,
                    "6": 0,
                    "7": 0,
                    "8": 0,
                    "9": 0
                },
                riskNarration: null,
                ...overrides.riskProfileDetails
            },
            lendingCenters: overrides.lendingCenters || [
                {
                    text: " ",
                    value: 0
                },
                {
                    text: "1 - Happy",
                    value: 120603
                },
                {
                    text: "3 - LRA_050",
                    value: 120605
                },
                {
                    text: "4 - Mapagmahal",
                    value: 120606
                }
            ],
            centercounter: overrides.centercounter || 4,
            beneficiaryRelationship: overrides.beneficiaryRelationship || 0,
            principalClient: overrides.principalClient || null
        },
        riskProfile: overrides.riskProfile || 0
    };

    return Api.api_post('/client-management/add', payload).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        
        cy.log(`Client Added Successfully!`);
    });
});