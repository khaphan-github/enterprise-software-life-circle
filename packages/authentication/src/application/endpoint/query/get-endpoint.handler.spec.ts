/* eslint-disable @typescript-eslint/unbound-method */
import { EndpointRepository } from '../../../infrastructure/repository/postgres/endpoint.repository';
import { GetEndpointQuery } from '../../../domain/endpoint/query/get-endpoint.query';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { GetEndpointQueryHandler } from './get-endpoint.handler';

describe('GetEndpointQueryHandler', () => {
  let handler: GetEndpointQueryHandler;
  let repository: jest.Mocked<EndpointRepository>;

  beforeEach(() => {
    repository = {
      getEndpoint: jest.fn(),
      // ...other mocked methods if necessary...
    } as unknown as jest.Mocked<EndpointRepository>;

    handler = new GetEndpointQueryHandler(repository);
  });

  it('should return an endpoint when found', async () => {
    const query = new GetEndpointQuery('/test-path', 'GET');
    const endpoint = new EndpointEntity(); // Mocked entity
    repository.getEndpoint.mockResolvedValue(endpoint);

    const result = await handler.execute(query);

    expect(result).toBe(endpoint);
    expect(repository.getEndpoint).toHaveBeenCalledWith('/test-path', 'GET');
  });

  it('should return null when no endpoint is found', async () => {
    const query = new GetEndpointQuery('/non-existent-path', 'POST');
    repository.getEndpoint.mockResolvedValue(null);

    const result = await handler.execute(query);

    expect(result).toBeNull();
    expect(repository.getEndpoint).toHaveBeenCalledWith(
      '/non-existent-path',
      'POST',
    );
  });
});
