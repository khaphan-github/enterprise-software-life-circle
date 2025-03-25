/* eslint-disable @typescript-eslint/no-floating-promises */
import { repl } from '@nestjs/core';
import { PgMigrationModule } from './configurations/databases/migration/config.module';
/**
 * https://docs.nestjs.com/recipes/repl
 * npm run migrate
 */
async function bootstrap() {
  await repl(PgMigrationModule);
}
bootstrap();
