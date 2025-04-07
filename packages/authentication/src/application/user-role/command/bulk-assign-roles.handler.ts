import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BulkAssignRolesCommand } from '../../../domain/user-role/command/bulk-assign-roles.command';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import {
  UserRoleEntity,
  UserRoleStatus,
} from '../../../domain/role/user-role.entity';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { BulkRolesAssignedEvent } from '../../../domain/user-role/events/bulk-roles-assigned.event';

@CommandHandler(BulkAssignRolesCommand)
export class BulkAssignRolesHandler
  implements ICommandHandler<BulkAssignRolesCommand>
{
  constructor(
    @Inject(ROLE_REPOSITORY_PROVIDER)
    private readonly roleRepository: IRoleRepository,
    @Inject(EVENT_HUB_PROVIDER)
    private readonly eventHub: EventHub,
  ) {}

  async execute(command: BulkAssignRolesCommand) {
    const userRoles = command.assignments.flatMap((assignment) =>
      assignment.roleIds.map((roleId) => {
        const userRole = new UserRoleEntity();
        userRole.userId = assignment.userId;
        userRole.roleId = roleId;
        userRole.status = UserRoleStatus.ACTIVE;
        userRole.metadata = {};
        return userRole;
      }),
    );

    await this.roleRepository.assignRoleToUser(userRoles);

    this.eventHub.publish(new BulkRolesAssignedEvent(command.assignments));
  }
}
