/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { DeleteActionsHandler } from './delete-actions.handler';
import { DeleteActionsCommand } from '../../../domain/action/commands/delete-actions.command';
import { ActionRepository } from '../../../infrastructure/repository/postgres/action.repository';
import { ActionDeletedEvent } from '../../../domain/action/events/action-deleted.event';

describe('DeleteActionsHandler', () => {
  let handler: DeleteActionsHandler;
  let repository: ActionRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteActionsHandler,
        {
          provide: ActionRepository,
          useValue: {
            deleteActions: jest.fn(),
          },
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<DeleteActionsHandler>(DeleteActionsHandler);
    repository = module.get<ActionRepository>(ActionRepository);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should delete actions and publish an event', async () => {
    const actionIds = ['id1', 'id2'];
    jest.spyOn(repository, 'deleteActions').mockResolvedValue();

    const command = new DeleteActionsCommand(actionIds);
    await handler.execute(command);

    expect(repository.deleteActions).toHaveBeenCalledWith(actionIds);
    expect(eventBus.publish).toHaveBeenCalledWith(
      new ActionDeletedEvent(actionIds),
    );
  });
});
