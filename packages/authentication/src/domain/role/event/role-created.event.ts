import { RoleEntity } from '../role-entity';

export class RoleEntityCreatedEvent {
  constructor(public readonly entity: RoleEntity) {}
}
