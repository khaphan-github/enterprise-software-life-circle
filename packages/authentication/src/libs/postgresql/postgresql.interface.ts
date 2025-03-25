import { PoolConfig } from 'pg';

export interface Connection extends PoolConfig {
  name?: string;
}

export interface AsyncConnection {
  imports?: any[];
  useFactory: (...params: any[]) => Connection[];
  inject?: any[];
}
