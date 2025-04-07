import { Test, TestingModule } from '@nestjs/testing';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { VerifyfaSessionHandler } from './verify-mfa-session.handler';
import { VerifyMfaSessionCommand } from '../../../domain/mfa/command/verify-mfa-session.command';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { UserEntity, MfaMethod } from '../../../domain/user/user-entity';
import { USER_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { VerifyMfaCodeNotMatchError } from '../../../domain/mfa/error/verify-mfa-not-match.error';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';

describe('VerifyfaSessionHandler', () => {
  let handler: VerifyfaSessionHandler;
  let cacheManager: jest.Mocked<Cache>;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyfaSessionHandler,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: USER_REPOSITORY_PROVIDER,
          useValue: {
            findUserById: jest.fn(),
            updateUser: jest.fn(),
          },
        },
        {
          provide: AuthConf,
          useValue: {
            getRbacConf: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<VerifyfaSessionHandler>(VerifyfaSessionHandler);
    cacheManager = module.get(CACHE_MANAGER);
    repository = module.get(USER_REPOSITORY_PROVIDER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully verify MFA session', async () => {
      // Arrange
      const command = new VerifyMfaSessionCommand('session123', '123456');
      const mockUser = new UserEntity();
      mockUser.id = 'user123';
      mockUser.mfa = {
        method: MfaMethod.EMAIL,
        receiveMfaCodeAddress: 'test@example.com',
        verified: false,
        enable: true,
      };

      cacheManager.get.mockResolvedValue({
        otp: '123456',
        uid: 'user123',
      });

      repository.findUserById.mockResolvedValue(mockUser);
      repository.updateUser.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('user123');
      expect(result.mfa.verified).toBe(true);
      expect(cacheManager.del).toHaveBeenCalledWith('session123');
      expect(repository.updateUser).toHaveBeenCalled();
    });

    it('should throw VerifyMfaCodeNotMatchError when OTP does not match', async () => {
      // Arrange
      const command = new VerifyMfaSessionCommand('session123', '123456');
      cacheManager.get.mockResolvedValue({
        otp: '654321', // Different OTP
        uid: 'user123',
      });

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        VerifyMfaCodeNotMatchError,
      );
      expect(repository.updateUser).not.toHaveBeenCalled();
      expect(cacheManager.del).not.toHaveBeenCalled();
    });

    it('should throw VerifyMfaCodeNotMatchError when session not found', async () => {
      // Arrange
      const command = new VerifyMfaSessionCommand('session123', '123456');
      cacheManager.get.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        VerifyMfaCodeNotMatchError,
      );
      expect(repository.updateUser).not.toHaveBeenCalled();
      expect(cacheManager.del).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundError when user not found', async () => {
      // Arrange
      const command = new VerifyMfaSessionCommand('session123', '123456');
      cacheManager.get.mockResolvedValue({
        otp: '123456',
        uid: 'user123',
      });
      repository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundError);
      expect(repository.updateUser).not.toHaveBeenCalled();
      expect(cacheManager.del).not.toHaveBeenCalled();
    });
  });
});
