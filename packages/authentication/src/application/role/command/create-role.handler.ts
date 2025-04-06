import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateRoleCommand } from '../../../domain/role/command/create-role.command';
import { RoleEntityCreatedEvent } from '../../../domain/role/event/role-created.event';
import { RoleEntity } from '../../../domain/role/role-entity';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';

@CommandHandler(CreateRoleCommand)
export class CreateRoleCommandHandler
  implements ICommandHandler<CreateRoleCommand>
{
  @Inject(ROLE_REPOSITORY_PROVIDER)
  private readonly repository: IRoleRepository;
  constructor(private readonly eventBus: EventBus) {}

  async execute(command: CreateRoleCommand): Promise<RoleEntity> {
    const entity = new RoleEntity();
    entity.initId();
    entity.metadata = command.metadata;
    entity.name = command.name;
    entity.description = command.description;
    entity.status = command.status;
    entity.setCreateTime();

    await this.repository.createRole(entity);

    this.eventBus.publish(new RoleEntityCreatedEvent(entity));
    return Promise.resolve(entity);
  }
}
