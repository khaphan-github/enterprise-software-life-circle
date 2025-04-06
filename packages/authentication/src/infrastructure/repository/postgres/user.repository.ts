import { Injectable } from '@nestjs/common';
import { UserTransformer } from '../../../domain/user/transformer';
import { UserEntity } from '../../../domain/user/user-entity';
import {
  PgSQLConnection,
  PgSQLConnectionPool,
} from 'nest-postgresql-multi-connect';
import { CONNECTION_STRING_DEFAULT } from '../../providers/repository/connection-string-default';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @PgSQLConnection(CONNECTION_STRING_DEFAULT)
    private readonly pg: PgSQLConnectionPool,
  ) {}
  async createUser(userEntity: UserEntity): Promise<UserEntity | null> {
    const query = `
      INSERT INTO auth_users (id, username, password_hash, status, metadata, created_at, updated_at, type, mfa, reset_password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = [
      userEntity.id,
      userEntity.username,
      userEntity.passwordHash,
      userEntity.status,
      JSON.stringify(userEntity.metadata),
      userEntity.createdAt,
      userEntity.updatedAt,
      userEntity.type,
      JSON.stringify(userEntity.mfa),
      JSON.stringify(userEntity.resetPassword),
    ];
    const result = await this.pg.execute(query, values);
    return UserTransformer.fromDbToEntity(result.rows[0]);
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
      SET username = $1, password_hash = $2, status = $3, metadata = $4, updated_at = $5, type = $6, mfa = $7, reset_password = $8
      WHERE id = $9
    `;
    const values = [
      userEntity.username,
      userEntity.passwordHash,
      userEntity.status,
      JSON.stringify(userEntity.metadata),
      userEntity.updatedAt,
      userEntity.type,
      JSON.stringify(userEntity.mfa),
      JSON.stringify(userEntity.resetPassword),
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

  async findUserByResetPasswordAddress(
    address: string,
  ): Promise<UserEntity | null> {
    const query = `
      SELECT * FROM auth_users
      WHERE reset_password->>'address' = $1
    `;
    const values = [address];
    const result = await this.pg.execute(query, values);
    const row = result.rows[0];
    return UserTransformer.fromDbToEntity(row);
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    const query = `
      SELECT * FROM auth_users
      WHERE id = $1
    `;
    const values = [id];
    const result = await this.pg.execute(query, values);
    const row = result.rows[0];
    return UserTransformer.fromDbToEntity(row);
  }

  async isExistUserById(id: string): Promise<boolean> {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM auth_users
        WHERE id = $1
      )
    `;
    const values = [id];
    const result = await this.pg.execute(query, values);
    const exists = result.rows[0].exists;
    return exists;
  }

  async getUserByUsername(username: string): Promise<UserEntity | null> {
    const query = `
      SELECT * FROM auth_users
      WHERE username = $1
    `;
    const values = [username];
    const result = await this.pg.execute(query, values);
    const row = result.rows[0];
    return row ? UserTransformer.fromDbToEntity(row) : null;
  }

  async findUserByResetToken(token: string): Promise<UserEntity | null> {
    const query = `
      SELECT * FROM auth_users
      WHERE reset_password->>'token' = $1
      AND (reset_password->>'tokenExpiresAt')::timestamp > NOW()
    `;
    const values = [token];
    const result = await this.pg.execute(query, values);
    const row = result.rows[0];
    return row ? UserTransformer.fromDbToEntity(row) : null;
  }
}
