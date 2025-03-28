/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { EventBus } from '@nestjs/cqrs';
import { CreateTokenHandler } from './create-token.handler';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { RoleRepository } from '../../../infrastructure/repository/role.repository';
import { TokenCreatedEvent } from '../../../domain/user/events/token-created.event';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET_KEY,
} from '../../../domain/user/const';

describe('CreateTokenHandler', () => {
  let handler: CreateTokenHandler;
  let roleRepository: jest.Mocked<RoleRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTokenHandler,
        {
          provide: RoleRepository,
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
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateTokenHandler>(CreateTokenHandler);
    roleRepository = module.get(RoleRepository);
    jwtService = module.get(JwtService);
    eventBus = module.get(EventBus);
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
        secret: ACCESS_TOKEN_SECRET_KEY,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    );
    expect(jwtService.sign).toHaveBeenCalledWith(
      { uid: 'user-id-123' },
      {
        secret: REFRESH_TOKEN_SECRET_KEY,
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      },
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      new TokenCreatedEvent(refreshToken, accessToken),
    );
    expect(result).toEqual({ accessToken, refreshToken });
  });
});
