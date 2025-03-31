import {
  Module,
  DynamicModule,
  OnModuleInit,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Handlers } from './application';
import { CqrsModule } from '@nestjs/cqrs';
import { Controllers, Repositories } from './infrastructure';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PostgresModule } from 'nest-postgresql-multi-connect';
import { PgMigration } from 'postgrest-migration';
import { CONNECTION_STRING_DEFAULT } from './configurations/connection-string-default';
import { PoolConfig } from 'pg';
import { AuthConf } from './configurations/auth-config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ErrorInterceptor } from './infrastructure/interceptor/error.interceptor';
import { LoggingInterceptor } from './infrastructure/interceptor/log.interceptor';
import { UserStatus } from './domain/user/user-status';
import { INotifyProxy } from './domain/mfa/inotify.proxy';

export interface IRBACConf {
  authSecretKey: string;
  authSalt: string;
  authJwtSecret: string;
  authAccessTokenSecretKey: string;
  authRefreshTokenSecretKey: string;
  authAccessTokenExpiresIn: string;
  authRefreshTokenExpiresIn: string;
  authTokenType: string;
  defaultUserStatus: UserStatus;

  // Config google authentication
  authGoogleClientId?: string;
  authGoogleClientSecret?: string;

  // Multi-Factor Authentication (MFA)
  mfa: {
    enable: boolean;
    template: string;
    otpLength: number;
    notifyProxy: INotifyProxy;
  };
}

export interface AuthRBACConfig {
  dbConf: PoolConfig;
  jwtOptions: JwtModuleOptions;
  rbacConf: IRBACConf;
  migrations?: {
    enable?: boolean;
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
          load: [
            () => ({
              authRBACConfig: conf,
              GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
            }),
          ],
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
      providers: [
        ...Handlers,
        ...Repositories,
        {
          provide: APP_INTERCEPTOR,
          useClass: ErrorInterceptor,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: LoggingInterceptor,
        },
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
        AuthConf,
      ],
      exports: [...Handlers, ...Repositories, AuthConf],
      controllers: conf.constroller?.enable ? Controllers : [],
    };
  }

  async onModuleInit() {
    // TODO: How exec right migration file directory
    if (CQRSAuthenticationRBAC.config.migrations?.enable) {
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
}
