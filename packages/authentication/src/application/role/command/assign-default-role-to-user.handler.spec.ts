import { Test, TestingModule } from '@nestjs/testing';
import { AssignDefaultRoleToUserHandler } from './assign-default-role-to-user.handler';
import { AssignDefaultRoleToUserCommand } from '../../../domain/role/command/assign-default-role-to-user.command';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { RoleEntity, RoleType } from '../../../domain/role/role-entity';
import { UserEntity, UserType } from '../../../domain/user/user-entity';
import { UserStatus } from '../../../domain/user/user-status';
import {
  UserRoleEntity,
  UserRoleStatus,
} from '../../../domain/role/user-role.entity';
import { UserRoleEntityCreatedEvent } from '../../../domain/role/event/user-entity-created.event';

describe('AssignDefaultRoleToUserHandler', () => {
  let handler: AssignDefaultRoleToUserHandler;
  let repository: jest.Mocked<IRoleRepository>;
  let eventHub: jest.Mocked<EventHub>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignDefaultRoleToUserHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: {
            getRoleByType: jest.fn(),
            assignRoleToUser: jest.fn(),
          },
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<AssignDefaultRoleToUserHandler>(
      AssignDefaultRoleToUserHandler,
    );
    repository = module.get(ROLE_REPOSITORY_PROVIDER);
    eventHub = module.get(EVENT_HUB_PROVIDER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully assign default role to users', async () => {
      // Arrange
      const defaultRole = new RoleEntity();
      defaultRole.setId('default-role-id');
      defaultRole.status = RoleType.DEFAULT;

      const users = [createTestUser('user1'), createTestUser('user2')];

      const command = new AssignDefaultRoleToUserCommand(users);
      repository.getRoleByType.mockResolvedValue([defaultRole]);
      repository.assignRoleToUser.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserRoleEntity);
      expect(result[0].roleId).toBe('default-role-id');
      expect(result[0].userId).toBe('user1');
      expect(result[0].status).toBe(UserRoleStatus.ACTIVE);
      expect(result[1].roleId).toBe('default-role-id');
      expect(result[1].userId).toBe('user2');
      expect(result[1].status).toBe(UserRoleStatus.ACTIVE);

      expect(repository.getRoleByType).toHaveBeenCalledWith(RoleType.DEFAULT);
      expect(repository.assignRoleToUser).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            roleId: 'default-role-id',
            userId: 'user1',
            status: UserRoleStatus.ACTIVE,
          }),
          expect.objectContaining({
            roleId: 'default-role-id',
            userId: 'user2',
            status: UserRoleStatus.ACTIVE,
          }),
        ]),
      );
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(UserRoleEntityCreatedEvent),
      );
    });

    it('should return empty array when no default role exists', async () => {
      // Arrange
      const users = [createTestUser('user1')];
      const command = new AssignDefaultRoleToUserCommand(users);
      repository.getRoleByType.mockResolvedValue([]);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(0);
      expect(repository.assignRoleToUser).not.toHaveBeenCalled();
      expect(eventHub.publish).not.toHaveBeenCalled();
    });

    it('should handle repository error when getting role', async () => {
      // Arrange
      const users = [createTestUser('user1')];
      const command = new AssignDefaultRoleToUserCommand(users);
      const error = new Error('Repository error');
      repository.getRoleByType.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Repository error',
      );
      expect(repository.assignRoleToUser).not.toHaveBeenCalled();
      expect(eventHub.publish).not.toHaveBeenCalled();
    });

    it('should handle repository error when assigning role', async () => {
      // Arrange
      const defaultRole = new RoleEntity();
      defaultRole.setId('default-role-id');
      defaultRole.status = RoleType.DEFAULT;

      const users = [createTestUser('user1')];
      const command = new AssignDefaultRoleToUserCommand(users);

      repository.getRoleByType.mockResolvedValue([defaultRole]);
      const error = new Error('Assignment error');
      repository.assignRoleToUser.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Assignment error',
      );
      expect(eventHub.publish).not.toHaveBeenCalled();
    });

    it('should handle empty user array', async () => {
      // Arrange
      const command = new AssignDefaultRoleToUserCommand([]);
      const defaultRole = new RoleEntity();
      defaultRole.setId('default-role-id');
      defaultRole.status = RoleType.DEFAULT;
      repository.getRoleByType.mockResolvedValue([defaultRole]);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(0);
      expect(repository.assignRoleToUser).toHaveBeenCalledWith([]);
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(UserRoleEntityCreatedEvent),
      );
    });
  });
});

function createTestUser(id: string): UserEntity {
  const user = new UserEntity();
  user.setId(id);
  user.username = `test_${id}`;
  user.passwordHash = 'hashed_password';
  user.status = UserStatus.ACTIVE;
  user.type = UserType.PASSWORD;
  return user;
}
