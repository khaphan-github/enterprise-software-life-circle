/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RequestPasswordResetHandler } from './request-password-reset.handler';
import { EventBus } from '@nestjs/cqrs';
import { AuthConf } from '../../../configurations/auth-config';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { RequestPasswordResetCommand } from '../../../domain/user/command/request-password-reset.command';
import { UserStatus } from '../../../domain/user/user-status';
import {
  UserType,
  ResetPasswordMethod,
} from '../../../domain/user/user-entity';
import { PasswordResetRequestedEvent } from '../../../domain/user/events/password-reset-requested.event';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';

describe('RequestPasswordResetHandler', () => {
  let handler: RequestPasswordResetHandler;
  let userRepository: UserRepository;
  let eventBus: EventBus;

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
          provide: UserRepository,
          useValue: {
            findUserByResetPasswordAddress: jest.fn(),
            updateUser: jest.fn(),
          },
        },
        {
          provide: EventBus,
          useValue: { publish: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<RequestPasswordResetHandler>(
      RequestPasswordResetHandler,
    );
    userRepository = module.get<UserRepository>(UserRepository);
    eventBus = module.get<EventBus>(EventBus);
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
    jest.spyOn(eventBus, 'publish').mockResolvedValue(undefined);

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
    expect(eventBus.publish).toHaveBeenCalledWith(
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
    expect(eventBus.publish).not.toHaveBeenCalled();
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
    jest.spyOn(eventBus, 'publish').mockResolvedValue(undefined);

    const command = new RequestPasswordResetCommand(
      'test@example.com',
      ResetPasswordMethod.EMAIL,
    );
    await handler.execute(command);

    expect(eventBus.publish).toHaveBeenCalledWith(
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
