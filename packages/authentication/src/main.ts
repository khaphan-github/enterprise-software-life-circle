import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { CQRSAuthenticationRBAC } from './auth.module';
import { setupApiDocs } from './configurations/swagger/configuration';

async function bootstrap() {
  // Tạo một logger mới
  const logger = new Logger('STARTUP');

  const app = await NestFactory.create(
    CQRSAuthenticationRBAC.register({
      dbConf: {
        host: process.env.PG_MAIN_DB_HOST || 'localhost',
        port: parseInt(process.env.PG_MAIN_DB_PORT || '5432', 10),
        user: process.env.PG_MAIN_DB_USER || 'postgres',
        password: process.env.PG_MAIN_DB_PASSWORD || 'postgres',
        database: process.env.PG_MAIN_DB_DATABASE || 'postgres',
      },
      jwtOptions: {
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: { expiresIn: '60s' },
      },
      rbacConf: {
        authSecretKey: process.env.AUTH_SECRET_KEY || 'defaultAuthSecretKey',
        authSalt: process.env.AUTH_SALT || 'defaultAuthSalt',
        authJwtSecret: process.env.AUTH_JWT_SECRET || 'defaultAuthJwtSecret',
        authAccessTokenSecretKey:
          process.env.AUTH_ACCESS_TOKEN_SECRET_KEY ||
          'defaultAccessTokenSecretKey',
        authRefreshTokenSecretKey:
          process.env.AUTH_REFRESH_TOKEN_SECRET_KEY ||
          'defaultRefreshTokenSecretKey',
        authAccessTokenExpiresIn:
          process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN || '3600s',
        authRefreshTokenExpiresIn:
          process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN || '86400s',
      },
    }),
  );

  app.setGlobalPrefix('api/v23');

  app.enableCors({
    allowedHeaders: [
      'Content-Type, Authorization, Content-Length, X-Requested-With, app-key',
    ],
  });

  app.useGlobalPipes(new ValidationPipe());

  // Kích hoạt API docs swagger
  setupApiDocs('docs', app);

  await app.listen(process.env.PORT || 3000);
  logger.log('App start running on ' + (await app.getUrl()));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
