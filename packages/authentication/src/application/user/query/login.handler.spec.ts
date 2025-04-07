import { Test, TestingModule } from '@nestjs/testing';
import { LoginHandler } from './login.handler';
import { LoginQuery } from '../../../domain/user/query/login.query';
import { CommandBus } from '@nestjs/cqrs';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { PasswordNotMatchError } from '../../../domain/user/errors/password-not-match.error';
import { UserDeletedError } from '../../../domain/user/errors/user-deleted.error';
import { UserInactivatedError } from '../../../domain/user/errors/user-inactivated.error';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { USER_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { UserEntity } from '../../../domain/user/user-entity';
import { UserStatus } from '../../../domain/user/user-status';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { CreateMfaSessionCommand } from '../../../domain/mfa/command/create-mfa-session.command';
import { MfaMethod } from '../../../domain/user/user-entity';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('LoginHandler', () => {
  let handler: LoginHandler;
  let commandBus: jest.Mocked<CommandBus>;
  let repository: jest.Mocked<IUserRepository>;
  let eventHub: jest.Mocked<EventHub>;
  let authConfig: jest.Mocked<AuthConf>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginHandler,
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
          },
        },
      ],
    }).compile();

    handler = module.get<LoginHandler>(LoginHandler);
    commandBus = module.get(CommandBus);
    repository = module.get(USER_REPOSITORY_PROVIDER);
    eventHub = module.get(EVENT_HUB_PROVIDER);
    authConfig = module.get(AuthConf);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully login without MFA', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      const query = new LoginQuery(username, password);
      const user = new UserEntity();
      user.id = 'user1';
      user.status = UserStatus.ACTIVE;
      user.passwordHash = 'hashed-password';

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      repository.findUserByUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      commandBus.execute.mockResolvedValue(tokens);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual({
        user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(repository.findUserByUsername).toHaveBeenCalledWith(username);
      expect(argon2.verify).toHaveBeenCalledWith(
        user.passwordHash,
        password,
        {},
      );
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateTokenCommand),
      );
      expect(eventHub.publish).toHaveBeenCalled();
    });

    it('should successfully login with MFA', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      const query = new LoginQuery(username, password);
      const user = new UserEntity();
      user.id = 'user1';
      user.status = UserStatus.ACTIVE;
      user.passwordHash = 'hashed-password';
      user.mfa = {
        enable: true,
        method: MfaMethod.EMAIL,
        receiveMfaCodeAddress: 'test@example.com',
        verified: false,
      };

      const sessionId = 'session-id';

      repository.findUserByUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      commandBus.execute.mockResolvedValue(sessionId);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual({ sessionId });
      expect(repository.findUserByUsername).toHaveBeenCalledWith(username);
      expect(argon2.verify).toHaveBeenCalledWith(
        user.passwordHash,
        password,
        {},
      );
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateMfaSessionCommand),
      );
      expect(eventHub.publish).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      // Arrange
      const username = 'nonexistent';
      const password = 'password123';
      const query = new LoginQuery(username, password);

      repository.findUserByUsername.mockResolvedValue(null);
      (argon2.verify as jest.Mock).mockClear();

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(UserNotFoundError);
      expect(argon2.verify).not.toHaveBeenCalled();
      expect(commandBus.execute).not.toHaveBeenCalled();
      expect(eventHub.publish).not.toHaveBeenCalled();
    });

    it('should throw UserDeletedError when user is deleted', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      const query = new LoginQuery(username, password);
      const user = new UserEntity();
      user.status = UserStatus.DELETED;

      repository.findUserByUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockClear();

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(UserDeletedError);
      expect(argon2.verify).not.toHaveBeenCalled();
      expect(commandBus.execute).not.toHaveBeenCalled();
      expect(eventHub.publish).not.toHaveBeenCalled();
    });

    it('should throw UserInactivatedError when user is inactive', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      const query = new LoginQuery(username, password);
      const user = new UserEntity();
      user.status = UserStatus.INACTIVE;

      repository.findUserByUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockClear();

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(
        UserInactivatedError,
      );
      expect(argon2.verify).not.toHaveBeenCalled();
      expect(commandBus.execute).not.toHaveBeenCalled();
      expect(eventHub.publish).not.toHaveBeenCalled();
    });

    it('should throw PasswordNotMatchError when password is incorrect', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'wrong-password';
      const query = new LoginQuery(username, password);
      const user = new UserEntity();
      user.status = UserStatus.ACTIVE;
      user.passwordHash = 'hashed-password';

      repository.findUserByUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(
        PasswordNotMatchError,
      );
      expect(eventHub.publish).toHaveBeenCalled();
      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('should handle command bus error during token creation', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      const query = new LoginQuery(username, password);
      const user = new UserEntity();
      user.status = UserStatus.ACTIVE;
      user.passwordHash = 'hashed-password';

      repository.findUserByUsername.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      commandBus.execute.mockRejectedValue(new Error('Command bus error'));

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow('Command bus error');
    });
  });
});
