/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RequestPasswordResetHandler } from './request-password-reset.handler';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { RequestPasswordResetCommand } from '../../../domain/user/command/request-password-reset.command';
import { UserStatus } from '../../../domain/user/user-status';
import {
  UserType,
  ResetPasswordMethod,
} from '../../../domain/user/user-entity';
import { PasswordResetRequestedEvent } from '../../../domain/user/events/password-reset-requested.event';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { USER_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';

describe('RequestPasswordResetHandler', () => {
  let handler: RequestPasswordResetHandler;
  let userRepository: IUserRepository;
  let eventHub: EventHub;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestPasswordResetHandler,
        {
          provide: AuthConf,
          useValue: {
            getRbacConf: jest.fn().mockReturnValue({}),
          },
        },
        {
          provide: USER_REPOSITORY_PROVIDER,
          useValue: {
            findUserByResetPasswordAddress: jest.fn(),
            updateUser: jest.fn(),
          },
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: { publish: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<RequestPasswordResetHandler>(
      RequestPasswordResetHandler,
    );
    userRepository = module.get<IUserRepository>(USER_REPOSITORY_PROVIDER);
    eventHub = module.get<EventHub>(EVENT_HUB_PROVIDER);
  });

  it('should successfully request password reset for existing user', async () => {
    const mockUser = {
      id: 'test-user-id',
      username: 'test@example.com',
      passwordHash: 'hashed-password',
      status: UserStatus.ACTIVE,
      type: UserType.PASSWORD,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      initId: jest.fn(),
      getId: jest.fn().mockReturnValue('test-user-id'),
      setId: jest.fn(),
      setCreateTime: jest.fn(),
      setUpdateTime: jest.fn(),
    };

    jest
      .spyOn(userRepository, 'findUserByResetPasswordAddress')
      .mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'updateUser').mockResolvedValue(undefined);
    jest.spyOn(eventHub, 'publish').mockResolvedValue(undefined);

    const command = new RequestPasswordResetCommand(
      'test@example.com',
      ResetPasswordMethod.EMAIL,
    );
    await handler.execute(command);

    expect(userRepository.findUserByResetPasswordAddress).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(userRepository.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-user-id',
        resetPassword: expect.objectContaining({
          token: expect.any(String),
          tokenExpiresAt: expect.any(Date),
        }),
      }),
    );
    expect(eventHub.publish).toHaveBeenCalledWith(
      expect.any(PasswordResetRequestedEvent),
    );
  });

  it('should throw UserNotFoundError if user does not exist', async () => {
    jest
      .spyOn(userRepository, 'findUserByResetPasswordAddress')
      .mockResolvedValue(null);

    const command = new RequestPasswordResetCommand(
      'nonexistent@example.com',
      ResetPasswordMethod.EMAIL,
    );

    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundError);
    expect(userRepository.updateUser).not.toHaveBeenCalled();
    expect(eventHub.publish).not.toHaveBeenCalled();
  });

  it('should generate valid reset token and expiration time', async () => {
    const mockUser = {
      id: 'test-user-id',
      username: 'test@example.com',
      passwordHash: 'hashed-password',
      status: UserStatus.ACTIVE,
      type: UserType.PASSWORD,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      initId: jest.fn(),
      getId: jest.fn().mockReturnValue('test-user-id'),
      setId: jest.fn(),
      setCreateTime: jest.fn(),
      setUpdateTime: jest.fn(),
    };

    jest
      .spyOn(userRepository, 'findUserByResetPasswordAddress')
      .mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'updateUser').mockImplementation((user) => {
      if (!user.resetPassword) {
        throw new Error('Reset password data should be defined');
      }
      expect(user.resetPassword.token).toMatch(/^[a-f0-9]{64}$/); // 32 bytes in hex
      if (!user.resetPassword.tokenExpiresAt) {
        throw new Error('Token expiration should be defined');
      }
      expect(user.resetPassword.tokenExpiresAt.getTime()).toBeGreaterThan(
        Date.now(),
      );
      expect(user.resetPassword.tokenExpiresAt.getTime()).toBeLessThan(
        Date.now() + 25 * 60 * 60 * 1000,
      ); // 25 hours
      return Promise.resolve(undefined);
    });

    const command = new RequestPasswordResetCommand(
      'test@example.com',
      ResetPasswordMethod.EMAIL,
    );
    await handler.execute(command);
  });

  it('should initialize resetPassword object if it does not exist', async () => {
    const mockUser = {
      id: 'test-user-id',
      username: 'test@example.com',
      passwordHash: 'hashed-password',
      status: UserStatus.ACTIVE,
      type: UserType.PASSWORD,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      initId: jest.fn(),
      getId: jest.fn().mockReturnValue('test-user-id'),
      setId: jest.fn(),
      setCreateTime: jest.fn(),
      setUpdateTime: jest.fn(),
    };

    jest
      .spyOn(userRepository, 'findUserByResetPasswordAddress')
      .mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'updateUser').mockImplementation((user) => {
      const resetPassword = user.resetPassword as {
        token: string;
        tokenExpiresAt: Date;
      };
      expect(resetPassword).toBeDefined();
      expect(resetPassword.token).toBeDefined();
      expect(resetPassword.tokenExpiresAt).toBeDefined();
      return Promise.resolve(undefined);
    });

    const command = new RequestPasswordResetCommand(
      'test@example.com',
      ResetPasswordMethod.EMAIL,
    );
    await handler.execute(command);
  });

  it('should publish PasswordResetRequestedEvent with correct data', async () => {
    const mockUser = {
      id: 'test-user-id',
      username: 'test@example.com',
      passwordHash: 'hashed-password',
      status: UserStatus.ACTIVE,
      type: UserType.PASSWORD,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      initId: jest.fn(),
      getId: jest.fn().mockReturnValue('test-user-id'),
      setId: jest.fn(),
      setCreateTime: jest.fn(),
      setUpdateTime: jest.fn(),
    };

    jest
      .spyOn(userRepository, 'findUserByResetPasswordAddress')
      .mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'updateUser').mockResolvedValue(undefined);
    jest.spyOn(eventHub, 'publish').mockResolvedValue(undefined);

    const command = new RequestPasswordResetCommand(
      'test@example.com',
      ResetPasswordMethod.EMAIL,
    );
    await handler.execute(command);

    expect(eventHub.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'test-user-id',
        email: 'test@example.com',
        resetPassword: expect.objectContaining({
          token: expect.any(String),
          tokenExpiresAt: expect.any(Date),
        }),
      }),
    );
  });
});
