import { BaseEntity } from '../entity/base-entity';

export enum UserRoleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export class UserRoleEntity extends BaseEntity {
  userId: string;
  roleId: string;
  status: UserRoleStatus;
  metadata: object;
}
