import { Test, TestingModule } from '@nestjs/testing';
import { AssignActionToRoleHandler } from './assign-action-to-role.handler';
import { AssignActionToRoleCommand } from '../../../domain/role/command/assign-action-to-role.command';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';
import { ACTION_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { ActionsAssignedToRolesEvent } from '../../../domain/role/event/actions-assigned-to-roles.event';

describe('AssignActionToRoleHandler', () => {
  let handler: AssignActionToRoleHandler;
  let repository: jest.Mocked<IActionRepository>;
  let eventHub: jest.Mocked<EventHub>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignActionToRoleHandler,
        {
          provide: ACTION_REPOSITORY_PROVIDER,
          useValue: {
            assignActionsToRoles: jest.fn(),
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

    handler = module.get<AssignActionToRoleHandler>(AssignActionToRoleHandler);
    repository = module.get(ACTION_REPOSITORY_PROVIDER);
    eventHub = module.get(EVENT_HUB_PROVIDER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully assign actions to roles', async () => {
      // Arrange
      const command = new AssignActionToRoleCommand(
        ['action1', 'action2'],
        ['role1', 'role2'],
      );
      repository.assignActionsToRoles.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(repository.assignActionsToRoles).toHaveBeenCalledWith(
        ['action1', 'action2'],
        ['role1', 'role2'],
      );
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(ActionsAssignedToRolesEvent),
      );
    });

    it('should handle empty actionIds array', async () => {
      // Arrange
      const command = new AssignActionToRoleCommand([], ['role1', 'role2']);
      repository.assignActionsToRoles.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(repository.assignActionsToRoles).toHaveBeenCalledWith(
        [],
        ['role1', 'role2'],
      );
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(ActionsAssignedToRolesEvent),
      );
    });

    it('should handle empty roleIds array', async () => {
      // Arrange
      const command = new AssignActionToRoleCommand(['action1', 'action2'], []);
      repository.assignActionsToRoles.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(repository.assignActionsToRoles).toHaveBeenCalledWith(
        ['action1', 'action2'],
        [],
      );
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(ActionsAssignedToRolesEvent),
      );
    });

    it('should handle repository error', async () => {
      // Arrange
      const command = new AssignActionToRoleCommand(['action1'], ['role1']);
      const error = new Error('Repository error');
      repository.assignActionsToRoles.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Repository error',
      );
      expect(eventHub.publish).not.toHaveBeenCalled();
    });
  });
});
