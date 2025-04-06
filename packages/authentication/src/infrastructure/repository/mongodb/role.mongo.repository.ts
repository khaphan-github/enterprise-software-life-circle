import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleEntity } from '../../../domain/role/role-entity';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Role, RoleDocument } from './schema/role.schema';
import { UserRoleEntity } from 'src/domain/role/user-role.entity';

@Injectable()
export class RoleMongoRepository implements IRoleRepository {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}
  getUserRoles(userId: string): Promise<RoleEntity[] | null> {
    throw new Error('Method not implemented.');
  }
  getRolesByRoute(route: string, method: string): Promise<RoleEntity[] | null> {
    throw new Error('Method not implemented.');
  }
  getRolesByUserId(userId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getRoleByType(type: string): Promise<RoleEntity[] | null> {
    throw new Error('Method not implemented.');
  }
  assignRoleToUser(userRoleEntites: UserRoleEntity[]): Promise<void> {
    throw new Error('Method not implemented.');
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
    return role ? (role.toObject() as unknown as RoleEntity) : null;
  }

  async isExistRoleById(id: string): Promise<boolean> {
    const count = await this.roleModel.countDocuments({ _id: id }).exec();
    return count > 0;
  }
}
