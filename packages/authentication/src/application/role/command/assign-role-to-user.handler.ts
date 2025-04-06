import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { AssignRoleToUserCommand } from '../../../domain/role/command/assign-role-to-user.command';
import {
  UserRoleEntity,
  UserRoleStatus,
} from '../../../domain/role/user-role.entity';
import { UserRoleEntityCreatedEvent } from '../../../domain/role/event/user-entity-created.event';

@CommandHandler(AssignRoleToUserCommand)
export class AssignRoleToUserHandler
  implements ICommandHandler<AssignRoleToUserCommand>
{
  @Inject(ROLE_REPOSITORY_PROVIDER)
  private readonly repository: IRoleRepository;

  constructor(private readonly eventBus: EventBus) {}

  async execute(
    command: AssignRoleToUserCommand,
  ): Promise<Array<UserRoleEntity>> {
    const userRoleEntities: UserRoleEntity[] = command.roleIds.flatMap(
      (roleId) =>
        command.userIds.map((userId) => {
          const entity = new UserRoleEntity();
          entity.roleId = roleId;
          entity.userId = userId;
          entity.status = UserRoleStatus.ACTIVE;
          entity.setCreateTime();
          return entity;
        }),
    );

    await this.repository.assignRoleToUser(userRoleEntities);
    this.eventBus.publish(new UserRoleEntityCreatedEvent(userRoleEntities));
    return userRoleEntities;
  }
}
