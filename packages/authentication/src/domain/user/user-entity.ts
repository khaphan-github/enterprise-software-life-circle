import { UserStatus } from './user-status';

export class UserEntity {
  public id: string;
  public username: string;
  public email: string;
  public passwordHash: string;
  public status: UserStatus;
  public metadata?: object;
  public createdAt: Date;
  public updatedAt: Date;
  constructor() {}
}
