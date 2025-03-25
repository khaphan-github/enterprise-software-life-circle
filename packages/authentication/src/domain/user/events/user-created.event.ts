import { UserEntity } from '../user-entity';

export class UserCreatedEvent {
  constructor(public readonly entity: UserEntity) {}
}
