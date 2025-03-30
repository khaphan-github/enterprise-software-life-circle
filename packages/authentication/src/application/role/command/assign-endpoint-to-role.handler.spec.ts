/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { AssignEndpointToRoleHandler } from './assign-endpoint-to-role.handler';
import { AssignEndpointToRoleCommand } from '../../../domain/role/command/assign-endpoint-to-role.command';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { EndpointsAssignedToRolesEvent } from '../../../domain/role/event/endpoints-assigned-to-roles.event';

describe('AssignEndpointToRoleHandler', () => {
  let handler: AssignEndpointToRoleHandler;
  let repository: EndpointRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignEndpointToRoleHandler,
        {
          provide: EndpointRepository,
          useValue: {
            assignEndpointsToRoles: jest.fn(),
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

    handler = module.get<AssignEndpointToRoleHandler>(
      AssignEndpointToRoleHandler,
    );
    repository = module.get<EndpointRepository>(EndpointRepository);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should assign endpoints to roles and publish an event', async () => {
    const command = new AssignEndpointToRoleCommand(['endpoint1'], ['role1']);
    await handler.execute(command);

    expect(repository.assignEndpointsToRoles).toHaveBeenCalledWith(
      ['endpoint1'],
      ['role1'],
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      new EndpointsAssignedToRolesEvent(['endpoint1'], ['role1']),
    );
  });
});
