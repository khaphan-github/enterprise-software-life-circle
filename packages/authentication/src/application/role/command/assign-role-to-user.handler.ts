import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { AssignRoleToUserCommand } from '../../../domain/role/command/assign-role-to-user.command';
import {
  UserRoleEntity,
  UserRoleStatus,
} from '../../../domain/role/user-role.entity';
import { UserRoleEntityCreatedEvent } from '../../../domain/role/event/user-entity-created.event';
import { ID_GENERATOR } from '../../../infrastructure/providers/id-genrerator.provider';
import { IdGenerator } from '../../../domain/entity/id';

import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
@CommandHandler(AssignRoleToUserCommand)
export class AssignRoleToUserHandler
  implements ICommandHandler<AssignRoleToUserCommand>
{
  @Inject(ROLE_REPOSITORY_PROVIDER)
  private readonly repository: IRoleRepository;

  @Inject(ID_GENERATOR)
  private readonly generator: IdGenerator;

  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;

  async execute(
    command: AssignRoleToUserCommand,
  ): Promise<Array<UserRoleEntity>> {
    if (command.roleIds.length === 0 || command.userIds.length === 0) {
      return [];
    }

    const userRoleEntities: UserRoleEntity[] = command.roleIds.flatMap(
      (roleId) =>
        command.userIds.map((userId) => {
          const entity = new UserRoleEntity();
          entity.initId(this.generator);
          entity.roleId = roleId;
          entity.userId = userId;
          entity.status = UserRoleStatus.ACTIVE;
          entity.setCreateTime();
          return entity;
        }),
    );

    await this.repository.assignRoleToUser(userRoleEntities);
    this.eventHub.publish(new UserRoleEntityCreatedEvent(userRoleEntities));
    return userRoleEntities;
  }
}
