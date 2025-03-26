import { Module, DynamicModule, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Handlers } from './application';
import { CqrsModule } from '@nestjs/cqrs';
import { Repositories } from './infrastructure';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PostgresModule } from 'nest-postgresql-multi-connect';
import { Connection } from 'nest-postgresql-multi-connect/dist/postgresql.interface';
import { PgMigration } from 'postgrest-migration';
import { CONNECTION_STRING_DEFAULT } from './configurations/connection-string-default';

export interface AuthRBACConfig {
  dbConf: Connection;
  jwtOptions: JwtModuleOptions;
  rbacConf: {
    authSecretKey: string;
    authSalt: string;
    authJwtSecret: string;
    authAccessTokenSecretKey: string;
    authRefreshTokenSecretKey: string;
    authAccessTokenExpiresIn: string;
    authRefreshTokenExpiresIn: string;
  };
}

@Module({})
export class CQRSAuthenticationRBAC implements OnModuleInit {
  private static config: AuthRBACConfig;

  static register(conf: AuthRBACConfig): DynamicModule {
    this.config = conf;
    return {
      module: CQRSAuthenticationRBAC,
      imports: [
        ConfigModule.forRoot({
          load: [() => ({ authRBACConfig: conf })],
        }),
        CqrsModule,
        PostgresModule.forRootAsync({
          useFactory: () => [
            {
              name: CONNECTION_STRING_DEFAULT,
              ...conf.dbConf,
            },
          ],
        }),
        PostgresModule.forFeature(CONNECTION_STRING_DEFAULT),
        JwtModule.register(conf.jwtOptions),
      ],
      providers: [...Handlers, ...Repositories],
      exports: [...Handlers, ...Repositories],
    };
  }

  async onModuleInit() {
    const migrateExecution = new PgMigration(
      CQRSAuthenticationRBAC.config.dbConf,
      {
        modulePrefix: 'src/infrastructure/migrations/',
      },
    );
    await migrateExecution.executeMigrations();
  }
}
