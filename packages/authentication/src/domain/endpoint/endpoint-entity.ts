import { BaseEntity } from '../entity/base-entity';

export enum EndpointStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
}

export class EndpointEntity extends BaseEntity {
  path: string; // Unique and not null
  method: string; // Not null
  metadata?: Record<string, any>; // JSONB field
  status: EndpointStatus;
  constructor() {
    super();
  }
}
