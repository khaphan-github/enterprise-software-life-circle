# CQRS Authentication RBAC Module for NestJS

This module provides Role-Based Access Control (RBAC) authentication using CQRS in a NestJS application. It integrates with PostgreSQL and uses JWT for authentication.

## Features
- CQRS-based authentication
- Role-Based Access Control (RBAC)
- JWT-based authentication
- Configurable via environment variables

## Installation

Ensure you have NestJS installed in your project. Then, install the required dependencies:

```sh
npm install @nestjs/jwt @nestjs/config pg
```

## Configuration

To use this module, provide the necessary environment variables:

```sh
PG_MAIN_DB_HOST=localhost
PG_MAIN_DB_PORT=5432
PG_MAIN_DB_USER=postgres
PG_MAIN_DB_PASSWORD=postgres
PG_MAIN_DB_DATABASE=postgres

JWT_SECRET=your_jwt_secret

AUTH_SECRET_KEY=your_auth_secret_key
AUTH_SALT=your_auth_salt
AUTH_JWT_SECRET=your_auth_jwt_secret
AUTH_ACCESS_TOKEN_SECRET_KEY=your_access_token_secret_key
AUTH_REFRESH_TOKEN_SECRET_KEY=your_refresh_token_secret_key
AUTH_ACCESS_TOKEN_EXPIRES_IN=3600s
AUTH_REFRESH_TOKEN_EXPIRES_IN=86400s
```

## Usage

### Register the Module

Import and configure the module in your NestJS application:

```typescript
import { Module } from '@nestjs/common';
import { CQRSAuthenticationRBAC } from 'your-auth-module';

@Module({
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
          process.env.AUTH_ACCESS_TOKEN_SECRET_KEY || 'defaultAccessTokenSecretKey',
        authRefreshTokenSecretKey:
          process.env.AUTH_REFRESH_TOKEN_SECRET_KEY || 'defaultRefreshTokenSecretKey',
        authAccessTokenExpiresIn:
          process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN || '3600s',
        authRefreshTokenExpiresIn:
          process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN || '86400s',
      },
    }),
  ],
})
export class AppModule {}
```

### Available APIs

#### Register a User

```http
POST /auth/register
```
**Body:**
```json
{
  "username": "testuser",
  "password": "securepassword",
  "role": "admin"
}
```

#### Login
```http
POST /auth/login
```
**Body:**
```json
{
  "username": "testuser",
  "password": "securepassword"
}
```

#### Get User Info
```http
GET /auth/me
```
**Headers:**
```http
Authorization: Bearer <access_token>
```

### Role-Based Authorization

You can protect routes using role-based guards.

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'your-auth-module';
import { Roles } from 'your-auth-module';

@Controller('protected')
@UseGuards(RolesGuard)
export class ProtectedController {
  @Get()
  @Roles('admin')
  getProtectedResource() {
    return { message: 'Access granted!' };
  }
}
```

## License
MIT

