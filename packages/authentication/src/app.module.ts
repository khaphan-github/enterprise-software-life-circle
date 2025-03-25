import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    // Configurations
    ConfigModule.forRoot({
      envFilePath: [`${process.env.NODE_ENV || ''}.env`],
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
      secret: process.env.AUTHENTICATION_ACCESS_TOKEN_SECRET_KEY || '', // Store in .env
      signOptions: {
        expiresIn: process.env.AUTHENTICATION_ACCESS_TOKEN_EXPIRES_IN,
      }, // Token expires in 1 hour
    }),
    // Features
  ],
  controllers: Controllers,
  providers: [...Handlers, ...Repositories],
})
export class AppModule {}
