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

##### Register User
**POST** `/auth/register`

Request Body:
```json
{
  "username": "string",
  "password": "string",
  "metadata": {
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

Response:
```json
{
  "id": "string",
  "username": "string",
  "metadata": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

##### Login
**POST** `/auth/login`

Request Body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "metadata": {},
    "createdAt": "string",
    "updatedAt": "string"
  },
  "accessToken": "string",
  "refreshToken": "string"
}
```

##### Refresh Token
**POST** `/auth/refresh-token`

Request Body:
```json
{
  "refreshToken": "string"
}
```

Response:
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

##### Get Current User
**GET** `/auth/me`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "id": "string",
  "username": "string",
  "metadata": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### Multi-Factor Authentication (MFA) Flow

The module supports Time-based One-Time Password (TOTP) for MFA. Here's how to implement the MFA flow:

##### 1. Enable MFA for User
**POST** `/auth/mfa/enable`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "secret": "string", // TOTP secret key
  "qrCode": "string"  // QR code for authenticator apps
}
```

##### 2. Verify MFA Setup
**POST** `/auth/mfa/verify-setup`

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "code": "string" // 6-digit code from authenticator app
}
```

Response:
```json
{
  "success": true
}
```

##### 3. Login with MFA
**POST** `/auth/login`

Request Body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response (if MFA is enabled):
```json
{
  "requiresMFA": true,
  "tempToken": "string"
}
```

##### 4. Complete MFA Login
**POST** `/auth/mfa/verify`

Request Body:
```json
{
  "tempToken": "string",
  "code": "string" // 6-digit code from authenticator app
}
```

Response:
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "metadata": {},
    "createdAt": "string",
    "updatedAt": "string"
  },
  "accessToken": "string",
  "refreshToken": "string"
}
```

##### 5. Disable MFA
**POST** `/auth/mfa/disable`

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "code": "string" // 6-digit code from authenticator app
}
```

Response:
```json
{
  "success": true
}
```

##### MFA Implementation Example

```typescript
// 1. Enable MFA for a user
async enableMFA(userId: string) {
  const { secret, qrCode } = await this.authService.enableMFA(userId);
  
  // Display QR code to user
  // User scans with authenticator app (Google Authenticator, Authy, etc.)
  
  // Verify setup
  const isValid = await this.authService.verifyMFASetup(userId, code);
  if (isValid) {
    // MFA is now enabled for the user
  }
}

// 2. Handle login with MFA
async login(username: string, password: string) {
  const response = await this.authService.login(username, password);
  
  if (response.requiresMFA) {
    // Show MFA input to user
    const mfaCode = await this.getMFAInput();
    
    // Complete login with MFA
    const tokens = await this.authService.verifyMFA(
      response.tempToken,
      mfaCode
    );
    
    // Handle successful login
  }
}
```

##### MFA Security Considerations

1. **Backup Codes**
   - Generate backup codes when enabling MFA
   - Store backup codes securely
   - Allow users to regenerate backup codes

2. **Recovery Process**
   - Implement a secure recovery process for lost MFA access
   - Require additional verification for MFA recovery
   - Consider using backup email/phone for recovery

3. **Rate Limiting**
   - Implement stricter rate limiting for MFA attempts
   - Lock account after multiple failed MFA attempts
   - Require admin intervention for account unlock

4. **Session Management**
   - Consider "remember this device" option
   - Implement device tracking for suspicious activity
   - Allow users to view and revoke active sessions

#### Role Management APIs

##### Create Role
**POST** `/auth/roles`

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "name": "string",
  "description": "string",
  "permissions": ["string"]
}
```

Response:
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "permissions": ["string"],
  "createdAt": "string",
  "updatedAt": "string"
}
```

##### Assign Role to User
**POST** `/auth/roles/assign`

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "userId": "string",
  "roleId": "string"
}
```

Response:
```json
{
  "success": true
}
```

##### Get User Roles
**GET** `/auth/roles/user/:userId`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "roles": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "permissions": ["string"]
    }
  ]
}
```

##### Get Roles by Route
**GET** `/auth/roles/route/:routeId`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "roles": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "permissions": ["string"]
    }
  ]
}
```

#### Endpoint Management APIs

##### Create Endpoint
**POST** `/auth/endpoints`

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "path": "string",
  "method": "string",
  "description": "string",
  "isPublic": boolean
}
```

Response:
```json
{
  "id": "string",
  "path": "string",
  "method": "string",
  "description": "string",
  "isPublic": boolean,
  "createdAt": "string",
  "updatedAt": "string"
}
```

##### Update Endpoint
**PUT** `/auth/endpoints/:id`

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "path": "string",
  "method": "string",
  "description": "string",
  "isPublic": boolean
}
```

Response:
```json
{
  "id": "string",
  "path": "string",
  "method": "string",
  "description": "string",
  "isPublic": boolean,
  "createdAt": "string",
  "updatedAt": "string"
}
```

##### Delete Endpoint
**DELETE** `/auth/endpoints/:id`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "success": true
}
```

##### Get Endpoints
**GET** `/auth/endpoints`

Headers:
```
Authorization: Bearer <access_token>
```

Query Parameters:
- `cursor`: string (optional) - Pagination cursor
- `limit`: number (optional) - Number of items per page

Response:
```json
{
  "items": [
    {
      "id": "string",
      "path": "string",
      "method": "string",
      "description": "string",
      "isPublic": boolean,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "nextCursor": "string"
}
```

##### Check Public Route
**GET** `/auth/endpoints/public/:path`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "isPublic": boolean
}
```

#### Action Management APIs

##### Create Action
**POST** `/auth/actions`

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "name": "string",
  "description": "string",
  "type": "string"
}
```

Response:
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "type": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

##### Update Action
**PUT** `/auth/actions/:id`

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "name": "string",
  "description": "string",
  "type": "string"
}
```

Response:
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "type": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

##### Delete Action
**DELETE** `/auth/actions/:id`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "success": true
}
```

##### Get Actions
**GET** `/auth/actions`

Headers:
```
Authorization: Bearer <access_token>
```

Query Parameters:
- `cursor`: string (optional) - Pagination cursor
- `limit`: number (optional) - Number of items per page

Response:
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "type": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "nextCursor": "string"
}
```

##### Get Action by ID
**GET** `/auth/actions/:id`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "type": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### Route Permission APIs

##### Check Route Execution Permission
**GET** `/auth/routes/:routeId/can-execute`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "canExecute": boolean
}
```

#### Events

The module emits various events that you can listen to for custom business logic:

##### User Events
- `UserCreatedEvent`: Triggered when a new user is created
- `UserLogedinEvent`: Triggered when a user successfully logs in
- `UserLoginFailEvent`: Triggered when a user login attempt fails
- `UserUpdatedEvent`: Triggered when a user's details are updated
- `UserDeletedEvent`: Triggered when a user is deleted

##### Role Events
- `UserRoleEntityCreatedEvent`: Triggered when a new user role is created
- `UserRoleUpdatedEvent`: Triggered when a user role is updated
- `UserRoleDeletedEvent`: Triggered when a user role is deleted
- `EndpointsAddedToRolesEvent`: Triggered when endpoints are added to roles
- `PermissionsUpdatedForRoleEvent`: Triggered when role permissions are updated

##### Endpoint Events
- `EndpointEntityCreatedEvent`: Triggered when a new endpoint is created
- `EndpointEntityUpdatedEvent`: Triggered when an endpoint is updated
- `EndpointEntityDeletedEvent`: Triggered when an endpoint is deleted
- `EndpointAccessedEvent`: Triggered when an endpoint is accessed
- `EndpointPermissionUpdatedEvent`: Triggered when endpoint permissions are updated

### Role-Based Authorization

The module provides several ways to implement role-based authorization:

1. **Using Guards**
```typescript
@UseGuards(RoleGuard)
@Roles('ADMIN')
@Get('admin-only')
async adminOnly() {
  return 'This is admin only';
}
```

2. **Using Decorators**
```typescript
@HasRole('ADMIN')
async someAdminFunction() {
  // Only accessible by users with ADMIN role
}
```

3. **Using Permissions**
```typescript
@HasPermission('READ_USERS')
async getUsers() {
  // Only accessible by users with READ_USERS permission
}
```

### Error Handling

The module includes comprehensive error handling with the following features:
- Standardized error responses
- Detailed error logging
- Custom error interceptors
- Validation error handling

### Database Migrations

The module includes automatic database migrations that can be enabled/disabled through configuration. Migrations handle:
- User table creation
- Role and permission tables
- User-role relationships
- Endpoint permissions

## Security Considerations

1. **Environment Variables**
   - Always use environment variables for sensitive configuration
   - Never commit sensitive values to version control

2. **Token Security**
   - Access tokens have a shorter expiration time
   - Refresh tokens have a longer expiration time
   - Tokens are signed with secure secrets

3. **Password Security**
   - Passwords are hashed using bcrypt
   - Password policies can be enforced through validation

4. **Rate Limiting**
   - Implement rate limiting for authentication endpoints
   - Configure appropriate limits based on your needs

## License

MIT
