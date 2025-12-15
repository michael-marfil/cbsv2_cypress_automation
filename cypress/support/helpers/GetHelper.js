import { db } from '@database';

/**
 * GetHelper
 * ----------------------------------------------------------------------
 * Purpose:
 * Acts as an abstraction layer between Cypress tests and the backend database.
 * It centralizes the logic for retrieving user context like user credentials, etc.
 *
 * Usage:
 * - Imported as a singleton instance.
 * - Methods return Cypress Chains/Promises (due to database interactions).
 * - Utilizes Cypress.env for default user context but allows overrides.
 *
 * Dependencies:
 * - @database: Custom DB module for direct SQL execution.
 * - Cypress.env: Relies on 'username' and 'password' being set in cypress.config.
 * 
 * @author Michael
 */
class GetHelper {
    /**
     * Retrieves the current environment's login credentials.
     * @returns {{username: string, password: string}} Object containing credentials from Cypress.env
     */
    get_user_credentials() {
        return { username: Cypress.env('username'), password: Cypress.env('password') }
    }

    /**
     * Fetches the specific Branch ID assigned to a user from the database.
     * @param {string} [username] - Defaults to the environment username if not provided.
     * @returns {Cypress.Chainable<number>} The UserBranch ID.
     */
    userbranch(username = Cypress.env('username')) {
        return db.userbranch(username);
    }

    /**
     * Retrieves the System Date.
     * If `branchid` is null, it resolves the user's default branch first.
     * * @param {string} [username] - Used to look up branch if ID is unknown.
     * @param {number|null} [branchid] - Specific branch ID override.
     * @returns {Cypress.Chainable<string|Date>}
     */
    systemdate(username = Cypress.env('username'), branchid = null) {
        return this.userbranch(username).then(userbranchid => {
            const userbranch = branchid != null ? branchid : userbranchid;

            return db.systemdate(userbranch);
        });
    }

    /**
     * Fetches the employee's data from db
     * @param {string} [username] - Defaults to the environment username if not provided.
     * @returns {Cypress.Chainable<>} employee data row
     */
    get_employee(username = Cypress.env('username')) {
        return db.employee(username);
    }

    /**
     * Fetches if employee has a user-right based on permissionid
     * @param {string, number} [employeeid,permissionid] - Defaults to the environment username if not provided.
     * @returns {Cypress.Chainable<>} if employee has that specific user-right permission
     */ 
    get_employee_userright(employeeid = null, permissionid = null) {
        if (employeeid === null && permissionid === null) {
            throw new Error('Employee ID or Permission ID is null.');
        }

        return db.employee_userright(employeeid, permissionid);
    }

    /**
     * Fetches permission list
     * @param {string} [categoryid,slug]
     * @returns {Cypress.Chainable<>} permissions row
     */ 
    permissions(categoryid, slug) {
        return db.permissions(categoryid, slug);
    }

}

export default new GetHelper();