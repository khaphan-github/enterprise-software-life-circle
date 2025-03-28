/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { ActionEntity } from './action-entity';

export class ActionTransformer {
  static fromDbToEntity(db: any): ActionEntity | any {
    if (!db) return null;
    const entity = new ActionEntity();
    entity.id = db.id;
    entity.name = db.name;
    entity.description = db.description;
    entity.status = db.status;
    entity.metadata = db.metadata;
    entity.createdAt = db.created_at;
    entity.updatedAt = db.updated_at;
    return entity;
  }

  static toDb(entity: ActionEntity): Record<string, any> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      metadata: entity.metadata,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }
}
