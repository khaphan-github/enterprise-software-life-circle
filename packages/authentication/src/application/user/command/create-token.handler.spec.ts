/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CreateTokenHandler } from './create-token.handler';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { TokenCreatedEvent } from '../../../domain/user/events/token-created.event';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';

describe('CreateTokenHandler', () => {
  let handler: CreateTokenHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let eventHub: jest.Mocked<EventHub>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTokenHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: {
            getRolesByUserId: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
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
            getRbacConf: jest.fn().mockReturnValue({
              authAccessTokenExpiresIn: '1d',
              authRefreshTokenExpiresIn: '7d',
              authAccessTokenSecretKey: 'ACCESS_TOKEN_SECRET_KEY',
              authRefreshTokenSecretKey: 'REFRESH_TOKEN_SECRET_KEY',
            }),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateTokenHandler>(CreateTokenHandler);
    roleRepository = module.get(ROLE_REPOSITORY_PROVIDER);
    jwtService = module.get(JwtService);
    eventHub = module.get(EVENT_HUB_PROVIDER);
  });

  it('should generate access and refresh tokens and publish TokenCreatedEvent', async () => {
    const command = new CreateTokenCommand('user-id-123');
    const roles: any = [{ id: 'role-1' }, { id: 'role-2' }];
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    roleRepository.getRolesByUserId.mockResolvedValue(roles);
    jwtService.sign
      .mockReturnValueOnce(accessToken) // For access token
      .mockReturnValueOnce(refreshToken); // For refresh token

    const result = await handler.execute(command);

    expect(roleRepository.getRolesByUserId).toHaveBeenCalledWith('user-id-123');
    expect(jwtService.sign).toHaveBeenCalledWith(
      { uid: 'user-id-123', roles: ['role-1', 'role-2'] },
      {
        secret: 'ACCESS_TOKEN_SECRET_KEY',
        expiresIn: '1d',
      },
    );
    expect(jwtService.sign).toHaveBeenCalledWith(
      { uid: 'user-id-123' },
      {
        secret: 'REFRESH_TOKEN_SECRET_KEY',
        expiresIn: '7d',
      },
    );
    expect(eventHub.publish).toHaveBeenCalledWith(
      new TokenCreatedEvent(refreshToken, accessToken),
    );
    expect(result).toEqual({ accessToken, refreshToken });
  });
});
