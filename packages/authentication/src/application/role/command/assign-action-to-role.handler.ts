import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AssignActionToRoleCommand } from '../../../domain/role/command/assign-action-to-role.command';
import { ActionsAssignedToRolesEvent } from '../../../domain/role/event/actions-assigned-to-roles.event';
import { ActionRepositoryProvider } from '../../../infrastructure/providers/repository/repository-providers';
import { Inject } from '@nestjs/common';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';

@CommandHandler(AssignActionToRoleCommand)
export class AssignActionToRoleHandler
  implements ICommandHandler<AssignActionToRoleCommand>
{
  @Inject(ActionRepositoryProvider)
  private readonly repository: IActionRepository;
  constructor(private readonly eventBus: EventBus) {}

  async execute(command: AssignActionToRoleCommand): Promise<void> {
    await this.repository.assignActionsToRoles(
      command.actionIds,
      command.roleIds,
    );
    this.eventBus.publish(
      new ActionsAssignedToRolesEvent(command.actionIds, command.roleIds),
    );
  }
}
