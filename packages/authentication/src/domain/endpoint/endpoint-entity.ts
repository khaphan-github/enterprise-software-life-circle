import { BaseEntity } from '../entity/base-entity';

export class EndpointEntity extends BaseEntity {
  path: string; // Unique and not null
  method: string; // Not null
  metadata?: Record<string, any>; // JSONB field

  constructor() {
    super();
  }
}
