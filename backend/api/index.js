require('pg');
require('pg-hstore');

const app = require('../dist/app').default || require('../dist/app');

module.exports = app;
