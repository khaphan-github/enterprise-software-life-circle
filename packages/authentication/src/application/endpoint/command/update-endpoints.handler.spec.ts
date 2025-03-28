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

  it('should update endpoints and publish an event', async () => {
    const command = new UpdateEndpointsCommand([
      {
        id: 'test-id',
        path: '/test',
        method: 'POST',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        initId: function (): void {
          throw new Error('Function not implemented.');
        },
        getId: function (): string {
          throw new Error('Function not implemented.');
        },
        setCreateTime: function (): void {
          throw new Error('Function not implemented.');
        },
        setUpdateTime: function (): void {
          throw new Error('Function not implemented.');
        },
      },
    ]);
    const updatedEntities = [new EndpointEntity()];
    updatedEntities[0].id = 'test-id';
    updatedEntities[0].path = '/test';
    updatedEntities[0].method = 'POST';
    updatedEntities[0].metadata = {};
    updatedEntities[0].updatedAt = new Date();

    jest
      .spyOn(repository, 'updateEndpoints')
      .mockResolvedValue(updatedEntities);

    const result = await handler.execute(command);

    expect(repository.updateEndpoints).toHaveBeenCalledWith(expect.any(Array));
    expect(eventBus.publish).toHaveBeenCalledWith(
      new EndpointEntityUpdatedEvent(updatedEntities),
    );
    expect(result).toEqual(updatedEntities);
  });
});
