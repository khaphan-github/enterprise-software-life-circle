import { RoleEntity } from './role-entity';

export class RoleTransformer {
  static fromDbToEntity(db: any) {
    const entity = new RoleEntity();
    entity.id = db.id;
    entity.name = db.name;
    entity.description = db.description;
    entity.status = db.status;
    entity.metadata = db.metadata;
    entity.createdAt = db.created_at;
    entity.updatedAt = db.updated_at;
    return entity;
  }
}
