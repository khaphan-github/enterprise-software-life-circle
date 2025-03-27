import { Module, DynamicModule, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Handlers } from './application';
import { CqrsModule } from '@nestjs/cqrs';
import { Repositories } from './infrastructure';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PostgresModule } from 'nest-postgresql-multi-connect';
import { PgMigration } from 'postgrest-migration';
import { CONNECTION_STRING_DEFAULT } from './configurations/connection-string-default';
import { PoolConfig } from 'pg';
import { AuthController } from './infrastructure/interface/auth.controller';

export interface AuthRBACConfig {
  dbConf: PoolConfig;
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
  migrations?: {
    migrationTableName?: string;
  };
  constroller?: {
    enable?: boolean;
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
      controllers: conf.constroller?.enable ? [AuthController] : [],
    };
  }

  async onModuleInit() {
    // TODO: How exec right migration file directory
    const migrateExecution = new PgMigration(
      CQRSAuthenticationRBAC.config.dbConf,
      {
        modulePrefix: __dirname + '/infrastructure/migrations/',
        migrationTableName:
          CQRSAuthenticationRBAC.config.migrations?.migrationTableName ??
          '_mig_auth_rbac',
      },
    );
    await migrateExecution.executeMigrations();
  }
}
