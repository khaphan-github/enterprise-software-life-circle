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
        defaultUserStatus: 'ACTIVE',
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

export interface IRBACConf {
  authSecretKey: string;
  authSalt: string;
  authJwtSecret: string;
  authAccessTokenSecretKey: string;
  authRefreshTokenSecretKey: string;
  authAccessTokenExpiresIn: string;
  authRefreshTokenExpiresIn: string;
  authTokenType: string;
  defaultUserStatus: UserStatus;

  // Config google authentication
  authGoogleClientId?: string;
  authGoogleClientSecret?: string;

  // Multi-Factor Authentication (MFA)
  mfa?: {
    enable?: boolean;
    template?: string;
    method?: MfaMethod;
    otpLength?: number;
    notifyProxy?: INotifyProxy;
  };
}

export interface AuthRBACConfig {
  dbConf: PoolConfig;
  jwtOptions: JwtModuleOptions;
  rbacConf: IRBACConf;
  migrations?: {
    enable?: boolean;
    migrationTableName?: string;
  };
  constroller?: {
    enable?: boolean;
  };
}
@Module({})
export class CQRSAuthenticationRBAC implements OnModuleInit {
  private static config: AuthRBACConfig;

  static register(conf: AuthRBACConfig): DynamicModule {
    this.config = conf;
    return {
      module: CQRSAuthenticationRBAC,
      imports: [
        CacheModule.register(),
        ConfigModule.forRoot({
          load: [
            () => ({
              authRBACConfig: conf,
              GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
            }),
          ],
        }),
        CqrsModule,
        PostgresModule.forRootAsync({
          useFactory: () => [
            {
              name: CONNECTION_STRING_DEFAULT,
              ...conf.dbConf,
            },
          ],
        }),
        PostgresModule.forFeature(CONNECTION_STRING_DEFAULT),
        JwtModule.register(conf.jwtOptions),
      ],
      providers: [
        ...Handlers,
        ...Repositories,
        {
          provide: APP_INTERCEPTOR,
          useClass: ErrorInterceptor,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: LoggingInterceptor,
        },
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
        AuthConf,
      ],
      exports: [...Handlers, ...Repositories, AuthConf],
      controllers: conf.constroller?.enable ? Controllers : [],
    };
  }

  async onModuleInit() {
    // TODO: How exec right migration file directory
    if (CQRSAuthenticationRBAC.config.migrations?.enable) {
      const migrateExecution = new PgMigration(
        CQRSAuthenticationRBAC.config.dbConf,
        {
          modulePrefix: __dirname + '/infrastructure/migrations/',
          migrationTableName:
            CQRSAuthenticationRBAC.config.migrations?.migrationTableName ??
            '_mig_auth_rbac',
        },
      );
      await migrateExecution.executeMigrations();
    }
  }
}
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

```typescript
@Controller('auth')
export class AuthController implements ICustomController {
  @Inject() private readonly commandBus: CommandBus;
  @Inject() private readonly queryBus: QueryBus;

  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDTO) {
    return this.queryBus.execute(
      new LoginQuery(loginDto.username, loginDto.password),
    );
  }

  @Post('google-login')
  @HttpCode(200)
  async googleLogin(@Body() dto: GoogleLoginDTO) {
    return this.commandBus.execute(new GoogleLoginCommand(dto.token));
  }

  @Post('register')
  register(@Body() dto: CreateUserDTO) {
    return this.commandBus.execute(
      new CreateUserCommand(
        dto.username,
        dto.password,
        dto.mfa,
        UserType.PASSWORD,
        dto.metadata,
      ),
    );
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('refresh-token')
  @HttpCode(201)
  refreshToken(@Body() dto: RefreshTokenDTO) {
    return this.commandBus.execute(new RefreshTokenCommand(dto.refreshToken));
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  me(@Headers('authorization') authorization: string) {
    const accessToken = extractTokenFromHeader(authorization);
    return this.queryBus.execute(new MeQuery(accessToken));
  }

  // use when register
  @Post('verify-register-mfa-session')
  @HttpCode(200)
  async verifyMfaSession(@Body() dto: VerifyMfaSessionDTO) {
    return this.commandBus.execute(
      new VerifyMfaSessionCommand(dto.sessionId, dto.otp),
    );
  }

  @Post('verify-login-mfa-session')
  @HttpCode(200)
  async verifyLoginMfaSession(@Body() dto: VerifyLoginMfaSessionDTO) {
    return this.commandBus.execute(
      new VerifyLoginMfaSessionCommand(dto.sessionId, dto.otp),
    );
  }
}

@Controller('actions')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ActionController {
  @Inject() private readonly commandBus: CommandBus;

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateActionDTO[]) {
    return this.commandBus.execute(new CreateActionsCommand(dto));
  }

  @Put()
  @HttpCode(200)
  async update(@Body() dto: UpdateActionDTO[]) {
    return this.commandBus.execute(new UpdateActionsCommand(dto));
  }

  @Delete()
  @HttpCode(204)
  async delete(@Body() dto: DeleteActionDTO) {
    await this.commandBus.execute(new DeleteActionsCommand(dto.ids));
  }
}

@Controller('endpoints')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class EndpointController {
  @Inject() private readonly commandBus: CommandBus;
  @Inject() private readonly queryBus: QueryBus;

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new endpoints' })
  @ApiResponse({
    status: 201,
    description: 'The endpoints have been successfully created.',
    schema: {
      example: [
        {
          path: '/api/example',
          method: 'GET',
          metadata: { key: 'value' },
          status: 'ACTIVE',
        },
      ],
    },
  })
  async create(@Body() dto: CreateEndpointDTO[]) {
    return this.commandBus.execute(new CreateEndpointsCommand(dto));
  }

  @Put()
  @HttpCode(200)
  async update(@Body() dto: UpdateEndpointDTO[]) {
    return this.commandBus.execute(new UpdateEndpointsCommand(dto));
  }

  @Delete()
  @HttpCode(204)
  async delete(@Body() dto: DeleteEndpointDTO) {
    await this.commandBus.execute(new DeleteEndpointsCommand(dto.ids));
  }
}

@ApiTags('Roles')
@Controller('roles')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class RoleController {
  @Inject() private readonly commandBus: CommandBus;
  @Inject() private readonly queryBus: QueryBus;

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateRoleDto) {
    return this.commandBus.execute(
      new CreateRoleCommand(
        dto.name,
        dto.description,
        dto.status,
        dto.metadata,
      ),
    );
  }

  @Post('assign-user')
  @HttpCode(200)
  async assignRoleToUser(@Body() dto: AssignRoleToUserDto) {
    return this.commandBus.execute(
      new AssignRoleToUserCommand(dto.roleIds, dto.userIds),
    );
  }

  @Post('assign-actions')
  @ApiOperation({ summary: 'Assign actions to roles' })
  @ApiBody({ type: AssignActionsToRoleDto })
  async assignActionsToRole(
    @Body() dto: AssignActionsToRoleDto,
  ): Promise<void> {
    const { actionIds, roleIds } = dto;
    await this.commandBus.execute(
      new AssignActionToRoleCommand(actionIds, roleIds),
    );
  }

  @Post('assign-endpoints')
  @ApiOperation({ summary: 'Assign endpoints to roles' })
  @ApiBody({ type: AssignEndpointsToRoleDto })
  async assignEndpointsToRole(
    @Body() dto: AssignEndpointsToRoleDto,
  ): Promise<void> {
    const { endpointIds, roleIds } = dto;
    await this.commandBus.execute(
      new AssignEndpointToRoleCommand(endpointIds, roleIds),
    );
  }
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  @Inject() authenticationConfig: AuthConf;

  private readonly logger = new Logger(AccessTokenGuard.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly queryBus: QueryBus,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isTestMode()) {
      this.logger.debug('Test mode, skipping access token validation');
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    const currentPath = request.path;
    const currentMethod = request.method;
    /// Is public route
    const isPublicRoutes = await this.queryBus.execute(
      new IsPublicRoutesQuery(currentPath, currentMethod),
    );
    if (isPublicRoutes) {
      return true;
    }

    // Check if the request has an authorization header
    const token = extractTokenFromHeader(
      request.headers.authorization,
      this.authenticationConfig.getRbacConf().authTokenType,
    );
    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    // Decode the token
    let decoded = {
      uid: '',
      roles: [],
    };
    try {
      // Verify JWT token manually
      decoded = this.jwtService.verify(token, {
        secret:
          this.authenticationConfig.getRbacConf().authAccessTokenSecretKey,
      });
      request['user'] = decoded;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Can exec route
    const canAccess = await this.queryBus.execute(
      new CanExecRouteQuery(
        decoded['uid'],
        currentPath,
        currentMethod,
        decoded['roles'],
      ),
    );
    if (!canAccess) {
      throw new ForbiddenException(
        'You do not have permission to access this route',
      );
    }

    return true;
  }
}
```

## License

MIT
