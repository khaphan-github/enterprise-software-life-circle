import { RoleEntity } from '../role-entity';

export class RoleEntityUpdatedEvent {
  constructor(public readonly role: RoleEntity) {}
}
