import { Test, TestingModule } from '@nestjs/testing';
import { UpdateActionsHandler } from './update-actions.handler';
import { ACTION_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { UpdateActionsCommand } from '../../../domain/action/commands/update-actions.command';
import { ActionUpdatedEvent } from '../../../domain/action/events/action-updated.event';
import { ActionEntity } from '../../../domain/action/action-entity';

describe('UpdateActionsHandler', () => {
  let handler: UpdateActionsHandler;
  let repositoryMock: any;
  let eventHubMock: any;

  beforeEach(async () => {
    // Create mocks for dependencies
    repositoryMock = {
      updateActions: jest.fn().mockResolvedValue(undefined),
    };

    eventHubMock = {
      publish: jest.fn(),
    };

    // Create a test module with our handler and mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateActionsHandler,
        {
          provide: ACTION_REPOSITORY_PROVIDER,
          useValue: repositoryMock,
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: eventHubMock,
        },
      ],
    }).compile();

    handler = module.get<UpdateActionsHandler>(UpdateActionsHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should update multiple actions and publish event', async () => {
      // Arrange
      const actionData: any = [
        {
          id: 'action-1',
          name: 'Updated Action 1',
          description: 'Updated Description 1',
          metadata: { key: 'updated-value1' },
        },
        {
          id: 'action-2',
          name: 'Updated Action 2',
          description: 'Updated Description 2',
          metadata: { key: 'updated-value2' },
        },
      ];
      const command = new UpdateActionsCommand(actionData);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(2);

      // Check each action has the correct properties
      expect(result[0].getId()).toBe('action-1');
      expect(result[0].name).toBe('Updated Action 1');
      expect(result[0].description).toBe('Updated Description 1');
      expect(result[0].metadata).toEqual({ key: 'updated-value1' });

      expect(result[1].getId()).toBe('action-2');
      expect(result[1].name).toBe('Updated Action 2');
      expect(result[1].description).toBe('Updated Description 2');
      expect(result[1].metadata).toEqual({ key: 'updated-value2' });

      // Verify update time is set
      expect(result[0].updatedAt).toBeDefined();
      expect(result[1].updatedAt).toBeDefined();

      // Verify repository was called with the actions
      expect(repositoryMock.updateActions).toHaveBeenCalledWith(result);

      // Verify event was published with the actions
      expect(eventHubMock.publish).toHaveBeenCalledTimes(1);
      const publishedEvent = eventHubMock.publish.mock.calls[0][0];
      expect(publishedEvent).toBeInstanceOf(ActionUpdatedEvent);
      expect(publishedEvent.actions).toEqual(result);
    });

    it('should handle updating a single action', async () => {
      // Arrange
      const actionData: any = [
        {
          id: 'single-id',
          name: 'Single Updated Action',
          description: 'Test single action update',
          metadata: { priority: 'high' },
        },
      ];
      const command = new UpdateActionsCommand(actionData);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].getId()).toBe('single-id');
      expect(result[0].name).toBe('Single Updated Action');
      expect(result[0].description).toBe('Test single action update');
      expect(result[0].metadata).toEqual({ priority: 'high' });
      expect(repositoryMock.updateActions).toHaveBeenCalledWith(result);
      expect(eventHubMock.publish).toHaveBeenCalledWith(
        expect.any(ActionUpdatedEvent),
      );
    });

    it('should handle empty actions array', async () => {
      // Arrange
      const actionData: any[] = [];
      const command = new UpdateActionsCommand(actionData);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(0);
      expect(repositoryMock.updateActions).toHaveBeenCalledWith([]);
      expect(eventHubMock.publish).toHaveBeenCalledWith(
        expect.any(ActionUpdatedEvent),
      );
      const publishedEvent = eventHubMock.publish.mock.calls[0][0];
      expect(publishedEvent.actions).toEqual([]);
    });

    it('should throw error when repository update fails', async () => {
      // Arrange
      repositoryMock.updateActions.mockRejectedValueOnce(
        new Error('Database error during update'),
      );

      const actionData: any = [
        {
          id: 'action-1',
          name: 'Updated Action 1',
          description: 'Updated Description 1',
          metadata: { key: 'value1' },
        },
      ];
      const command = new UpdateActionsCommand(actionData);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Database error during update',
      );
      expect(repositoryMock.updateActions).toHaveBeenCalled();
      expect(eventHubMock.publish).not.toHaveBeenCalled();
    });

    it('should throw error when event hub publish fails', async () => {
      // Arrange
      eventHubMock.publish.mockImplementationOnce(() => {
        throw new Error('Event publishing failed');
      });

      const actionData: any = [
        {
          id: 'action-1',
          name: 'Updated Action 1',
          description: 'Updated Description 1',
          metadata: { key: 'value1' },
        },
      ];
      const command = new UpdateActionsCommand(actionData);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Event publishing failed',
      );
      expect(repositoryMock.updateActions).toHaveBeenCalled();
    });

    it('should correctly set entity properties from action data', async () => {
      // Arrange
      const now = new Date();
      jest
        .spyOn(global, 'Date')
        .mockImplementation(() => now as unknown as any);

      const actionData: any = [
        {
          id: 'test-id',
          name: 'Test Action',
          description: 'Test Description',
          metadata: { testKey: 'testValue' },
        },
      ];
      const command = new UpdateActionsCommand(actionData);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result[0]).toBeInstanceOf(ActionEntity);
      expect(result[0].getId()).toBe('test-id');
      expect(result[0].name).toBe('Test Action');
      expect(result[0].description).toBe('Test Description');
      expect(result[0].metadata).toEqual({ testKey: 'testValue' });
      expect(result[0].updatedAt).toBe(now);

      // Restore the Date implementation
      jest.restoreAllMocks();
    });
  });
});
