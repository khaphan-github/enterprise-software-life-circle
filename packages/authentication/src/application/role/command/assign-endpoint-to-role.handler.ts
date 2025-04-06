import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignEndpointToRoleCommand } from '../../../domain/role/command/assign-endpoint-to-role.command';
import { EndpointsAssignedToRolesEvent } from '../../../domain/role/event/endpoints-assigned-to-roles.event';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { Inject } from '@nestjs/common';
import { ENDPOINT_REPOSITORY_PROVIDER } from 'src/infrastructure/providers/repository/repository-providers';

import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
@CommandHandler(AssignEndpointToRoleCommand)
export class AssignEndpointToRoleHandler
  implements ICommandHandler<AssignEndpointToRoleCommand>
{
  @Inject(ENDPOINT_REPOSITORY_PROVIDER)
  private readonly repository: IEndpointRepository;
  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;

  async execute(command: AssignEndpointToRoleCommand): Promise<void> {
    await this.repository.assignEndpointsToRoles(
      command.endpointIds,
      command.roleIds,
    );
    this.eventHub.publish(
      new EndpointsAssignedToRolesEvent(command.endpointIds, command.roleIds),
    );
  }
}
