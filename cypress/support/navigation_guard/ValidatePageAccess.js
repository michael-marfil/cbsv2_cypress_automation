import GetHelper from '@support/helpers/GetHelper';
/**
 * Validates user permissions before navigating to page
 * 
 * This function checks if the current user has the required permission level
 * for a specific page/feature. It sets a Cypress environment flag that controls
 * whether navigation should be done via direct URL visit or UI interaction.
 * 
 * 
 * @param {string|object} permission - Permission identifier in format:
 *   - String: "permissionID-level" (e.g., "1303-1")
 *   - Object: { permissionID: "1303", level: 1 }
 * 
 * @returns {Cypress.Chainable} - Returns a Cypress chainable for use with .then()
 * 
 * @example
 * // Usage in page object methods:
 * beforeEnter('1303-1').then(() => {
 *   cy.navigateTo('page-to-access/visit');
 * });
 * 
 * @author Michael
 */
export function beforeEnter(permission) {
    // handle and parse given permission
    const parsed = (() => {
		if (typeof permission === 'string') {
		    const [permissionID, levelStr] = permission.split('-');
			return { permissionID, level: Number(levelStr || 0) };
		}
		if (permission && typeof permission === 'object') {
			return {
				permissionID: String(permission.permissionID || ''),
				level: Number(permission.level || 0),
			};
		}
		return { permissionID: '', level: 0 }; // fallback if invalid input
	})();

    // extract categoryid and construct slug from parsed permission
    const categoryid = parsed.permissionID;
    const slug = `${parsed.permissionID}-${parsed.level}`;

    // assign username from user credential
    const { username } = GetHelper.get_user_credentials();
    
    return GetHelper.permissions(categoryid, slug).then((permissions) => { // get permission details from database using category and slug
        const permissionid = permissions.permissionid;
        cy.wrap(permissionid).as('permissionid');
    }).then(() => {
        return GetHelper.get_employee(username).then((employeedata) => { // get employee data using username (specifically for employeeid)
        const employeeid = employeedata.employeeid; 
            return cy.get('@permissionid').then((permissionid) => {
                return GetHelper.get_employee_userright(employeeid, permissionid).then((result) => {
                    // Normalize the query result to a number, handling various inconsistent shapes returned by the MySQL driver:
                    // - Tries result.employee_userright first (ideal case when alias works)
                    // - Falls back to result.count (common when COUNT(*) is returned as 'count')
                    // - Falls back to result directly (in case the driver returns just the raw number, e.g., 1 or 0)
                    // - Defaults to 0 if result is null/undefined/empty
                    // Number() converts strings like "1" to actual numbers and handles invalid cases safely
                    const userRight = Number(
                        result?.employee_userright ?? 
                        result?.count ?? 
                        result ?? 
                        0
                    );

                    // Convert the numeric user right into a boolean:
                    // - Any value > 0 means the employee has the permission
                    // - 0 or falsy means no access
                    const hasAccess = userRight > 0;

                    Cypress.env('nav-direct-visit-once', hasAccess); // store the boolean flag in Cypress environment for one-time use
                });
            });
        });
    });
}