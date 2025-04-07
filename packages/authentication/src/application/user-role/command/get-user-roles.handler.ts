import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetUserRolesCommand } from '../../../domain/user-role/command/get-user-roles.command';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';

@CommandHandler(GetUserRolesCommand)
export class GetUserRolesHandler
  implements ICommandHandler<GetUserRolesCommand>
{
  constructor(
    @Inject(ROLE_REPOSITORY_PROVIDER)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: GetUserRolesCommand) {
    return this.roleRepository.getRolesByUserId(command.userId);
  }
}
