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
    getOne(key, params) {
        return this.query(key, params).then(rows => (rows.length ? rows[0] : null));
    }

    // returns all rows
    getAll(key, params) {
        return this.query(key, params);
    }

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
    
}

export const db = new Database();