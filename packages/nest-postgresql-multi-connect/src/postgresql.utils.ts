import { Inject } from '@nestjs/common';

export const POSTGRES_MODULE_OPTIONS = Symbol('postgres-module-options');

export const CONNECTION_POOL_MAP_PROVIDER = Symbol(
  'connection-pool-map-provider',
);

export const DEFAULT_CONNECTION_NAME = 'default';

export function generateConnectionPoolToken(name: string) {
  return `POSTGRESQL_CONNECTION_POOL_${name.toUpperCase()}`;
}

export function PgSQLConnection(name: string = DEFAULT_CONNECTION_NAME) {
  return Inject(generateConnectionPoolToken(name));
}
