// ** USER RIGHT PERMISSIONS ** //
import getHelper from '@support/helpers/GetHelper';
let employee;

Cypress.Commands.add('permissions', ({
    userPermissions
}) => {
    // get user credential
    const { username } = getHelper.get_user_credentials();
    cy.intercept('POST', '**/administration/user_right_per_employee/update_employee_permission').as('updatePermission');
    // Intercept for employee autocomplete search
    cy.intercept('GET', '**/vue-autocomplete/employees/**').as('employeeSearch');
    return cy.task('query', {
        sql: `SELECT firstname, lastname, employeeid, branchid 
                  FROM general_employees 
                  WHERE username = ?`,
        values: [username]
    }).then(([emp]) => {
        if (!emp) throw new Error(`Employee ${username} not found`);
        employee = emp;

        // save permissions for global use
        cy.navigateTo('administration.userrights.userright-per-employee');

        cy.get('.v-card.table-card:visible').find('section:visible').then(($section) => {
            cy.wrap($section)
                .find('input:visible')
                .click()
                .type(username, { delay: 100 });

            cy.wait('@employeeSearch').its('response.statusCode').should('eq', 200);
            cy.get('.v-menu__content:visible').within(() => {
                cy.get('.v-list-item:visible')
                    .contains(employee.employeeid)
                    .should('be.visible')
                    .click({ force: true });
            });

            cy.get('.v-data-table:visible')
                .find('tbody')
                .find('tr')
                .as('permission-table-row');

            if (!userPermissions) {
                cy.log('SKIPPING: userPermissions is not defined.');
            } else {
                // loop through userPermissions to check/uncheck permissions dynamically
                userPermissions.forEach(({ permissionID, level, hasAccess }) => {
                    cy.get('@permission-table-row')
                        .find('td')
                        .contains(`${permissionID} - Lvl ${level}`)
                        .scrollIntoView({ easing: 'linear', duration: 1000, offset: { top: -200 } })
                        .should('be.visible')
                        .parent()
                        .within(() => {
                            cy.get('input[type="checkbox"]').realHover({ scrollBehavior: false }).then(($checkbox) => {
                                const isChecked = $checkbox.prop('checked');

                                if (isChecked !== hasAccess) {
                                    cy.wrap($checkbox).click({ force: true, timeout: 10000 }); // force click just in case it's hidden by css

                                    // Wait for state to actually change
                                    cy.wrap($checkbox).should(hasAccess ? 'be.checked' : 'not.be.checked');
                                }
                            });
                        });
                });
            }

            // then update rights
            cy.then(() => {
                cy.wrap($section)
                    .contains('button', 'Update Rights')
                    .should('be.visible')
                    .click();

                cy.wait('@updatePermission').its('response.statusCode').should('eq', 200);
            });
        });
    });
});