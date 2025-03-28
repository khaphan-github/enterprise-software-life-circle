# CQRS Authentication RBAC Module for NestJS
# Hi! We are developing at full speed! Come back when we reach version ≥ 3.0.0.
This module provides Role-Based Access Control (RBAC) authentication using CQRS in a NestJS application. It integrates with PostgreSQL and uses JWT for authentication.
## Features

### Authentication Features
- ✅ **User Registration** – Allow users to sign up (email/password, social login, etc.).
- ✅ **User Login** – Authenticate users with secure methods (JWT, OAuth, session-based).
- ✅ **Token Management** – Use access & refresh tokens (JWT-based or session).
- X **Multi-Factor Authentication (MFA)** – Optional for added security.
- X **Password Reset & Recovery** – Enable users to recover their accounts.
- X **Session Management** – Handle multiple active sessions & logout.

### Role-Based Access Control (RBAC) Features
- ✅ **Role Management** – Create, update, and delete roles (e.g., Admin, User, Editor).
- ✅ **Permission Management** – Assign permissions to roles (e.g., read, write, delete).
- ✅ **User-Role Assignment** – Map users to one or multiple roles.
- ✅ **Fine-Grained Access Control** – Restrict access based on permissions.
- ✅ **Middleware/Guards** – Enforce role-based access in API endpoints or UI components.

### Security & Compliance
- ✅ **Secure Password Hashing** – Use bcrypt, Argon2, or PBKDF2.
- X **Rate Limiting & Brute Force Protection** – Prevent login abuse.
- X **Audit Logging** – Track authentication & authorization actions.
- X **RBAC Configuration Storage** – Store roles/permissions in DB, cache, or config.
- X **Granular Access Policies** – Allow resource-level access control.

## Installation

Ensure you have NestJS installed in your project. Then, install the required dependencies:

```sh
npm i cqrs-authentication-rbac
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
        authAccessTokenSecretKey:
          process.env.AUTH_ACCESS_TOKEN_SECRET_KEY || 'defaultAccessTokenSecretKey',
        authRefreshTokenSecretKey:
          process.env.AUTH_REFRESH_TOKEN_SECRET_KEY || 'defaultRefreshTokenSecretKey',
        authAccessTokenExpiresIn:
          process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN || '3600s',
        authRefreshTokenExpiresIn:
          process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN || '86400s',
      },
      migrations: {
        enable: false,
        migrationTableName: '_migration_authentication',
      },
    }),
  ],
})
export class AppModule {}
```
### Available Bussiness logic
- Let's me write doc after finish verion 3.0.0
#### Login with username password
#### Register
#### Refresh token
#### Me
#### AccessTokenGuard
#### Events

### Events

#### User Events
- **UserCreatedEvent**: Triggered when a new user is created.
- **UserLogedinEvent**: Triggered when a user successfully logs in.
- **UserLoginFailEvent**: Triggered when a user login attempt fails.
- **UserUpdatedEvent**: Triggered when a user's details are updated.
- **UserDeletedEvent**: Triggered when a user is deleted.

#### Role Events
- **UserRoleEntityCreatedEvent**: Triggered when a new user role entity is created.
- **UserRoleUpdatedEvent**: Triggered when a user role is updated.
- **UserRoleDeletedEvent**: Triggered when a user role is deleted.
- **EndpointsAddedToRolesEvent**: Triggered when endpoints are added to specific roles.
- **PermissionsUpdatedForRoleEvent**: Triggered when permissions are updated for a role.

#### Endpoint Events
- **EndpointEntityCreatedEvent**: Triggered when a new endpoint entity is created.
- **EndpointEntityUpdatedEvent**: Triggered when an endpoint entity is updated.
- **EndpointEntityDeletedEvent**: Triggered when an endpoint entity is deleted.
- **EndpointAccessedEvent**: Triggered when an endpoint is accessed.
- **EndpointPermissionUpdatedEvent**: Triggered when permissions for an endpoint are updated.

#### Action Events
- **ActionTriggeredEvent**: Triggered when a specific action is performed by a user.
- **ActionFailedEvent**: Triggered when an action fails to execute.
- **ActionCompletedEvent**: Triggered when an action is successfully completed.

### Role-Based Authorization
- Let's me write doc after finish verion 3.0.0

## License
MIT

