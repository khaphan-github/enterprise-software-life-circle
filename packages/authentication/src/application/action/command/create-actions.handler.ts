/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateActionsCommand } from '../../../domain/action/commands/create-actions.command';
import { ActionCreatedEvent } from '../../../domain/action/events/action-created.event';
import { ActionRepository } from '../../../infrastructure/repository/action.repository';

@CommandHandler(CreateActionsCommand)
export class CreateActionsHandler
  implements ICommandHandler<CreateActionsCommand>
{
  constructor(
    private readonly repository: ActionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateActionsCommand) {
    const createdActions = await this.repository.createActions(command.actions);
    this.eventBus.publish(new ActionCreatedEvent(createdActions));
    return createdActions;
  }
}
