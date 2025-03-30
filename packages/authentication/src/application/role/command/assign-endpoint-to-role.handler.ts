import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AssignEndpointToRoleCommand } from '../../../domain/role/command/assign-endpoint-to-role.command';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { EndpointsAssignedToRolesEvent } from '../../../domain/role/event/endpoints-assigned-to-roles.event';

@CommandHandler(AssignEndpointToRoleCommand)
export class AssignEndpointToRoleHandler
  implements ICommandHandler<AssignEndpointToRoleCommand>
{
  constructor(
    private readonly repository: EndpointRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AssignEndpointToRoleCommand): Promise<void> {
    await this.repository.assignEndpointsToRoles(
      command.endpointIds,
      command.roleIds,
    );
    this.eventBus.publish(
      new EndpointsAssignedToRolesEvent(command.endpointIds, command.roleIds),
    );
  }
}
