/**
 * API
 * 
 * Generic API command to make authenticated POST requests with X-XSRF-TOKEN header.
 * Automatically handles cookie retrieval and decoding.
 * 
 * @author Michael
 */
class Api {
    api_post(url, body, options = {}) {
        return cy.getCookie('XSRF-TOKEN').then((xsrfCookie) => {
            if (!xsrfCookie) {
                throw new Error('XSRF-TOKEN cookie not found.');
            }

            const xsrfToken = decodeURIComponent(xsrfCookie.value);
            
            return cy.request({
                method: 'POST',
                url,
                body,
                failOnStatusCode: options.failOnStatusCode ?? false,
                headers: {
                    'X-XSRF-TOKEN': xsrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers // allow overrides
                }
            }).then((response) => {
                // auto-assert success
                if (!options.skipAssert) {
                    expect(response.status).to.be.oneOf([200, 201]);
                }

                return response; // return so we can chain .then()
            });
        });
    }
}

export default new Api();