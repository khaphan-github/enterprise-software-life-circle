# PgMigration Library

## Introduction
PgMigration is a PostgreSQL migration tool designed to help developers manage database versioning and schema changes efficiently. It scans migration files, applies necessary updates, and tracks migration history in a dedicated database table.

## Installation

Install the required dependencies using npm:
```sh
npm install pg
```

## Usage

### 1. Configure Migration
Create a migration instance by providing database configuration and migration settings:

```typescript
import { PgMigration } from './pgmigration';
import { PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  user: 'your_username',
  host: 'localhost',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
};

const migration = new PgMigration(dbConfig, {
  modulePrefix: 'migrations',
  migrationTableName: '_migrations',
});
```

### 2. Execute Migrations
Call the `executeMigrations` method to apply new migrations:
```typescript
migration.executeMigrations()
  .then(() => console.log('Migrations completed successfully!'))
  .catch(err => console.error('Migration failed:', err));
```

## Migration File Format
Migration files should be placed in the `migrations/` directory and follow the naming convention `Version-X.Y.Z.ts` (e.g., `Version-1.0.0.ts`).

Each migration file should export a function that accepts a database client:
```typescript
import { PoolClient } from 'pg';

export default async (client: PoolClient, schema: string) => {
  await client.query(`CREATE TABLE IF NOT EXISTS ${schema}.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
  )`);
};
```

## Features
- **Automatic Migration Detection**: Scans and applies only new migrations.
- **Version Tracking**: Stores migration history in `_migrations` table.
- **Error Handling**: Ensures migrations run transactionally to avoid partial updates.
- **Configurable**: Allows customization of migration table name, module prefix, and versioning rules.

## Database Schema Tracking
Migrations are tracked in a table (`_migrations` by default):
```sql
CREATE TABLE _migrations (
  id SERIAL PRIMARY KEY,
  module VARCHAR(256) UNIQUE NOT NULL,
  version VARCHAR(12) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting
- Ensure PostgreSQL is running and accessible.
- Check if migration files follow the correct naming convention.
- Inspect the `_migrations` table for migration history.

## License
This project is open-source and licensed under the MIT License.

