import { Inject } from '@nestjs/common';
import {
  DEFAULT_CONNECTION_NAME,
  generateConnectionPoolToken,
} from './postgresql.utils';

export function PgSQLConnection(name: string = DEFAULT_CONNECTION_NAME) {
  return Inject(generateConnectionPoolToken(name));
}
