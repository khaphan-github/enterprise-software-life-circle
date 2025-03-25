import { UserRoleEntity } from '../user-role.entity';

export class UserRoleEntityCreatedEvent {
  constructor(public readonly entity: UserRoleEntity[]) {}
}
