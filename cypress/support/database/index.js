import { sql } from '@database/queries';
import GetHelper from '@support/helpers/GetHelper';

/**
 * Database Utility for Cypress Tests
 *
 * Singleton wrapper for executing SQL queries via Cypress task 'query'.
 * Uses queries from @database/queries.
 *
 * Main methods:
 * - query(key, params = []): Executes query, returns Cypress chain of rows.
 *   Throws if key not found. Normalizes params to array.
 *
 * Usage: import { db } from '@/database';
 * db.systemdate().then(date => cy.log(date));
 *
 * Note: All methods return Promises/chains – use .then() or await in cy.then().
 * Cache Map exists but currently unused.
 * 
 * @author Michael
 */
class Database {
    constructor() {
        this.cache = new Map();

        // --- ACTION WRAPPERS ---
        // Core database operation methods that wrap the query function
        const action = {
            // returns first row or null
            getOne(key, ...params) {
                return this.query(key, params).then(rows => (rows.length ? rows[0] : null));
            },

            // returns all rows
            getAll(key, ...params) {
                return this.query(key, params);
            },

            // executes INSERT and returns inserted row
            insertOne(key, ...params) {
                return this.query(key, params).then(rows => (rows.length ? rows[0] : null));
            },

            // executes INSERT multiple rows
            insertAll(key, ...params) {
                return this.query(key, params);
            },

            // executes DELETE and returns affected rows count or result
            deleteAll(key, ...params) {
                return this.query(key, params);
            }
        }

        // Assign actions to the instance
        Object.assign(this, action);
    }

    // executes query and returns Cypress chain of rows
    query(key, params = []) {
        // parse operation type and query key
        const [operation, ...keyParts] = key.split('.');
        const queryKey = keyParts.join('.');

        // access nested query structure
        const template = sql[operation]?.[queryKey];
        if (!template) throw new Error(`Unknown SQL key: ${key}`);

        const values = Array.isArray(params) ? params : [params];

        return cy.task('query', { sql: template, values }, { log: false });
    }

    // --- SPECIFIC QUERY WRAPPERS ---
    // Developers: Add your new query helper methods below this line,
    // which should wrap existing SQL queries using getOne/getAll/query.

    // ------ SELECT OPERATIONS ------

    /**
     * @returns system date string for given branch (or null if none)
     */
    systemdate(branchid) {
        return this.getOne('select.system.systemdate', branchid).then(row => row?.systemdate ?? null);
    }

    /**
     * @returns branch ID for given username (or null if none)
     */
    userbranch(username) {
        return this.getOne('select.user.userbranchid', username).then(row => row?.userbranchid ?? null);
    }

    /**
     * @returns username for given fullname (or null if none)
     */
    usernameByFullName(firstname, middlename, lastname) {
        return this.getOne('select.user.usernamebyfullname', firstname, middlename, lastname).then(row => row ?? null);
    }

    /**
     * @returns employee's data for given username (or null if none)
     */
    employee(username) {
        return this.getOne('select.employee.data', username).then(row => row ?? null);
    }

    /**
     * @returns employee's user-rights for given employeeid and permissionid(or null if none)
     */
    employee_userright(employeeid, permissionid) {
        return this.getOne('select.employee.user-right', employeeid, permissionid).then(row => row?.employee_userright ?? null);
    }

    /**
     * @returns list of permissions (or null if none)
     */
    permissions(categoryid, slug) {
        return this.getOne('select.system.permissions', categoryid, slug).then(row => row ?? null);
    }

    /**
     * @returns list of GL accounts (or null if none)
     */
    glaccounts(limit = 1) {
        return this.getAll('select.accounting.glaccount', limit);
    }

    /**
     * @returns loan product settings for given loan product name (or null if none)
     */
    loan_product(loanproductname) {
        if (loanproductname === null || loanproductname === undefined) {
            return cy.task('query', `SELECT loanproductid, name, shortname FROM lending_loanproducts ORDER BY RAND() LIMIT 1`, { log: false })
                .then(rows => rows && rows.length > 0 ? rows[0] : null);
        }
        return this.getOne('select.lending.loanproductsettings', loanproductname).then(row => row ?? null);
    }

    /**
     * @returns laon product to use for given userbranch and loanproductid (or null if none)
     */
    loan_product_to_use(userbranch, loanproductid) {
        if (loanproductid === null || loanproductid === undefined) {
            return cy.task('query', `SELECT * FROM lending_loanproductstouse WHERE branchid = ${userbranch}`, { log: false })
                .then(rows => rows && rows.length > 0 ? rows : null);
        }
        return this.getOne('select.lending.loanproducttouse', userbranch, loanproductid).then(row => row ?? null);
    }

    /**
     * @param {number|null} loanpurposeid - Optional loan purpose ID
     * @returns loan purpose data
     */
    loan_purpose(loanpurposeid = null) {
        if (loanpurposeid) {
            return cy.task('query', `SELECT name FROM lending_loanpurpose WHERE loanpurposeid = ${loanpurposeid}`, { log: false })
                .then(rows => rows && rows.length > 0 ? rows[0] : null);
        }
        return this.getOne('select.lending.loanpurpose').then(row => row ?? null);
    }

    /**
     * @param {number|null} loanpurposeid 
     * @returns loan class data
     */
    loan_class(loanpurposeid) {
        return this.getOne('select.lending.loanclass', loanpurposeid).then(row => row ?? null);
    }

    /**
     * @returns random loan security
     */
    loan_security() {
        return this.getOne('select.lending.loansecurity').then(row => row ?? null);
    }

    /**
     * @returns random client group id
     */
    client_group(clientgroupid = null) {
        if (clientgroupid) {
            return cy.task('query', `SELECT name FROM lending_clientgroup WHERE clientgroupid = ${clientgroupid}`, { log: false })
                .then(rows => rows && rows.length > 0 ? rows[0] : null);
        }
        return this.getOne('select.lending.clientgroup').then(row => row ?? null);
    }

    /**
     * @returns latest pnid for loan application
     */
    loan_details(clientid, loanproductid, amount) {
        return this.getOne('select.lending.loandetails', clientid, loanproductid, amount).then(row => row ?? null);
    }

    /**
     * @returns product settings for given product name (or null if none)
     */
    savings_product(productname, productid) {
        if (productname === null && productid) {
            return cy.task('query', `SELECT * FROM savings_products WHERE productid = ${productid}`, { log: false })
                .then(rows => rows && rows.length > 0 ? rows[0] : null);
        }
        return this.getOne('select.casa.productsettings', productname).then(row => row ?? null);
    }

    /**
     * @returns savings product to use for given userbranch and productid (or null if none)
     */
    savings_product_to_use(userbranch, savingsproductid) {
        return this.getOne('select.casa.producttouse', userbranch, savingsproductid).then(row => row ?? null);
    }

    /**
     * @returns total count of savings accounts for given productid and accountname
     */
    check_savings_account(productid, accountname) {
        return this.getOne('select.casa.checksavingsaccount', productid, accountname).then(row => row ?? null);
    }

    /**
     * @returns list of clients matching given names (or null if none)
     */
    clients(firstname, middlename, lastname) {
        if ((firstname === null || firstname === undefined) && 
            (middlename === null || middlename === undefined) && 
            (lastname === null || lastname === undefined)) {

            return GetHelper.userbranch().then(userbranch => {
                return cy.task('query', {
                    sql: 'SELECT clientid FROM general_clients WHERE branchid != ? ORDER BY RAND() LIMIT 1',
                    values: [userbranch]
                }, { log: false });
            }).then(rows => rows && rows.length > 0 ? rows[0] : null);
        }
        
        return this.getOne('select.general.clients', firstname, middlename, lastname).then(row => row ?? null);
    }

    /**
     * @returns list of random employees (loan officer)
     */
    loan_officer() {
        return this.getOne('select.general.employees').then(row => row ?? null);
    }

    /**
     * @returns clientid (for coborrower)
     */
    co_borrower() {
        return this.getOne('select.general.co-borrower').then(row => row ?? null);
    }

    /**
     * @returns clientid (for comaker)
     */
    co_maker() {
        return this.getOne('select.general.co-maker').then(row => row ?? null);
    }

    /**
     * @returns latest created username (or null if none)
     */
    getLatestUsername() {
        return this.getOne('select.user.latest').then(row => row?.username ?? null);
    }

    /**
     * @returns user count for given fullname (or 0 if none)
     */
    getUserCountByFullName(firstname, middlename, lastname) {
        return this.getOne('select.user.countbyfullname', firstname, middlename, lastname).then(row => row?.count || 0);
    }

    /**
     * @returns employeeid for given username (or null if none)
     */
    getEmployeeByUsername(username) {
        return this.getOne('select.user.employeebyusername', username).then(row => row?.employeeid ?? null);
    }

    /**
     * @returns employeeid and activitylog for given username (or null if none)
     */
    getEmployeeActivityByUsername(username) {
        return this.getOne('select.user.employeeactivitybyusername', username).then(row => row ?? null);
    }

    // ------ UPDATE OPERATIONS ------

    /**
     * @resets user login attempts and activates account
     */
    resetUserLoginAttempts(username) {
        return this.query('update.user.resetattempts', username);
    }

    /**
     * @sets the activity log for a user
     */
    setUserActivityLog(activitylog, employeeid) {
        return this.query('update.user.setactivitylog', [activitylog, employeeid]);
    }

    /**
     * @resets the activity log for a user
     */
    resetUserActivityLog(employeeid) {
        return this.query('update.user.resetactivitylog', employeeid);
    }

    /**
     * @sets the password change date for a user
     */
    setUserPasswordChangeDate(date, employeeid) {
        return this.query('update.user.setpasswordchangedate', [date, employeeid]);
    }

    /**
     * @sets user status to on vacation leave
     */
    setUserOnVacation(employeeid) {
        return this.query('update.user.setonvacation', employeeid);
    }

    /**
     * @resets user vacation leave status
     */
    resetUserVacation(employeeid) {
        return this.query('update.user.resetvacation', employeeid);
    }
    
    /**
     * @sets the session timeout value in general_settings
     */
    setSessionTimeout(value) {
        return this.query('update.settings.sessiontimeout', value);
    }

    // ------ INSERT OPERATIONS ------

    /**
     * @insert loan product to loan product to use
     */
    insert_loan_product_to_use(userbranch, loanproductid) {
        // if loanproductid is an array, insert multiple rows
        if (Array.isArray(loanproductid)) {
            return this.insertAll('insert.lending.loanproducttouse', userbranch, loanproductid);
        }
        // otherwise, insert single row
        return this.insertOne('insert.lending.loanproducttouse', userbranch, loanproductid);
    }

    /**
     * @insert savings product to savings product to use
     */
    insert_savings_product_to_use(userbranch, savingsproductid) {
        // if savingsproductid is an array, insert multiple rows
        if (Array.isArray(savingsproductid)) {
            return this.insertAll('insert.casa.producttouse', userbranch, savingsproductid);
        }
        // otherwise, insert single row
        return this.insertOne('insert.casa.producttouse', userbranch, savingsproductid);
    }

    // ------ DELETE OPERATIONS ------
    /**
     * @delete loan product to use
     */
    delete_loan_product_to_use(userbranch) {
        return this.deleteAll('delete.lending.loanproducttouse', userbranch);
    }
}

export const db = new Database();