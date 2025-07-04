import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.ts';

// Create SQLite database instance
const DATABASE_URL = process.env.DATABASE_URL || './database.sqlite';
const sqlite = new Database(DATABASE_URL);

// Enable WAL mode for better concurrency
sqlite.pragma('journal_mode = WAL');

// Create Drizzle database instance
export const db = drizzle(sqlite, { schema });

export default db;
