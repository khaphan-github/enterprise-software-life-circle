# NestJS PostgreSQL Module

## Introduction
This module provides a flexible way to manage multiple PostgreSQL database connections in a NestJS application. It allows:

- Defining database connections statically using `forRoot`
- Defining database connections asynchronously using `forRootAsync`
- Accessing specific connections using `forFeature`

## Installation
Ensure you have `pg` installed as a dependency:

```sh
npm install pg
```

## Usage

### 1. Configure the Module

#### Static Configuration (forRoot)

```typescript
import { Module } from '@nestjs/common';
import { PostgresModule } from './postgres.module';

@Module({
  imports: [
    PostgresModule.forRoot([
      { name: 'main', host: 'localhost', port: 5432, user: 'user', password: 'pass', database: 'db1' },
      { name: 'secondary', host: 'localhost', port: 5432, user: 'user2', password: 'pass2', database: 'db2' },
    ]),
  ],
})
export class AppModule {}
```

#### Asynchronous Configuration (forRootAsync)

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostgresModule } from './postgres.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PostgresModule.forRootAsync({
      useFactory: async (configService: ConfigService) => [
        {
          name: 'main',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          user: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
        },
      ],
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 2. Injecting a Specific Connection (forFeature)
To access a specific connection in a service:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { PgSQLConnectionPool } from './connection-pool';
import { generateConnectionPoolToken } from './postgresql.utils';

@Injectable()
export class MyService {
  constructor(
    @Inject(generateConnectionPoolToken('main')) private readonly mainDb: PgSQLConnectionPool,
  ) {}

  async executeQuery() {
    const client = await this.mainDb.getClient();
    const result = await client.query('SELECT * FROM users');
    client.release();
    return result.rows;
  }
}
```

### 3. Registering `forFeature` in a Module

```typescript
import { Module } from '@nestjs/common';
import { PostgresModule } from './postgres.module';
import { MyService } from './my.service';

@Module({
  imports: [PostgresModule.forFeature('main')],
  providers: [MyService],
  exports: [MyService],
})
export class MyModule {}
```

## Error Handling
If an invalid connection name is provided, the module will throw an error:

```
Error: no connection <name> available
```

Ensure the connection is defined in `forRoot` or `forRootAsync` before using `forFeature`.

## License
This project is open-source and available under the MIT License.

