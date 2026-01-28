// ==================== HELPER FUNCTIONS ====================

// Common selectors
const SELECTORS = {
    username: '#username',
    password: '#password',
    changePasswordBtn: '.container > .v-btn > .v-btn__content'
};

// Helper: Attempt login with username and password
const attemptLogin = (username, pwd, options = {}) => {
    const { delay = 100, logPassword = true } = options;
    cy.get(SELECTORS.username).clear().type(username, { delay });
    cy.get(SELECTORS.password).clear().type(pwd, { delay, log: logPassword }).type('{enter}');
};

// Helper: Fill change password form
const fillChangePasswordForm = (username, oldPwd, newPwd, options = {}) => {
    const { delay = 100, visible = true } = options;
    const visibleSelector = visible ? ':visible' : '';
    
    cy.get(`.d-flex${visibleSelector}`, { timeout: 60000 }).contains('Username')
        .parent().find('input').clear({ force: true }).type(username, { delay, log: false });
    
    cy.get(`.d-flex${visibleSelector}`, { timeout: 60000 }).contains('Old Password')
        .parent().find('input').type(oldPwd, { delay });
    
    cy.get(`.d-flex${visibleSelector}`, { timeout: 60000 }).contains('New Password')
        .parent().find('input').type(newPwd, { delay, log: false }).type('{enter}');
    
    cy.get(`.d-flex${visibleSelector}`, { timeout: 60000 }).contains('Confirm Password')
        .parent().find('input').type(newPwd, { delay, log: false }).type('{enter}');
    
    cy.get(`${SELECTORS.changePasswordBtn}${visibleSelector}`, { timeout: 60000 })
        .contains('Change Password').click();
};

// Helper: Get Philippine DateTime (UTC+8)
const getPhilippineDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 8);
    return now.toISOString().slice(0, 19).replace('T', ' ');
};

// Helper: Fill user creation form
const fillUserCreationForm = (firstname, middlename, lastname) => {
    cy.get('td').contains('Create_Table').click();
    cy.get('td').contains('Firstname').parent().find('input').clear().type(firstname, { delay: 100 });
    cy.get('td').contains('Middlename').parent().find('input').clear().type(middlename, { delay: 100 });
    cy.get('td').contains('Lastname').parent().find('input').clear().type(lastname, { delay: 100 });
};

// Helper: Submit user creation
const submitUserCreation = () => {
    cy.get('td:visible', { timeout: 60000 }).contains('Submit').click();
    cy.get('td:visible', { timeout: 60000 }).contains('Create').click();
    // cy.wait(2000); // Ensures database update
};

// Helper: Fetch latest username from database
const fetchLatestUsername = () => {
    return cy.task('query', "SELECT username FROM general_employees ORDER BY employeeid DESC LIMIT 1;")
        .then((result) => result[0]?.username || 'defaultUser');
};

// ==================== COMMANDS ====================

//** Scenario for LogIn Invalid Credentials after create user account */
Cypress.Commands.add("LoginInvalidCredentials", ({ firstname, middlename, lastname, incorrectPassword }) => {
    cy.visit('/maintenance/create_admin_user');
    
    fillUserCreationForm(firstname, middlename, lastname);
    submitUserCreation();

    fetchLatestUsername().then((latestUsername) => {
        cy.log(`Fetched Username: ${latestUsername}`);
        cy.get(SELECTORS.username).should('be.visible');
        attemptLogin(latestUsername, incorrectPassword);
    });
});


//** Scenario for LogIn Valid Credentials and proceed to change the default password */
Cypress.Commands.add("LoginValidCredentials", () => {
    // Get user data from Cypress environment variables
    const { firstname, middlename, lastname, password } = Cypress.env('newUser');

    cy.visit('/maintenance/create_admin_user');
    fillUserCreationForm(firstname, middlename, lastname);

    // Check if user already exists
    cy.task('query', `
        SELECT COUNT(*) AS count FROM general_employees
        WHERE firstname = '${firstname}' AND middlename = '${middlename}' AND lastname = '${lastname}'
    `, { log: false })
    .then((result) => {
        if ((result[0]?.count || 0) > 0) {
            cy.log(`User "${firstname} ${middlename} ${lastname}" already exists. Skipping creation.`);
            cy.visit('/login');
            return;
        }

        submitUserCreation();

        fetchLatestUsername().then((latestUsername) => {
            cy.log(`Fetched Username: ${latestUsername}`);

            // Save credentials
            cy.writeFile('cypress/fixtures/create-user-credential/userCredentials.json', {
                username: latestUsername,
                password: password
            });

            // Login with default password (username = password)
            cy.get(`${SELECTORS.username}:visible`, { timeout: 60000 }).should('be.visible');
            attemptLogin(latestUsername, latestUsername, 
                // { logPassword: false }
            );

            // Change password
            fillChangePasswordForm(latestUsername, latestUsername, password);
        });
    });
});

//** Scenario for LogIn on 1st Attempt */
Cypress.Commands.add("LoginSuccedingOn1stAttempt", () => {
    cy.getCredentials().then(({ username, password }) => {
        cy.log(`Logging in with username: ${username}`);
        cy.visit('/login');
        attemptLogin(username, password);
        cy.url().should("not.include", "/login");
    });
});

//** Scenario for LogIn with N Incorrect Password Attempts then Success
// * @param {number} attempts - Number of incorrect attempts before correct login (0-3)
// * @param {string} incorrectPassword - The incorrect password to use
// * @param {boolean} resetAfter - Whether to reset user account after test (for 3 attempts)
// */
Cypress.Commands.add("LoginWithIncorrectAttempts", ({ incorrectPassword, attempts = 1, resetAfter = false }) => {
    cy.getCredentials().then(({ username, password }) => {
        cy.visit('/login');

        // Make incorrect attempts
        for (let i = 0; i < attempts; i++) {
            attemptLogin(username, incorrectPassword);
        }

        // Correct login
        attemptLogin(username, password);
        cy.url().should("not.include", "/login");

        // Reset user account if needed (for blocked accounts after 3 attempts)
        if (resetAfter) {
            cy.task('query', `
                UPDATE general_employees
                SET attempts = '0', isactive = '1'
                WHERE username = '${username}';
            `, { log: false });
        }
    });
});

// Legacy commands - kept for backward compatibility, now use LoginWithIncorrectAttempts internally
Cypress.Commands.add("LoginSucceding1IncorrectPassword", ({ incorrectPassword }) => {
    cy.LoginWithIncorrectAttempts({ incorrectPassword, attempts: 1 });
});

Cypress.Commands.add("LoginSucceding2IncorrectPassword", ({ incorrectPassword }) => {
    cy.LoginWithIncorrectAttempts({ incorrectPassword, attempts: 2 });
});

Cypress.Commands.add("LoginSucceding3IncorrectPassword", ({ incorrectPassword }) => {
    cy.LoginWithIncorrectAttempts({ incorrectPassword, attempts: 3, resetAfter: true });
});

//** Scenario for LogIn Non RBSoftTech CBS User */
Cypress.Commands.add("LoginNonRBSoftTechCBSUser", ({ noneUsername, nonePassword }) => {
    cy.visit('/login');
    cy.get(SELECTORS.username).should('be.visible');
    attemptLogin(noneUsername, nonePassword);
});


// Helper: Test login with active session (user not logged out properly or logged from another terminal)
const testActiveSessionLogin = (expectedMessage) => {
    cy.getCredentials().then(({ username, password }) => {
        cy.task('query', `SELECT employeeid FROM general_employees WHERE username = '${username}' LIMIT 1;`, { log: false })
            .then((result) => {
                if (!result || result.length === 0) {
                    throw new Error(`No matching user found for username: ${username}`);
                }

                const employeeid = result[0].employeeid;
                const currentDateTime = getPhilippineDateTime();

                // Set active session
                cy.task('query', `UPDATE general_employees SET activitylog = '${currentDateTime}' WHERE employeeid = ${employeeid};`, { log: false })
                    .then(() => {
                        cy.visit('/login');
                        cy.get(SELECTORS.username).should('be.visible');
                        attemptLogin(username, password);
                        cy.contains(expectedMessage).should('be.visible');

                        // Reset activitylog
                        cy.task('query', `UPDATE general_employees SET activitylog = '0000-00-00 00:00:00' WHERE employeeid = ${employeeid};`, { log: false });
                    });
            });
    });
};

//** Scenario for logIn User has not Logged Out Properly */
Cypress.Commands.add("LoginUserHasNotLoggedOutProperly", () => {
    testActiveSessionLogin('User has not logged-out properly or is currently logged in other terminal.');
});

//** Scenario for User is logged from another terminal */
Cypress.Commands.add("LoginUserIsLoggedFromAnotherTerminal", () => {
    testActiveSessionLogin('User has not logged-out properly or is currently logged in other terminal.');
});
//** Scenario for logIn User's current password has already expired */
Cypress.Commands.add("LoginUserCurrentPasswordHasAlreadyExpired", () => {
    cy.getCredentials().then(({ username }) => {
        cy.readFile('cypress/fixtures/user-login/password_cycle.json').then((passwordCycle) => {
            const { passwords, currentIndex } = passwordCycle;
            const oldPassword = passwords[currentIndex];
            const newIndex = (currentIndex + 1) % passwords.length;
            const newPassword = passwords[newIndex];

            // Update password_cycle.json
            cy.writeFile('cypress/fixtures/user-login/password_cycle.json', { ...passwordCycle, currentIndex: newIndex });

            // Force password expiration
            cy.task('query', `SELECT employeeid FROM general_employees WHERE username='${username}' LIMIT 1;`)
                .then((result) => {
                    cy.task('query', `UPDATE general_employees SET passwordchangedate='2010-01-01' WHERE employeeid=${result[0].employeeid};`);
                })
                .then(() => {
                    // Login with old password
                    cy.visit('/login');
                    cy.get(SELECTORS.username).should('be.visible');
                    attemptLogin(username, oldPassword);

                    // Change password using helper
                    fillChangePasswordForm(username, oldPassword, newPassword, { visible: false });

                    // Save new credentials
                    cy.writeFile('cypress/fixtures/create-user-credential/userCredentials.json', {
                        username: username,
                        password: newPassword
                    });

                    // Re-login with new password
                    cy.get(SELECTORS.username).should('be.visible');
                    attemptLogin(username, newPassword);
                    cy.url().should("not.include", "/login");
                });

            cy.visit('/login');
        });
    });
});


//** Scenario for User is logged from another terminal */
Cypress.Commands.add("LoginUserIsLoggedFromAnotherTerminal", () => {
    cy.getCredentials().then(({ username, password }) => {
        const storedUsername = username;

        //  Fetch employeeid and check activitylog status
        cy.task('query', `SELECT employeeid, activitylog FROM general_employees WHERE username = '${storedUsername}' LIMIT 1;`, {log: false})
            .then((result) => {
                if (!result || result.length === 0) {
                    throw new Error(` No matching user found for username: ${storedUsername}`);
                }

                const employeeid = result[0].employeeid;
                //  Convert to Philippine Time (UTC+8)
                const now = new Date();
                now.setHours(now.getHours() + 8); //  Add 8 hours to match PHT
                const currentDateTime = now.toISOString().slice(0, 19).replace('T', ' '); // Full YYYY-MM-DD HH:MM:SS format

                cy.task('query', `UPDATE general_employees SET activitylog = '${currentDateTime}' WHERE employeeid = ${employeeid};`, {log: false})
                    .then(() => {
                        cy.visit('/login');
                        cy.get('#username').should('be.visible').clear().type(storedUsername);
                        cy.get('#password').should('be.visible').clear().type(password).type('{enter}');
                        cy.contains('User has not logged-out properly or is currently logged in other terminal.').should('be.visible')
                        .then(() =>{
                            cy.task('query', `UPDATE general_employees SET activitylog = '0000-00-00 00:00:00' WHERE employeeid = ${employeeid};`, {log: false})
                        })
                        ;
                    });
            });
    });
});


//** Scenario for User was on Vacation Leave */
Cypress.Commands.add("LoginUserIsOnVacationLeave", () => {
    cy.getCredentials().then(({ username, password }) => {
        cy.task('query', `SELECT employeeid FROM general_employees WHERE username = '${username}' LIMIT 1;`, { log: false })
            .then((result) => {
                if (!result || result.length === 0) {
                    throw new Error(`No matching user found for username: ${username}`);
                }

                const employeeid = result[0].employeeid;

                // Set user as on vacation leave
                cy.task('query', `UPDATE general_employees SET blockduetoleave = '1', isactive = '0' WHERE employeeid = ${employeeid};`, { log: false })
                    .then(() => {
                        cy.visit('/login');
                        cy.get(SELECTORS.username).should('be.visible');
                        attemptLogin(username, password);

                        cy.contains('Account Blocked. Please contact your system administrator for more info.')
                            .should('be.visible')
                            .then(() => {
                                // Reset vacation leave status
                                cy.task('query', `UPDATE general_employees SET blockduetoleave = '0', isactive = '1' WHERE employeeid = ${employeeid};`, { log: false });
                                cy.log('User vacation leave status reset successfully.');
                            });
                    });
            });
    });
});


//** Scenario for User Login Successfully to RBSoftech but remains Inactive */
Cypress.Commands.add("InActiveUserAccount", () => {
    // Set short session timeout for test
    cy.task('query', `UPDATE general_settings SET value = '10' WHERE name = 'sessiontimeout';`, { log: false })
        .then(() => {
            cy.getCredentials().then(({ username, password }) => {
                cy.visit('/login');
                cy.get(SELECTORS.username).should('be.visible');
                attemptLogin(username, password);

                cy.url().should("not.include", "/login");
                cy.get('body').trigger('mousemove');
                cy.wait(10000)
                    .then(() => {
                        // Restore session timeout
                        cy.task('query', `UPDATE general_settings SET value = '1800' WHERE name = 'sessiontimeout';`, { log: false });
                        cy.log('Session timeout restored to 1800 seconds.');
                    });
            });
        });
});
