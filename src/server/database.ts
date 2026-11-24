import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { z } from "astro/zod";

import { withMigrations } from "./migration.ts";

const schema = z.object({
  /** The database path. Defaults to an in memory database */
  DATABASE: z.string().default(":memory:"),
  /** The target database version. Defaults to the latest migration */
  TARGET_VERSION: z
    .string()
    .optional()
    .transform((value) => (value ? parseInt(value, 10) : undefined)),
  /** Whether to apply migrations. Defaults to true if the database is in memory */
  APPLY_MIGRATIONS: z
    .string()
    .transform((value) => value === "true")
    .optional(),
});

const config = schema.parse(process.env);

export const DATABASE = config.DATABASE;
export const TARGET_VERSION = config.TARGET_VERSION;
export const APPLY_MIGRATIONS = config.APPLY_MIGRATIONS ?? config.DATABASE === ":memory:";
// The bundled server can't resolve migrations relative to this module, so
// they are read from the project root (where the server is started).
export const MIGRATIONS_DIR = join(process.cwd(), "src/server/migrations/");

export const database = new DatabaseSync(config.DATABASE);

database.exec(`PRAGMA journal_mode = WAL;`);
database.exec(`PRAGMA synchronous = NORMAL;`);
database.exec(`PRAGMA foreign_keys = ON;`);

// Check and apply migrations
await withMigrations(database, {
  migrationsDir: MIGRATIONS_DIR,
  targetVersion: TARGET_VERSION,
  apply: APPLY_MIGRATIONS,
});
