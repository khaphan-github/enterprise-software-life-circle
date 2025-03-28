import { BaseEntity } from '../entity/base-entity';

export class ActionEntity extends BaseEntity {
  name: string;
  description: string;
  status: string;
  metadata: Record<string, any>;
  constructor() {
    super();
  }
}
