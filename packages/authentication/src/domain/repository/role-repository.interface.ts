import { RoleEntity, RoleType } from '../role/role-entity';
import { UserRoleEntity } from '../role/user-role.entity';

export interface IRoleRepository {
  createRole(role: RoleEntity): Promise<RoleEntity | null>;
  updateRole(role: RoleEntity): Promise<RoleEntity | null>;
  deleteRole(roleId: string): Promise<void>;
  getRolesByUserId(userId: string): Promise<RoleEntity[]>;
  assignRoleToUser(userRoles: UserRoleEntity[]): Promise<UserRoleEntity[]>;
  getRoleById(roleId: string): Promise<RoleEntity | null>;
  getRoleByType(type: RoleType): Promise<RoleEntity[]>;
  getRolesByRoute(path: string, method: string): Promise<RoleEntity[]>;
  getUserRoles(userId: string): Promise<RoleEntity[]>;
}
