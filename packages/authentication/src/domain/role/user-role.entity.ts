export enum UserRoleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export class UserRoleEntity {
  userId: string;
  roleId: string;
  status: UserRoleStatus;
  metadata: object;
  createdAt: Date;
  updatedAt: Date;
}
