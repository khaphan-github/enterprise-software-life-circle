/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ACTION_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';
import { UpdateActionsCommand } from '../../../domain/action/commands/update-actions.command';
import { ActionEntity } from '../../../domain/action/action-entity';
import { ActionUpdatedEvent } from '../../../domain/action/events/action-updated.event';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';

@CommandHandler(UpdateActionsCommand)
export class UpdateActionsHandler
  implements ICommandHandler<UpdateActionsCommand>
{
  @Inject(ACTION_REPOSITORY_PROVIDER)
  private readonly repository: IActionRepository;
  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;

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
    this.eventHub.publish(new ActionUpdatedEvent(actions));
    return actions;
  }
}
