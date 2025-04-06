import {
  PgSQLConnection,
  PgSQLConnectionPool,
} from 'nest-postgresql-multi-connect';
import * as format from 'pg-format';
import { CONNECTION_STRING_DEFAULT } from '../../providers/repository/connection-string-default';
import { RoleEntity, RoleType } from '../../../domain/role/role-entity';
import { RoleTransformer } from '../../../domain/role/transformer';
import { UserRoleEntity } from '../../../domain/role/user-role.entity';
import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @PgSQLConnection(CONNECTION_STRING_DEFAULT)
    private readonly pg: PgSQLConnectionPool,
  ) {}

  async getRolesByUserId(userId: string) {
    const query = `
      SELECT * FROM auth_roles
      WHERE id IN (
        SELECT role_id FROM auth_user_roles
        WHERE user_id = $1
      )
    `;
    const values = [userId];
    const res = await this.pg.execute(query, values);
    return res.rows.map((row) => RoleTransformer.fromDbToEntity(row));
  }

  async createRole(role: RoleEntity) {
    const query = `
      INSERT INTO auth_roles (id, name, description, status, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      role.id,
      role.name,
      role.description,
      role.status,
      role.metadata,
      role.createdAt,
      role.updatedAt,
    ];
    const res = await this.pg.execute(query, values);
    return RoleTransformer.fromDbToEntity(res.rows[0]);
  }

  async getRoleById(roleId: string) {
    const query = `
      SELECT * FROM auth_roles
      WHERE id = $1
    `;
    const values = [roleId];
    const res = await this.pg.execute(query, values);
    return res.rows.length ? RoleTransformer.fromDbToEntity(res.rows[0]) : null;
  }

  async updateRole(role: RoleEntity) {
    const query = `
      UPDATE auth_roles
      SET name = COALESCE($2, name),
          description = COALESCE($3, description),
          status = COALESCE($4, status),
          metadata = COALESCE($5, metadata),
          updated_at = $6
      WHERE id = $1
      RETURNING *
    `;
    const values = [
      role.id,
      role.name,
      role.description,
      role.status,
      role.metadata,
      role.updatedAt,
    ];
    const res = await this.pg.execute(query, values);
    return res.rows.length ? RoleTransformer.fromDbToEntity(res.rows[0]) : null;
  }

  async deleteRole(roleId: string) {
    const query = `
      DELETE FROM auth_roles
      WHERE id = $1
      RETURNING *
    `;
    const values = [roleId];
    await this.pg.execute(query, values);
  }

  async assignRoleToUser(userRoles: UserRoleEntity[]) {
    const values = userRoles.map((userRole) => [
      userRole.userId,
      userRole.roleId,
      userRole.status,
      userRole.metadata,
      userRole.createdAt,
      userRole.updatedAt,
    ]);

    const query = format(
      `
      INSERT INTO auth_user_roles (user_id, role_id, status, metadata, created_at, updated_at)
      VALUES %L
      ON CONFLICT (user_id, role_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `,
      values,
    );

    const res = await this.pg.execute(query);
    return res.rows;
  }

  async getRoleByType(type: RoleType) {
    const query = `
      SELECT * FROM auth_roles
      WHERE metadata->>'type' = $1
    `;
    const values = [type];
    const res = await this.pg.execute(query, values);
    return res.rows.map((row) => RoleTransformer.fromDbToEntity(row));
  }

  async getRolesByRoute(path: string, method: string) {
    const roleIdQuery = `
      SELECT id FROM auth_endpoints
      WHERE path = $1 AND method = $2
    `;
    const roleIdsResult = await this.pg.execute(roleIdQuery, [path, method]);

    if (roleIdsResult.rows.length === 0) {
      return []; // Return an empty array if no roles are found
    }

    const endpointIds = roleIdsResult.rows.map((row) => row.id);

    const rolesQuery = `
      SELECT * FROM auth_roles
      WHERE id = ANY(
        SELECT role_id FROM auth_role_endpoint_permissions
        WHERE endpoint_id = ANY($1)
      )
    `;
    const rolesResult = await this.pg.execute(rolesQuery, [endpointIds]);

    return rolesResult.rows.map((row) => RoleTransformer.fromDbToEntity(row));
  }

  async getUserRoles(userId: string) {
    const query = `
      SELECT * FROM auth_roles
      WHERE id IN (
        SELECT role_id FROM auth_user_roles
        WHERE user_id = $1
      )
    `;
    const values = [userId];
    const res = await this.pg.execute(query, values);
    return res.rows.map((row) => RoleTransformer.fromDbToEntity(row));
  }
}
