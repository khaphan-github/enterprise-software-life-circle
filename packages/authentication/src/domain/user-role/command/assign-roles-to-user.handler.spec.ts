/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AssignRolesToUserHandler } from '../../../application/user-role/command/assign-roles-to-user.handler';
import { AssignRolesToUserCommand } from './assign-roles-to-user.command';
import { IRoleRepository } from '../../repository/role-repository.interface';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EventHub } from '../../event-hub/event.hub';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { UserRoleEntity, UserRoleStatus } from '../../role/user-role.entity';

describe('AssignRolesToUserHandler', () => {
  let handler: AssignRolesToUserHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let eventHub: jest.Mocked<EventHub>;

  beforeEach(async () => {
    roleRepository = {
      assignRoleToUser: jest.fn().mockImplementation(() => Promise.resolve()),
    } as any;

    eventHub = {
      publish: jest.fn().mockImplementation(() => Promise.resolve()),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignRolesToUserHandler,
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

    handler = module.get<AssignRolesToUserHandler>(AssignRolesToUserHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should assign roles to user and publish event', async () => {
    const userId = 'test-user-id';
    const roleIds = ['role1', 'role2'];
    const userRoles = roleIds.map((roleId) => {
      const entity = new UserRoleEntity();
      entity.userId = userId;
      entity.roleId = roleId;
      entity.status = UserRoleStatus.ACTIVE;
      entity.metadata = {};
      return entity;
    });

    await handler.execute(new AssignRolesToUserCommand(userId, roleIds));

    expect(roleRepository.assignRoleToUser).toHaveBeenCalledWith(userRoles);
    expect(eventHub.publish).toHaveBeenCalled();
  });
});
