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
    const actions = command.actions.map((action) => {
      const updatedAction = new ActionEntity();
      updatedAction.setId(action.id);
      updatedAction.name = action.name;
      updatedAction.description = action.description;
      updatedAction.status = action.status;
      updatedAction.metadata = action.metadata ?? {};
      updatedAction.setUpdateTime();
      return updatedAction;
    });
    await this.repository.updateActions(actions);
    this.eventBus.publish(new ActionUpdatedEvent(actions));
    return actions;
  }
}
