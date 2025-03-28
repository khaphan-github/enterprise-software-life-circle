import { BaseEntity } from '../entity/base-entity';
import { UserStatus } from './user-status';

export class UserEntity extends BaseEntity {
  public username: string;
  public email: string;
  public passwordHash: string;
  public status: UserStatus;
  public metadata?: object;

  constructor() {
    super();
  }
}
