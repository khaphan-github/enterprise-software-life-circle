import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { AddEndpointsToRolesCommand } from '../../../domain/role/command/add-endpoints-to-roles.command';
import { EndpointsAddedToRolesEvent } from '../../../domain/role/event/endpoints-added-to-roles.event';

@CommandHandler(AddEndpointsToRolesCommand)
export class AddEndpointsToRolesCommandHandler
  implements ICommandHandler<AddEndpointsToRolesCommand>
{
  constructor(
    private readonly repository: EndpointRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddEndpointsToRolesCommand): Promise<void> {
    await this.repository.addEndpointsToRoles(
      command.endpointIds,
      command.roleIds,
    );
    this.eventBus.publish(
      new EndpointsAddedToRolesEvent(command.endpointIds, command.roleIds),
    );
  }
}
