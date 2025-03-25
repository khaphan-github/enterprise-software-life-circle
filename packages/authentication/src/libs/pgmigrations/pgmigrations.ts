/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Logger } from '@nestjs/common';
import * as path from 'path';
import { PoolClient } from 'pg';
import { FileMigration, PgMigrationUtil } from './pgmigrations.util';
import { PgMigrationModel } from './pgmigations.model';
import { PgSQLConnectionPool } from '../postgresql/connection-pool';

export class PgMigration {
  private readonly logger = new Logger(PgMigration.name);

  private readonly VERSION_FILE_REGEX: RegExp =
    /^Version-+([1-9].[0-9].[0-9])+.ts$/;
  private readonly VERSSION_FILE_REGEX_FROM_PATH: RegExp =
    /Version-(\d+\.\d+\.\d+)/;
  private readonly MODULE_PREFIX = 'src/infrastructure/migrations';
  private readonly DEFAULT_VERSION = '0.0.0';
  private readonly MIGRATION_TABLE_NAME = '_migrations';

  constructor(
    private client: PgSQLConnectionPool,
    private readonly DEFAULT_SCHEMA: string = 'public',
  ) {}

  // Hàm thực thi kiểm tra và chạy task migrations;
  /** LOGIC:
   * 1. Tạo bảng migration nếu chưa tạo.
   * 2. Duyệt qua tất cả các file migration trong project sau đó thực hiện logic sau:
   * Tìm module theo tên trong bảng migration trong db nếu tìm thấy:
   *    2.1. Kiểm tra version của module đã được lưu trong db và các version mới nhất của file migration trên source code:
   *       2.1.1: Nếu phát hiện version nào chưa được chạy thì thực hiện chạy các version đó và update bảng migrations.
   *       2.1.2: Nếu không phát hiện version mới nào thì không thực hiện gì hết.
   *
   *    2.2. Nếu không tìm thấy module nào đã được lưu trong bảng migration thì:
   *       2.2.1. Thực hiện chạy tất cả các version của module đó từ thấp đến cao.
   *       2.2.2. Cập nhật lại version mới nhất của module trong bảng migrations.
   * 3. Kết thúc.
   *
   */
  public executeMigrations = async () => {
    this.logger.verbose(`\nSystem is running migrations task!`);

    try {
      // Tạo bảng miration nếu không tồn tại;
      const createMigrationTableResult = await this.createMigrationTable();

      // Trường hợp table migrations đã được tạo
      const tableAlreadyExist = createMigrationTableResult?.rowCount == null;
      let migationsInDatabaseTable: PgMigrationModel[] = [];
      if (tableAlreadyExist) {
        migationsInDatabaseTable = await this.getAllMigrations();
      }

      // Kiểm tra và tìm tất cả các file migrations tồn tại trong project
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
        // Lấy danh sách những version mới ứng với từng module
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
              errorMessages.push(`>> Error: ${error.message}, 
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
        this.logger.error(errorMessages.join(`\n`));
        this.logger.verbose(
          `\nCheck why this error happen then run migration again`,
        );
      }
      if (haveNoChange) {
        this.logger.verbose(
          `\nYour database is in the latest version migration.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `\nError inserting migration: ${error.stack}, detail: ${JSON.stringify(error, null, 2)}, `,
      );
      return;
    }
    this.logger.verbose(`\nYou can PRESS Ctrl + C to exit now!`);
  };

  // Thực thi transaction chạy file 'Version' và cập nhật lại version vô bảng migrations
  private startMigrationTransaction = async (migrationFiles: FileMigration) => {
    return this.client.transaction(async (client: PoolClient) => {
      // Đọc file trừ path
      const migrationFromModule = require(path.resolve(migrationFiles.path));
      await migrationFromModule(client, this.DEFAULT_SCHEMA);
      await this.updateMigration(
        client,
        migrationFiles.module,
        migrationFiles.version,
      );
    });
  };

  /**
   * Tạo bảng lịch sử thay đỗi nếu chưa tồn tại.
   */
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
      this.logger.error(`Lỗi tạo bảng lịch sử thay đỗi: ${error.message}`);
      return;
    }
  };

  /**
   * Cập nhật lịch sử thay đỗi.
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
      this.logger.error(`Lỗi khi cập nhật lịch sử thay đỗi: ${error.message}`);
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
      this.logger.error(`Error when get all migrations: ${error.message}`);
      return [];
    }
  };
}
