import { Test, TestingModule } from '@nestjs/testing';
import { RemoveRolesFromUserHandler } from '../../../application/user-role/command/remove-roles-from-user.handler';
import { RemoveRolesFromUserCommand } from './remove-roles-from-user.command';
import { IRoleRepository } from '../../repository/role-repository.interface';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EventHub } from '../../event-hub/event.hub';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';

describe('RemoveRolesFromUserHandler', () => {
  let handler: RemoveRolesFromUserHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let eventHub: jest.Mocked<EventHub>;

  beforeEach(async () => {
    roleRepository = {
      removeRolesFromUser: jest.fn(),
    } as any;

    eventHub = {
      publish: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveRolesFromUserHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: roleRepository,
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: eventHub,
        },
      ],
    }).compile();

    handler = module.get<RemoveRolesFromUserHandler>(
      RemoveRolesFromUserHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should remove roles from user and publish event', async () => {
    const userId = 'test-user-id';
    const roleIds = ['role1', 'role2'];

    await handler.execute(new RemoveRolesFromUserCommand(userId, roleIds));

    expect(roleRepository.removeRolesFromUser).toHaveBeenCalledWith(
      userId,
      roleIds,
    );
    expect(eventHub.publish).toHaveBeenCalled();
  });
});
