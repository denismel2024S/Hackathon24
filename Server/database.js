const { Pool } = require('pg');

// Create a connection pool to PostgreSQL
const pool = new Pool({
  user: 'rideshare_user',
  host: 'localhost',
  database: 'rideshare_app',
  password: 'password',
  port: 5433,
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows);
  } catch (error) {
    console.error('Database connection error:', error.message);
  } finally {
    pool.end();
  }
}

testConnection();

module.exports = pool;