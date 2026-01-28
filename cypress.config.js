const fs = require('fs');
require('dotenv').config(); // load environment variables from .emv file

const { defineConfig } = require("cypress");
const mysql = require("mysql2/promise");
const path = require("path");
const webpack = require('@cypress/webpack-preprocessor');

module.exports = defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_BASE_URL,

        setupNodeEvents(on, config) {
            // Load user credentials from fixture
            const UserFixtureCredentials = JSON.parse(
                fs.readFileSync(path.resolve(__dirname, 'cypress/fixtures/create-user-credential/userCredentials.json'), 'utf8')
            );

            // Load environment variables and pass them to Cypress
            config.env.newUser = {
                firstname: process.env.CYPRESS_NEW_FIRSTNAME,
                middlename: process.env.CYPRESS_NEW_MIDDLENAME,
                lastname: process.env.CYPRESS_NEW_LASTNAME,
                password: process.env.CYPRESS_NEW_PASSWORD
            }

            config.env.username = UserFixtureCredentials.username;
            config.env.password = UserFixtureCredentials.password;

            on('file:preprocessor', webpack({
                webpackOptions: {
                    resolve: {
                        alias: {
                            '@support': path.resolve(__dirname, 'cypress/support'),
                            '@database': path.resolve(__dirname, 'cypress/support/database'),
                            '@handler': path.resolve(__dirname, 'cypress/support/handlers')
                        }
                    }
                }
            }))
            on('task', {
                fileExists(filename) {
                    return fs.existsSync(filename);
                },
                query: async (query) => {
                    const connection = await mysql.createConnection({
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        database: process.env.DB_NAME,
                        port: parseInt(process.env.DB_PORT)
                    });

                    const [results] = await connection.execute(query);
                    await connection.end();
                    return results;
                }
            });

            return config;
        },
    },
});