import GetHelper from '@support/helpers/GetHelper';
import { db } from '@database';
import { action as UIHelper } from '@support/helpers/UIHelper';

// ==================== HELPER FUNCTIONS ====================

/*
 * NOTE ON REFACTORING:
 * Many functions in this file use a selector strategy based on finding an element by its
 * text label first, then navigating the DOM (e.g., .contains('Label').parent().find('input')).
 * The current UIHelper functions are designed for simpler, direct selectors (e.g., '#id').
 *
 * For this reason, only `attemptLogin` has been refactored, as its direct selectors
 * are a good fit for the existing UIHelper.
 */

// Common selectors
const SELECTORS = {
    username: '#username',
    password: '#password',
    changePasswordBtn: '.container > .v-btn > .v-btn__content'
};

// Helper: Attempt login with username and password
const attemptLogin = (username, pwd, options = {}) => {
    const { logPassword = true } = options;
    
    // Use the UI helper for the username field
    UIHelper.input(SELECTORS.username, username);
    
    // Password field is handled directly to accommodate the `.type('{enter}')` and `log` option
    cy.get(SELECTORS.password).clear().type(pwd, { delay: 100, log: logPassword }).type('{enter}');
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
};

// Helper: Fetch latest username from database
const fetchLatestUsername = () => {
    return db.getLatestUsername().then((username) => username || 'defaultUser');
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
    db.getUserCountByFullName(firstname, middlename, lastname)
    .then((count) => {
        if (count > 0) {
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
    GetHelper.get_user_credentials().then(({ username, password }) => {
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
    GetHelper.get_user_credentials().then(({ username, password }) => {
        cy.visit('/login');

        // Make incorrect attempts
        for (let i = 0; i < attempts; i++) {
            attemptLogin(username, incorrectPassword);
        }

        // Correct login
        cy.url().then((url) => {
            if (url.includes('/home')) {
                attemptLogin(username, password);
                cy.url().should("not.include", "/login");
            } else {
                cy.log('User account may be blocked due to too many failed attempts.');
            }
        });

        // Reset user account if needed (for blocked accounts after 3 attempts)
        if (resetAfter) {
            db.resetUserLoginAttempts(username);
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
    GetHelper.get_user_credentials().then(({ username, password }) => {
        db.getEmployeeByUsername(username)
            .then((employeeid) => {
                if (!employeeid) {
                    throw new Error(`No matching user found for username: ${username}`);
                }
                const currentDateTime = getPhilippineDateTime();
                cy.log(`Setting active session for employee ID: ${employeeid} at ${currentDateTime}`);

                // Set active session
                db.setUserActivityLog(currentDateTime, employeeid)
                    .then(() => {
                        cy.visit('/login');
                        cy.get(SELECTORS.username).should('be.visible');
                        attemptLogin(username, password);
                        cy.contains(expectedMessage).should('be.visible');

                        // Reset activitylog
                        db.resetUserActivityLog(employeeid);
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
    // Get the username from credentials, but the password sequence will be driven by passwordCycle.json
    GetHelper.get_user_credentials().then(({ username }) => {
        cy.readFile('cypress/fixtures/create-user-credential/passwordCycle.json').then((passwordCycle) => {
            const { passwords, currentIndex } = passwordCycle;

            // The "old" password is the one at the current index in the cycle
            const oldPassword = passwords[currentIndex];
            
            // The "new" password is the next one in the cycle
            const newIndex = (currentIndex + 1) % passwords.length;
            const newPassword = passwords[newIndex];

            // Update the cycle file with the new index for the next run
            cy.writeFile('cypress/fixtures/create-user-credential/passwordCycle.json', { ...passwordCycle, currentIndex: newIndex });

            // Force password expiration in the database
            db.getEmployeeByUsername(username)
                .then((employeeid) => {
                    if (!employeeid) {
                        throw new Error(`Could not find employee for username: ${username}`);
                    }
                    cy.log(`Forcing password expiration for employee ID: ${employeeid}`);
                    return db.setUserPasswordChangeDate('2010-01-01', employeeid);
                })
                .then(() => {
                    // Attempt to login with the "expired" old password from the cycle
                    cy.visit('/login');
                    cy.get(SELECTORS.username).should('be.visible');
                    attemptLogin(username, oldPassword);

                    // Fill out the change password form
                    fillChangePasswordForm(username, oldPassword, newPassword, { visible: false });

                    // Update userCredentials.json with the new password to keep it in sync
                    cy.writeFile('cypress/fixtures/create-user-credential/userCredentials.json', {
                        username: username,
                        password: newPassword
                    });

                    // Re-login with the new password to confirm the change
                    cy.get(SELECTORS.username).should('be.visible');
                    attemptLogin(username, newPassword);
                    cy.url().should("not.include", "/login");
                });
        });
    });
});


//** Scenario for User is logged from another terminal */
Cypress.Commands.add("LoginUserIsLoggedFromAnotherTerminal", () => {
    GetHelper.get_user_credentials().then(({ username, password }) => {
        const storedUsername = username;

        //  Fetch employeeid and check activitylog status
        db.getEmployeeActivityByUsername(storedUsername)
            .then((user) => {
                if (!user || !user.employeeid) {
                    throw new Error(` No matching user found for username: ${storedUsername}`);
                }

                const employeeid = user.employeeid;
                //  Convert to Philippine Time (UTC+8)
                const now = new Date();
                now.setHours(now.getHours() + 8); //  Add 8 hours to match PHT
                const currentDateTime = now.toISOString().slice(0, 19).replace('T', ' '); // Full YYYY-MM-DD HH:MM:SS format

                db.setUserActivityLog(currentDateTime, employeeid)
                    .then(() => {
                        cy.visit('/login');
                        cy.get('#username').should('be.visible').clear().type(storedUsername);
                        cy.get('#password').should('be.visible').clear().type(password).type('{enter}');
                        cy.contains('User has not logged-out properly or is currently logged in other terminal.').should('be.visible')
                        .then(() =>{
                            db.resetUserActivityLog(employeeid)
                        })
                        ;
                    });
            });
    });
});


//** Scenario for User was on Vacation Leave */
Cypress.Commands.add("LoginUserIsOnVacationLeave", () => {
    GetHelper.get_user_credentials().then(({ username, password }) => {
        db.getEmployeeByUsername(username)
            .then((rows) => {
                if (!rows || rows.length === 0) {
                    throw new Error(`No matching user found for username: ${username}`);
                }
                const employeeid = rows[0].employeeid;

                // Set user as on vacation leave
                db.setUserOnVacation(employeeid)
                    .then(() => {
                        cy.visit('/login');
                        cy.get(SELECTORS.username).should('be.visible');
                        attemptLogin(username, password);

                        cy.contains('Account Blocked. Please contact your system administrator for more info.')
                            .should('be.visible')
                            .then(() => {
                                // Reset vacation leave status
                                db.resetUserVacation(employeeid);
                                cy.log('User vacation leave status reset successfully.');
                            });
                    });
            });
    });
});


//** Scenario for User Login Successfully to RBSoftech but remains Inactive */
Cypress.Commands.add("InActiveUserAccount", () => {
    // Set short session timeout for test
    db.setSessionTimeout('10')
        .then(() => {
            GetHelper.get_user_credentials().then(({ username, password }) => {
                cy.visit('/login');
                cy.get(SELECTORS.username).should('be.visible');
                attemptLogin(username, password);

                cy.url().should("not.include", "/login");
                cy.get('body').trigger('mousemove');
                cy.wait(10000)
                    .then(() => {
                        // Restore session timeout
                        db.setSessionTimeout('1800');
                        cy.log('Session timeout restored to 1800 seconds.');
                    });
            });
        });
});
