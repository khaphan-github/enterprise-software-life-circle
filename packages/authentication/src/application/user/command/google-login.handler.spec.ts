/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleLoginHandler } from './google-login.handler';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { AuthConf } from '../../../configurations/auth-config';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { GoogleLoginCommand } from '../../../domain/user/command/google-login.command';
import { OAuth2Client } from 'google-auth-library';
import { InvalidGoogleClientIdError } from '../../../domain/user/errors/invalid-google-client-id.error';
import { CreateUserCommand } from '../../../domain/user/command/create-user.command';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { Mfa, MfaMethod, UserType } from '../../../domain/user/user-entity';
import { UserStatus } from '../../../domain/user/user-status';

jest.mock('google-auth-library');

describe('GoogleLoginHandler', () => {
  let handler: GoogleLoginHandler;
  let commandBus: CommandBus;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleLoginHandler,
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AuthConf,
          useValue: {
            getRbacConf: jest.fn().mockReturnValue({
              authGoogleClientId: 'test-client-id',
              authGoogleClientSecret: 'test-client-secret',
            }),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getUserByUsername: jest.fn(),
          },
        },
        {
          provide: EventBus,
          useValue: { publish: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<GoogleLoginHandler>(GoogleLoginHandler);
    commandBus = module.get<CommandBus>(CommandBus);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should create a new user and return tokens if user does not exist', async () => {
    const mockPayload = { sub: 'test-sub', email: 'test@example.com' };
    const mockTicket = { getPayload: jest.fn().mockReturnValue(mockPayload) };
    const mockGoogleClient = {
      verifyIdToken: jest.fn().mockResolvedValue(mockTicket),
    };
    jest
      .spyOn(OAuth2Client.prototype, 'verifyIdToken')
      .mockImplementation(mockGoogleClient.verifyIdToken);
    jest.spyOn(userRepository, 'getUserByUsername').mockResolvedValue(null);
    jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValueOnce({ id: 'new-user-id' }) // CreateUserCommand
      .mockResolvedValueOnce({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }); // CreateTokenCommand

    const command = new GoogleLoginCommand('test-id-token');
    const result = await handler.execute(command);

    expect(mockGoogleClient.verifyIdToken).toHaveBeenCalledWith({
      idToken: 'test-id-token',
      audience: 'test-client-id',
    });

    const mfa: Mfa = {
      enable: false,
      method: MfaMethod.EMAIL,
      receiveMfaCodeAddress: mockPayload.email,
      verified: false,
    };
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CreateUserCommand(
        'test-sub',
        expect.any(String),
        mfa,
        UserType.GOOGLE,
        mockPayload,
      ),
    );
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CreateTokenCommand('new-user-id'),
    );
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'new-user-id' },
    });
  });

  it('should return tokens for an existing user', async () => {
    const mockPayload = { sub: 'test-sub', email: 'test@example.com' };
    const mockTicket = { getPayload: jest.fn().mockReturnValue(mockPayload) };
    const mockGoogleClient = {
      verifyIdToken: jest.fn().mockResolvedValue(mockTicket),
    };
    jest
      .spyOn(OAuth2Client.prototype, 'verifyIdToken')
      .mockImplementation(mockGoogleClient.verifyIdToken);
    jest.spyOn(userRepository, 'getUserByUsername').mockResolvedValue({
      id: 'existing-user-id',
      username: 'existing-user',
      passwordHash: 'hashed-password',
      status: UserStatus.ACTIVE,
      type: UserType.GOOGLE,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      initId: jest.fn(),
      getId: jest.fn().mockReturnValue('existing-user-id'),
      setId: jest.fn(),
      setCreateTime: jest.fn(),
      setUpdateTime: jest.fn(),
    });
    jest.spyOn(commandBus, 'execute').mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const command = new GoogleLoginCommand('test-id-token');
    const result = await handler.execute(command);

    expect(mockGoogleClient.verifyIdToken).toHaveBeenCalledWith({
      idToken: 'test-id-token',
      audience: 'test-client-id',
    });
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CreateTokenCommand('existing-user-id'),
    );
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: expect.objectContaining({ id: 'existing-user-id' }),
    });
  });

  it('should throw InvalidGoogleClientIdError if payload is invalid', async () => {
    const mockTicket = { getPayload: jest.fn().mockReturnValue(null) };
    const mockGoogleClient = {
      verifyIdToken: jest.fn().mockResolvedValue(mockTicket),
    };
    jest
      .spyOn(OAuth2Client.prototype, 'verifyIdToken')
      .mockImplementation(mockGoogleClient.verifyIdToken);

    const command = new GoogleLoginCommand('test-id-token');

    await expect(handler.execute(command)).rejects.toThrow(
      InvalidGoogleClientIdError,
    );
    expect(mockGoogleClient.verifyIdToken).toHaveBeenCalledWith({
      idToken: 'test-id-token',
      audience: 'test-client-id',
    });
  });
});
