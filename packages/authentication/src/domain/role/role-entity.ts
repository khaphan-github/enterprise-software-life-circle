import { BaseEntity } from '../entity/base-entity';

export enum RoleType {
  DEFAULT = 'DEFAULT',
}
export class RoleEntity extends BaseEntity {
  name: string;
  description: string;
  status: string;
  metadata: object;
  constructor() {
    super();
  }
}
