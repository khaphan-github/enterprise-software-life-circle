/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { CreateActionsHandler } from './create-actions.handler';
import { CreateActionsCommand } from '../../../domain/action/commands/create-actions.command';
import { ActionRepository } from '../../../infrastructure/repository/action.repository';
import { ActionCreatedEvent } from '../../../domain/action/events/action-created.event';
import { ActionEntity } from '../../../domain/action/action-entity';

describe('CreateActionsHandler', () => {
  let handler: CreateActionsHandler;
  let repository: ActionRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateActionsHandler,
        {
          provide: ActionRepository,
          useValue: {
            createActions: jest.fn(),
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

    handler = module.get<CreateActionsHandler>(CreateActionsHandler);
    repository = module.get<ActionRepository>(ActionRepository);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should create actions and publish an event', async () => {
    const actions = [new ActionEntity()];
    jest.spyOn(repository, 'createActions').mockResolvedValue(actions);

    const command = new CreateActionsCommand(actions);
    const result = await handler.execute(command);

    expect(repository.createActions).toHaveBeenCalledWith(actions);
    expect(eventBus.publish).toHaveBeenCalledWith(
      new ActionCreatedEvent(actions),
    );
    expect(result).toEqual(actions);
  });
});
