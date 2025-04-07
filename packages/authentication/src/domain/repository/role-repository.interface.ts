import { RoleEntity } from '../role/role-entity';
import { UserRoleEntity } from '../role/user-role.entity';

export interface IRoleRepository {
  createRole(role: RoleEntity): Promise<RoleEntity | null>;
  getRolesByUserId(userId: string): Promise<any>;
  updateRole(role: RoleEntity): any;
  deleteRole(roleId: string): Promise<void>;
  findRoleById(id: string): Promise<RoleEntity | null>;
  isExistRoleById(id: string): Promise<boolean>;
  getRoleByType(type: string): Promise<RoleEntity[] | null>;
  assignRoleToUser(userRoleEntites: UserRoleEntity[]): Promise<any>;
  getRolesByRoute(route: string, method: string): Promise<RoleEntity[] | null>;
  getUserRoles(userId: string): Promise<RoleEntity[] | null>;
}
