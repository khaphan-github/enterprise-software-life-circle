import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { VerifyLoginfaSessionHandler } from './verify-login-mfa-session.handler';
import { VerifyLoginMfaSessionCommand } from '../../../domain/mfa/command/verify-login-mfa-session.command';
import { VerifyMfaSessionCommand } from '../../../domain/mfa/command/verify-mfa-session.command';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { UserLogedinEvent } from '../../../domain/user/events/user-logedin.event';
import { UserEntity } from '../../../domain/user/user-entity';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { AuthConf } from '../../../infrastructure/conf/auth-config';

describe('VerifyLoginfaSessionHandler', () => {
  let handler: VerifyLoginfaSessionHandler;
  let commandBus: jest.Mocked<CommandBus>;
  let eventHub: jest.Mocked<EventHub>;
  let authConfig: AuthConf;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyLoginfaSessionHandler,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
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
            getRbacConf: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<VerifyLoginfaSessionHandler>(
      VerifyLoginfaSessionHandler,
    );
    commandBus = module.get(CommandBus);
    eventHub = module.get(EVENT_HUB_PROVIDER);
    authConfig = module.get(AuthConf);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully verify login MFA session and return tokens', async () => {
      // Arrange
      const command = new VerifyLoginMfaSessionCommand('session123', '123456');
      const mockUser = new UserEntity();
      mockUser.id = 'user123';

      const mockTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      };

      commandBus.execute
        .mockResolvedValueOnce(mockUser) // For VerifyMfaSessionCommand
        .mockResolvedValueOnce(mockTokens); // For CreateTokenCommand

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toEqual({
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(VerifyMfaSessionCommand),
      );
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateTokenCommand),
      );
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(UserLogedinEvent),
      );
    });

    it('should handle verification failure', async () => {
      // Arrange
      const command = new VerifyLoginMfaSessionCommand('session123', '123456');
      const error = new Error('Verification failed');
      commandBus.execute.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Verification failed',
      );
      expect(eventHub.publish).not.toHaveBeenCalled();
    });
  });
});
