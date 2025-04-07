import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { DeleteEndpointsCommand } from '../../../domain/endpoint/command/delete-endpoints.command';
import { EndpointEntityDeletedEvent } from '../../../domain/endpoint/event/endpoint-deleted.event';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';

@CommandHandler(DeleteEndpointsCommand)
export class DeleteEndpointsCommandHandler
  implements ICommandHandler<DeleteEndpointsCommand>
{
  @Inject(ENDPOINT_REPOSITORY_PROVIDER)
  private readonly repository: IEndpointRepository;

  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;

  async execute(command: DeleteEndpointsCommand): Promise<void> {
    await this.repository.deleteEndpoints(command.ids);
    this.eventHub.publish(new EndpointEntityDeletedEvent(command.ids));
  }
}
