/**
 * Centralized SQL Queries
 *
 * Organized by operation type (SELECT, UPDATE, INSERT, DELETE)
 * 
 * Exports named SQL query strings for database operations.
 * Use with db utility: e.g., db.query(sql['system.systemdate'], [branchId])
 *
 * Keys follow 'category.query' format.
 * All queries use ? placeholders for parameters (prevents SQL injection).
 *
 * @author Michael
 */
export const sql = {
    /**
     * SELECT QUERIES
     */
    select: {
        // ------ SYSTEM ------ //
        'system.systemdate': `SELECT DATE_FORMAT(DATE_ADD(MAX(dateclosed), INTERVAL 1 DAY), '%Y-%m-%d') AS systemdate
            FROM general_systemdate
            WHERE branchid = ? AND managerapproverid > 0`,

        // ------ USER ------ //
        'user.userbranchid': `SELECT userbranchid FROM general_employees WHERE username = ?`,

        // ------ EMPLOYEE ------ //
        'employee.data': `SELECT * FROM general_employees WHERE username = ?`,
        'employee.user-right': `SELECT COUNT(*) AS employee_userright FROM mis_employee_userrights WHERE employeeid = ? AND permissionid = ?`,

        // ------ PERMISSIONS ------ //
        'system.permissions': `SELECT * FROM mis_permissions WHERE categoryid = ? AND slug = ?`,

        /**
         * ACCOUNTING
         */
        // GL Accounts
        'accounting.glaccount': `SELECT * FROM acctng_glaccounts WHERE glchildcount = 0 ORDER BY RAND() LIMIT ?`,

        /**
         * LENDING
         */
        // Loan Product Settings
        'lending.loanproductsettings': `SELECT * FROM lending_loanproducts WHERE NAME = ?`,
        // Loan Purpose
        'lending.loanpurpose': `SELECT loanpurposeid, name FROM lending_loanpurpose WHERE childcount = 0 ORDER BY RAND() LIMIT 1`,
        // Loan Class
        'lending.loanclass': `SELECT 
                lp.loanpurposeid, 
                lp.name AS purpose_name,
                lc.loanclassid,
                lc.name AS classification_name,
                li.industryname AS industry_name
            FROM lending_loanpurpose lp
            INNER JOIN lending_loanclassperpurpose lcpp 
                ON lp.loanpurposeid = lcpp.loanpurposeid
            INNER JOIN lending_loanclassifications lc 
                ON lcpp.loanclassid = lc.loanclassid
            INNER JOIN lending_industryperloanclass lipc
                ON lc.loanclassid = lipc.loanclassid
            INNER JOIN lending_industries li
                ON lipc.industryid = li.industryid
            WHERE lp.loanpurposeid = ?
            ORDER BY RAND() 
            LIMIT 1`,
        // Loan Security
        'lending.loansecurity': `SELECT * FROM lending_loansecurities ORDER BY RAND() LIMIT 1`,
            
        /**
         * CASA
         */
        // Product Settings
        'casa.productsettings': `SELECT productid, productname FROM savings_products WHERE productname = ? ORDER BY productid DESC LIMIT 1`,

        /**
         * GENERAL
         */
        // Clients
        'general.clients': `SELECT clientid,
            CONCAT(firstname, ' ', LEFT(middlename, 1), '.', ' ', lastname) AS accountname 
            FROM general_clients 
            WHERE firstname = ? AND middlename = ? AND lastname = ?`,
        // Employees
        'general.employees': `SELECT employeeid FROM general_employees ORDER BY RAND() LIMIT 1`,
        // Co Borrower
        'general.co-borrower': `SELECT clientid FROM general_clients ORDER BY RAND() LIMIT 1`,
        // Co Maker
        'general.co-maker': `SELECT clientid FROM general_clients ORDER BY RAND() LIMIT 1`
    }

    /**
     * UPDATE QUERIES
     */

    /**
     * INSERT QUERIES
     */

    /**
     * DELETE QUERIES
     */
}