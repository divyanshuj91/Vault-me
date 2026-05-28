import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL environment variable is not defined.');
}

// Neon and Supabase require SSL. Enable rejectUnauthorized: false for remote databases
const pool = new pg.Pool({
  connectionString,
  ssl: connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
    ? { rejectUnauthorized: false }
    : false
});

export const query = (text, params) => pool.query(text, params);

export async function initDatabase() {
  try {
    // Create Users Table (PostgreSQL format)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        salt VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Credentials Table (PostgreSQL format)
    await query(`
      CREATE TABLE IF NOT EXISTS credentials (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        site_name VARCHAR(255) NOT NULL,
        url VARCHAR(255),
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        notes TEXT,
        last_changed_at VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    console.log('PostgreSQL database tables verified/created successfully.');
  } catch (error) {
    console.error('Error migrating PostgreSQL database:', error);
    throw error;
  }
}

export default {
  query,
  initDatabase,
  pool
};
