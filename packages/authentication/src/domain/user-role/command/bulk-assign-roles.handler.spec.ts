/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BulkAssignRolesHandler } from '../../../application/user-role/command/bulk-assign-roles.handler';
import { BulkAssignRolesCommand } from './bulk-assign-roles.command';
import { IRoleRepository } from '../../repository/role-repository.interface';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EventHub } from '../../event-hub/event.hub';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { UserRoleEntity, UserRoleStatus } from '../../role/user-role.entity';

describe('BulkAssignRolesHandler', () => {
  let handler: BulkAssignRolesHandler;
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
        BulkAssignRolesHandler,
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

    handler = module.get<BulkAssignRolesHandler>(BulkAssignRolesHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should assign roles to users and publish events', async function (this: void) {
    const assignments = [
      { userId: 'user1', roleIds: ['role1', 'role2'] },
      { userId: 'user2', roleIds: ['role3'] },
    ];

    const userRoles = assignments.flatMap(({ userId, roleIds }) =>
      roleIds.map((roleId) => {
        const entity = new UserRoleEntity();
        entity.userId = userId;
        entity.roleId = roleId;
        entity.status = UserRoleStatus.ACTIVE;
        entity.metadata = {};
        return entity;
      }),
    );

    await handler.execute(new BulkAssignRolesCommand(assignments));

    expect(roleRepository.assignRoleToUser).toHaveBeenCalledWith(userRoles);
    expect(eventHub.publish).toHaveBeenCalled();
  });
});
