import { BaseEntity } from '../entity/base-entity';
import { UserStatus } from './user-status';

export enum UserType {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  GITHUB = 'GITHUB',
  PASSWORD = 'PASSWORD',
}
export class UserEntity extends BaseEntity {
  public username: string;
  public passwordHash: string;
  public status: UserStatus;
  public type: UserType;
  public metadata?: object;

  constructor() {
    super();
  }
}
