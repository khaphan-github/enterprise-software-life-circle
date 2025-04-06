import { Injectable } from '@nestjs/common';
import {
  PgSQLConnection,
  PgSQLConnectionPool,
} from 'nest-postgresql-multi-connect';
import { CONNECTION_STRING_DEFAULT } from '../../providers/repository/connection-string-default';
import { ActionEntity } from '../../../domain/action/action-entity';
import { ActionTransformer } from '../../../domain/action/transformer';
import * as format from 'pg-format';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';

@Injectable()
export class ActionRepository implements IActionRepository {
  constructor(
    @PgSQLConnection(CONNECTION_STRING_DEFAULT)
    private readonly pg: PgSQLConnectionPool,
  ) {}

  async createActions(actions: ActionEntity[]) {
    const query = `
      INSERT INTO auth_actions (id, name, description, status, metadata, created_at, updated_at)
      VALUES %L
      RETURNING *;
    `;
    const values = actions.map((action) => [
      action.id,
      action.name,
      action.description,
      action.status,
      action.metadata,
      action.createdAt,
      action.updatedAt,
    ]);
    const formattedQuery = format(query, values);
    const result = await this.pg.execute(formattedQuery);
    return result.rows.map((row) => ActionTransformer.fromDbToEntity(row));
  }

  async updateActions(actions: ActionEntity[]) {
    const query = `
      UPDATE auth_actions
      SET name = data.name,
          description = data.description,
          status = data.status,
          metadata = data.metadata,
          updated_at = data.updated_at::timestamp
      FROM (VALUES %L) AS data(id, name, description, status, metadata, updated_at)
      WHERE auth_actions.id = data.id
      RETURNING auth_actions.*;
    `;
    const values = actions.map((action) => [
      action.id,
      action.name,
      action.description,
      action.status,
      action.metadata,
      action.updatedAt,
    ]);
    const formattedQuery = format(query, values);
    const result = await this.pg.execute(formattedQuery);
    return result.rows.map((row) => ActionTransformer.fromDbToEntity(row));
  }

  async deleteActions(actionIds: string[]): Promise<void> {
    const query = `
      DELETE FROM auth_actions
      WHERE id = ANY($1::text[]);
    `;
    const values = [actionIds];
    await this.pg.execute(query, values);
  }

  async findActionById(id: string): Promise<ActionEntity | null> {
    const query = `
      SELECT * FROM auth_actions
      WHERE id = $1;
    `;
    const values = [id];
    const result = await this.pg.execute(query, values);
    return result.rows.length
      ? ActionTransformer.fromDbToEntity(result.rows[0])
      : null;
  }

  async getActionsByCursor(cursor: string, limit: number) {
    const query = `
      SELECT * FROM auth_actions
      WHERE ($1::text IS NULL OR id > $1)
      ORDER BY id ASC
      LIMIT $2;
    `;
    const values = [cursor || null, limit];
    const result = await this.pg.execute(query, values);
    return result.rows.map((row) => ActionTransformer.fromDbToEntity(row));
  }

  async assignActionsToRoles(
    actionIds: string[],
    roleIds: string[],
  ): Promise<void> {
    const values = roleIds.flatMap((roleId) =>
      actionIds.map((actionId) => [actionId, roleId]),
    );

    const query = format(
      `
      INSERT INTO auth_role_action_permissions (action_id, role_id)
      VALUES %L
      ON CONFLICT (action_id, role_id)
      DO NOTHING
    `,
      values,
    );

    await this.pg.execute(query);
  }
}
