import { Injectable } from '@nestjs/common';
import { UserTransformer } from 'src/domain/user/transformer';
import { UserEntity } from 'src/domain/user/user-entity';
import {
  PgSQLConnection,
  PgSQLConnectionPool,
} from 'nest-postgresql-multi-connect';
import { CONNECTION_STRING_DEFAULT } from 'src/configurations/connection-string-default';

@Injectable()
export class UserRepository {
  constructor(
    @PgSQLConnection(CONNECTION_STRING_DEFAULT)
    private readonly pg: PgSQLConnectionPool,
  ) {}

  async createUser(userEntity: UserEntity): Promise<void> {
    const query = `
      INSERT INTO auth_users (id, username, email, password_hash, status, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [
      userEntity.id,
      userEntity.username,
      userEntity.email,
      userEntity.passwordHash,
      userEntity.status,
      JSON.stringify(userEntity.metadata),
      userEntity.createdAt,
      userEntity.updatedAt,
    ];
    await this.pg.execute(query, values);
  }

  async getUsersByCursor(cursor: string, limit: number) {
    const query = `
      SELECT * FROM auth_users
      WHERE id > $1
      ORDER BY id ASC
      LIMIT $2
    `;
    const values = [cursor, limit];
    const result = await this.pg.execute(query, values);
    return result.rows.map((row) => UserTransformer.fromDbToEntity(row));
  }

  async updateUser(userEntity: UserEntity): Promise<void> {
    const query = `
      UPDATE auth_users
      SET username = $1, email = $2, password_hash = $3, status = $4, metadata = $5, updated_at = $6
      WHERE id = $7
    `;
    const values = [
      userEntity.username,
      userEntity.email,
      userEntity.passwordHash,
      userEntity.status,
      JSON.stringify(userEntity.metadata),
      userEntity.updatedAt,
      userEntity.id,
    ];
    await this.pg.execute(query, values);
  }

  async deleteUser(id: string): Promise<void> {
    const query = `
      DELETE FROM auth_users
      WHERE id = $1
    `;
    const values = [id];
    await this.pg.execute(query, values);
  }

  async findUserByUsername(username: string): Promise<UserEntity | null> {
    const query = `
      SELECT * FROM auth_users
      WHERE username = $1
    `;
    const values = [username];
    const result = await this.pg.execute(query, values);
    const row = result.rows[0];
    return UserTransformer.fromDbToEntity(row);
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const query = `
      SELECT * FROM auth_users
      WHERE email = $1
    `;
    const values = [email];
    const result = await this.pg.execute(query, values);
    const row = result.rows[0];
    return UserTransformer.fromDbToEntity(row);
  }
}
