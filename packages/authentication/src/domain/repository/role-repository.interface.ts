import { RoleEntity } from '../role/role-entity';
import { UserRoleEntity } from '../role/user-role.entity';

export interface IRoleRepository {
  createRole(role: RoleEntity): Promise<RoleEntity | null>;
  getRolesByUserId(userId: string): Promise<RoleEntity[] | null>;
  updateRole(role: RoleEntity): Promise<void>;
  deleteRole(roleId: string): Promise<void>;
  findRoleById(id: string): Promise<RoleEntity | null>;
  isExistRoleById(id: string): Promise<boolean>;
  getRoleByType(type: string): Promise<RoleEntity[] | null>;
  assignRoleToUser(userRoleEntities: UserRoleEntity[]): Promise<void>;
  getRolesByRoute(route: string, method: string): Promise<RoleEntity[] | null>;
  getUserRoles(userId: string): Promise<RoleEntity[] | null>;
  removeRolesFromUser(userId: string, roleIds: string[]): Promise<void>;
  getRoleById(roleId: string): Promise<RoleEntity | null>;
  getRolesWithCursor(limit: number, cursor: string): Promise<RoleEntity[]>;
  assignActionsToRoles(actionIds: string[], roleIds: string[]): Promise<void>;
  removeActionsFromRoles(actionIds: string[], roleIds: string[]): Promise<void>;
}
