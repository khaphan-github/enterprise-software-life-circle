import { Test, TestingModule } from '@nestjs/testing';
import { CreateRoleCommandHandler } from './create-role.handler';
import { CreateRoleCommand } from '../../../domain/role/command/create-role.command';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { ID_GENERATOR } from '../../../infrastructure/providers/id-genrerator.provider';
import { IdGenerator } from '../../../domain/entity/id';
import { RoleEntity } from '../../../domain/role/role-entity';
import { RoleEntityCreatedEvent } from '../../../domain/role/event/role-created.event';

describe('CreateRoleCommandHandler', () => {
  let handler: CreateRoleCommandHandler;
  let repository: jest.Mocked<IRoleRepository>;
  let eventHub: jest.Mocked<EventHub>;
  let idGenerator: jest.Mocked<IdGenerator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoleCommandHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: {
            createRole: jest.fn(),
          },
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: ID_GENERATOR,
          useValue: {
            generateId: jest.fn().mockReturnValue('generated-id'),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateRoleCommandHandler>(CreateRoleCommandHandler);
    repository = module.get(ROLE_REPOSITORY_PROVIDER);
    eventHub = module.get(EVENT_HUB_PROVIDER);
    idGenerator = module.get(ID_GENERATOR);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully create a role', async () => {
      // Arrange
      const command = new CreateRoleCommand(
        'Test Role',
        'Test Description',
        'ACTIVE',
        { customField: 'value' },
      );

      const createdRole = new RoleEntity();
      createdRole.setId('generated-id');
      createdRole.name = 'Test Role';
      createdRole.description = 'Test Description';
      createdRole.status = 'ACTIVE';
      createdRole.metadata = { customField: 'value' };
      createdRole.setCreateTime();

      repository.createRole.mockResolvedValue(createdRole);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeInstanceOf(RoleEntity);
      expect(result.name).toBe('Test Role');
      expect(result.description).toBe('Test Description');
      expect(result.status).toBe('ACTIVE');
      expect(result.metadata).toEqual({ customField: 'value' });
      expect(result.getId()).toBe('generated-id');

      expect(repository.createRole).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Role',
          description: 'Test Description',
          status: 'ACTIVE',
          metadata: { customField: 'value' },
        }),
      );
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(RoleEntityCreatedEvent),
      );
    });

    it('should create a role with minimal required fields', async () => {
      // Arrange
      const command = new CreateRoleCommand(
        'Test Role',
        'Test Description',
        'ACTIVE',
        {},
      );

      const createdRole = new RoleEntity();
      createdRole.setId('generated-id');
      createdRole.name = 'Test Role';
      createdRole.description = 'Test Description';
      createdRole.status = 'ACTIVE';
      createdRole.metadata = {};
      createdRole.setCreateTime();

      repository.createRole.mockResolvedValue(createdRole);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeInstanceOf(RoleEntity);
      expect(result.name).toBe('Test Role');
      expect(result.description).toBe('Test Description');
      expect(result.status).toBe('ACTIVE');
      expect(result.metadata).toEqual({});
      expect(result.getId()).toBe('generated-id');

      expect(repository.createRole).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Role',
          description: 'Test Description',
          status: 'ACTIVE',
          metadata: {},
        }),
      );
      expect(eventHub.publish).toHaveBeenCalledWith(
        expect.any(RoleEntityCreatedEvent),
      );
    });

    it('should handle repository error', async () => {
      // Arrange
      const command = new CreateRoleCommand(
        'Test Role',
        'Test Description',
        'ACTIVE',
        {},
      );
      const error = new Error('Repository error');
      repository.createRole.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Repository error',
      );
      expect(eventHub.publish).not.toHaveBeenCalled();
    });

    it('should handle id generator error', async () => {
      // Arrange
      const command = new CreateRoleCommand(
        'Test Role',
        'Test Description',
        'ACTIVE',
        {},
      );
      const error = new Error('ID generation error');
      idGenerator.generateId.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'ID generation error',
      );
      expect(repository.createRole).not.toHaveBeenCalled();
      expect(eventHub.publish).not.toHaveBeenCalled();
    });
  });
});
