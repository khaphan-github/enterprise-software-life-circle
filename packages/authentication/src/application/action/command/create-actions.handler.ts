/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateActionsCommand } from '../../../domain/action/commands/create-actions.command';
import { ActionCreatedEvent } from '../../../domain/action/events/action-created.event';
import { ActionEntity } from '../../../domain/action/action-entity';
import { Inject } from '@nestjs/common';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';
import { ACTION_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { ID_GENERATOR } from '../../../infrastructure/providers/id-genrerator.provider';
import { IdGenerator } from '../../../domain/entity/id';

@CommandHandler(CreateActionsCommand)
export class CreateActionsHandler
  implements ICommandHandler<CreateActionsCommand>
{
  @Inject(ACTION_REPOSITORY_PROVIDER)
  private readonly repository: IActionRepository;

  @Inject(ID_GENERATOR)
  private readonly generator: IdGenerator;

  constructor(private readonly eventBus: EventBus) {}

  async execute(command: CreateActionsCommand) {
    const actions = command.actions.map((action) => {
      const newAction = new ActionEntity();
      newAction.initId(this.generator);
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
  z;
}
