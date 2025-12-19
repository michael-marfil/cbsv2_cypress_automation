/**
 * Navigates through the application using a dot-notated path based on a navigation tree.
 * Supports both UI-click navigation and direct URL visit.
 *
 * @param {object} navigationTree - The hierarchical object defining navigation nodes.
 * @param {string} path - The dot-notated path (e.g., 'accounting.journals.journal-posting').
 * @param {object} options - Options to control navigation.
 * @param {boolean} [options.directVisit] - Force direct URL visit (true) or force UI clicks (false)..
 * 
 * @author Michael
 */

export function navigation_step(navigationTree, path, options = {}) {

    // checks if a current URL matches an expected URL pattern
    const urlMatches = (url, expected) => {
        if (expected instanceof RegExp) return expected.test(url);
        if (Array.isArray(expected)) return expected.some(e => url.includes(e));

        return url.includes(String(expected));
    };

    // helper that validates current URL against expected patterns
    const assertUrlMatches = (expected) => {
        // for RegExp: Use Cypress's 'match' assertion
        if (expected instanceof RegExp) {
            cy.url().should('match', expected);
        } else if (Array.isArray(expected)) { // for arrays: Check if current URL includes ANY of the expected URLs
            cy.url().should((u) => {
                const ok = expected.some(e => u.includes(e));
                expect(ok, `Expected "${u}" to include one of: ${expected.join(', ')}`).to.be.true;
            });
        } else { // for strings: Use Cypress's 'include' assertion
            cy.url().should('include', String(expected));
        }
    };

    /**
     * Parse dot notation path into navigation steps
     * 
     * Example: 'accounting.journals.journal-posting' becomes:
     * 1. Click category: 'Accounting'
     * 2. Click submenu: 'Journals' 
     * 3. Click nav: 'Journal Posting'
     * 4. Visit URL: '/accounting/journals/journal-posting'
     */
    const pathParts = String(path).split('.'); // split the dot notation path into individual segments
    let current = navigationTree;
    const navigationSteps = [];

    pathParts.forEach((part) => {
        if (!current[part]) {
            throw new Error(`navigateTo: path segment "${part}" not found at this level`);
        }
        const node = current[part];

        // Extract navigation actions from the node and add to steps array

        // each property type represents a different navigation action:
        if (node.category) navigationSteps.push({ type: 'category', value: node.category });         // click module
        if (node.submenu) navigationSteps.push({ type: 'submenu', value: node.submenu });           // click the sub module inside main module
        if (node.nav) navigationSteps.push({ type: 'nav', value: node.nav });                   // click target page to visit
        if (node.url) navigationSteps.push({ type: 'url', value: node.url });                   // target URL to visit
        if (node.expectedUrl) navigationSteps.push({ type: 'expectedUrl', value: node.expectedUrl });   // URL pattern to validate
        if (node.action) navigationSteps.push({ type: 'action', value: node.action });

        current = node.children || {}; // if no children exist, this becomes an empty object {}
    });

    // determine final and expected URL (fallbacks safe)
    const finalUrl = [...navigationSteps].reverse().find(s => s.type === 'url')?.value || '/';
    let expectedUrl = [...navigationSteps].reverse().find(s => s.type === 'expectedUrl')?.value || finalUrl;

    // read one-shot direct-visit flag (set by beforeEnter) unless caller overrides options.directVisit
    const hasAccess = Cypress.env('nav-direct-visit-once');

    // if user has explicit directVisit preference, use that
    // otherwise, do direct visit when user DOESN'T have access (hasAccess is false)
    const effectiveDirectVisit = (typeof options.directVisit === 'boolean')
        ? options.directVisit
        : hasAccess === false; // direct visit when no access

    Cypress.env('nav-direct-visit-once', undefined); // reset flag so it only applies to a specific navigation

    if (effectiveDirectVisit) { // if effectiveDirectVisit is true, skip UI clicks and go straight to URL
        cy.visit(finalUrl);
        assertUrlMatches(expectedUrl, { timeout: 2000 });
        return;
    }

    // otherwise, do normal click navigation
    cy.get('.v-content:visible', { timeout: 5000 });
    
    // ensure sidenav is visible
    cy.get('body').then(($body) => {
        const $sidenav = $body.find('#sidenav'); 
        const $icon = $body.find('.v-icon.mdi-chevron-right');

        cy.log(`Sidenav found: ${$sidenav.length}`);
        cy.log(`Sidenav is :visible: ${$sidenav.is(':visible')}`);
        cy.log(`icon visible: ${$icon.is(':visible')}`);
        if ($sidenav.length === 0 || !$sidenav.is(':visible')) {
            cy.log('sidenav is not visible');
            
            cy.wrap($icon).click({ force: true });

            cy.get('#sidenav', { timeout: 10000 }).should('be.visible');
        } else {
            cy.log('sidenav already visible');
        }
    });

    navigationSteps.forEach((step) => { // execute navigating to page
        switch (step.type) {
            case 'category':
                cy.get('.category-name').contains(step.value).click();
                cy.wait(500);
                break;

            case 'submenu':
                cy.get('.white-bg > a, .white-bg a').contains(step.value).click({ force: true });
                cy.wait(500);
                break;

            case 'nav':
                cy.get('body').then(($body) => {
                    if ($body.find('.main-navigation').length > 0) {
                        cy.get('.main-navigation').contains(step.value).click({ force: true });
                    } else {
                        cy.contains(step.value).click({ force: true });
                    }
                });
                cy.wait(500);
                break;

            case 'url':
                if (options.directVisit !== false) {
                    cy.visit(step.value);
                    cy.wait(500);
                }
                break;

            case 'expectedUrl':
                expectedUrl = step.value ?? expectedUrl;
                break;

            case 'action':
                if (step.value === 'logout') {
                    cy.logout();
                }
                break;
        }
    });

    // FALLBACK: if UI navigation doesn't land on the expected URL, force a direct visit and verify
    cy.url().then((u) => {
        if (!urlMatches(u, expectedUrl)) {
            cy.visit(finalUrl);
        }
    }).then(() => {
        assertUrlMatches(expectedUrl);
    });

    cy.get('body', { timeout: 5000 }).click(0, 0);
}