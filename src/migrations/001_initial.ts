import type { Database, Migration } from "../migration.ts";

export default {
  version: 1,
  up: (db: Database) => {
    db.exec(`
      CREATE TABLE registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event STRING NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        wants_neighbor TEXT,
        wants_songbook BOOLEAN NOT NULL DEFAULT 0,
        dietary_preferences TEXT,
        payment_kind TEXT NOT NULL,
        payment_amount INTEGER NOT NULL,
        payment_confirmed BOOLEAN NOT NULL DEFAULT 0,
        payment_verified BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (event, phone)
      );
    `);
  },
} satisfies Migration;
