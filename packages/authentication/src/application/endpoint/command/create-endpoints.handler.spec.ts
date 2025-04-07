import { Test, TestingModule } from '@nestjs/testing';
import { CreateEndpointCommandHandler } from './create-endpoints.handler';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { ID_GENERATOR } from '../../../infrastructure/providers/id-genrerator.provider';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { CreateEndpointsCommand } from '../../../domain/endpoint/command/create-endpoints.command';
import { EndpointEntityCreatedEvent } from '../../../domain/endpoint/event/endpoint-created.event';

describe('CreateEndpointCommandHandler', () => {
  let handler: CreateEndpointCommandHandler;
  let repositoryMock: any;
  let idGeneratorMock: any;
  let eventHubMock: any;

  beforeEach(async () => {
    // Create mocks for dependencies
    repositoryMock = {
      createEndpoints: jest
        .fn()
        .mockImplementation((endpoints) => Promise.resolve(endpoints)),
    };

    idGeneratorMock = {
      generateId: jest.fn().mockReturnValue('mock-endpoint-id'),
    };

    eventHubMock = {
      publish: jest.fn(),
    };

    // Create a test module with our handler and mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEndpointCommandHandler,
        {
          provide: ENDPOINT_REPOSITORY_PROVIDER,
          useValue: repositoryMock,
        },
        {
          provide: ID_GENERATOR,
          useValue: idGeneratorMock,
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: eventHubMock,
        },
      ],
    }).compile();

    handler = module.get<CreateEndpointCommandHandler>(
      CreateEndpointCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create multiple endpoints successfully', async () => {
      // Arrange
      const endpointData: any = [
        {
          path: '/api/users',
          method: 'GET',
          metadata: { requiresAuth: true },
          status: 'active',
        },
        {
          path: '/api/posts',
          method: 'POST',
          metadata: { requiresAuth: true, roles: ['admin'] },
          status: 'active',
        },
      ];

      const command = new CreateEndpointsCommand(endpointData);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(2);

      // Check properties of created entities
      expect(result[0].path).toBe('/api/users');
      expect(result[0].method).toBe('GET');
      expect(result[0].metadata).toEqual({ requiresAuth: true });
      expect(result[0].status).toBe('active');
      expect(result[0].getId()).toBe('mock-endpoint-id');
      expect(result[0].createdAt).toBeDefined();

      expect(result[1].path).toBe('/api/posts');
      expect(result[1].method).toBe('POST');
      expect(result[1].metadata).toEqual({
        requiresAuth: true,
        roles: ['admin'],
      });
      expect(result[1].status).toBe('active');

      // Verify repository was called correctly
      expect(repositoryMock.createEndpoints).toHaveBeenCalledWith(result);

      // Verify event was published
      expect(eventHubMock.publish).toHaveBeenCalledTimes(1);
      const publishedEvent = eventHubMock.publish.mock.calls[0][0];
      expect(publishedEvent).toBeInstanceOf(EndpointEntityCreatedEvent);
      expect(publishedEvent.endpoints).toEqual(result);
    });

    it('should create a single endpoint successfully', async () => {
      // Arrange
      const endpointData: any = [
        {
          path: '/api/auth',
          method: 'POST',
          metadata: { public: true },
          status: 'active',
        },
      ];

      const command = new CreateEndpointsCommand(endpointData);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('/api/auth');
      expect(result[0].method).toBe('POST');
      expect(result[0].metadata).toEqual({ public: true });
      expect(repositoryMock.createEndpoints).toHaveBeenCalledWith(result);
      expect(eventHubMock.publish).toHaveBeenCalledTimes(1);
    });

    it('should handle empty endpoints array', async () => {
      // Arrange
      const endpointData: any[] = [];
      const command = new CreateEndpointsCommand(endpointData);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toHaveLength(0);
      expect(repositoryMock.createEndpoints).toHaveBeenCalledWith([]);
      expect(eventHubMock.publish).toHaveBeenCalledTimes(1);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      repositoryMock.createEndpoints.mockRejectedValueOnce(
        new Error('Database error during endpoint creation'),
      );

      const endpointData: any = [
        {
          path: '/api/error',
          method: 'GET',
          metadata: {},
          status: 'active',
        },
      ];
      const command = new CreateEndpointsCommand(endpointData);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Database error during endpoint creation',
      );
      expect(eventHubMock.publish).not.toHaveBeenCalled();
    });

    it('should throw error when event hub publish fails', async () => {
      // Arrange
      eventHubMock.publish.mockImplementationOnce(() => {
        throw new Error('Event publishing failed');
      });

      const endpointData: any = [
        {
          path: '/api/users',
          method: 'GET',
          metadata: {},
          status: 'active',
        },
      ];
      const command = new CreateEndpointsCommand(endpointData);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Event publishing failed',
      );
      expect(repositoryMock.createEndpoints).toHaveBeenCalled();
    });

    it('should throw error when ID generator fails', async () => {
      // Arrange
      idGeneratorMock.generateId.mockImplementationOnce(() => {
        throw new Error('ID generation failed');
      });

      const endpointData: any = [
        {
          path: '/api/users',
          method: 'GET',
          metadata: {},
          status: 'active',
        },
      ];
      const command = new CreateEndpointsCommand(endpointData);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'ID generation failed',
      );
      expect(repositoryMock.createEndpoints).not.toHaveBeenCalled();
      expect(eventHubMock.publish).not.toHaveBeenCalled();
    });
  });
});
