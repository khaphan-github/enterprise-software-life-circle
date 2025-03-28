/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { RoleRepository } from '../../..//infrastructure/repository/role.repository';
import { AssignDefaultRoleToUserHandler } from './assign-default-role-to-user.handler';
import { AssignDefaultRoleToUserCommand } from '../../../domain/role/command/assign-default-role-to-user.command';
import { RoleType } from '../../../domain/role/role-entity';
import { UserRoleStatus } from '../../..//domain/role/user-role.entity';
import { UserRoleEntityCreatedEvent } from '../../../domain/role/event/user-entity-created.event';
import { UserStatus } from '../../../domain/user/user-status';

describe('AssignDefaultRoleToUserHandler', () => {
  let handler: AssignDefaultRoleToUserHandler;
  let repository: RoleRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignDefaultRoleToUserHandler,
        {
          provide: RoleRepository,
          useValue: {
            getRoleByType: jest.fn(),
            assignRoleToUser: jest.fn(),
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

    handler = module.get<AssignDefaultRoleToUserHandler>(
      AssignDefaultRoleToUserHandler,
    );
    repository = module.get<RoleRepository>(RoleRepository);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should assign default role to users and publish event', async () => {
    const command = new AssignDefaultRoleToUserCommand([
      {
        id: 'user1',
        username: 'user1',
        email: 'user1@example.com',
        passwordHash: 'hash1',
        status: UserStatus.ACTIVE,
        getId: jest.fn().mockReturnValue('user1'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user2',
        username: 'user2',
        email: 'user2@example.com',
        passwordHash: 'hash2',
        getId: jest.fn().mockReturnValue('user2'),
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as any);
    const defaultRole = [
      {
        id: 'role1',
        name: 'defaultRole',
        description: 'Default role for new users',
        status: 'active',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        initId: jest.fn(),
        getId: jest.fn().mockReturnValue('role1'),
        setCreateTime: jest.fn(),
        setUpdateTime: jest.fn(),
      },
    ];
    jest
      .spyOn(repository, 'getRoleByType')
      .mockResolvedValue(defaultRole as any);

    const result = await handler.execute(command);

    expect(repository.getRoleByType).toHaveBeenCalledWith(RoleType.DEFAULT);
    expect(repository.assignRoleToUser).toHaveBeenCalledWith(expect.any(Array));
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(UserRoleEntityCreatedEvent),
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      roleId: 'role1',
      userId: 'user1',
      status: UserRoleStatus.ACTIVE,
    });
    expect(result[1]).toMatchObject({
      roleId: 'role1',
      userId: 'user2',
      status: UserRoleStatus.ACTIVE,
    });
  });

  it('should return empty array if no default role found', async () => {
    const command = new AssignDefaultRoleToUserCommand([
      {
        id: 'user1',
        username: 'user1',
        email: 'user1@example.com',
        passwordHash: 'hash1',
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ]);
    jest.spyOn(repository, 'getRoleByType').mockResolvedValue([]);

    const result = await handler.execute(command);

    expect(repository.getRoleByType).toHaveBeenCalledWith(RoleType.DEFAULT);
    expect(result).toEqual([]);
  });
});
