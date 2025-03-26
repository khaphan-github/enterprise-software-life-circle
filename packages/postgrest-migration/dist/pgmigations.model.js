"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgMigrationModel = void 0;
class PgMigrationModel {
    constructor(args) {
        if (args) {
            this.id = args.id;
            this.module = args.module;
            this.version = args.version;
            this.created_at = args.created_at;
            this.updated_at = args.updated_at;
        }
    }
}
exports.PgMigrationModel = PgMigrationModel;
