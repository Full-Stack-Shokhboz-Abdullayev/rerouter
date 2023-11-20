/* eslint-disable @typescript-eslint/no-var-requires */
const { migrate } = require('drizzle-orm/better-sqlite3/migrator');

const { drizzle } = require('drizzle-orm/better-sqlite3');

const Database = require('better-sqlite3');

const sqlite = new Database('./sqlite.db');

const db = drizzle(sqlite);

migrate(db, { migrationsFolder: './drizzle' });
