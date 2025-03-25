import { UserEntity } from '../user-entity';

export class UserLogedinEvent {
  constructor(public readonly entity: UserEntity) {}
}
