import { Test, TestingModule } from '@nestjs/testing';
import { AssignEndpointToRoleHandler } from './assign-endpoint-to-role.handler';
import { AssignEndpointToRoleCommand } from '../../../domain/role/command/assign-endpoint-to-role.command';
import { EndpointsAssignedToRolesEvent } from '../../../domain/role/event/endpoints-assigned-to-roles.event';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';

describe('AssignEndpointToRoleHandler', () => {
  let handler: AssignEndpointToRoleHandler;
  let repository: jest.Mocked<IEndpointRepository>;
  let eventHub: jest.Mocked<EventHub>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignEndpointToRoleHandler,
        {
          provide: ENDPOINT_REPOSITORY_PROVIDER,
          useValue: {
            assignEndpointsToRoles: jest.fn(),
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

    handler = module.get<AssignEndpointToRoleHandler>(
      AssignEndpointToRoleHandler,
    );
    repository = module.get(ENDPOINT_REPOSITORY_PROVIDER);
    eventHub = module.get(EVENT_HUB_PROVIDER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully assign endpoints to roles', async () => {
      // Arrange
      const command = new AssignEndpointToRoleCommand(
        ['endpoint1', 'endpoint2'],
        ['role1', 'role2'],
      );
      repository.assignEndpointsToRoles.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(repository.assignEndpointsToRoles).toHaveBeenCalledWith(
        ['endpoint1', 'endpoint2'],
        ['role1', 'role2'],
      );
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(EndpointsAssignedToRolesEvent),
      );
    });

    it('should handle empty endpointIds array', async () => {
      // Arrange
      const command = new AssignEndpointToRoleCommand([], ['role1', 'role2']);
      repository.assignEndpointsToRoles.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(repository.assignEndpointsToRoles).toHaveBeenCalledWith(
        [],
        ['role1', 'role2'],
      );
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(EndpointsAssignedToRolesEvent),
      );
    });

    it('should handle empty roleIds array', async () => {
      // Arrange
      const command = new AssignEndpointToRoleCommand(
        ['endpoint1', 'endpoint2'],
        [],
      );
      repository.assignEndpointsToRoles.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(repository.assignEndpointsToRoles).toHaveBeenCalledWith(
        ['endpoint1', 'endpoint2'],
        [],
      );
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(EndpointsAssignedToRolesEvent),
      );
    });

    it('should handle repository error', async () => {
      // Arrange
      const command = new AssignEndpointToRoleCommand(['endpoint1'], ['role1']);
      const error = new Error('Repository error');
      repository.assignEndpointsToRoles.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Repository error',
      );
      expect(eventHub.publish).not.toHaveBeenCalled();
    });
  });
});
