import { Module, DynamicModule } from '@nestjs/common';
import { PortgresqlConfigModule } from './configurations/databases/postgresql/config.module';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import {
  CONNECTION_STRING_DEFAULT,
  POSTGRE_SQL_DB_CONFIG_MAIN,
} from './configurations/databases/postgresql/configuration';
import { Handlers } from './application';
import { CqrsModule } from '@nestjs/cqrs';
import { Repositories } from './infrastructure';
import { PostgresModule } from './libs/postgresql/postgres.module';
import { Controllers } from './interfaces';
import { JwtModule } from '@nestjs/jwt';

@Module({})
export class CQRSAuthenticationRBAC {
  static register(config: {
    envFilePath: string;
    secretKey: string;
    expiresIn: string;
  }): DynamicModule {
    return {
      module: CQRSAuthenticationRBAC,
      imports: [
        // Configurations
        ConfigModule.forRoot({
          envFilePath: [config.envFilePath],
          load: [POSTGRE_SQL_DB_CONFIG_MAIN],
          isGlobal: true,
          validationSchema: Joi?.object([]),
          validationOptions: {
            abortEarly: true, // if true, stops validation on the first error
          },
        }),

        PortgresqlConfigModule,
        PostgresModule.forFeature(CONNECTION_STRING_DEFAULT),
        // Core
        CqrsModule,
        JwtModule.register({
          secret: config.secretKey, // Use the secret key from the config
          signOptions: {
            expiresIn: config.expiresIn,
          }, // Token expires in the provided time
        }),
        // Features
      ],
      controllers: Controllers,
      providers: [...Handlers, ...Repositories],
      exports: [...Handlers, ...Repositories],
    };
  }
}
