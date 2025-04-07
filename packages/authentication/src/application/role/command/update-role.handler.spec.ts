import { Test, TestingModule } from '@nestjs/testing';
import { UpdateRoleHandler } from './update-role.handler';
import { UpdateRoleCommand } from '../../../domain/role/command/update-role.command';
import { RoleEntityUpdatedEvent } from '../../../domain/role/event/role-updated.event';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { RoleEntity } from '../../../domain/role/role-entity';

describe('UpdateRoleHandler', () => {
  let handler: UpdateRoleHandler;
  let repository: jest.Mocked<IRoleRepository>;
  let eventHub: jest.Mocked<EventHub>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRoleHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: {
            updateRole: jest.fn(),
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

    handler = module.get<UpdateRoleHandler>(UpdateRoleHandler);
    repository = module.get(ROLE_REPOSITORY_PROVIDER);
    eventHub = module.get(EVENT_HUB_PROVIDER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully update a role', async () => {
      // Arrange
      const command = new UpdateRoleCommand(
        'role-id',
        'Updated Role',
        'Updated Description',
        'active',
        { key: 'value' },
      );

      repository.updateRole.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeInstanceOf(RoleEntity);
      expect(result.id).toBe('role-id');
      expect(result.name).toBe('Updated Role');
      expect(result.description).toBe('Updated Description');
      expect(result.status).toBe('active');
      expect(result.metadata).toEqual({ key: 'value' });

      expect(repository.updateRole).toHaveBeenCalledWith(result);
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(RoleEntityUpdatedEvent),
      );
    });

    it('should handle empty metadata', async () => {
      // Arrange
      const command = new UpdateRoleCommand(
        'role-id',
        'Updated Role',
        'Updated Description',
        'active',
      );

      repository.updateRole.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.metadata).toEqual({});
      expect(repository.updateRole).toHaveBeenCalled();
      expect(eventHub.publish).toHaveBeenCalled();
    });

    it('should handle repository error', async () => {
      // Arrange
      const command = new UpdateRoleCommand(
        'role-id',
        'Updated Role',
        'Updated Description',
        'active',
      );

      const error = new Error('Repository error');
      repository.updateRole.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Repository error',
      );
      expect(eventHub.publish).not.toHaveBeenCalled();
    });
  });
});
