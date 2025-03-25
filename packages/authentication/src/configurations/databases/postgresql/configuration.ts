import { registerAs } from '@nestjs/config';

export const CONNECTION_STRING_DEFAULT = 'DB_DEFAULT';
export const POSTGRE_SQL_DB_CONFIG_MAIN = registerAs(
  'postgreSQLMainDBConfig',
  () => ({
    host: process.env.PG_MAIN_DB_HOST,
    port: process.env.PG_MAIN_DB_PORT || 5432,
    user: process.env.PG_MAIN_DB_USER,
    password: process.env.PG_MAIN_DB_PASSWORD,
    database: process.env.PG_MAIN_DB_DATABASE,
  }),
);
