/**
 * Centralized SQL Queries
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
    'system.permissions': `SELECT * FROM mis_permissions WHERE categoryid = ? AND slug = ?`
}