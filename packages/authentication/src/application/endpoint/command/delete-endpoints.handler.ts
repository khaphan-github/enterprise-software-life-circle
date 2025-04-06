import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { DeleteEndpointsCommand } from '../../../domain/endpoint/command/delete-endpoints.command';
import { EndpointEntityDeletedEvent } from '../../../domain/endpoint/event/endpoint-deleted.event';

@CommandHandler(DeleteEndpointsCommand)
export class DeleteEndpointsCommandHandler
  implements ICommandHandler<DeleteEndpointsCommand>
{
  @Inject(ENDPOINT_REPOSITORY_PROVIDER)
  private readonly repository: IEndpointRepository;

  constructor(private readonly eventBus: EventBus) {}

  async execute(command: DeleteEndpointsCommand): Promise<void> {
    const deletedEntities = await this.repository.deleteEndpoints(command.ids);
    this.eventBus.publish(new EndpointEntityDeletedEvent(deletedEntities));
  }
}
