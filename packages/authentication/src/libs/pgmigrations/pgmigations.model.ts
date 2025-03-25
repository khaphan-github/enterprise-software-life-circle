export class PgMigrationModel {
  id: number;
  module: string;
  version: string;
  created_at: string;
  updated_at: string;

  constructor(args?: any) {
    if (args) {
      this.id = args.id;
      this.module = args.module;
      this.version = args.version;
      this.created_at = args.created_at;
      this.updated_at = args.updated_at;
    }
  }
}
