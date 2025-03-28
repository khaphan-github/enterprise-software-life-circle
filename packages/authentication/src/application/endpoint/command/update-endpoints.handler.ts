import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { UpdateEndpointsCommand } from '../../../domain/endpoint/command/update-endpoints.command';
import { EndpointEntityUpdatedEvent } from '../../../domain/endpoint/event/endpoint-updated.event';

@CommandHandler(UpdateEndpointsCommand)
export class UpdateEndpointsCommandHandler
  implements ICommandHandler<UpdateEndpointsCommand>
{
  constructor(
    private readonly repository: EndpointRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateEndpointsCommand): Promise<EndpointEntity[]> {
    const updatedEntities = await this.repository.updateEndpoints(
      command.endpoints,
    );
    this.eventBus.publish(new EndpointEntityUpdatedEvent(updatedEntities));
    return updatedEntities;
  }
}
