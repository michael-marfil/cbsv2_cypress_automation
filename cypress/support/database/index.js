import { sql } from '@database/queries';

class Database {
    constructor() {
        this.cache = new Map();
    }

    // return Cypress chain of rows
    query(key, params = []) {
        const template = sql[key];
        if (!template) throw new Error(`Unknown SQL key: ${key}`)

        const values = Array.isArray(params) ? params : [params];

        return cy.task('query', { sql: template, values }, { log: false });
    }

    getOne(key, params) {
        return this.query(key, params).then(rows => (rows.length ? rows[0] : null));
    }

    getAll(key, params) {
        return this.query(key, params);
    }

    //
    userbranch(username) {
        return this.getOne('user.userbranchid', username).then(row => row?.userbranchid ?? null);
    }
    
}

export const db = new Database();