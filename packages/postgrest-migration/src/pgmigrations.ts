import * as path from 'path';
import { PoolClient, PoolConfig } from 'pg';
import { FileMigration, PgMigrationUtil } from './pgmigrations.util';
import { PgMigrationModel } from './pgmigations.model';
import { PgSQLConnectionPool } from './connection-pool';

export class PgMigration {
  private VERSION_FILE_REGEX: RegExp =
    /^Version-+([1-9].[0-9].[0-9])+.ts$/;
  private VERSSION_FILE_REGEX_FROM_PATH: RegExp =
    /Version-(\d+\.\d+\.\d+)/;
  private MODULE_PREFIX = 'migrations';
  private DEFAULT_VERSION = '0.0.0';
  private MIGRATION_TABLE_NAME = '_migrations';
  private DEFAULT_SCHEMA: string = 'public';

  private client = new PgSQLConnectionPool()

  constructor(
    public dbConf: PoolConfig,
    public tableConf: {
      modulePrefix?: string;
      migrationTableName?: string;
      versionFileRegex?: RegExp;
      versionFileRegexFromPath?: RegExp;
      defaultVersion?: string;
    }
  ) {
    this.client = new PgSQLConnectionPool(dbConf);

    if (tableConf.modulePrefix) {
      this.MODULE_PREFIX = tableConf.modulePrefix;
    }
    if (tableConf.migrationTableName) {
      this.MIGRATION_TABLE_NAME = tableConf.migrationTableName;
    }
    if (tableConf.versionFileRegex) {
      this.VERSION_FILE_REGEX = tableConf.versionFileRegex;
    }
    if (tableConf.versionFileRegexFromPath) {
      this.VERSSION_FILE_REGEX_FROM_PATH = tableConf.versionFileRegexFromPath;
    }
    if (tableConf.defaultVersion) {
      this.DEFAULT_VERSION = tableConf.defaultVersion;
    }
  }

  public executeMigrations = async () => {
    console.log(`\nSystem is running migrations task!`);

    try {
      const createMigrationTableResult = await this.createMigrationTable();

      const tableAlreadyExist = createMigrationTableResult?.rowCount == null;
      let migationsInDatabaseTable: PgMigrationModel[] = [];
      if (tableAlreadyExist) {
        migationsInDatabaseTable = await this.getAllMigrations();
      }

      const migrationsFiles = PgMigrationUtil.searchMigrationFiles(
        this.MODULE_PREFIX,
        this.VERSION_FILE_REGEX,
        this.VERSSION_FILE_REGEX_FROM_PATH,
      );

      const uniqueModulesInFiles = PgMigrationUtil.getUniqueModuleFromFile(
        migrationsFiles.map((file) => file.path),
      );

      let processs = 1;
      let haveNoChange = true;
      const errorMessages: string[] = [];

      // Executor
      for (const moduleName of uniqueModulesInFiles) {
        PgMigrationUtil.progressBar(processs / uniqueModulesInFiles.length);

        const moduleNameInFileInfo = PgMigrationUtil.findModuleByName(
          migationsInDatabaseTable,
          moduleName,
        );

        const moduleNameToCheck = moduleNameInFileInfo
          ? moduleNameInFileInfo.module
          : moduleName;
        const currentVersionToCheck = moduleNameInFileInfo
          ? moduleNameInFileInfo.version
          : this.DEFAULT_VERSION;

        const arrayNewerVersion = PgMigrationUtil.getNewerVersions(
          migrationsFiles,
          moduleNameToCheck,
          currentVersionToCheck,
        );
        if (arrayNewerVersion.length > 0) {
          haveNoChange = false;
          for (const iterator of arrayNewerVersion) {
            try {
              await this.startMigrationTransaction(iterator);
            } catch (error) {
              const errorMessage = (error as Error).message;
              errorMessages.push(`>> Error: ${errorMessage}, 
                \n>>>> At: ${JSON.stringify(iterator, null, 2)},
                \n>>>> Detais error: ${JSON.stringify(error, null, 2)}
                \n<< End Error \n-------------------------------
              `);
            }
          }
        }
        processs += 1;
      }

      // Display message
      if (errorMessages.length != 0) {
        console.error(errorMessages.join(`\n`));
        console.log(
          `\nCheck why this error happen then run migration again`,
        );
      }
      if (haveNoChange) {
        console.log(
          `\nYour database is in the latest version migration.`,
        );
      }
    } catch (error) {
      console.error(
        `\nError inserting migration: ${(error as Error).stack}, detail: ${JSON.stringify(error, null, 2)}, `,
      );
      return;
    }
    console.log(`\nYou can PRESS Ctrl + C to exit now!`);
  };

  private startMigrationTransaction = async (migrationFiles: FileMigration) => {
    return this.client.transaction(async (client: PoolClient) => {
      const migrationFromModule = require(path.resolve(migrationFiles.path));
      await migrationFromModule(client, this.DEFAULT_SCHEMA);
      await this.updateMigration(
        client,
        migrationFiles.module,
        migrationFiles.version,
      );
    });
  };

  private createMigrationTable = () => {
    try {
      return this.client.execute(`
      CREATE TABLE IF NOT EXISTS ${this.DEFAULT_SCHEMA}.${this.MIGRATION_TABLE_NAME} (
        id serial PRIMARY KEY,
        module varchar(256) UNIQUE NOT NULL,
        version varchar(12) NOT NULL,
        created_at timestamp(0) without time zone DEFAULT current_timestamp,
        updated_at timestamp(0) without time zone DEFAULT current_timestamp
      );
    `);
    } catch (error) {
      console.error(`Lỗi tạo bảng lịch sử thay đỗi: ${(error as Error).message}`);
      return;
    }
  };

  /**
   */
  private updateMigration = async (
    client: PoolClient,
    moduleName: string,
    version: string,
  ) => {
    const query = `
      INSERT INTO ${this.DEFAULT_SCHEMA}.${this.MIGRATION_TABLE_NAME} (version, updated_at, module)
      VALUES ($1, CURRENT_TIMESTAMP, $2)
      ON CONFLICT (module)
      DO UPDATE SET version = $1, updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    try {
      const result = await client.query(query, [version, moduleName]);
      return result.rows;
    } catch (error) {
      console.error(`Lỗi khi cập nhật lịch sử thay đỗi: ${(error as Error).message}`);
    }
  };

  private getAllMigrations = async () => {
    const query = `
      SELECT * 
      FROM ${this.DEFAULT_SCHEMA}.${this.MIGRATION_TABLE_NAME}
    `;
    try {
      const result = await this.client.execute(query);
      return result.rows as Array<PgMigrationModel>;
    } catch (error) {
      console.error(`Error when get all migrations: ${(error as Error).message}`);
      return [];
    }
  };
}
