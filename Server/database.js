const { Pool } = require('pg');

// Create a connection pool to PostgreSQL
const pool = new Pool({
  user: 'rideshare_user',
  host: 'localhost',
  database: 'rideshare_app',
  password: 'password',
  port: 5432,
});

module.exports = pool;