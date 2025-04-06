import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateRoleCommand } from '../../../domain/role/command/create-role.command';
import { RoleEntityCreatedEvent } from '../../../domain/role/event/role-created.event';
import { RoleEntity } from '../../../domain/role/role-entity';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { ID_GENERATOR } from '../../../infrastructure/providers/id-genrerator.provider';
import { IdGenerator } from '../../../domain/entity/id';

import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
@CommandHandler(CreateRoleCommand)
export class CreateRoleCommandHandler
  implements ICommandHandler<CreateRoleCommand>
{
  @Inject(ROLE_REPOSITORY_PROVIDER)
  private readonly repository: IRoleRepository;

  @Inject(ID_GENERATOR)
  private readonly generator: IdGenerator;

  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;

  async execute(command: CreateRoleCommand): Promise<RoleEntity> {
    const entity = new RoleEntity();
    entity.initId(this.generator);
    entity.metadata = command.metadata;
    entity.name = command.name;
    entity.description = command.description;
    entity.status = command.status;
    entity.setCreateTime();

    await this.repository.createRole(entity);

    this.eventHub.publish(new RoleEntityCreatedEvent(entity));
    return Promise.resolve(entity);
  }
}
