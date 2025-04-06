import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MfaMethod,
  ResetPasswordMethod,
  UserType,
} from '../../../../domain/user/user-entity';
import { UserStatus } from '../../../../domain/user/user-status';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class Mfa {
  @Prop({ required: true })
  enable: boolean;

  @Prop({ required: true })
  verified: boolean;

  @Prop({ required: true, enum: Object.values(MfaMethod) })
  method: MfaMethod;

  @Prop({ required: true })
  receiveMfaCodeAddress: string;
}

export const MfaSchema = SchemaFactory.createForClass(Mfa);

@Schema()
export class ResetPassword {
  @Prop()
  token?: string;

  @Prop()
  tokenExpiresAt?: Date;

  @Prop({ required: true, enum: Object.values(ResetPasswordMethod) })
  method: ResetPasswordMethod;

  @Prop({ required: true })
  address: string;
}

export const ResetPasswordSchema = SchemaFactory.createForClass(ResetPassword);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: Object.values(UserStatus) })
  status: UserStatus;

  @Prop({ required: true, enum: Object.values(UserType) })
  type: UserType;

  @Prop({ type: MfaSchema, required: false })
  mfa?: Mfa;

  @Prop({ type: Object, required: false })
  metadata?: object;

  @Prop({ type: ResetPasswordSchema, required: false })
  resetPassword?: ResetPassword;
}

export const UserSchema = SchemaFactory.createForClass(User);
