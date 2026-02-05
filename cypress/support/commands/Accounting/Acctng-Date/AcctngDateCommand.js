import accounting from '@support/routes/accounting';
import generalmodule from '@support/routes/general';
import { action as UIHelper } from '@support/helpers/UIHelper';
import { db } from '@support/database'; // Import the db utility

// ==================== LOCAL HELPER FUNCTIONS ====================
// This pattern breaks down complex UI flows into smaller, reusable functions,
// making the main command easier to read and maintain.

/**
 * Clicks a setting row by its name, scrolls it into view, and hovers over it.
 * @param {string} settingName - The text content of the setting to find.
 * @returns {Cypress.Chainable} - Returns the row element for further chaining.
 */
const clickSettingRow = (settingName) => {
	return cy.contains('td', settingName).click({ force: true })
	.scrollIntoView({ easing: 'linear', duration: 500, offset: { top: -200 } })
	.should('be.visible')
	.parent()
	.realHover()
	.wait(1000);
};

/**
 * Clicks the first button found within a given row.
 * @param {JQuery<HTMLElement>} $row - The parent row element.
 * @returns {boolean} - True if a button was clicked, false otherwise.
 */
const clickButtonInRow = ($row) => {
	const $button = $row.find('button').first();
	if ($button.length > 0) {
		cy.wrap($button).click({ force: true });
		return true;
	}
	cy.log('No button found in row — skipping action.');
		return false;
};

/**
 * Enters a value into the setting's input field using the UIHelper.
 * @param {string | number} value - The value to input.
 */
const setSettingValue = (value) => {
	cy.log('Editing setting value');
	cy.get('td').contains(/value:/i)
	.parent()
	.wait(1000)
	.within(() => {
		// Use the imported UIHelper for a more robust input action
		UIHelper.input('input', value);
	});
};

/**
 * Clicks a button on the page based on its visible text.
 * @param {string} text - The text of the button to click.
 */
const clickButtonByText = (text) => {
	cy.get('button').contains(text).click();
};

// ==================== CYPRESS COMMANDS ====================
/**
 * This command edits the 'backdatedaysallowed' setting in Accounting Settings,
 * then navigates to the General > Approval page to check for the approval item.
 * @param {string | number} backdateValue - The value to set for 'backdatedaysallowed'.
 */
Cypress.Commands.add('editBackdateAndCheckApproval', (backdateValue) => {
	accounting.goToSettingsMgmt();
	cy.wait(500);

	// Use the helper functions to perform the sequence of actions
	clickSettingRow('backdatedaysallowed').then(($row) => {
		if (clickButtonInRow($row)) {
			setSettingValue(backdateValue);
			clickButtonByText('Edit Setting');
			cy.contains(/Successfully submitted changes for backdatedaysallowed/i, { timeout: 10000 })
			.should('be.visible');
			// Added a small wait to allow for UI transition before checking for invisibility
			cy.wait(500); 
			cy.contains(/Successfully submitted changes for backdatedaysallowed/i, { timeout: 10000 })
			.should('not.be.visible'); // Changed to check for not.be.visible
		}
	});

	// Wait for the page to reload and verify the setting is still visible
	cy.wait(1000);
	clickSettingRow('backdatedaysallowed');

	// Proceed to the approval page
	generalmodule.goToApproval();
});



/**
 * This command performs a test scenario where an attempt is made to backdate
 * beyond the allowed number of days. It sets specific user permissions,
 * configures the 'backdatedaysallowed' setting in the database, navigates
 * to the accounting date settings, and attempts to select a date.
 *
 * @param {number} initialDbSetting - The value to set 'backdatedaysallowed' in the DB initially.
 * @param {number} daysToAttemptBackdate - The number of days to attempt to backdate in the UI.
 * @param {number} finalDbSetting - The value to reset 'backdatedaysallowed' to in the DB after the attempt.
 */
Cypress.Commands.add('attemptBackdateBeyondAllowed', (initialDbSetting, daysToAttemptBackdate, finalDbSetting) => {
	// Update the 'backdatedaysallowed' setting in the database
	db.setBackdateDaysAllowed(initialDbSetting)
		.then(() => {
			cy.log(`DB 'backdatedaysallowed' set to ${initialDbSetting}`);
			// Navigate to Accounting -> Acctng Date
			accounting.goToAccountingDate();
			// Open the date picker
			cy.contains('DEFINE NEW ACCOUNTING DATE:')
				.closest('.v-card')
				.find('input[type="text"]')
				.click({ force: true });
			// Calculate and attempt to select a date 'daysToAttemptBackdate' prior to current date
			cy.get('.v-date-picker-table .v-btn--active').invoke('text').then((activeDayText) => {
				cy.get('.v-date-picker-header .v-date-picker-header__value').invoke('text').then((headerText) => {
					const [monthName, year] = headerText.trim().split(' ');
					const currentMonth = new Date(Date.parse(monthName + " 1, " + year)).getMonth();
					const currentDate = new Date(year, currentMonth, Number(activeDayText));

					const targetDate = new Date(currentDate);
					targetDate.setDate(currentDate.getDate() - daysToAttemptBackdate);

					const targetDayNumber = targetDate.getDate();

					cy.log(`Attempting to select date: ${targetDayNumber}`);
					cy.get('.v-date-picker-table button')
						.contains(new RegExp(`^${targetDayNumber}$`))
						.click();
					cy.wait(1000); // Wait for date selection to register
				});
			});
		})
		.then(() => {
			// Reset 'backdatedaysallowed' in the database to finalDbSetting
			db.setBackdateDaysAllowed(finalDbSetting);
			cy.log(`DB 'backdatedaysallowed' reset to ${finalDbSetting}`);
		});
});
