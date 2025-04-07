import { Test, TestingModule } from '@nestjs/testing';
import { CreateActionsHandler } from './create-actions.handler';
import { ACTION_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { ID_GENERATOR } from '../../../infrastructure/providers/id-genrerator.provider';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { CreateActionsCommand } from '../../../domain/action/commands/create-actions.command';
import { ActionCreatedEvent } from '../../../domain/action/events/action-created.event';

describe('CreateActionsHandler', () => {
  let handler: CreateActionsHandler;
  let repositoryMock: any;
  let idGeneratorMock: any;
  let eventHubMock: any;

  beforeEach(async () => {
    // Create mocks for dependencies
    repositoryMock = {
      createActions: jest.fn().mockResolvedValue(undefined),
    };

    idGeneratorMock = {
      generateId: jest.fn().mockReturnValue('mock-id'),
    };

    eventHubMock = {
      publish: jest.fn(),
    };

    // Create a test module with our handler and mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateActionsHandler,
        {
          provide: ACTION_REPOSITORY_PROVIDER,
          useValue: repositoryMock,
        },
        {
          provide: ID_GENERATOR,
          useValue: idGeneratorMock,
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: eventHubMock,
        },
      ],
    }).compile();

    handler = module.get<CreateActionsHandler>(CreateActionsHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create actions from command, save them, publish event and return created actions', async () => {
      // Arrange
      const actionData: any = [
        {
          name: 'Action 1',
          description: 'Description 1',
          status: 'active',
          metadata: { key: 'value1' },
        },
        {
          name: 'Action 2',
          description: 'Description 2',
          status: 'inactive',
          metadata: { key: 'value2' },
        },
      ];
      const command = new CreateActionsCommand(actionData);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(2);

      // Check each action has the correct properties
      expect(result[0].name).toBe('Action 1');
      expect(result[0].description).toBe('Description 1');
      expect(result[0].status).toBe('active');
      expect(result[0].metadata).toEqual({ key: 'value1' });

      expect(result[1].name).toBe('Action 2');
      expect(result[1].description).toBe('Description 2');
      expect(result[1].status).toBe('inactive');
      expect(result[1].metadata).toEqual({ key: 'value2' });

      // Verify repository was called with the actions
      expect(repositoryMock.createActions).toHaveBeenCalledWith(result);

      // Verify event was published with the actions
      expect(eventHubMock.publish).toHaveBeenCalledTimes(1);
      const publishedEvent = eventHubMock.publish.mock.calls[0][0];
      expect(publishedEvent).toBeInstanceOf(ActionCreatedEvent);
      expect(publishedEvent.actions).toEqual(result);
    });

    it('should handle creating a single action', async () => {
      // Arrange
      const actionData: any = [
        {
          name: 'Single Action',
          description: 'Test single action creation',
          status: 'pending',
          metadata: { priority: 'high' },
        },
      ];
      const command = new CreateActionsCommand(actionData);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Single Action');
      expect(result[0].description).toBe('Test single action creation');
      expect(result[0].status).toBe('pending');
      expect(result[0].metadata).toEqual({ priority: 'high' });
      expect(repositoryMock.createActions).toHaveBeenCalledWith(result);
      expect(eventHubMock.publish).toHaveBeenCalledTimes(1);
    });

    it('should handle empty actions array', async () => {
      // Arrange
      const actionData: any[] = [];
      const command = new CreateActionsCommand(actionData);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(0);
      expect(repositoryMock.createActions).toHaveBeenCalledWith([]);
      expect(eventHubMock.publish).toHaveBeenCalledWith(
        expect.any(ActionCreatedEvent),
      );
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      repositoryMock.createActions.mockRejectedValueOnce(
        new Error('Database connection error'),
      );

      const actionData: any = [
        {
          name: 'Action 1',
          description: 'Description 1',
          status: 'active',
          metadata: { key: 'value1' },
        },
      ];
      const command = new CreateActionsCommand(actionData);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Database connection error',
      );
      expect(eventHubMock.publish).not.toHaveBeenCalled();
    });

    it('should throw error when ID generator fails', async () => {
      // Arrange
      idGeneratorMock.generateId.mockImplementationOnce(() => {
        throw new Error('ID generation failed');
      });

      const actionData: any = [
        {
          name: 'Action 1',
          description: 'Description 1',
          status: 'active',
          metadata: { key: 'value1' },
        },
      ];
      const command = new CreateActionsCommand(actionData);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'ID generation failed',
      );
      expect(repositoryMock.createActions).not.toHaveBeenCalled();
      expect(eventHubMock.publish).not.toHaveBeenCalled();
    });
  });
});
