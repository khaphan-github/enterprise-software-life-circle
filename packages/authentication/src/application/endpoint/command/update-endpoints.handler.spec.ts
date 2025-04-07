import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEndpointsCommandHandler } from './update-endpoints.handler';
import { UpdateEndpointsCommand } from '../../../domain/endpoint/command/update-endpoints.command';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { EventHub } from '../../../domain/event-hub/event.hub';
import {
  EndpointEntity,
  EndpointStatus,
} from '../../../domain/endpoint/endpoint-entity';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';

describe('UpdateEndpointsCommandHandler', () => {
  let handler: UpdateEndpointsCommandHandler;
  let repository: jest.Mocked<IEndpointRepository>;
  let eventHub: jest.Mocked<EventHub>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEndpointsCommandHandler,
        {
          provide: ENDPOINT_REPOSITORY_PROVIDER,
          useValue: {
            updateEndpoints: jest
              .fn()
              .mockImplementation(() => Promise.resolve()),
          },
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: {
            publish: jest.fn().mockImplementation(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateEndpointsCommandHandler>(
      UpdateEndpointsCommandHandler,
    );
    repository = module.get(ENDPOINT_REPOSITORY_PROVIDER);
    eventHub = module.get(EVENT_HUB_PROVIDER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully update multiple endpoints', async () => {
      // Arrange
      const command = new UpdateEndpointsCommand([
        {
          id: '1',
          path: '/api/test1',
          method: 'GET',
          metadata: { description: 'Test endpoint 1' },
          status: EndpointStatus.ACTIVE,
        },
        {
          id: '2',
          path: '/api/test2',
          method: 'POST',
          metadata: { description: 'Test endpoint 2' },
          status: EndpointStatus.ACTIVE,
        },
      ]);

      const expectedEntities = command.endpoints.map((endpoint) => {
        const entity = new EndpointEntity();
        entity.setId(endpoint.id);
        entity.path = endpoint.path;
        entity.method = endpoint.method;
        entity.metadata = endpoint.metadata;
        entity.status = endpoint.status;
        entity.setUpdateTime();
        return entity;
      });

      repository.updateEndpoints.mockImplementation(() => Promise.resolve());

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].path).toBe('/api/test1');
      expect(result[1].id).toBe('2');
      expect(result[1].path).toBe('/api/test2');

      // Verify the call with a more flexible comparison
      expect(repository.updateEndpoints).toHaveBeenCalled();
      const actualCall = repository.updateEndpoints.mock.calls[0][0];
      expect(actualCall).toHaveLength(2);
      expect(actualCall[0].id).toBe(expectedEntities[0].id);
      expect(actualCall[0].path).toBe(expectedEntities[0].path);
      expect(actualCall[0].method).toBe(expectedEntities[0].method);
      expect(actualCall[0].metadata).toEqual(expectedEntities[0].metadata);
      expect(actualCall[0].status).toBe(expectedEntities[0].status);
      expect(actualCall[1].id).toBe(expectedEntities[1].id);
      expect(actualCall[1].path).toBe(expectedEntities[1].path);
      expect(actualCall[1].method).toBe(expectedEntities[1].method);
      expect(actualCall[1].metadata).toEqual(expectedEntities[1].metadata);
      expect(actualCall[1].status).toBe(expectedEntities[1].status);

      expect(eventHub.publish).toHaveBeenCalled();
    });

    it('should handle empty endpoints array', async () => {
      // Arrange
      const command = new UpdateEndpointsCommand([]);
      repository.updateEndpoints.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(0);
      expect(repository.updateEndpoints).toHaveBeenCalledWith([]);
      expect(eventHub.publish).toHaveBeenCalled();
    });

    it('should handle repository error', async () => {
      // Arrange
      const command = new UpdateEndpointsCommand([
        {
          id: '1',
          path: '/api/test',
          method: 'GET',
          status: EndpointStatus.ACTIVE,
        },
      ]);

      const error = new Error('Repository error');
      repository.updateEndpoints.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Repository error',
      );
      expect(eventHub.publish).not.toHaveBeenCalled();
    });

    it('should handle endpoints with missing optional metadata', async () => {
      // Arrange
      const command = new UpdateEndpointsCommand([
        {
          id: '1',
          path: '/api/test',
          method: 'GET',
          status: EndpointStatus.ACTIVE,
        },
      ]);

      repository.updateEndpoints.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].metadata).toEqual({});
      expect(repository.updateEndpoints).toHaveBeenCalled();
      expect(eventHub.publish).toHaveBeenCalled();
    });
  });
});
