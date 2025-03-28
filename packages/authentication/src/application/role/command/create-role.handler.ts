import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RoleRepository } from '../../../infrastructure/repository/role.repository';
import { CreateRoleCommand } from '../../../domain/role/command/create-role.command';
import { RoleEntityCreatedEvent } from '../../../domain/role/event/role-created.event';
import { RoleEntity } from '../../../domain/role/role-entity';
import { nanoid } from 'nanoid';

@CommandHandler(CreateRoleCommand)
export class CreateRoleCommandHandler
  implements ICommandHandler<CreateRoleCommand>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly repository: RoleRepository,
  ) {}

  async execute(command: CreateRoleCommand): Promise<RoleEntity> {
    const entity = new RoleEntity();
    entity.id = nanoid(32);
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
