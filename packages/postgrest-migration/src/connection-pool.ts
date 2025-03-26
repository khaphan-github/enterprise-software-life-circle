import { Pool, PoolClient, PoolConfig } from 'pg';

export class PgSQLConnectionPool {
  public readonly pool!: Pool;
  constructor(conf?: PoolConfig) {
    this.pool = new Pool(conf);
    // the pool will emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    if (this.pool) {
      this.pool.on('error', (err) => {
        console.error(`Unexpected error on idle client: ${err.message}`);
      });
    }
  }

  public execute(query: string, params: any[] = []) {
    return this.pool.query(query, params);
  }

  public async transaction<T = any>(
    callback: (client: PoolClient) => Promise<T>,
  ) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
