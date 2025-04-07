import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserHandler } from './create-user.handler';
import { CreateUserCommand } from '../../../domain/user/command/create-user.command';
import { CommandBus } from '@nestjs/cqrs';
import { UserAlreadyExistError } from '../../../domain/user/errors/user-already-exist.error';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { USER_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { UserEntity } from '../../../domain/user/user-entity';
import { UserType } from '../../../domain/user/user-entity';
import { MfaMethod } from '../../../domain/user/user-entity';
import { ResetPasswordMethod } from '../../../domain/user/user-entity';
import { CreateMfaSessionCommand } from '../../../domain/mfa/command/create-mfa-session.command';
import { UserStatus } from '../../../domain/user/user-status';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let commandBus: jest.Mocked<CommandBus>;
  let repository: jest.Mocked<IUserRepository>;
  let eventHub: jest.Mocked<EventHub>;
  let authConfig: jest.Mocked<AuthConf>;

  const mockRbacConf = {
    authSecretKey: 'test-secret',
    authSalt: 'test-salt',
    authJwtSecret: 'test-jwt-secret',
    authAccessTokenSecretKey: 'test-access-secret',
    authRefreshTokenSecretKey: 'test-refresh-secret',
    authAccessTokenExpiresIn: '1h',
    authRefreshTokenExpiresIn: '7d',
    authTokenType: 'Bearer',
    defaultUserStatus: UserStatus.ACTIVE,
    authGoogleClientId: 'test-client-id',
    authGoogleClientSecret: 'test-client-secret',
    mfa: {
      enable: false,
      method: MfaMethod.NONE,
      otpLength: 6,
      template: 'default',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: USER_REPOSITORY_PROVIDER,
          useValue: {
            findUserByUsername: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: AuthConf,
          useValue: {
            getHashPasswordConf: jest.fn().mockReturnValue({}),
            getRbacConf: jest.fn().mockReturnValue(mockRbacConf),
          },
        },
        {
          provide: 'ID_GENERATOR',
          useValue: {
            generateId: jest.fn().mockReturnValue('test-id'),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateUserHandler>(CreateUserHandler);
    commandBus = module.get(CommandBus);
    repository = module.get(USER_REPOSITORY_PROVIDER);
    eventHub = module.get(EVENT_HUB_PROVIDER);
    authConfig = module.get(AuthConf);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully create a user without MFA', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      const command = new CreateUserCommand(
        username,
        password,
        {
          enable: false,
          method: MfaMethod.NONE,
          receiveMfaCodeAddress: '',
          verified: false,
        },
        UserType.PASSWORD,
      );

      const createdUser = new UserEntity();
      createdUser.id = 'test-id';
      createdUser.username = username;
      createdUser.type = UserType.PASSWORD;
      createdUser.status = UserStatus.ACTIVE;
      createdUser.mfa = {
        enable: false,
        method: MfaMethod.NONE,
        receiveMfaCodeAddress: '',
        verified: false,
      };
      createdUser.passwordHash =
        '$argon2id$v=19$m=65536,t=3,p=4$w5fvssD2cc7Vk2exyY0MFw$jRlcfiU/a6vSStnNNXZtd3kYkuQxmhkWgtH5Maeo4ns';
      createdUser.resetPassword = {
        address: '',
        method: ResetPasswordMethod.NONE,
        token: undefined,
        tokenExpiresAt: undefined,
      };
      createdUser.createdAt = new Date();
      createdUser.updatedAt = new Date();

      repository.findUserByUsername.mockResolvedValue(null);
      repository.createUser.mockResolvedValue(createdUser);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result instanceof UserEntity).toBe(true);
      if (result instanceof UserEntity) {
        expect(result).toMatchObject({
          id: 'test-id',
          username,
          type: UserType.PASSWORD,
          status: UserStatus.ACTIVE,
          mfa: {
            enable: false,
            method: MfaMethod.NONE,
            receiveMfaCodeAddress: '',
            verified: false,
          },
          resetPassword: {
            address: '',
            method: ResetPasswordMethod.NONE,
            token: undefined,
            tokenExpiresAt: undefined,
          },
        });
        expect(result.passwordHash).toMatch(/^\$argon2id\$v=19\$/);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
      }
      expect(repository.findUserByUsername).toHaveBeenCalledWith(username);
      expect(repository.createUser).toHaveBeenCalled();
      expect(eventHub.publish).toHaveBeenCalled();
    });

    it('should successfully create a user with MFA', async () => {
      // Arrange
      authConfig.getRbacConf.mockReturnValue({
        ...mockRbacConf,
        mfa: {
          enable: true,
          method: MfaMethod.EMAIL,
          otpLength: 6,
          template: 'default',
        },
      });

      const username = 'testuser';
      const password = 'password123';
      const command = new CreateUserCommand(
        username,
        password,
        {
          enable: true,
          method: MfaMethod.EMAIL,
          receiveMfaCodeAddress: 'test@example.com',
          verified: false,
        },
        UserType.PASSWORD,
      );

      const createdUser = new UserEntity();
      createdUser.id = 'test-id';
      createdUser.username = username;
      createdUser.type = UserType.PASSWORD;
      createdUser.status = UserStatus.ACTIVE;
      createdUser.mfa = {
        enable: true,
        method: MfaMethod.EMAIL,
        receiveMfaCodeAddress: 'test@example.com',
        verified: false,
      };
      createdUser.passwordHash =
        '$argon2id$v=19$m=65536,t=3,p=4$w5fvssD2cc7Vk2exyY0MFw$jRlcfiU/a6vSStnNNXZtd3kYkuQxmhkWgtH5Maeo4ns';
      createdUser.resetPassword = {
        address: '',
        method: ResetPasswordMethod.NONE,
        token: undefined,
        tokenExpiresAt: undefined,
      };
      createdUser.createdAt = new Date();
      createdUser.updatedAt = new Date();

      const sessionId = 'session-id';

      repository.findUserByUsername.mockResolvedValue(null);
      repository.createUser.mockResolvedValue(createdUser);
      commandBus.execute.mockResolvedValue(sessionId);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toEqual({ sessionId });
      expect(repository.findUserByUsername).toHaveBeenCalledWith(username);
      expect(repository.createUser).toHaveBeenCalled();
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateMfaSessionCommand),
      );
      expect(eventHub.publish).not.toHaveBeenCalled();
    });

    it('should throw UserAlreadyExistError when user exists', async () => {
      // Arrange
      const username = 'existinguser';
      const password = 'password123';
      const command = new CreateUserCommand(
        username,
        password,
        {
          enable: false,
          method: MfaMethod.NONE,
          receiveMfaCodeAddress: '',
          verified: false,
        },
        UserType.PASSWORD,
      );
      const existingUser = new UserEntity();

      repository.findUserByUsername.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        UserAlreadyExistError,
      );
      expect(repository.createUser).not.toHaveBeenCalled();
      expect(eventHub.publish).not.toHaveBeenCalled();
    });

    it('should handle repository error during user creation', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      const command = new CreateUserCommand(
        username,
        password,
        {
          enable: false,
          method: MfaMethod.NONE,
          receiveMfaCodeAddress: '',
          verified: false,
        },
        UserType.PASSWORD,
      );

      repository.findUserByUsername.mockResolvedValue(null);
      repository.createUser.mockRejectedValue(new Error('Repository error'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Repository error',
      );
    });

    it('should handle command bus error during MFA session creation', async () => {
      // Arrange
      authConfig.getRbacConf.mockReturnValue({
        ...mockRbacConf,
        mfa: {
          enable: true,
          method: MfaMethod.EMAIL,
          otpLength: 6,
          template: 'default',
        },
      });

      const username = 'testuser';
      const password = 'password123';
      const command = new CreateUserCommand(
        username,
        password,
        {
          enable: true,
          method: MfaMethod.EMAIL,
          receiveMfaCodeAddress: 'test@example.com',
          verified: false,
        },
        UserType.PASSWORD,
      );

      const createdUser = new UserEntity();
      createdUser.id = 'test-id';
      createdUser.username = username;
      createdUser.type = UserType.PASSWORD;
      createdUser.status = UserStatus.ACTIVE;
      createdUser.mfa = {
        enable: true,
        method: MfaMethod.EMAIL,
        receiveMfaCodeAddress: 'test@example.com',
        verified: false,
      };
      createdUser.passwordHash =
        '$argon2id$v=19$m=65536,t=3,p=4$w5fvssD2cc7Vk2exyY0MFw$jRlcfiU/a6vSStnNNXZtd3kYkuQxmhkWgtH5Maeo4ns';
      createdUser.resetPassword = {
        address: '',
        method: ResetPasswordMethod.NONE,
        token: undefined,
        tokenExpiresAt: undefined,
      };
      createdUser.createdAt = new Date();
      createdUser.updatedAt = new Date();

      repository.findUserByUsername.mockResolvedValue(null);
      repository.createUser.mockResolvedValue(createdUser);
      commandBus.execute.mockRejectedValue(new Error('Command bus error'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Command bus error',
      );
    });
  });
});
