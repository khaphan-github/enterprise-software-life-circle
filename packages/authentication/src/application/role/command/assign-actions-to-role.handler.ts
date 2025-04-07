import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignActionsToRoleCommand } from '../../../domain/role/command/assign-actions-to-role.command';
import { ActionsAssignedToRolesEvent } from '../../../domain/role/event/actions-assigned-to-roles.event';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';

@CommandHandler(AssignActionsToRoleCommand)
export class AssignActionsToRoleHandler
  implements ICommandHandler<AssignActionsToRoleCommand>
{
  constructor(
    @Inject(ROLE_REPOSITORY_PROVIDER)
    private readonly repository: IRoleRepository,
    @Inject(EVENT_HUB_PROVIDER)
    private readonly eventHub: EventHub,
  ) {}

  async execute(command: AssignActionsToRoleCommand): Promise<void> {
    await this.repository.assignActionsToRoles(
      command.actionIds,
      command.roleIds,
    );
    this.eventHub.publish(
      new ActionsAssignedToRolesEvent(command.actionIds, command.roleIds),
    );
  }
}
