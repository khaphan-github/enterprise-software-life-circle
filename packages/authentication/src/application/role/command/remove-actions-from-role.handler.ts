import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveActionsFromRoleCommand } from '../../../domain/role/command/remove-actions-from-role.command';
import { ActionsRemovedFromRolesEvent } from '../../../domain/role/event/actions-removed-from-roles.event';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';

@CommandHandler(RemoveActionsFromRoleCommand)
export class RemoveActionsFromRoleHandler
  implements ICommandHandler<RemoveActionsFromRoleCommand>
{
  constructor(
    @Inject(ROLE_REPOSITORY_PROVIDER)
    private readonly repository: IRoleRepository,
    @Inject(EVENT_HUB_PROVIDER)
    private readonly eventHub: EventHub,
  ) {}

  async execute(command: RemoveActionsFromRoleCommand): Promise<void> {
    await this.repository.removeActionsFromRoles(
      command.actionIds,
      command.roleIds,
    );
    this.eventHub.publish(
      new ActionsRemovedFromRolesEvent(command.actionIds, command.roleIds),
    );
  }
}
