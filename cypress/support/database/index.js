import { sql } from '@database/queries';

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
    }

    // executes query and returns Cypress chain of rows
    query(key, params = []) {
        const template = sql[key];
        if (!template) throw new Error(`Unknown SQL key: ${key}`)

        const values = Array.isArray(params) ? params : [params];

        return cy.task('query', { sql: template, values }, { log: false });
    }

    // returns first row or null
    getOne(key, ...params) {
        return this.query(key, params).then(rows => (rows.length ? rows[0] : null));
    }

    // returns all rows
    getAll(key, ...params) {
        return this.query(key, params);
    }

    // --- SPECIFIC QUERY WRAPPERS ---
    // Developers: Add your new query helper methods below this line,
    // which should wrap existing SQL queries using getOne/getAll/query.

    /**
     * @returns system date string for given branch (or null if none)
     */
    systemdate(branchid) {
        return this.getOne('system.systemdate', branchid).then(row => row?.systemdate ?? null);
    }

    /**
     * @returns branch ID for given username (or null if none)
     */
    userbranch(username) {
        return this.getOne('user.userbranchid', username).then(row => row?.userbranchid ?? null);
    }

    /**
     * @returns employee's data for given username (or null if none)
     */
    employee(username) {
        return this.getOne('employee.data', username).then(row => row ?? null);
    }

    /**
     * @returns employee's user-rights for given employeeid and permissionid(or null if none)
     */
    employee_userright(employeeid, permissionid) {
        return this.getOne('employee.user-right', employeeid, permissionid).then(row => row?.employee_userright ?? null);
    }

    /**
     * @returns list of permissions (or null if none)
     */
    permissions(categoryid, slug) {
        return this.getOne('system.permissions', categoryid, slug).then(row => row ?? null);
    }

    /**
     * @returns list of GL accounts (or null if none)
     */
    glaccounts(limit = 1) {
        return this.getAll('accounting.glaccount', limit);
    }

    /**
     * @returns loan product settings for given loan product name (or null if none)
     */
    loan_product(loanproductname) {
        return this.getOne('lending.loanproductsettings', loanproductname).then(row => row ?? null);
    }

    /**
     * @returns product settings for given product name (or null if none)
     */
    savings_product(productname) {
        return this.getOne('casa.productsettings', productname).then(row => row ?? null);
    }

    /**
     * @returns list of clients matching given names (or null if none)
     */
    clients(firstname, middlename, lastname) {
        return this.getAll('general.clients', firstname, middlename, lastname);
    }
}

export const db = new Database();