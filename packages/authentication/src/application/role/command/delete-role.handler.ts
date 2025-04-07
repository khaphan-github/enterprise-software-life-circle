import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteRoleCommand } from '../../../domain/role/command/delete-role.command';
import { RoleEntityDeletedEvent } from '../../../domain/role/event/role-deleted.event';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';

@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler implements ICommandHandler<DeleteRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY_PROVIDER)
    private readonly repository: IRoleRepository,
    @Inject(EVENT_HUB_PROVIDER)
    private readonly eventHub: EventHub,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    await this.repository.deleteRole(command.id);
    this.eventHub.publish(new RoleEntityDeletedEvent(command.id));
  }
}
