import {
  PgSQLConnection,
  PgSQLConnectionPool,
} from 'nest-postgresql-multi-connect';
import { CONNECTION_STRING_DEFAULT } from '../../configurations/connection-string-default';
import { EndpointEntity } from '../../domain/endpoint/endpoint-entity';
import { EndpointTransformer } from '../../domain/endpoint/transformer';
import * as format from 'pg-format';

export class EndpointRepository {
  constructor(
    @PgSQLConnection(CONNECTION_STRING_DEFAULT)
    private readonly pg: PgSQLConnectionPool,
  ) {}

  async createEndpoints(endpoints: EndpointEntity[]) {
    const query = `
      INSERT INTO auth_endpoints (id, path, method, metadata, created_at, updated_at)
      VALUES %L
      RETURNING *
    `;
    const values = endpoints.map((endpoint) => [
      endpoint.id,
      endpoint.path,
      endpoint.method,
      endpoint.metadata,
      endpoint.createdAt,
      endpoint.updatedAt,
    ]);
    const formattedQuery = format(query, values);
    const res = await this.pg.execute(formattedQuery);
    return res.rows.map((row) => EndpointTransformer.fromDbToEntity(row));
  }

  async getEndpointById(endpointId: string) {
    const query = `
      SELECT * FROM auth_endpoints
      WHERE id = $1
    `;
    const values = [endpointId];
    const res = await this.pg.execute(query, values);
    return res.rows.length
      ? EndpointTransformer.fromDbToEntity(res.rows[0])
      : null;
  }

  async updateEndpoint(endpoint: EndpointEntity) {
    const query = `
      UPDATE auth_endpoints
      SET path = COALESCE($2, path),
          method = COALESCE($3, method),
          metadata = COALESCE($4, metadata),
          updated_at = $5
      WHERE id = $1
      RETURNING *
    `;
    const values = [
      endpoint.id,
      endpoint.path,
      endpoint.method,
      endpoint.metadata,
      endpoint.updatedAt,
    ];
    const res = await this.pg.execute(query, values);
    return res.rows.length
      ? EndpointTransformer.fromDbToEntity(res.rows[0])
      : null;
  }

  async deleteEndpoint(endpointId: string) {
    const query = `
      DELETE FROM auth_endpoints
      WHERE id = $1
      RETURNING *
    `;
    const values = [endpointId];
    const res = await this.pg.execute(query, values);
    return res.rows.length
      ? EndpointTransformer.fromDbToEntity(res.rows[0])
      : null;
  }

  async getEndpointsByPathAndMethod(path: string, method: string) {
    const query = `
      SELECT * FROM auth_endpoints
      WHERE path = $1 AND method = $2
    `;
    const values = [path, method];
    const res = await this.pg.execute(query, values);
    return res.rows.map((row) => EndpointTransformer.fromDbToEntity(row));
  }

  async getEndpoint(path: string, method: string) {
    const query = `
      SELECT * FROM auth_endpoints
      WHERE path = $1 AND method = $2
    `;
    const values = [path, method];
    const res = await this.pg.execute(query, values);
    return res.rows.length
      ? EndpointTransformer.fromDbToEntity(res.rows[0])
      : null;
  }

  async getEndpointsWithCursor(limit: number, cursor?: string) {
    const query = `
      SELECT * FROM auth_endpoints
      WHERE ($1::text IS NULL OR id > $1)
      ORDER BY id ASC
      LIMIT $2
    `;
    const values = [cursor || null, limit];
    const res = await this.pg.execute(query, values);
    return res.rows.map((row) => EndpointTransformer.fromDbToEntity(row));
  }

  async updateEndpoints(endpoints: EndpointEntity[]) {
    const query = `
      UPDATE auth_endpoints
      SET path = data.path,
          method = data.method,
          metadata = data.metadata,
          updated_at = data.updated_at
      FROM (VALUES %L) AS data(id, path, method, metadata, updated_at)
      WHERE auth_endpoints.id = data.id
      RETURNING auth_endpoints.*;
    `;
    const values = endpoints.map((endpoint) => [
      endpoint.id,
      endpoint.path,
      endpoint.method,
      endpoint.metadata,
      endpoint.updatedAt,
    ]);
    const formattedQuery = format(query, values);
    const res = await this.pg.execute(formattedQuery);
    return res.rows.map((row) => EndpointTransformer.fromDbToEntity(row));
  }

  async deleteEndpoints(endpointIds: string[]) {
    const query = `
      DELETE FROM auth_endpoints
      WHERE id = ANY($1::uuid[])
      RETURNING *;
    `;
    const values = [endpointIds];
    const res = await this.pg.execute(query, values);
    return res.rows.map((row) => EndpointTransformer.fromDbToEntity(row));
  }

  async addEndpointsToRoles(endpointIds: string[], roleIds: string[]) {
    const query = `
      INSERT INTO role_endpoints (role_id, endpoint_id)
      VALUES %L
      ON CONFLICT DO NOTHING;
    `;
    const values = roleIds.flatMap((roleId) =>
      endpointIds.map((endpointId) => [roleId, endpointId]),
    );
    const formattedQuery = format(query, values);
    await this.pg.execute(formattedQuery);
  }

  async isRouteAndMethodExist(path: string, method: string): Promise<boolean> {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM auth_endpoints
        WHERE path = $1 AND method = $2
      ) AS exists;
    `;
    const values = [path, method];
    const res = await this.pg.execute(query, values);
    return res.rows[0]?.exists || false;
  }
}
