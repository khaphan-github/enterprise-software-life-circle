/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { AddEndpointsToRolesCommandHandler } from './add-endpoints-to-roles.handler';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { AddEndpointsToRolesCommand } from '../../../domain/role/command/add-endpoints-to-roles.command';
import { EndpointsAddedToRolesEvent } from '../../../domain/role/event/endpoints-added-to-roles.event';

describe('AddEndpointsToRolesCommandHandler', () => {
  let handler: AddEndpointsToRolesCommandHandler;
  let repository: EndpointRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddEndpointsToRolesCommandHandler,
        {
          provide: EndpointRepository,
          useValue: {
            addEndpointsToRoles: jest.fn(),
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

    handler = module.get<AddEndpointsToRolesCommandHandler>(
      AddEndpointsToRolesCommandHandler,
    );
    repository = module.get<EndpointRepository>(EndpointRepository);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should add endpoints to roles and publish an event', async () => {
    const command = new AddEndpointsToRolesCommand(
      ['endpoint-id'],
      ['role-id'],
    );

    await handler.execute(command);

    expect(repository.addEndpointsToRoles).toHaveBeenCalledWith(
      ['endpoint-id'],
      ['role-id'],
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      new EndpointsAddedToRolesEvent(['endpoint-id'], ['role-id']),
    );
  });
});
