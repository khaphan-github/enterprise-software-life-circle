import { EndpointEntity } from './endpoint-entity';

export class EndpointTransformer {
  static fromDbToEntity(row: any): EndpointEntity {
    const entity = new EndpointEntity();
    entity.id = row.id;
    entity.path = row.path;
    entity.method = row.method;
    entity.metadata = row.metadata;
    entity.createdAt = row.created_at;
    entity.updatedAt = row.updated_at;
    return entity;
  }

  static fromEntityToDb(entity: EndpointEntity): any {
    return {
      id: entity.id,
      path: entity.path,
      method: entity.method,
      metadata: entity.metadata,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }
}
