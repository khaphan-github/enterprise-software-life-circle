import {
  Module,
  DynamicModule,
  OnModuleInit,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Handlers } from './application';
import { CacheModule } from '@nestjs/cache-manager';
import { CqrsModule } from '@nestjs/cqrs';
import { Controllers } from './infrastructure';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PostgresModule } from 'nest-postgresql-multi-connect';
import { PgMigration } from 'postgrest-migration';
import { CONNECTION_STRING_DEFAULT } from './infrastructure/providers/repository/connection-string-default';
import { PoolConfig } from 'pg';
import { AuthConf } from './infrastructure/conf/auth-config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ErrorInterceptor } from './infrastructure/interceptor/error.interceptor';
import { LoggingInterceptor } from './infrastructure/interceptor/log.interceptor';
import { UserStatus } from './domain/user/user-status';
import { INotifyProxy } from './domain/mfa/inotify.proxy';
import { MfaMethod } from './domain/user/user-entity';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
} from './infrastructure/repository/mongodb/schema/user.schema';
import { EventHubProvider } from './infrastructure/providers/event-hub.provider';
import { IdGeneratorProvider } from './infrastructure/providers/id-genrerator.provider';
import { MongoRepositoryProviders } from './infrastructure/providers/repository/mongo-repository.provider';
import { PostgresRepositoryProviders } from './infrastructure/providers/repository/postgres-repository.provider';

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
  mfa?: {
    enable?: boolean;
    template?: string;
    method?: MfaMethod;
    otpLength?: number;
    notifyProxy?: INotifyProxy;
  };
}

export interface AuthRBACConfig {
  database: 'postgres' | 'mongodb';
  dbConf?: PoolConfig;
  migrations?: {
    enable?: boolean;
    migrationTableName?: string;
  };
  mongoDbConf?: MongooseModuleOptions; // Added MongoDB configuration
  jwtOptions: JwtModuleOptions;
  rbacConf: IRBACConf;
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
        CqrsModule,
        CacheModule.register(),
        JwtModule.register(conf.jwtOptions),
        ConfigModule.forRoot({
          load: [
            () => ({
              authRBACConfig: conf,
            }),
          ],
        }),
        PostgresModule.forRootAsync({
          useFactory: () => [
            {
              name: CONNECTION_STRING_DEFAULT,
              ...conf.dbConf,
            },
          ],
        }),
        PostgresModule.forFeature(CONNECTION_STRING_DEFAULT),
        ...(conf.mongoDbConf
          ? [
              MongooseModule.forRootAsync({
                useFactory: () => conf.mongoDbConf || {},
              }),
              MongooseModule.forFeature([
                { name: User.name, schema: UserSchema },
              ]),
            ]
          : []), // Conditionally add MongoDB module
      ],
      providers: [
        ...(this.config.database == 'mongodb'
          ? MongoRepositoryProviders
          : PostgresRepositoryProviders),
        ...Handlers,
        AuthConf,
        IdGeneratorProvider,
        EventHubProvider,
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
      ],
      exports: [...Handlers, AuthConf],
      controllers: conf.constroller?.enable ? Controllers : [],
    };
  }

  async onModuleInit() {
    // TODO: How exec right migration file directory
    if (
      CQRSAuthenticationRBAC.config.migrations?.enable &&
      CQRSAuthenticationRBAC.config.dbConf
    ) {
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
