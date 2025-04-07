import { Test, TestingModule } from '@nestjs/testing';
import { AssignRoleToUserHandler } from './assign-role-to-user.handler';
import { AssignRoleToUserCommand } from '../../../domain/role/command/assign-role-to-user.command';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { ID_GENERATOR } from '../../../infrastructure/providers/id-genrerator.provider';
import { IdGenerator } from '../../../domain/entity/id';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { EventHub } from '../../../domain/event-hub/event.hub';

describe('AssignRoleToUserHandler', () => {
  let handler: AssignRoleToUserHandler;
  let repository: jest.Mocked<IRoleRepository>;
  let eventHub: jest.Mocked<EventHub>;
  let generator: jest.Mocked<IdGenerator>;

  beforeEach(async () => {
    repository = {
      assignRoleToUser: jest.fn(),
      createRole: jest.fn(),
      getRolesByUserId: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
      getRoleById: jest.fn(),
      getRoleByName: jest.fn(),
      getRoles: jest.fn(),
      getUserRoles: jest.fn(),
      findRoleById: jest.fn(),
      isExistRoleById: jest.fn(),
      getRoleByType: jest.fn(),
      getRolesByRoute: jest.fn(),
    } as unknown as jest.Mocked<IRoleRepository>;

    eventHub = {
      publish: jest.fn(),
    } as jest.Mocked<EventHub>;

    generator = {
      generateId: jest.fn().mockReturnValue('test-id'),
    } as jest.Mocked<IdGenerator>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignRoleToUserHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: repository,
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: eventHub,
        },
        {
          provide: ID_GENERATOR,
          useValue: generator,
        },
      ],
    }).compile();

    handler = module.get<AssignRoleToUserHandler>(AssignRoleToUserHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should assign roles to users successfully', async () => {
      // Arrange
      const command = new AssignRoleToUserCommand(
        ['role1', 'role2'],
        ['user1', 'user2'],
      );
      repository.assignRoleToUser.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(4);
      expect(repository.assignRoleToUser).toHaveBeenCalledTimes(1);
      expect(eventHub.publish).toHaveBeenCalledTimes(1);
      expect(generator.generateId).toHaveBeenCalledTimes(4);
    });

    it('should handle empty roleIds array', async () => {
      // Arrange
      const command = new AssignRoleToUserCommand([], ['user1', 'user2']);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(0);
      expect(repository.assignRoleToUser).toHaveBeenCalledTimes(0);
      expect(eventHub.publish).toHaveBeenCalledTimes(0);
      expect(generator.generateId).toHaveBeenCalledTimes(0);
    });

    it('should handle empty userIds array', async () => {
      // Arrange
      const command = new AssignRoleToUserCommand(['role1', 'role2'], []);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(0);
      expect(repository.assignRoleToUser).toHaveBeenCalledTimes(0);
      expect(eventHub.publish).toHaveBeenCalledTimes(0);
      expect(generator.generateId).toHaveBeenCalledTimes(0);
    });
  });
});
