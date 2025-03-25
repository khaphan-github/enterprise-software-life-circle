import { Module, OnModuleInit } from '@nestjs/common';
import { CONNECTION_STRING_DEFAULT } from 'src/configurations/databases/postgresql/configuration';
import { PgMigration } from 'src/libs/pgmigrations/pgmigrations';
import { PgSQLConnectionPool } from 'src/libs/postgresql/connection-pool';
import { PgSQLConnection } from 'src/libs/postgresql/connection.decorator';
import { PostgresModule } from 'src/libs/postgresql/postgres.module';
import { PortgresqlConfigModule } from '../postgresql/config.module';

@Module({
  imports: [
    PortgresqlConfigModule,
    PostgresModule.forFeature(CONNECTION_STRING_DEFAULT),
  ],
})
export class PgMigrationModule implements OnModuleInit {
  constructor(
    @PgSQLConnection(CONNECTION_STRING_DEFAULT)
    public pool: PgSQLConnectionPool,
  ) {}

  async onModuleInit() {
    const migrateExecution = new PgMigration(this.pool);
    await migrateExecution.executeMigrations();
  }
}
