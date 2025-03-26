"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgMigration = void 0;
const path = __importStar(require("path"));
const pgmigrations_util_1 = require("./pgmigrations.util");
const connection_pool_1 = require("./connection-pool");
class PgMigration {
    constructor(dbConf, tableConf) {
        this.dbConf = dbConf;
        this.tableConf = tableConf;
        this.VERSION_FILE_REGEX = /^Version-+([1-9].[0-9].[0-9])+.ts$/;
        this.VERSSION_FILE_REGEX_FROM_PATH = /Version-(\d+\.\d+\.\d+)/;
        this.MODULE_PREFIX = 'migrations';
        this.DEFAULT_VERSION = '0.0.0';
        this.MIGRATION_TABLE_NAME = '_migrations';
        this.DEFAULT_SCHEMA = 'public';
        this.client = new connection_pool_1.PgSQLConnectionPool();
        this.executeMigrations = () => __awaiter(this, void 0, void 0, function* () {
            console.log(`\nSystem is running migrations task!`);
            try {
                const createMigrationTableResult = yield this.createMigrationTable();
                const tableAlreadyExist = (createMigrationTableResult === null || createMigrationTableResult === void 0 ? void 0 : createMigrationTableResult.rowCount) == null;
                let migationsInDatabaseTable = [];
                if (tableAlreadyExist) {
                    migationsInDatabaseTable = yield this.getAllMigrations();
                }
                const migrationsFiles = pgmigrations_util_1.PgMigrationUtil.searchMigrationFiles(this.MODULE_PREFIX, this.VERSION_FILE_REGEX, this.VERSSION_FILE_REGEX_FROM_PATH);
                const uniqueModulesInFiles = pgmigrations_util_1.PgMigrationUtil.getUniqueModuleFromFile(migrationsFiles.map((file) => file.path));
                let processs = 1;
                let haveNoChange = true;
                const errorMessages = [];
                // Executor
                for (const moduleName of uniqueModulesInFiles) {
                    pgmigrations_util_1.PgMigrationUtil.progressBar(processs / uniqueModulesInFiles.length);
                    const moduleNameInFileInfo = pgmigrations_util_1.PgMigrationUtil.findModuleByName(migationsInDatabaseTable, moduleName);
                    const moduleNameToCheck = moduleNameInFileInfo
                        ? moduleNameInFileInfo.module
                        : moduleName;
                    const currentVersionToCheck = moduleNameInFileInfo
                        ? moduleNameInFileInfo.version
                        : this.DEFAULT_VERSION;
                    const arrayNewerVersion = pgmigrations_util_1.PgMigrationUtil.getNewerVersions(migrationsFiles, moduleNameToCheck, currentVersionToCheck);
                    if (arrayNewerVersion.length > 0) {
                        haveNoChange = false;
                        for (const iterator of arrayNewerVersion) {
                            try {
                                yield this.startMigrationTransaction(iterator);
                            }
                            catch (error) {
                                const errorMessage = error.message;
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
                    console.log(`\nCheck why this error happen then run migration again`);
                }
                if (haveNoChange) {
                    console.log(`\nYour database is in the latest version migration.`);
                }
            }
            catch (error) {
                console.error(`\nError inserting migration: ${error.stack}, detail: ${JSON.stringify(error, null, 2)}, `);
                return;
            }
            console.log(`\nYou can PRESS Ctrl + C to exit now!`);
        });
        this.startMigrationTransaction = (migrationFiles) => __awaiter(this, void 0, void 0, function* () {
            return this.client.transaction((client) => __awaiter(this, void 0, void 0, function* () {
                const migrationFromModule = require(path.resolve(migrationFiles.path));
                yield migrationFromModule(client, this.DEFAULT_SCHEMA);
                yield this.updateMigration(client, migrationFiles.module, migrationFiles.version);
            }));
        });
        this.createMigrationTable = () => {
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
            }
            catch (error) {
                console.error(`Lỗi tạo bảng lịch sử thay đỗi: ${error.message}`);
                return;
            }
        };
        /**
         */
        this.updateMigration = (client, moduleName, version) => __awaiter(this, void 0, void 0, function* () {
            const query = `
      INSERT INTO ${this.DEFAULT_SCHEMA}.${this.MIGRATION_TABLE_NAME} (version, updated_at, module)
      VALUES ($1, CURRENT_TIMESTAMP, $2)
      ON CONFLICT (module)
      DO UPDATE SET version = $1, updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
            try {
                const result = yield client.query(query, [version, moduleName]);
                return result.rows;
            }
            catch (error) {
                console.error(`Lỗi khi cập nhật lịch sử thay đỗi: ${error.message}`);
            }
        });
        this.getAllMigrations = () => __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT * 
      FROM ${this.DEFAULT_SCHEMA}.${this.MIGRATION_TABLE_NAME}
    `;
            try {
                const result = yield this.client.execute(query);
                return result.rows;
            }
            catch (error) {
                console.error(`Error when get all migrations: ${error.message}`);
                return [];
            }
        });
        this.client = new connection_pool_1.PgSQLConnectionPool(dbConf);
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
}
exports.PgMigration = PgMigration;
