import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { EndpointEntityCreatedEvent } from '../../../domain/endpoint/event/endpoint-created.event';
import { CreateEndpointCommand } from '../../../domain/endpoint/command/create-endpoint.command';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';

@CommandHandler(CreateEndpointCommand)
export class CreateEndpointCommandHandler
  implements ICommandHandler<CreateEndpointCommand>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly repository: EndpointRepository,
  ) {}

  async execute(commands: CreateEndpointCommand): Promise<EndpointEntity[]> {
    const createdEntities: EndpointEntity[] = [];

    for (const command of commands.endpoints) {
      const entity = new EndpointEntity();
      entity.initId();
      entity.path = command.path;
      entity.method = command.method;
      entity.metadata = command.metadata;
      entity.createdAt = new Date();
      entity.updatedAt = new Date();
      createdEntities.push(entity);
    }
    const createdEntity =
      await this.repository.createEndpoints(createdEntities);

    this.eventBus.publish(new EndpointEntityCreatedEvent(createdEntity));

    return createdEntities;
  }
}
