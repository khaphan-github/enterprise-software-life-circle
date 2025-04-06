import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { EndpointEntityCreatedEvent } from '../../../domain/endpoint/event/endpoint-created.event';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { CreateEndpointsCommand } from '../../../domain/endpoint/command/create-endpoints.command';
import { ID_GENERATOR } from '../../../infrastructure/providers/id-genrerator.provider';
import { IdGenerator } from '../../../domain/entity/id';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';

@CommandHandler(CreateEndpointsCommand)
export class CreateEndpointCommandHandler
  implements ICommandHandler<CreateEndpointsCommand>
{
  @Inject(ENDPOINT_REPOSITORY_PROVIDER)
  private readonly repository: IEndpointRepository;

  @Inject(ID_GENERATOR)
  private readonly generator: IdGenerator;

  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;

  async execute(commands: CreateEndpointsCommand): Promise<EndpointEntity[]> {
    const createdEntities: EndpointEntity[] = [];

    for (const command of commands.endpoints) {
      const entity = new EndpointEntity();
      entity.initId(this.generator);
      entity.path = command.path;
      entity.method = command.method;
      entity.metadata = command.metadata;
      entity.status = command.status;
      entity.setCreateTime();
      createdEntities.push(entity);
    }
    const createdEntity =
      await this.repository.createEndpoints(createdEntities);

    this.eventHub.publish(new EndpointEntityCreatedEvent(createdEntity));

    return createdEntities;
  }
}
