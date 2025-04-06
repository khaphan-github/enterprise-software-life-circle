import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import {
  UserRoleEntity,
  UserRoleStatus,
} from '../../../domain/role/user-role.entity';
import { UserRoleEntityCreatedEvent } from '../../../domain/role/event/user-entity-created.event';
import { AssignDefaultRoleToUserCommand } from '../../../domain/role/command/assign-default-role-to-user.command';
import { RoleType } from '../../../domain/role/role-entity';

import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
@CommandHandler(AssignDefaultRoleToUserCommand)
export class AssignDefaultRoleToUserHandler
  implements ICommandHandler<AssignDefaultRoleToUserCommand>
{
  @Inject(ROLE_REPOSITORY_PROVIDER)
  private readonly repository: IRoleRepository;

  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;

  async execute(
    command: AssignDefaultRoleToUserCommand,
  ): Promise<Array<UserRoleEntity>> {
    const defaultRole = await this.repository.getRoleByType(RoleType.DEFAULT);
    if (!defaultRole || defaultRole.length === 0) {
      return [];
    }

    const userRoleEntities: UserRoleEntity[] = defaultRole
      .filter((e) => e != undefined)
      .flatMap((role) =>
        command.userDomain.map((user) => {
          const entity = new UserRoleEntity();
          entity.roleId = role.getId();
          entity.userId = user.getId();
          entity.createdAt = new Date();
          entity.updatedAt = new Date();
          entity.status = UserRoleStatus.ACTIVE;
          return entity;
        }),
      );
    await this.repository.assignRoleToUser(userRoleEntities);
    this.eventHub.publish(new UserRoleEntityCreatedEvent(userRoleEntities));
    return userRoleEntities;
  }
}
