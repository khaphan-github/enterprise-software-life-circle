import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RoleRepository } from 'src/infrastructure/repository/role.repository';
import {
  UserRoleEntity,
  UserRoleStatus,
} from 'src/domain/role/user-role.entity';
import { UserRoleEntityCreatedEvent } from 'src/domain/role/event/user-entity-created.event';
import { AssignDefaultRoleToUserCommand } from 'src/domain/role/command/assign-default-role-to-user.command';
import { RoleType } from 'src/domain/role/role-entity';

@CommandHandler(AssignDefaultRoleToUserCommand)
export class AssignDefaultRoleToUserHandler
  implements ICommandHandler<AssignDefaultRoleToUserCommand>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly repository: RoleRepository,
  ) {}

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
          entity.roleId = role.id;
          entity.userId = user.id;
          entity.createdAt = new Date();
          entity.updatedAt = new Date();
          entity.status = UserRoleStatus.ACTIVE;
          return entity;
        }),
      );
    await this.repository.assignRoleToUser(userRoleEntities);
    this.eventBus.publish(new UserRoleEntityCreatedEvent(userRoleEntities));
    return userRoleEntities;
  }
}
