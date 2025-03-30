/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { UpdateActionsHandler } from './update-actions.handler';
import { UpdateActionsCommand } from '../../../domain/action/commands/update-actions.command';
import { ActionRepository } from '../../../infrastructure/repository/action.repository';
import {
  ActionEntity,
  ActionStatus,
} from '../../../domain/action/action-entity';

describe('UpdateActionsHandler', () => {
  let handler: UpdateActionsHandler;
  let repository: ActionRepository;

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
  });

  it('should update actions and publish an event', async () => {
    const actionEntity = new ActionEntity();
    actionEntity.initId();
    actionEntity.name = 'Test Action';
    actionEntity.description = 'Test Description';
    actionEntity.metadata = { key: 'value' };
    actionEntity.status = ActionStatus.ACTIVE;
    actionEntity.setCreateTime();

    const actions = [actionEntity];

    jest.spyOn(repository, 'updateActions').mockResolvedValue(actions);

    const command = new UpdateActionsCommand(actions);
    const result = await handler.execute(command);

    result.forEach((action) => {
      expect(action).toHaveProperty('id');
      expect(action.id).toBeDefined();
      expect(action.updatedAt).toBeInstanceOf(Date);
      expect(action.description).toEqual(actionEntity.description);
      expect(action.metadata).toEqual(actionEntity.metadata);
      expect(action.name).toEqual(actionEntity.name);
      expect(action.status).toEqual(actionEntity.status);
    });
  });
});
