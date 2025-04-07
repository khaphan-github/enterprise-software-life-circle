/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { GetEndpointQuery } from '../../../domain/endpoint/query/get-endpoint.query';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { GetEndpointQueryHandler } from './get-endpoint.handler';

describe('GetEndpointQueryHandler', () => {
  let handler: GetEndpointQueryHandler;
  let repository: jest.Mocked<IEndpointRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEndpointQueryHandler,
        {
          provide: ENDPOINT_REPOSITORY_PROVIDER,
          useValue: {
            getEndpoint: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetEndpointQueryHandler>(GetEndpointQueryHandler);
    repository = module.get(ENDPOINT_REPOSITORY_PROVIDER);
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
