import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { EndpointEntityUpdatedEvent } from '../../../domain/endpoint/event/endpoint-updated.event';
import { UpdateEndpointsCommand } from '../../../domain/endpoint/command/update-endpoints.command';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';

import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
@CommandHandler(UpdateEndpointsCommand)
export class UpdateEndpointsCommandHandler
  implements ICommandHandler<UpdateEndpointsCommand>
{
  @Inject(ENDPOINT_REPOSITORY_PROVIDER)
  private readonly repository: IEndpointRepository;

  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;

  async execute(commands: UpdateEndpointsCommand): Promise<EndpointEntity[]> {
    const updatedEntities: EndpointEntity[] = [];

    for (const command of commands.endpoints) {
      const entity = new EndpointEntity();
      entity.setId(command.id);
      entity.path = command.path;
      entity.method = command.method;
      entity.metadata = command.metadata ?? {};
      entity.status = command.status;
      entity.setUpdateTime();
      updatedEntities.push(entity);
    }

    await this.repository.updateEndpoints(updatedEntities);

    this.eventHub.publish(new EndpointEntityUpdatedEvent(updatedEntities));

    return updatedEntities;
  }
}
