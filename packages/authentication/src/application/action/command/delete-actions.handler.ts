import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteActionsCommand } from '../../../domain/action/commands/delete-actions.command';
import { ActionDeletedEvent } from '../../../domain/action/events/action-deleted.event';
import { Inject } from '@nestjs/common';
import { ActionRepositoryProvider } from '../../../infrastructure/providers/repository/repository-providers';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';

@CommandHandler(DeleteActionsCommand)
export class DeleteActionsHandler
  implements ICommandHandler<DeleteActionsCommand>
{
  @Inject(ActionRepositoryProvider)
  private readonly repository: IActionRepository;
  constructor(private readonly eventBus: EventBus) {}

  async execute(command: DeleteActionsCommand): Promise<void> {
    await this.repository.deleteActions(command.actionIds);
    this.eventBus.publish(new ActionDeletedEvent(command.actionIds));
  }
}
