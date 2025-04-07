import { Test, TestingModule } from '@nestjs/testing';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { DeleteEndpointsCommand } from '../../../domain/endpoint/command/delete-endpoints.command';
import { DeleteEndpointsCommandHandler } from './delete-endpoints.handler';
import { EndpointEntityDeletedEvent } from '../../../domain/endpoint/event/endpoint-deleted.event';

describe('DeleteEndpointsHandler', () => {
  let handler: DeleteEndpointsCommandHandler;
  let repositoryMock: any;
  let eventHubMock: any;

  beforeEach(async () => {
    // Create mocks for dependencies
    repositoryMock = {
      deleteEndpoints: jest.fn().mockResolvedValue(undefined),
    };

    eventHubMock = {
      publish: jest.fn(),
    };

    // Create a test module with our handler and mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteEndpointsCommandHandler,
        {
          provide: ENDPOINT_REPOSITORY_PROVIDER,
          useValue: repositoryMock,
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: eventHubMock,
        },
      ],
    }).compile();

    handler = module.get<DeleteEndpointsCommandHandler>(
      DeleteEndpointsCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should delete endpoints by IDs and publish event', async () => {
      // Arrange
      const endpointIds = ['endpoint-1', 'endpoint-2', 'endpoint-3'];
      const command = new DeleteEndpointsCommand(endpointIds);

      // Act
      await handler.execute(command);

      // Assert
      expect(repositoryMock.deleteEndpoints).toHaveBeenCalledWith(endpointIds);
      expect(eventHubMock.publish).toHaveBeenCalledTimes(1);

      // Verify the event was published with the correct endpoint IDs
      const publishedEvent = eventHubMock.publish.mock.calls[0][0];
      expect(publishedEvent).toBeInstanceOf(EndpointEntityDeletedEvent);
      expect(publishedEvent.endpointIds).toEqual(endpointIds);
    });

    it('should handle deleting a single endpoint', async () => {
      // Arrange
      const endpointIds = ['single-endpoint-id'];
      const command = new DeleteEndpointsCommand(endpointIds);

      // Act
      await handler.execute(command);

      // Assert
      expect(repositoryMock.deleteEndpoints).toHaveBeenCalledWith(endpointIds);
      expect(eventHubMock.publish).toHaveBeenCalledWith(
        expect.any(EndpointEntityDeletedEvent),
      );
      const publishedEvent = eventHubMock.publish.mock.calls[0][0];
      expect(publishedEvent.endpointIds).toEqual(endpointIds);
    });

    it('should handle empty array of endpoint IDs', async () => {
      // Arrange
      const endpointIds: string[] = [];
      const command = new DeleteEndpointsCommand(endpointIds);

      // Act
      await handler.execute(command);

      // Assert
      expect(repositoryMock.deleteEndpoints).toHaveBeenCalledWith([]);
      expect(eventHubMock.publish).toHaveBeenCalledWith(
        expect.any(EndpointEntityDeletedEvent),
      );
      const publishedEvent = eventHubMock.publish.mock.calls[0][0];
      expect(publishedEvent.endpointIds).toEqual([]);
    });

    it('should throw error when repository deletion fails', async () => {
      // Arrange
      repositoryMock.deleteEndpoints.mockRejectedValueOnce(
        new Error('Database error during deletion'),
      );
      const endpointIds = ['endpoint-1', 'endpoint-2'];
      const command = new DeleteEndpointsCommand(endpointIds);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Database error during deletion',
      );
      expect(repositoryMock.deleteEndpoints).toHaveBeenCalledWith(endpointIds);
      expect(eventHubMock.publish).not.toHaveBeenCalled();
    });

    it('should throw error when event hub publish fails', async () => {
      // Arrange
      eventHubMock.publish.mockImplementationOnce(() => {
        throw new Error('Event publishing failed');
      });
      const endpointIds = ['endpoint-1', 'endpoint-2'];
      const command = new DeleteEndpointsCommand(endpointIds);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Event publishing failed',
      );
      expect(repositoryMock.deleteEndpoints).toHaveBeenCalledWith(endpointIds);
    });
  });
});
