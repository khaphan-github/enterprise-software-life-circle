import { BaseEntity } from '../entity/base-entity';
import { UserStatus } from './user-status';

export enum UserType {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  GITHUB = 'GITHUB',
  PASSWORD = 'PASSWORD',
}

export enum MfaMethod {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  NONE = 'NONE',
}

export class Mfa {
  enable: boolean;
  verified: boolean;
  method: MfaMethod;
  // It can be a phone number or email address
  receiveMfaCodeAddress: string;
}

export enum ResetPasswordMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  NONE = 'NONE',
}
export class ResetPassword {
  token?: string;
  tokenExpiresAt?: Date;
  method: ResetPasswordMethod;
  // It can be a phone number or email address
  address: string;
}

export class UserEntity extends BaseEntity {
  public username: string;
  public passwordHash: string;
  public status: UserStatus;
  public type: UserType;
  public mfa?: Mfa;
  public metadata?: object;
  public resetPassword?: ResetPassword;

  constructor() {
    super();
  }
}
