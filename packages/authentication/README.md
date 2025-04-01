# CQRS Authentication RBAC Module for NestJS
This module provides Role-Based Access Control (RBAC) authentication using CQRS in a NestJS application. It integrates with PostgreSQL and uses JWT for authentication.

## Features
### Authentication Features

- ✅ **User Registration** – Allow users to sign up with email/password authentication
- ✅ **User Login** – Authenticate users with JWT-based authentication
- ✅ **Token Management** – Use access & refresh tokens with configurable expiration
- ✅ **Password Reset & Recovery** – Enable users to recover their accounts
- ✅ **Session Management** – Handle multiple active sessions & logout
- ✅ **User Status Management** - Track and manage user account status (active, inactive, suspended)

### Role-Based Access Control (RBAC) Features

- ✅ **Role Management** – Create, update, and delete roles (e.g., Admin, User, Editor)
- ✅ **Permission Management** – Assign permissions to roles (e.g., read, write, delete)
- ✅ **User-Role Assignment** – Map users to one or multiple roles
- ✅ **Fine-Grained Access Control** – Restrict access based on permissions
- ✅ **Middleware/Guards** – Enforce role-based access in API endpoints
- ✅ **Endpoint-Based Authorization** - Control access to specific API endpoints

### Security & Compliance

- ✅ **Secure Password Hashing** – Use bcrypt for password hashing
- ✅ **Rate Limiting & Brute Force Protection** – Prevent login abuse
- ✅ **Audit Logging** – Track authentication & authorization actions
- ✅ **RBAC Configuration Storage** – Store roles/permissions in PostgreSQL
- ✅ **Granular Access Policies** – Allow resource-level access control
- ✅ **Error Handling & Logging** - Comprehensive error handling and logging system

## Installation

Ensure you have NestJS installed in your project. Then, install the required dependencies:

```sh
npm i cqrs-authentication-rbac
```

## Usage
### Register the Module

Import and configure the module in your NestJS application:

```typescript
import { Module } from '@nestjs/common';
import { CQRSAuthenticationRBAC } from 'cqrs-authentication-rbac';

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
        authAccessTokenSecretKey: process.env.AUTH_ACCESS_TOKEN_SECRET_KEY || 'defaultAccessTokenSecretKey',
        authRefreshTokenSecretKey: process.env.AUTH_REFRESH_TOKEN_SECRET_KEY || 'defaultRefreshTokenSecretKey',
        authAccessTokenExpiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN || '3600s',
        authRefreshTokenExpiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN || '86400s',
        authTokenType: process.env.AUTH_TOKEN_TYPE ?? 'Bearer',
        defaultUserStatus: 'ACTIVE'
      },
      migrations: {
        enable: true,
        migrationTableName: '_migration_authentication',
      },
      constroller: {
        enable: true,
      },
    }),
  ],
})
export class AppModule {}
```

### Available Business Logic
# Available Bussiness logic
- Let's me write doc after finish verion 3.0.0
## AccessTokenGuard
### 1. Apply Guard Globally (Recommended for Most Applications)

```typescript
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get required services from app
  const jwtService = app.get(JwtService);
  const queryBus = app.get(QueryBus);
  
  // Register guard globally
  app.useGlobalGuards(new AccessTokenGuard(jwtService, queryBus));
  
  await app.listen(3000);
}
bootstrap();
```

### 2. Apply Guard to Specific Controller

```typescript
// src/users/users.controller.ts
import { UseGuards } from '@nestjs/common';

@Controller('users')
@UseGuards(AccessTokenGuard)
export class UsersController {
  // All routes in this controller will be protected
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

### 3. Apply Guard to Individual Route

```typescript
// src/profile/profile.controller.ts
import { UseGuards } from '@nestjs/common';

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(AccessTokenGuard)
  getProfile() {
    // This specific route is protected
  }

  @Get('public')
  getPublicInfo() {
    // This route remains unprotected
  }
}
```
# Multi-factor login flow:
# Multi-factor register flow:
#### Authentication Endpoints
## License

MIT
