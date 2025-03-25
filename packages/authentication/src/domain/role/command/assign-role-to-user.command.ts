import { ICommand } from '@nestjs/cqrs';
import { UserEntity } from 'src/domain/user/user-entity';
import { RoleEntity } from '../role-entity';

export class AssignRoleToUserCommand implements ICommand {
  constructor(
    public readonly roleDomain: RoleEntity[],
    public readonly userDomain: UserEntity[],
  ) {}
}
