import { Test, TestingModule } from '@nestjs/testing';
import { DeleteActionsCommand } from '../../../domain/action/commands/delete-actions.command';
import { ActionDeletedEvent } from '../../../domain/action/events/action-deleted.event';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { ACTION_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { DeleteActionsHandler } from './delete-actions.handler';

describe('DeleteActionsHandler', () => {
  let handler: DeleteActionsHandler;
  let repository: jest.Mocked<IActionRepository>;
  let eventHub: jest.Mocked<EventHub>;

  beforeEach(async () => {
    // Create mocks
    repository = {
      deleteActions: jest.fn(),
    } as unknown as jest.Mocked<IActionRepository>;

    eventHub = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<EventHub>;

    // Create test module with our mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteActionsHandler,
        { provide: ACTION_REPOSITORY_PROVIDER, useValue: repository },
        { provide: EVENT_HUB_PROVIDER, useValue: eventHub },
      ],
    }).compile();

    handler = module.get<DeleteActionsHandler>(DeleteActionsHandler);
  });

  it('should delete actions and publish event', async () => {
    // Arrange
    const actionIds = ['action1', 'action2'];
    const command = new DeleteActionsCommand(actionIds);

    // Act
    await handler.execute(command);

    // Assert
    expect(repository.deleteActions).toHaveBeenCalledWith(actionIds);
    expect(eventHub.publish).toHaveBeenCalledWith(
      expect.any(ActionDeletedEvent),
    );
    expect(eventHub.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        actionIds: actionIds,
      }),
    );
  });
});
