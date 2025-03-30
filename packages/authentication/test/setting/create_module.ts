import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { CQRSAuthenticationRBAC } from '../../src/auth.module';

export async function CreateTestModule() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
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
        migrations: {
          enable: false,
          migrationTableName: '_migration_authentication',
        },
        constroller: {
          enable: true,
        },
      }),
    ],
  }).compile();

  const app: INestApplication<App> = moduleFixture.createNestApplication();
  await app.init();
  return app;
}
