/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { CreateEndpointCommandHandler } from './create-endpoints.handler';
import { EndpointRepository } from '../../../infrastructure/repository/postgres/endpoint.repository';
import { CreateEndpointCommand } from '../../../domain/endpoint/command/create-endpoint.command';
import {
  EndpointEntity,
  EndpointStatus,
} from '../../../domain/endpoint/endpoint-entity';
import { EndpointEntityCreatedEvent } from '../../../domain/endpoint/event/endpoint-created.event';

describe('CreateEndpointCommandHandler', () => {
  let handler: CreateEndpointCommandHandler;
  let repository: EndpointRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEndpointCommandHandler,
        {
          provide: EndpointRepository,
          useValue: {
            createEndpoints: jest.fn(),
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

    handler = module.get<CreateEndpointCommandHandler>(
      CreateEndpointCommandHandler,
    );
    repository = module.get<EndpointRepository>(EndpointRepository);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should create endpoints and publish an event', async () => {
    const command = new CreateEndpointCommand([
      {
        path: '/test',
        method: 'GET',
        metadata: {},
        status: EndpointStatus.ACTIVE,
      },
    ]);
    const createdEntities = [new EndpointEntity()];
    createdEntities[0].id = 'test-id';
    createdEntities[0].path = '/test';
    createdEntities[0].method = 'GET';
    createdEntities[0].metadata = {};
    createdEntities[0].createdAt = new Date();
    createdEntities[0].updatedAt = new Date();

    jest
      .spyOn(repository, 'createEndpoints')
      .mockResolvedValue(createdEntities);

    const result = await handler.execute(command);

    expect(repository.createEndpoints).toHaveBeenCalledWith(expect.any(Array));
    expect(eventBus.publish).toHaveBeenCalledWith(
      new EndpointEntityCreatedEvent(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.arrayContaining([
          expect.objectContaining({
            path: '/test',
            method: 'GET',
            metadata: {},
          }),
        ]),
      ),
    );
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/test',
          method: 'GET',
          metadata: {},
        }),
      ]),
    );
  });
});
