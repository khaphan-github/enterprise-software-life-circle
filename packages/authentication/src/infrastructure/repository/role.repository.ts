import * as format from 'pg-format';
import { CONNECTION_STRING_DEFAULT } from 'src/configurations/databases/postgresql/configuration';
import { RoleEntity, RoleType } from 'src/domain/role/role-entity';
import { RoleTransformer } from 'src/domain/role/transformer';
import { UserRoleEntity } from 'src/domain/role/user-role.entity';
import { PgSQLConnectionPool } from 'src/libs/postgresql/connection-pool';
import { PgSQLConnection } from 'src/libs/postgresql/connection.decorator';

export class RoleRepository {
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
    const res = await this.pg.execute(query, values);
    return res.rows.length ? RoleTransformer.fromDbToEntity(res.rows[0]) : null;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
}
