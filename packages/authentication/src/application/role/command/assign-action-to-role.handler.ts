import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AssignActionToRoleCommand } from '../../../domain/role/command/assign-action-to-role.command';
import { ActionRepository } from '../../../infrastructure/repository/action.repository';
import { ActionsAssignedToRolesEvent } from '../../../domain/role/event/actions-assigned-to-roles.event';

@CommandHandler(AssignActionToRoleCommand)
export class AssignActionToRoleHandler
  implements ICommandHandler<AssignActionToRoleCommand>
{
  constructor(
    private readonly repository: ActionRepository,
    private readonly eventBus: EventBus,
  ) {}

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
