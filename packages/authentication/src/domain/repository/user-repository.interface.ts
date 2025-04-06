import { UserEntity } from '../user/user-entity';

export interface IUserRepository {
  createUser(user: UserEntity): Promise<UserEntity | null>;
  updateUser(user: UserEntity): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  findUserByUsername(username: string): Promise<UserEntity | null>;
  findUserByResetPasswordAddress(address: string): Promise<UserEntity | null>;
  findUserById(id: string): Promise<UserEntity | null>;
  isExistUserById(id: string): Promise<boolean>;
  getUserByUsername(username: string): Promise<UserEntity | null>;
  findUserByResetToken(token: string): Promise<UserEntity | null>;
}
