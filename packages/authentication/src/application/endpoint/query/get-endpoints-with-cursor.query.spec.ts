/* eslint-disable @typescript-eslint/unbound-method */
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { GetEndpointsWithCursorQuery } from '../../../domain/endpoint/query/get-endpoints-with-cursor.query';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { GetEndpointsWithCursorQueryHandler } from './get-endpoints-with-cursor.handler';

describe('GetEndpointsWithCursorQueryHandler', () => {
  let handler: GetEndpointsWithCursorQueryHandler;
  let repository: jest.Mocked<EndpointRepository>;

  beforeEach(() => {
    repository = {
      getEndpointsWithCursor: jest.fn(),
      // ...other mocked methods if necessary...
    } as unknown as jest.Mocked<EndpointRepository>;

    handler = new GetEndpointsWithCursorQueryHandler(repository);
  });

  it('should return a list of endpoints', async () => {
    const query = new GetEndpointsWithCursorQuery(10, 'cursor123');
    const endpoints = [new EndpointEntity(), new EndpointEntity()]; // Mocked entities
    repository.getEndpointsWithCursor.mockResolvedValue(endpoints);

    const result = await handler.execute(query);

    expect(result).toBe(endpoints);
    expect(repository.getEndpointsWithCursor).toHaveBeenCalledWith(
      10,
      'cursor123',
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
