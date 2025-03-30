/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateActionsCommand } from '../../../domain/action/commands/create-actions.command';
import { ActionCreatedEvent } from '../../../domain/action/events/action-created.event';
import { ActionRepository } from '../../../infrastructure/repository/action.repository';
import { ActionEntity } from '../../../domain/action/action-entity';

@CommandHandler(CreateActionsCommand)
export class CreateActionsHandler
  implements ICommandHandler<CreateActionsCommand>
{
  constructor(
    private readonly repository: ActionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateActionsCommand) {
    const actions = command.actions.map((action) => {
      const newAction = new ActionEntity();
      newAction.initId();
      newAction.name = action.name;
      newAction.description = action.description;
      newAction.status = action.status;
      newAction.metadata = action.metadata;
      newAction.setCreateTime();
      return newAction;
    });
    await this.repository.createActions(actions);
    this.eventBus.publish(new ActionCreatedEvent(actions));
    return actions;
  }
}
