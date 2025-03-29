import { Test, TestingModule } from '@nestjs/testing';
import { MeHandler } from './me.handler';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { MeQuery } from '../../../domain/user/query/me.query';
import { InvalidAccessTokenError } from '../../../domain/user/errors/invalid-access-token.error';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { AuthConf } from '../../../configurations/auth-config';

describe('MeHandler', () => {
  let handler: MeHandler;
  let userRepository: UserRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeHandler,
        {
          provide: UserRepository,
          useValue: {
            findUserById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: AuthConf,
          useValue: {
            getRbacConf: jest.fn().mockReturnValue({
              authAccessTokenSecretKey: 'secretKey',
            }),
          },
        },
      ],
    }).compile();

    handler = module.get<MeHandler>(MeHandler);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return user if access token is valid', async () => {
    const mockUser: any = { id: '123', username: 'testuser' };
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ uid: '123' });
    jest.spyOn(userRepository, 'findUserById').mockReturnValue(mockUser);

    const result = await handler.execute(new MeQuery('validAccessToken'));
    expect(result).toEqual(mockUser);
  });

  it('should throw InvalidAccessTokenError if token is invalid', async () => {
    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

    await expect(
      handler.execute(new MeQuery('invalidAccessToken')),
    ).rejects.toThrow(InvalidAccessTokenError);
  });

  it('should throw UserNotFoundError if user is not found', async () => {
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ uid: '123' });
    jest.spyOn(userRepository, 'findUserById').mockResolvedValue(null);

    await expect(
      handler.execute(new MeQuery('validAccessToken')),
    ).rejects.toThrow(UserNotFoundError);
  });
});
