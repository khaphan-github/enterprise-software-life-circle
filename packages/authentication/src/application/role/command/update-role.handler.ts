import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateRoleCommand } from '../../../domain/role/command/update-role.command';
import { RoleEntityUpdatedEvent } from '../../../domain/role/event/role-updated.event';
import { RoleEntity } from '../../../domain/role/role-entity';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY_PROVIDER)
    private readonly repository: IRoleRepository,
    @Inject(EVENT_HUB_PROVIDER)
    private readonly eventHub: EventHub,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<RoleEntity> {
    const entity = new RoleEntity();
    entity.setId(command.id);
    entity.metadata = command.metadata ?? {};
    entity.name = command.name;
    entity.description = command.description;
    entity.status = command.status;
    entity.setUpdateTime();

    await this.repository.updateRole(entity);

    this.eventHub.publish(new RoleEntityUpdatedEvent(entity));
    return entity;
  }
}
