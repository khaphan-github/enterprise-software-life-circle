import { CreateUseruccessDTO } from './dto/create-user.dto';
import { UserLoginSuccessDTO } from './dto/login.dto';
import { UserEntity } from './user-entity';

export class UserTransformer {
  static fromDbToEntity(db: any): UserEntity | null {
    if (!db) {
      return null;
    }
    const entity = new UserEntity();
    entity.id = db.id;
    entity.username = db.username;
    entity.email = db.email;
    entity.passwordHash = db.password_hash;
    entity.status = db.status;
    entity.metadata = db.metadata;
    entity.createdAt = db.created_at;
    entity.updatedAt = db.updated_at;
    return entity;
  }

  static toLoginDTO(userEntity: UserEntity): UserLoginSuccessDTO {
    const result = new UserLoginSuccessDTO();
    result.id = userEntity.id;
    result.email = userEntity.email;
    result.status = userEntity.status;
    result.metadata = userEntity.metadata;
    result.createdAt = userEntity.createdAt;
    result.updatedAt = userEntity.updatedAt;
    return result;
  }

  static toCreateSucessDTO(userEntity: UserEntity): CreateUseruccessDTO {
    const result = new CreateUseruccessDTO();
    result.id = userEntity.id;
    result.username = userEntity.username;
    result.email = userEntity.email;
    result.status = userEntity.status;
    result.metadata = userEntity.metadata;
    result.createdAt = userEntity.createdAt;
    result.updatedAt = userEntity.updatedAt;
    return result;
  }
}
