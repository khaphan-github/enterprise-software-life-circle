import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRolesToUserCommand } from '../../../domain/user-role/command/assign-roles-to-user.command';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import {
  UserRoleEntity,
  UserRoleStatus,
} from '../../../domain/role/user-role.entity';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { RolesAssignedToUserEvent } from '../../../domain/user-role/events/roles-assigned-to-user.event';

@CommandHandler(AssignRolesToUserCommand)
export class AssignRolesToUserHandler
  implements ICommandHandler<AssignRolesToUserCommand>
{
  constructor(
    @Inject(ROLE_REPOSITORY_PROVIDER)
    private readonly roleRepository: IRoleRepository,
    @Inject(EVENT_HUB_PROVIDER)
    private readonly eventHub: EventHub,
  ) {}

  async execute(command: AssignRolesToUserCommand) {
    const userRoles = command.roleIds.map((roleId) => {
      const userRole = new UserRoleEntity();
      userRole.userId = command.userId;
      userRole.roleId = roleId;
      userRole.status = UserRoleStatus.ACTIVE;
      userRole.metadata = {};
      return userRole;
    });

    await this.roleRepository.assignRoleToUser(userRoles);

    this.eventHub.publish(
      new RolesAssignedToUserEvent(command.userId, command.roleIds),
    );
  }
}
