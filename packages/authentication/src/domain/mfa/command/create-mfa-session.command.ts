import { ICommand } from '@nestjs/cqrs';
import { UserEntity } from '../../user/user-entity';

export class CreateMfaSessionCommand implements ICommand {
  constructor(public readonly entity: UserEntity) {}
}
