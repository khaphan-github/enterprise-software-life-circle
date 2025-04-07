import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CQRSAuthenticationRBAC } from '../src/auth.module';
import { App } from 'supertest/types';
import { UserStatus } from '../src/domain/user/user-status';

let appSetup: INestApplication<App>;

export default async function globalSetup() {
  process.env.NODE_ENV = 'test';
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      CQRSAuthenticationRBAC.register({
        database: 'mongodb',
        mongoDbConf: {
          uri:
            process.env.MONGO_URI ||
            'mongodb://root:example@mongodb:27017/test?authSource=admin',
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
          authTokenType: process.env.AUTH_TOKEN_TYPE ?? 'Bearer',
          defaultUserStatus: UserStatus.ACTIVE,
        },
        migrations: {
          enable: false,
        },
        constroller: {
          enable: true,
        },
      }),
    ],
  }).compile();

  appSetup = moduleFixture.createNestApplication();
  await appSetup.init();

  // Store the app instance globally
  globalThis.__APP__ = appSetup;
}
