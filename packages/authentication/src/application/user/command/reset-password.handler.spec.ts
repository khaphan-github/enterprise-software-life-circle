/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordHandler } from './reset-password.handler';
import { ResetPasswordCommand } from '../../../domain/user/command/reset-password.command';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import * as argon2 from 'argon2';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { PasswordResetCompletedEvent } from '../../../domain/user/events/password-reset-completed.event';
import { USER_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';

describe('ResetPasswordHandler', () => {
  let handler: ResetPasswordHandler;
  let repository: jest.Mocked<IUserRepository>;
  let eventHub: jest.Mocked<EventHub>;
  let authConfig: jest.Mocked<AuthConf>;

  beforeEach(async () => {
    repository = {
      findUserByResetToken: jest.fn(),
      updateUser: jest.fn(),
    } as any;

    eventHub = {
      publish: jest.fn(),
    } as any;

    authConfig = {
      getHashPasswordConf: jest.fn().mockReturnValue({}),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordHandler,
        { provide: USER_REPOSITORY_PROVIDER, useValue: repository },
        { provide: EVENT_HUB_PROVIDER, useValue: eventHub },
        { provide: AuthConf, useValue: authConfig },
      ],
    }).compile();

    handler = module.get<ResetPasswordHandler>(ResetPasswordHandler);
  });

  it('should reset the password successfully', async () => {
    const command = new ResetPasswordCommand('valid-token', 'new-password');
    const user: any = {
      id: 'user-id',
      resetPassword: {
        token: 'valid-token',
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour in the future
      },
      passwordHash: 'old-hash',
    };

    repository.findUserByResetToken.mockResolvedValue(user);
    jest.spyOn(argon2, 'hash').mockResolvedValue('new-hash');

    await handler.execute(command);

    expect(repository.findUserByResetToken).toHaveBeenCalledWith('valid-token');
    expect(argon2.hash).toHaveBeenCalledWith('new-password', {});
    expect(user.passwordHash).toBe('new-hash');
    expect(user.resetPassword).toEqual({});
    expect(repository.updateUser).toHaveBeenCalledWith(user);
    expect(eventHub.publish).toHaveBeenCalledWith(
      new PasswordResetCompletedEvent('user-id'),
    );
  });

  it('should throw UserNotFoundError if user is not found', async () => {
    const command = new ResetPasswordCommand('invalid-token', 'new-password');
    repository.findUserByResetToken.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundError);
    expect(repository.findUserByResetToken).toHaveBeenCalledWith(
      'invalid-token',
    );
  });

  it('should throw an error if the reset token has expired', async () => {
    const command = new ResetPasswordCommand('expired-token', 'new-password');
    const user: any = {
      resetPassword: {
        token: 'expired-token',
        tokenExpiresAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour in the past
      },
    };

    repository.findUserByResetToken.mockResolvedValue(user);

    await expect(handler.execute(command)).rejects.toThrow(
      'Reset token has expired',
    );
  });

  it('should throw an error if the reset token is invalid', async () => {
    const command = new ResetPasswordCommand('invalid-token', 'new-password');
    const user: any = {
      resetPassword: {
        token: 'valid-token',
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour in the future
      },
    };

    repository.findUserByResetToken.mockResolvedValue(user);

    await expect(handler.execute(command)).rejects.toThrow(
      'Invalid reset token',
    );
  });
});
