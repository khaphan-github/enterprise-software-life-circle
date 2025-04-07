/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { GetEndpointsWithCursorQuery } from '../../../domain/endpoint/query/get-endpoints-with-cursor.query';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { GetEndpointsWithCursorQueryHandler } from './get-endpoints-with-cursor.handler';

describe('GetEndpointsWithCursorQueryHandler', () => {
  let handler: GetEndpointsWithCursorQueryHandler;
  let repository: jest.Mocked<IEndpointRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEndpointsWithCursorQueryHandler,
        {
          provide: ENDPOINT_REPOSITORY_PROVIDER,
          useValue: {
            getEndpointsWithCursor: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetEndpointsWithCursorQueryHandler>(
      GetEndpointsWithCursorQueryHandler,
    );
    repository = module.get(ENDPOINT_REPOSITORY_PROVIDER);
  });

  it('should return a list of endpoints', async () => {
    const query = new GetEndpointsWithCursorQuery(10, 'cursor');
    const endpoints = [new EndpointEntity(), new EndpointEntity()];
    repository.getEndpointsWithCursor.mockResolvedValue(endpoints);

    const result = await handler.execute(query);

    expect(result).toEqual(endpoints);
    expect(repository.getEndpointsWithCursor).toHaveBeenCalledWith(
      10,
      'cursor',
    );
  });

  it('should return an empty list when no endpoints are found', async () => {
    const query = new GetEndpointsWithCursorQuery(10);
    repository.getEndpointsWithCursor.mockResolvedValue([]);

    const result = await handler.execute(query);

    expect(result).toEqual([]);
    expect(repository.getEndpointsWithCursor).toHaveBeenCalledWith(
      10,
      undefined,
    );
  });
});
