/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateActionsCommand } from '../../../domain/action/commands/update-actions.command';
import { ActionEntity } from '../../../domain/action/action-entity';
import { ActionUpdatedEvent } from '../../../domain/action/events/action-updated.event';
import { ActionRepository } from '../../../infrastructure/repository/action.repository';

@CommandHandler(UpdateActionsCommand)
export class UpdateActionsHandler
  implements ICommandHandler<UpdateActionsCommand>
{
  constructor(
    private readonly repository: ActionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateActionsCommand): Promise<ActionEntity[]> {
    const updatedActions = await this.repository.updateActions(command.actions);
    this.eventBus.publish(new ActionUpdatedEvent(updatedActions));
    return updatedActions;
  }
}
