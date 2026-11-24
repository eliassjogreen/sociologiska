import { readdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

interface PreparedStatement {
  value?: <T>() => T | undefined;
  get?: () => Record<string, unknown> | undefined;
}

export interface Database {
  path?: string;
  prepare(sql: string): PreparedStatement;
  exec(sql: string): void;
}

export type MigrationFunction = (database: Database) => void | Promise<void>;

export interface Migration {
  version: number;
  name?: string;
  up: MigrationFunction;
  down?: MigrationFunction;
}

function titleCase(value: string) {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => `${segment[0]!.toUpperCase()}${segment.slice(1).toLowerCase()}`)
    .join(" ");
}

export function isInMemory(database: Database) {
  if (database.path === ":memory:") {
    return true;
  }

  if (database.path == null) {
    return false;
  }

  try {
    const uriFileName = new URL(database.path);
    return uriFileName.protocol === "file:" && uriFileName.pathname === "/:memory:";
  } catch {
    return false;
  }
}

export async function loadMigrations(dir: string) {
  const migrations: Migration[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const path = resolve(join(dir, entry.name));
    const name = titleCase(
      basename(path)
        .replace(/(^\d+_)?/, "")
        .replace(/(\.\w*)$/, ""),
    );

    try {
      /* @vite-ignore */
      const { default: migration } = await import(pathToFileURL(path).href);
      migration.name ??= name;
      migrations.push(migration);
    } catch (error) {
      console.error(`Failed to import migration ${path}: ${error}`);
    }
  }

  return migrations;
}

export function latestMigrationVersion(migrations: Migration[]) {
  return Math.max(...migrations.map(({ version }) => version));
}

export function hasVersion(migrations: Migration[], version: number) {
  return migrations.some((migration) => migration.version === version);
}

export function getVersion(migrations: Migration[], version: number) {
  return migrations.find((migration) => migration.version === version);
}

export function getUserVersion(database: Database) {
  const statement = database.prepare("PRAGMA user_version");

  if (statement.value != null) {
    const result = statement.value<[number]>();

    if (Array.isArray(result) && typeof result[0] === "number") {
      return result[0];
    }
  }

  if (statement.get != null) {
    const result = statement.get();
    const userVersion = result?.["user_version"];

    if (typeof userVersion === "number") {
      return userVersion;
    }
  }

  throw new TypeError("Failed to read current SQLite user_version.");
}

export function migrationToString(migration: Migration): string {
  if (migration.name !== undefined) {
    return `"${migration.name}" (${versionToString(migration.version)})`;
  }

  return versionToString(migration.version);
}

export function versionToString(version: number, migration?: Migration): string {
  if (migration !== undefined) {
    return migrationToString(migration);
  }

  return version.toString().padStart(4, "0");
}

export function isFutureMigration(migration: Migration, version: number, target: number) {
  return migration.version <= target && migration.version > version;
}

export function isPastMigration(migration: Migration, version: number, target: number) {
  return migration.version > target && migration.version <= version;
}

export function findApplicableMigrations(
  migrations: Migration[],
  direction: "up" | "down",
  version: number,
  target: number,
) {
  switch (direction) {
    case "up": {
      return migrations
        .filter((migration) => isFutureMigration(migration, version, target))
        .sort((a, b) => a.version - b.version);
    }
    case "down": {
      return migrations
        .filter((migration) => isPastMigration(migration, version, target))
        .sort((a, b) => b.version - a.version);
    }
  }
}

export async function migrate(
  database: Database,
  migrations: Migration[],
  version: number,
  target: number,
) {
  const direction = version < target ? "up" : "down";
  const applicable = findApplicableMigrations(migrations, direction, version, target);

  if (applicable.length === 0) {
    console.info("No migrations to apply!");
    return;
  }

  for (const migration of applicable) {
    console.info(`Applying migration ${migrationToString(migration)} ${direction}...`);

    const migrationFunction = migration[direction];

    if (migrationFunction == null) {
      throw new TypeError(
        `Expected migration function ${migrationToString(migration)} ${direction}`,
      );
    }

    database.exec("BEGIN");

    try {
      await migrationFunction(database);

      // SAFETY: Because PRAGMA statements dont support query parameters we set
      // it using templating here. This could lead to SQL injections if it was
      // from user input but is from our migrations here so should be fine.
      database.exec(`PRAGMA user_version = ${migration.version};`);
      database.exec("COMMIT");

      console.info(`Successfully applied migration ${migrationToString(migration)}!`);
    } catch (error) {
      try {
        database.exec("ROLLBACK");
      } catch (rollbackError) {
        console.error("Failed to roll back migration transaction", rollbackError);
      }

      console.error(error);
      throw new Error(
        `Failed to apply migration ${migrationToString(migration)}, rolling back migration!`,
        { cause: error },
      );
    }
  }
}

export interface WithMigrationsOptions {
  /**
   * Directory where migrations are located.
   *
   * @default "migrations/"
   */
  migrationsDir?: string;
  /**
   * Target version to migrate to.
   *
   * @default latest
   */
  targetVersion?: number;
  /**
   * Whether to apply migrations.
   *
   * @default database.path === ":memory:"
   */
  apply?: boolean;
}

export async function withMigrations(database: Database, options?: WithMigrationsOptions) {
  const migrationsDir = options?.migrationsDir ?? join(import.meta.dirname, "migrations/");

  const migrations = await loadMigrations(migrationsDir);

  const currentVersion = getUserVersion(database);
  const currentMigration = getVersion(migrations, currentVersion);
  const latestVersion = latestMigrationVersion(migrations);
  const targetVersion =
    options?.targetVersion != null && hasVersion(migrations, options?.targetVersion)
      ? options.targetVersion
      : latestVersion;
  const targetMigration = getVersion(migrations, targetVersion);
  const upToDate = currentVersion === targetVersion;

  if (upToDate) {
    console.info(
      `Database is up to date. Current and target version is ${versionToString(
        currentVersion,
        currentMigration,
      )}`,
    );
    return;
  }

  console.warn(
    `Database is not up to date on. Current version is ${versionToString(
      currentVersion,
      currentMigration,
    )} while target version is ${versionToString(targetVersion, targetMigration)}`,
  );

  if (currentVersion !== 0 && currentMigration === undefined) {
    console.warn(
      `The current database version ${versionToString(
        currentVersion,
      )} does not seem to have any associated migration, this may cause issues.`,
    );
  }

  if (targetMigration === undefined) {
    throw new Error(
      `Target version ${versionToString(
        targetVersion,
      )} does not seem to have any associated migration.`,
    );
  }

  if (options?.apply === undefined) {
    if (isInMemory(database)) {
      console.info("Database is in memory, applying migrations...");
      await migrate(database, migrations, currentVersion, targetVersion);
      return;
    }
  } else if (options.apply) {
    console.info("Applying migrations...");
    await migrate(database, migrations, currentVersion, targetVersion);
    return;
  }

  throw new Error(
    `Database is not up to date on. Current version is ${versionToString(
      currentVersion,
      currentMigration,
    )} while target version is ${versionToString(targetVersion, targetMigration)}`,
  );
}
