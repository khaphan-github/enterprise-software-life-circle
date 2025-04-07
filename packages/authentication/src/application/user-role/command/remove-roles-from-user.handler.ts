import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveRolesFromUserCommand } from '../../../domain/user-role/command/remove-roles-from-user.command';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { RolesRemovedFromUserEvent } from '../../../domain/user-role/events/roles-removed-from-user.event';

@CommandHandler(RemoveRolesFromUserCommand)
export class RemoveRolesFromUserHandler
  implements ICommandHandler<RemoveRolesFromUserCommand>
{
  constructor(
    @Inject(ROLE_REPOSITORY_PROVIDER)
    private readonly roleRepository: IRoleRepository,
    @Inject(EVENT_HUB_PROVIDER)
    private readonly eventHub: EventHub,
  ) {}

  async execute(command: RemoveRolesFromUserCommand) {
    await this.roleRepository.removeRolesFromUser(
      command.userId,
      command.roleIds,
    );

    this.eventHub.publish(
      new RolesRemovedFromUserEvent(command.userId, command.roleIds),
    );
  }
}
