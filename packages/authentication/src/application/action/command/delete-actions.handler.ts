import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteActionsCommand } from '../../../domain/action/commands/delete-actions.command';
import { ActionDeletedEvent } from '../../../domain/action/events/action-deleted.event';
import { ActionRepository } from '../../../infrastructure/repository/postgres/action.repository';

@CommandHandler(DeleteActionsCommand)
export class DeleteActionsHandler
  implements ICommandHandler<DeleteActionsCommand>
{
  constructor(
    private readonly repository: ActionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteActionsCommand): Promise<void> {
    await this.repository.deleteActions(command.actionIds);
    this.eventBus.publish(new ActionDeletedEvent(command.actionIds));
  }
}
