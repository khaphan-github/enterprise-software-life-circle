import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { EndpointEntityCreatedEvent } from '../../../domain/endpoint/event/endpoint-created.event';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { CreateEndpointsCommand } from '../../../domain/endpoint/command/create-endpoints.command';

@CommandHandler(CreateEndpointsCommand)
export class CreateEndpointCommandHandler
  implements ICommandHandler<CreateEndpointsCommand>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly repository: EndpointRepository,
  ) {}

  async execute(commands: CreateEndpointsCommand): Promise<EndpointEntity[]> {
    const createdEntities: EndpointEntity[] = [];

    for (const command of commands.endpoints) {
      const entity = new EndpointEntity();
      entity.initId();
      entity.path = command.path;
      entity.method = command.method;
      entity.metadata = command.metadata;
      entity.status = command.status;
      entity.setCreateTime();
      createdEntities.push(entity);
    }
    const createdEntity =
      await this.repository.createEndpoints(createdEntities);

    this.eventBus.publish(new EndpointEntityCreatedEvent(createdEntity));

    return createdEntities;
  }
}
