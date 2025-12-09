// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// import './commands'

// Global
import 'cypress-real-events'; // plugin for real events like like pointerdown, focus, or hover.

// Authentication
import '@support/commands/auth';

// Permissions
import '@support/commands/permissions';

// Navigation
import '@support/commands/navigation';

// Helpers
import '@support/helpers/GetHelper';