require('dotenv').config(); // load environment variables from .emv file

const { defineConfig } = require("cypress");
const mysql = require("mysql2/promise");
const path = require("path");
const webpack = require('@cypress/webpack-preprocessor');

module.exports = defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_BASE_URL,

        env: {
            username: process.env.CYPRESS_USERNAME,
            password: process.env.CYPRESS_PASSWORD,
        },

        setupNodeEvents(on, config) {
            on('file:preprocessor', webpack({
                webpackOptions: {
                    resolve: {
                        alias: {
                            '@support': path.resolve(__dirname, 'cypress/support'),
                            '@database': path.resolve(__dirname, 'cypress/support/database')
                        }
                    }
                }
            }))
            on('task', {
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