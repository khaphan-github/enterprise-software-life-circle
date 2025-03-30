/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { UpdateEndpointsCommandHandler } from './update-endpoints.handler';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { UpdateEndpointsCommand } from '../../../domain/endpoint/command/update-endpoints.command';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { EndpointEntityUpdatedEvent } from '../../../domain/endpoint/event/endpoint-updated.event';

describe('UpdateEndpointsCommandHandler', () => {
  let handler: UpdateEndpointsCommandHandler;
  let repository: EndpointRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEndpointsCommandHandler,
        {
          provide: EndpointRepository,
          useValue: {
            updateEndpoints: jest.fn(),
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

    handler = module.get<UpdateEndpointsCommandHandler>(
      UpdateEndpointsCommandHandler,
    );
    repository = module.get<EndpointRepository>(EndpointRepository);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should throw an error if repository update fails', async () => {
    const endpoints = new EndpointEntity();
    const command = new UpdateEndpointsCommand([endpoints]);

    jest
      .spyOn(repository, 'updateEndpoints')
      .mockRejectedValue(new Error('Update failed'));

    await expect(handler.execute(command)).rejects.toThrow('Update failed');
    expect(repository.updateEndpoints).toHaveBeenCalledWith(expect.any(Array));
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should handle an empty list of endpoints', async () => {
    const command = new UpdateEndpointsCommand([]);
    const result = await handler.execute(command);

    expect(repository.updateEndpoints).toHaveBeenCalledWith([]);
    expect(eventBus.publish).toHaveBeenCalledWith(
      new EndpointEntityUpdatedEvent([]),
    );
    expect(result).toEqual([]);
  });

  it('should not publish an event if no endpoints are updated', async () => {
    const command = new UpdateEndpointsCommand([]);

    jest.spyOn(repository, 'updateEndpoints').mockResolvedValue([]);

    const result = await handler.execute(command);
    expect(repository.updateEndpoints).toHaveBeenCalledWith([]);
    expect(result).toEqual([]);
  });

  it('should call repository with correct data', async () => {
    const endpoints = new EndpointEntity();
    endpoints.id = 'test-id';
    endpoints.path = '/test';
    endpoints.method = 'GET';
    endpoints.metadata = {};
    endpoints.updatedAt = new Date();

    const command = new UpdateEndpointsCommand([endpoints]);
    const updatedEntities = [endpoints];

    jest
      .spyOn(repository, 'updateEndpoints')
      .mockResolvedValue(updatedEntities);

    const result = await handler.execute(command);

    expect(repository.updateEndpoints).toHaveBeenCalledWith([endpoints]);
    expect(eventBus.publish).toHaveBeenCalledWith(
      new EndpointEntityUpdatedEvent(updatedEntities),
    );
    expect(result).toEqual(updatedEntities);
  });
});
