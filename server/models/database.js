import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;

let pool = null;
let sqliteDb = null;
let isPostgres = false;

// Dynamically load the correct database driver
if (connectionString) {
  isPostgres = true;
  console.log('DATABASE_URL environment variable found. Connecting to PostgreSQL...');
  const { default: pg } = await import('pg');
  pool = new pg.Pool({
    connectionString,
    ssl: connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
      ? { rejectUnauthorized: false }
      : false
  });
} else {
  isPostgres = false;
  console.log('DATABASE_URL is not defined. Connecting to SQLite fallback...');
  const { default: Database } = await import('better-sqlite3');
  const dbPath = process.env.DB_PATH || 'vault.db';
  const resolvedDbPath = path.isAbsolute(dbPath) 
    ? dbPath 
    : path.resolve(__dirname, '..', dbPath);
  
  console.log(`Connecting to SQLite database at: ${resolvedDbPath}`);
  sqliteDb = new Database(resolvedDbPath, { verbose: console.log });
  sqliteDb.pragma('foreign_keys = ON');
}

// Convert PostgreSQL parameterized query placeholders ($1, $2) to SQLite placeholders (?)
function convertPgToSqliteQuery(text) {
  return text.replace(/\$\d+/g, '?');
}

// Unified query runner
export async function query(text, params = []) {
  if (isPostgres) {
    return pool.query(text, params);
  } else {
    const sqliteText = convertPgToSqliteQuery(text);
    
    // Check if the query is a SELECT or contains RETURNING clause (which produces rows)
    const isQuery = /^\s*select/i.test(sqliteText) || /returning/i.test(sqliteText);
    
    if (isQuery) {
      const rows = sqliteDb.prepare(sqliteText).all(params);
      return {
        rows,
        rowCount: rows.length
      };
    } else {
      const info = sqliteDb.prepare(sqliteText).run(params);
      return {
        rows: [],
        rowCount: info.changes,
        lastInsertRowid: info.lastInsertRowid
      };
    }
  }
}

// Mock pool connection client for transactions (e.g. sync route)
const mockSqliteClient = {
  query: async (text, params) => query(text, params),
  release: () => {}
};

export const dbPool = {
  connect: async () => {
    if (isPostgres) {
      return pool.connect();
    } else {
      return mockSqliteClient;
    }
  }
};

export async function initDatabase() {
  if (isPostgres) {
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
  } else {
    // Create Users Table (SQLite format)
    sqliteDb.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Create Credentials Table (SQLite format)
    sqliteDb.prepare(`
      CREATE TABLE IF NOT EXISTS credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        site_name TEXT NOT NULL,
        url TEXT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        category TEXT,
        notes TEXT,
        last_changed_at TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `).run();
    console.log('SQLite database tables verified/created successfully.');
  }
}

export default {
  query,
  initDatabase,
  pool: dbPool
};
