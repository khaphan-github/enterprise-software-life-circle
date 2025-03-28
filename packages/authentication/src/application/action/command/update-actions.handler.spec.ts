/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { UpdateActionsHandler } from './update-actions.handler';
import { UpdateActionsCommand } from '../../../domain/action/commands/update-actions.command';
import { ActionRepository } from '../../../infrastructure/repository/action.repository';
import { ActionUpdatedEvent } from '../../../domain/action/events/action-updated.event';
import { ActionEntity } from '../../../domain/action/action-entity';

describe('UpdateActionsHandler', () => {
  let handler: UpdateActionsHandler;
  let repository: ActionRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateActionsHandler,
        {
          provide: ActionRepository,
          useValue: {
            updateActions: jest.fn(),
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

    handler = module.get<UpdateActionsHandler>(UpdateActionsHandler);
    repository = module.get<ActionRepository>(ActionRepository);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should update actions and publish an event', async () => {
    const actions = [new ActionEntity()];
    jest.spyOn(repository, 'updateActions').mockResolvedValue(actions);

    const command = new UpdateActionsCommand(actions);
    const result = await handler.execute(command);

    expect(repository.updateActions).toHaveBeenCalledWith(actions);
    expect(eventBus.publish).toHaveBeenCalledWith(
      new ActionUpdatedEvent(actions),
    );
    expect(result).toEqual(actions);
  });
});
