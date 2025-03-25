import { IEvent } from '@nestjs/cqrs';
import { UserEntity } from '../user-entity';

export class UserLoginFailEvent implements IEvent {
  constructor(public readonly entity: UserEntity) {}
}
