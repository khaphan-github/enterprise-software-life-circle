import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { DeleteEndpointsCommand } from '../../../domain/endpoint/command/delete-endpoints.command';
import { EndpointEntityDeletedEvent } from '../../../domain/endpoint/event/endpoint-deleted.event';

@CommandHandler(DeleteEndpointsCommand)
export class DeleteEndpointsCommandHandler
  implements ICommandHandler<DeleteEndpointsCommand>
{
  constructor(
    private readonly repository: EndpointRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteEndpointsCommand): Promise<void> {
    const deletedEntities = await this.repository.deleteEndpoints(
      command.endpointIds,
    );
    this.eventBus.publish(new EndpointEntityDeletedEvent(deletedEntities));
  }
}
