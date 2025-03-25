import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AssignRoleToUserCommand } from 'src/domain/role/command/assign-role-to-user.command';
import { RoleRepository } from 'src/infrastructure/repository/role.repository';
import {
  UserRoleEntity,
  UserRoleStatus,
} from 'src/domain/role/user-role.entity';
import { UserRoleEntityCreatedEvent } from 'src/domain/role/event/user-entity-created.event';

@CommandHandler(AssignRoleToUserCommand)
export class AssignRoleToUserHandler
  implements ICommandHandler<AssignRoleToUserCommand>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly repository: RoleRepository,
  ) {}

  async execute(
    command: AssignRoleToUserCommand,
  ): Promise<Array<UserRoleEntity>> {
    const userRoleEntities: UserRoleEntity[] = command.roleDomain.flatMap(
      (role) =>
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
