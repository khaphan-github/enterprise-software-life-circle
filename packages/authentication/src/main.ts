/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { CQRSAuthenticationRBAC } from './auth.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UserStatus } from './domain/user/user-status';
import { MfaMethod } from './domain/user/user-entity';

async function bootstrap() {
  const app = await NestFactory.create(
    CQRSAuthenticationRBAC.register({
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
        authTokenType: process.env.AUTH_TOKEN_TYPE ?? 'Bearer',
        defaultUserStatus: UserStatus.ACTIVE,
        authGoogleClientId: process.env.GOOGLE_CLIENT_ID,
        authGoogleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
        mfa: {
          enable: false,
          method: MfaMethod.EMAIL,
          otpLength: 6,
        },
      },
      constroller: { enable: true },
      migrations: {
        enable: true,
      },
      database: 'postgres',
      mongoDbConf: {
        uri: 'mongodb://root:example@mongodb:27017',
        dbName: 'local',
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API Documentation with JWT Authentication')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token', // This is the security name used in @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
