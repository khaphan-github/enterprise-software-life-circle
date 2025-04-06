import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AssignEndpointToRoleCommand } from '../../../domain/role/command/assign-endpoint-to-role.command';
import { EndpointsAssignedToRolesEvent } from '../../../domain/role/event/endpoints-assigned-to-roles.event';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { Inject } from '@nestjs/common';
import { EndpointRepositoryProvider } from 'src/infrastructure/providers/repository/repository-providers';

@CommandHandler(AssignEndpointToRoleCommand)
export class AssignEndpointToRoleHandler
  implements ICommandHandler<AssignEndpointToRoleCommand>
{
  @Inject(EndpointRepositoryProvider)
  private readonly repository: IEndpointRepository;
  constructor(private readonly eventBus: EventBus) {}

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
