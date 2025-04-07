import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateMfaSessionHandler } from './create-mfa-session.handler';
import { CreateMfaSessionCommand } from '../../../domain/mfa/command/create-mfa-session.command';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { UserEntity, MfaMethod } from '../../../domain/user/user-entity';
import { SendEmailCodeEvent } from '../../../domain/mfa/event/send-email-mfa-code.event';
import { SendSMSCodeEvent } from '../../../domain/mfa/event/send-sms-mfa-code.event';

jest.mock('../../../shared/utils/random-numer.util', () => ({
  generateRandomNumber: jest.fn().mockReturnValue('123456'),
}));

jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('test-session-id'),
}));

describe('CreateMfaSessionHandler', () => {
  let handler: CreateMfaSessionHandler;
  let eventBus: jest.Mocked<EventBus>;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMfaSessionHandler,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
          },
        },
        {
          provide: AuthConf,
          useValue: {
            getRbacConf: jest.fn().mockReturnValue({
              mfa: { otpLength: 6 },
            }),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateMfaSessionHandler>(CreateMfaSessionHandler);
    eventBus = module.get(EventBus);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create MFA session with EMAIL method', async () => {
      // Arrange
      const user = new UserEntity();
      user.id = 'user123';
      user.mfa = {
        method: MfaMethod.EMAIL,
        receiveMfaCodeAddress: 'test@example.com',
        verified: false,
        enable: true,
      };
      const command = new CreateMfaSessionCommand(user);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBe('test-session-id');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'test-session-id',
        {
          otp: '123456',
          uid: 'user123',
        },
        1000 * 60 * 5,
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(SendEmailCodeEvent),
      );
    });

    it('should create MFA session with SMS method', async () => {
      // Arrange
      const user = new UserEntity();
      user.id = 'user123';
      user.mfa = {
        method: MfaMethod.SMS,
        receiveMfaCodeAddress: '+1234567890',
        verified: false,
        enable: true,
      };
      const command = new CreateMfaSessionCommand(user);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBe('test-session-id');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'test-session-id',
        {
          otp: '123456',
          uid: 'user123',
        },
        1000 * 60 * 5,
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(SendSMSCodeEvent),
      );
    });

    it('should handle user without MFA method', async () => {
      // Arrange
      const user = new UserEntity();
      user.id = 'user123';
      const command = new CreateMfaSessionCommand(user);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBe('test-session-id');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'test-session-id',
        {
          otp: '123456',
          uid: 'user123',
        },
        1000 * 60 * 5,
      );
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
});
