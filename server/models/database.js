import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || 'vault.db';
const resolvedDbPath = path.isAbsolute(dbPath) 
  ? dbPath 
  : path.resolve(__dirname, '..', dbPath);

console.log(`Connecting to SQLite database at: ${resolvedDbPath}`);

const db = new Database(resolvedDbPath, { verbose: console.log });

// Enable foreign key support
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Create Users Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Create Credentials Table
  db.prepare(`
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

  console.log('Database tables initialized successfully.');
}

export default db;
