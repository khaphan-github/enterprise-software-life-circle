import { DynamicModule, Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { PgSQLConnectionPool } from './connection-pool';
import { AsyncConnection, Connection } from './postgresql.interface';
import {
  POSTGRES_MODULE_OPTIONS,
  CONNECTION_POOL_MAP_PROVIDER,
  DEFAULT_CONNECTION_NAME,
} from './postgresql.utils';

@Global()
@Module({})
export class PostgreCoreModule {
  public static forRoot(options: Connection[]): DynamicModule {
    return {
      module: PostgreCoreModule,
      providers: [
        {
          provide: POSTGRES_MODULE_OPTIONS,
          useValue: options || [],
        },
        {
          provide: CONNECTION_POOL_MAP_PROVIDER,
          useFactory: (options: Connection[]) => {
            const CONNECTION_POOL_MAP = new Map<string, PgSQLConnectionPool>();
            for (const conn of options) {
              CONNECTION_POOL_MAP.set(
                conn.name || DEFAULT_CONNECTION_NAME,
                new PgSQLConnectionPool(new Pool(conn)),
              );
            }

            return CONNECTION_POOL_MAP;
          },
          inject: [POSTGRES_MODULE_OPTIONS],
        },
      ],
      exports: [
        {
          provide: POSTGRES_MODULE_OPTIONS,
          useValue: options || [],
        },
        {
          provide: CONNECTION_POOL_MAP_PROVIDER,
          useFactory: (options: Connection[]) => {
            const CONNECTION_POOL_MAP = new Map<string, PgSQLConnectionPool>();
            for (const conn of options) {
              CONNECTION_POOL_MAP.set(
                conn.name || DEFAULT_CONNECTION_NAME,
                new PgSQLConnectionPool(new Pool(conn)),
              );
            }

            return CONNECTION_POOL_MAP;
          },
          inject: [POSTGRES_MODULE_OPTIONS],
        },
      ],
    };
  }

  public static forRootAsync(options: AsyncConnection): DynamicModule {
    return {
      module: PostgreCoreModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProvider(options)],
      exports: [...this.createAsyncProvider(options)],
    };
  }

  private static createAsyncProvider(options: AsyncConnection) {
    return [
      {
        provide: POSTGRES_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: CONNECTION_POOL_MAP_PROVIDER,
        useFactory: (options: Connection[]) => {
          const CONNECTION_POOL_MAP = new Map<string, PgSQLConnectionPool>();
          for (const conn of options) {
            CONNECTION_POOL_MAP.set(
              conn.name || DEFAULT_CONNECTION_NAME,
              new PgSQLConnectionPool(new Pool(conn)),
            );
          }

          return CONNECTION_POOL_MAP;
        },
        inject: [POSTGRES_MODULE_OPTIONS],
      },
    ];
  }
}
