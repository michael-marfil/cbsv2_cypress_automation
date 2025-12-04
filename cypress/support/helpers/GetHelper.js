class gethelper {
    get_user_credentials() {
        return { username: Cypress.env('username'), password: Cypress.env('password') }
    }
}

export default new gethelper();