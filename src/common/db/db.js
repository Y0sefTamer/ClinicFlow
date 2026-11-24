require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const knex = require('knex');
const knexConfig = require('./knexfile');
const environment = process.env.NODE_ENV;
const db = knex(knexConfig[environment]);

module.exports = db;