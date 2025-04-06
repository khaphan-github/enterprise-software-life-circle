/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { CreateActionsHandler } from './create-actions.handler';
import {
  CreateActionsCommand,
  ICreateActionsCommand,
} from '../../../domain/action/commands/create-actions.command';
import { ActionRepository } from '../../../infrastructure/repository/postgres/action.repository';
import { ActionStatus } from '../../../domain/action/action-entity';

describe('CreateActionsHandler', () => {
  let handler: CreateActionsHandler;
  let repository: ActionRepository;

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
  });

  it('should create actions and publish an event', async () => {
    const actionEntity: ICreateActionsCommand = {
      description: 'Test Description',
      metadata: { key: 'value' },
      name: 'Test Action',
      status: ActionStatus.ACTIVE,
    };

    const actions = [actionEntity];
    jest.spyOn(repository, 'createActions').mockResolvedValue(actions);

    const command = new CreateActionsCommand(actions);
    const result = await handler.execute(command);

    result.forEach((action) => {
      expect(action).toHaveProperty('id');
      expect(action.id).toBeDefined();
      expect(action.createdAt).toBeInstanceOf(Date);
      expect(action.updatedAt).toBeInstanceOf(Date);

      expect(action.description).toEqual(actionEntity.description);
      expect(action.metadata).toEqual(actionEntity.metadata);
      expect(action.name).toEqual(actionEntity.name);
      expect(action.status).toEqual(actionEntity.status);
    });
  });
});
