import { ICommand } from '@nestjs/cqrs';
import { UserEntity } from 'src/domain/user/user-entity';

export class AssignDefaultRoleToUserCommand implements ICommand {
  constructor(public readonly userDomain: UserEntity[]) {}
}
