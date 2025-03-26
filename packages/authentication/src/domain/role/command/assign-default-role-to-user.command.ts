import { ICommand } from '@nestjs/cqrs';
import { UserEntity } from '../../../domain/user/user-entity';

export class AssignDefaultRoleToUserCommand implements ICommand {
  constructor(public readonly userDomain: UserEntity[]) {}
}
