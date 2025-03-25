import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  POSTGRE_SQL_DB_CONFIG_MAIN,
  CONNECTION_STRING_DEFAULT,
} from './configuration';
import { PostgresModule } from 'src/libs/postgresql/postgres.module';

/**
 * Module này sẽ chứa tất cả các kết nối đến cơ sở dữ liệu posgresql
 * Chỉ được import 1 lần tại AppModule.
 * Các module tính năng khi import chỉ cần import: [PostgresModule.forFeature(CONNECTION)]
 */
@Module({
  imports: [
    PostgresModule.forRootAsync({
      imports: [ConfigModule.forFeature(POSTGRE_SQL_DB_CONFIG_MAIN)],
      inject: [POSTGRE_SQL_DB_CONFIG_MAIN.KEY],
      useFactory: (dbConfig: ConfigType<typeof POSTGRE_SQL_DB_CONFIG_MAIN>) => {
        // Kết nối database chính
        const DB_CONFIG_MAIN = {
          name: CONNECTION_STRING_DEFAULT,
          database: dbConfig.database,
          host: dbConfig.host,
          port: Number(dbConfig.port),
          user: dbConfig.user,
          password: dbConfig.password,
        };

        // Thêm các connection với db loại postgres bên dưới ...
        // const SUB_DB_CONFIG = {...};

        return [DB_CONFIG_MAIN];
      },
    }),
  ],
})
export class PortgresqlConfigModule {}
