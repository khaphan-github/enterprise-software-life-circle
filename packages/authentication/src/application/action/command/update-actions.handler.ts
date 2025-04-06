/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ActionRepositoryProvider } from '../../../infrastructure/providers/repository/repository-providers';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';
import { UpdateActionsCommand } from '../../../domain/action/commands/update-actions.command';
import { ActionEntity } from '../../../domain/action/action-entity';
import { ActionUpdatedEvent } from 'src/domain/action/events/action-updated.event';

@CommandHandler(UpdateActionsCommand)
export class UpdateActionsHandler
  implements ICommandHandler<UpdateActionsCommand>
{
  @Inject(ActionRepositoryProvider)
  private readonly repository: IActionRepository;

  constructor(private readonly eventBus: EventBus) {}

  async execute(command: UpdateActionsCommand): Promise<ActionEntity[]> {
    const actions = command.actions.map((action) => {
      const entity = new ActionEntity();
      entity.setId(action.id);
      entity.name = action.name;
      entity.description = action.description;
      entity.metadata = action.metadata;
      entity.setUpdateTime();
      return entity;
    });

    await this.repository.updateActions(actions);
    this.eventBus.publish(new ActionUpdatedEvent(actions));
    return actions;
  }
}
