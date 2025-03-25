export enum RoleType {
  DEFAULT = 'DEFAULT',
}
export class RoleEntity {
  id: string;
  name: string;
  description: string;
  status: string;
  metadata: object;
  createdAt: Date;
  updatedAt: Date;
}
