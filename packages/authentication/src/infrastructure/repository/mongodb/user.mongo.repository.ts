import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity } from '../../../domain/user/user-entity';
import { User, UserDocument } from './schema/user.schema';
import { UserTransformer } from 'src/domain/user/transformer';

@Injectable()
export class UserMongoRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(user: UserEntity): Promise<UserEntity | null> {
    const createdUser = new this.userModel({
      ...user,
      _id: user.id, // Use the provided user.id as the document ID
    });
    await createdUser.save();
    return user;
  }

  async updateUser(user: UserEntity): Promise<void> {
    await this.userModel.updateOne({ _id: user.id }, user).exec();
  }

  async deleteUser(userId: string): Promise<void> {
    await this.userModel.deleteOne({ _id: userId }).exec();
  }

  async findUserByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ username }).exec();
    return user ? UserTransformer.fromDocumentToEntity(user.toObject()) : null;
  }

  async findUserByResetPasswordAddress(
    address: string,
  ): Promise<UserEntity | null> {
    const user = await this.userModel
      .findOne({ 'resetPassword.address': address })
      .exec();
    return user ? (user.toObject() as unknown as UserEntity) : null;
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? UserTransformer.fromDocumentToEntity(user.toObject()) : null;
  }

  async isExistUserById(id: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ _id: id }).exec();
    return count > 0;
  }

  async getUserByUsername(username: string): Promise<UserEntity | null> {
    return this.findUserByUsername(username);
  }

  async findUserByResetToken(token: string): Promise<UserEntity | null> {
    const user = await this.userModel
      .findOne({ 'resetPassword.token': token })
      .exec();
    return user ? UserTransformer.fromDocumentToEntity(user.toObject()) : null;
  }
}
