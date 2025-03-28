/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { DeleteEndpointsCommandHandler } from './delete-endpoints.handler';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { DeleteEndpointsCommand } from '../../../domain/endpoint/command/delete-endpoints.command';
import { EndpointEntityDeletedEvent } from '../../../domain/endpoint/event/endpoint-deleted.event';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';

describe('DeleteEndpointsCommandHandler', () => {
  let handler: DeleteEndpointsCommandHandler;
  let repository: EndpointRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteEndpointsCommandHandler,
        {
          provide: EndpointRepository,
          useValue: {
            deleteEndpoints: jest.fn(),
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

    handler = module.get<DeleteEndpointsCommandHandler>(
      DeleteEndpointsCommandHandler,
    );
    repository = module.get<EndpointRepository>(EndpointRepository);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should delete endpoints and publish an event', async () => {
    const command = new DeleteEndpointsCommand(['test-id']);
    const deletedEntities = [new EndpointEntity()];
    deletedEntities[0].id = 'test-id';

    jest
      .spyOn(repository, 'deleteEndpoints')
      .mockResolvedValue(deletedEntities);

    await handler.execute(command);

    expect(repository.deleteEndpoints).toHaveBeenCalledWith(['test-id']);
    expect(eventBus.publish).toHaveBeenCalledWith(
      new EndpointEntityDeletedEvent(deletedEntities),
    );
  });
});
