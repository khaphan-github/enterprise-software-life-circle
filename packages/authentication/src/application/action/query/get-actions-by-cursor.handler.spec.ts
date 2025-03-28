/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetActionsByCursorHandler } from './get-actions-by-cursor.handler';
import { GetActionsByCursorQuery } from '../../../domain/action/queries/get-actions-by-cursor.query';
import { ActionRepository } from '../../../infrastructure/repository/action.repository';
import { ActionEntity } from '../../../domain/action/action-entity';

describe('GetActionsByCursorHandler', () => {
  let handler: GetActionsByCursorHandler;
  let repository: ActionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetActionsByCursorHandler,
        {
          provide: ActionRepository,
          useValue: {
            getActionsByCursor: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetActionsByCursorHandler>(GetActionsByCursorHandler);
    repository = module.get<ActionRepository>(ActionRepository);
  });

  it('should get actions by cursor', async () => {
    const actions = [new ActionEntity()];
    jest.spyOn(repository, 'getActionsByCursor').mockResolvedValue(actions);

    const query = new GetActionsByCursorQuery('cursor1', 10);
    const result = await handler.execute(query);

    expect(repository.getActionsByCursor).toHaveBeenCalledWith('cursor1', 10);
    expect(result).toEqual(actions);
  });
});
