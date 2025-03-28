/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { FindActionByIdHandler } from './find-action-by-id.handler';
import { FindActionByIdQuery } from '../../../domain/action/queries/find-action-by-id.query';
import { ActionRepository } from '../../../infrastructure/repository/action.repository';
import { ActionEntity } from '../../../domain/action/action-entity';

describe('FindActionByIdHandler', () => {
  let handler: FindActionByIdHandler;
  let repository: ActionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindActionByIdHandler,
        {
          provide: ActionRepository,
          useValue: {
            findActionById: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<FindActionByIdHandler>(FindActionByIdHandler);
    repository = module.get<ActionRepository>(ActionRepository);
  });

  it('should find an action by ID', async () => {
    const action = new ActionEntity();
    jest.spyOn(repository, 'findActionById').mockResolvedValue(action);

    const query = new FindActionByIdQuery('id1');
    const result = await handler.execute(query);

    expect(repository.findActionById).toHaveBeenCalledWith('id1');
    expect(result).toEqual(action);
  });
});
