import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenHandler } from './refresh-token.handler';
import { RefreshTokenCommand } from '../../../domain/user/command/refresh-token.command';
import { JwtService } from '@nestjs/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { InvalidRefreshTokenError } from '../../../domain/user/errors/invalid-refresh-token.error';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { USER_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { UserEntity } from '../../../domain/user/user-entity';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { AuthConf } from '../../../infrastructure/conf/auth-config';

describe('RefreshTokenHandler', () => {
  let handler: RefreshTokenHandler;
  let jwtService: jest.Mocked<JwtService>;
  let commandBus: jest.Mocked<CommandBus>;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenHandler,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockImplementation((token) => {
              if (token === 'invalid-refresh-token') {
                throw new Error('Invalid token');
              }
              return Promise.resolve({ uid: 'user1' });
            }),
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn().mockResolvedValue(new UserEntity()),
          },
        },
        {
          provide: USER_REPOSITORY_PROVIDER,
          useValue: {
            isExistUserById: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: AuthConf,
          useValue: {
            getRbacConf: jest.fn().mockReturnValue({
              authRefreshTokenSecretKey: 'test-secret-key',
            }),
          },
        },
      ],
    }).compile();

    handler = module.get<RefreshTokenHandler>(RefreshTokenHandler);
    jwtService = module.get(JwtService);
    commandBus = module.get(CommandBus);
    repository = module.get(USER_REPOSITORY_PROVIDER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully refresh token', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const userId = 'user1';
      const command = new RefreshTokenCommand(refreshToken);
      const expectedUser = new UserEntity();

      jwtService.verifyAsync.mockResolvedValue({ uid: userId });
      repository.isExistUserById.mockResolvedValue(true);
      commandBus.execute.mockResolvedValue(expectedUser);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBe(expectedUser);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-secret-key',
      });
      expect(repository.isExistUserById).toHaveBeenCalledWith(userId);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateTokenCommand),
      );
    });

    it('should throw InvalidRefreshTokenError when token is invalid', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';
      const command = new RefreshTokenCommand(refreshToken);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        InvalidRefreshTokenError,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-secret-key',
      });
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const userId = 'non-existent-user';
      const command = new RefreshTokenCommand(refreshToken);

      jwtService.verifyAsync.mockResolvedValue({ uid: userId });
      repository.isExistUserById.mockResolvedValue(false);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundError);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-secret-key',
      });
      expect(repository.isExistUserById).toHaveBeenCalledWith(userId);
    });

    it('should handle command bus error during token creation', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const userId = 'user1';
      const command = new RefreshTokenCommand(refreshToken);

      jwtService.verifyAsync.mockResolvedValue({ uid: userId });
      repository.isExistUserById.mockResolvedValue(true);
      commandBus.execute.mockRejectedValue(new Error('Command bus error'));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Command bus error',
      );
    });
  });
});
