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
    entity.passwordHash = db.passwordHash;
    entity.status = db.status;
    entity.metadata = db.metadata;
    entity.createdAt = db.createdAt;
    entity.updatedAt = db.updatedAt;
    entity.mfa = db.mfa;
    entity.type = db.type;
    entity.resetPassword = db.resetPassword;
    return entity;
  }

  static fromDocumentToEntity(db: any): UserEntity | null {
    const entity = new UserEntity();
    entity.id = db._id;
    entity.username = db.username;
    entity.passwordHash = db.passwordHash;
    entity.status = db.status;
    entity.metadata = db.metadata;
    entity.createdAt = db.createdAt;
    entity.updatedAt = db.updatedAt;
    entity.mfa = db.mfa;
    entity.type = db.type;
    entity.resetPassword = db.resetPassword;
    return entity;
  }

  static toLoginDTO(userEntity: UserEntity): UserLoginSuccessDTO {
    const result = new UserLoginSuccessDTO();
    result.id = userEntity.id;
    result.status = userEntity.status;
    result.metadata = userEntity.metadata;
    result.createdAt = userEntity.createdAt;
    result.updatedAt = userEntity.updatedAt;
    return result;
  }

  hiddenPassword(userEntity: UserEntity): UserEntity {
    userEntity.passwordHash = '';
    return userEntity;
  }

  static toCreateSucessDTO(userEntity: UserEntity): CreateUseruccessDTO {
    const result = new CreateUseruccessDTO();
    result.id = userEntity.id;
    result.username = userEntity.username;
    result.status = userEntity.status;
    result.metadata = userEntity.metadata;
    result.createdAt = userEntity.createdAt;
    result.updatedAt = userEntity.updatedAt;
    return result;
  }
}
