import { BaseEntity } from '../entity/base-entity';
export enum ActionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
}
export class ActionEntity extends BaseEntity {
  name: string;
  description: string;
  metadata: Record<string, any>;
  status: ActionStatus;
  constructor() {
    super();
  }
}
