import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schema/role.schema';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { RoleEntity } from '../../../domain/role/role-entity';
import { UserRoleEntity } from '../../../domain/role/user-role.entity';

@Injectable()
export class RoleMongoRepository implements IRoleRepository {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async getUserRoles(userId: string): Promise<RoleEntity[] | null> {
    const roles = await this.roleModel.find({ 'users.userId': userId }).exec();
    return roles.length > 0
      ? roles.map((role) => role.toObject() as any)
      : null;
  }

  async getRolesByRoute(
    route: string,
    method: string,
  ): Promise<RoleEntity[] | null> {
    const roles = await this.roleModel
      .find({ 'permissions.route': route, 'permissions.method': method })
      .exec();
    return roles.length > 0
      ? roles.map((role) => role.toObject() as any)
      : null;
  }

  async getRolesByUserId(userId: string): Promise<RoleEntity[] | null> {
    const roles = await this.roleModel.find({ 'users.userId': userId }).exec();
    return roles.length > 0
      ? roles.map((role) => role.toObject() as any)
      : null;
  }

  async getRoleByType(type: string): Promise<RoleEntity[] | null> {
    const roles = await this.roleModel.find({ type }).exec();
    return roles.length > 0
      ? roles.map((role) => role.toObject() as any)
      : null;
  }

  async assignRoleToUser(userRoleEntities: UserRoleEntity[]): Promise<void> {
    const bulkOps = userRoleEntities.map((userRole) => ({
      updateOne: {
        filter: { _id: userRole.roleId },
        update: { $addToSet: { users: { userId: userRole.userId } } },
      },
    }));
    await this.roleModel.bulkWrite(bulkOps);
  }

  async createRole(role: RoleEntity): Promise<RoleEntity | null> {
    const createdRole = new this.roleModel({
      ...role,
      _id: role.id, // Use the provided role.id as the document ID
    });
    await createdRole.save();
    return role;
  }

  async updateRole(role: RoleEntity): Promise<void> {
    await this.roleModel.updateOne({ _id: role.id }, role).exec();
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.roleModel.deleteOne({ _id: roleId }).exec();
  }
  async findRoleById(id: string): Promise<RoleEntity | null> {
    const role = await this.roleModel.findById(id).exec();
    return role ? (role.toObject() as unknown as any) : null;
  }

  async isExistRoleById(id: string): Promise<boolean> {
    const count = await this.roleModel.countDocuments({ _id: id }).exec();
    return count > 0;
  }
}
