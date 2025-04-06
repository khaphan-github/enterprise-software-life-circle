import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignActionToRoleCommand } from '../../../domain/role/command/assign-action-to-role.command';
import { ActionsAssignedToRolesEvent } from '../../../domain/role/event/actions-assigned-to-roles.event';
import { ACTION_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { Inject } from '@nestjs/common';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';

import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
@CommandHandler(AssignActionToRoleCommand)
export class AssignActionToRoleHandler
  implements ICommandHandler<AssignActionToRoleCommand>
{
  @Inject(ACTION_REPOSITORY_PROVIDER)
  private readonly repository: IActionRepository;
  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;

  async execute(command: AssignActionToRoleCommand): Promise<void> {
    await this.repository.assignActionsToRoles(
      command.actionIds,
      command.roleIds,
    );
    this.eventHub.publish(
      new ActionsAssignedToRolesEvent(command.actionIds, command.roleIds),
    );
  }
}
