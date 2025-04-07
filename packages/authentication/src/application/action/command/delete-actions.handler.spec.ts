import { Test, TestingModule } from '@nestjs/testing';
import { DeleteActionsHandler } from './delete-actions.handler';
import { ACTION_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { DeleteActionsCommand } from '../../../domain/action/commands/delete-actions.command';
import { ActionDeletedEvent } from '../../../domain/action/events/action-deleted.event';

describe('DeleteActionsHandler', () => {
  let handler: DeleteActionsHandler;
  let repositoryMock: any;
  let eventHubMock: any;

  beforeEach(async () => {
    // Create mocks for dependencies
    repositoryMock = {
      deleteActions: jest.fn().mockResolvedValue(undefined),
    };

    eventHubMock = {
      publish: jest.fn(),
    };

    // Create a test module with our handler and mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteActionsHandler,
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

    handler = module.get<DeleteActionsHandler>(DeleteActionsHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should delete actions by IDs and publish event', async () => {
      // Arrange
      const actionIds = ['id1', 'id2', 'id3'];
      const command = new DeleteActionsCommand(actionIds);

      // Act
      await handler.execute(command);

      // Assert
      expect(repositoryMock.deleteActions).toHaveBeenCalledWith(actionIds);
      expect(eventHubMock.publish).toHaveBeenCalledTimes(1);

      // Verify the event was published with the correct action IDs
      const publishedEvent = eventHubMock.publish.mock.calls[0][0];
      expect(publishedEvent).toBeInstanceOf(ActionDeletedEvent);
      expect(publishedEvent.actionIds).toEqual(actionIds);
    });

    it('should handle deleting a single action', async () => {
      // Arrange
      const actionIds = ['single-id'];
      const command = new DeleteActionsCommand(actionIds);

      // Act
      await handler.execute(command);

      // Assert
      expect(repositoryMock.deleteActions).toHaveBeenCalledWith(actionIds);
      expect(eventHubMock.publish).toHaveBeenCalledWith(
        expect.any(ActionDeletedEvent),
      );
      const publishedEvent = eventHubMock.publish.mock.calls[0][0];
      expect(publishedEvent.actionIds).toEqual(actionIds);
    });

    it('should handle empty array of action IDs', async () => {
      // Arrange
      const actionIds: string[] = [];
      const command = new DeleteActionsCommand(actionIds);

      // Act
      await handler.execute(command);

      // Assert
      expect(repositoryMock.deleteActions).toHaveBeenCalledWith([]);
      expect(eventHubMock.publish).toHaveBeenCalledWith(
        expect.any(ActionDeletedEvent),
      );
      const publishedEvent = eventHubMock.publish.mock.calls[0][0];
      expect(publishedEvent.actionIds).toEqual([]);
    });

    it('should throw error when repository deletion fails', async () => {
      // Arrange
      repositoryMock.deleteActions.mockRejectedValueOnce(
        new Error('Database error during deletion'),
      );
      const actionIds = ['id1', 'id2'];
      const command = new DeleteActionsCommand(actionIds);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Database error during deletion',
      );
      expect(repositoryMock.deleteActions).toHaveBeenCalledWith(actionIds);
      expect(eventHubMock.publish).not.toHaveBeenCalled();
    });

    it('should throw error when event hub publish fails', async () => {
      // Arrange
      eventHubMock.publish.mockImplementationOnce(() => {
        throw new Error('Event publishing failed');
      });
      const actionIds = ['id1', 'id2'];
      const command = new DeleteActionsCommand(actionIds);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Event publishing failed',
      );
      expect(repositoryMock.deleteActions).toHaveBeenCalledWith(actionIds);
    });
  });
});
