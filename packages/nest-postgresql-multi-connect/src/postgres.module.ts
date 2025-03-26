import { DynamicModule, Module } from '@nestjs/common';
import { PgSQLConnectionPool } from './connection-pool';
import { PostgreCoreModule } from './postgres-core.module';
import { Connection, AsyncConnection } from './postgresql.interface';
import {
  generateConnectionPoolToken,
  CONNECTION_POOL_MAP_PROVIDER,
  DEFAULT_CONNECTION_NAME,
} from './postgresql.utils';

@Module({})
export class PostgresModule {
  /**
   * You are expecting to configure a dynamic module once and reuse that
   * configuration in multiple places (though possibly unknowingly as
   * it's abstracted away) */
  public static forRoot(options: Connection[]): DynamicModule {
    return {
      module: PostgresModule,
      imports: [PostgreCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(options: AsyncConnection): DynamicModule {
    return {
      module: PostgresModule,
      imports: [PostgreCoreModule.forRootAsync(options)],
    };
  }

  /** You are expecting to use the configuration of a dynamic module's forRoot
   * but need to modify some configuration specific to the calling module's needs */
  public static forFeature(
    connection: string = DEFAULT_CONNECTION_NAME,
  ): DynamicModule {
    return {
      module: PostgresModule,
      providers: [this.createConnectionPoolProvider(connection)],
      exports: [this.createConnectionPoolProvider(connection)],
    };
  }

  private static createConnectionPoolProvider(connection: string) {
    return {
      provide: generateConnectionPoolToken(connection),
      useFactory: (connPoolMap: Map<string, PgSQLConnectionPool>) => {
        if (!connPoolMap.has(connection)) {
          throw new Error(`no connection ${connection} available`);
        }

        return connPoolMap.get(connection);
      },
      inject: [CONNECTION_POOL_MAP_PROVIDER],
    };
  }
}
