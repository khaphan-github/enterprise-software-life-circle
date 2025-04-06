import { Provider } from '@nestjs/common';
import {
  IdGenerator,
  MongoIdGenerator,
  NanoIdGenerator,
} from '../../domain/entity/id';
import { AuthConf } from '../conf/auth-config';

export const ID_GENERATOR = 'ID_GENERATOR';
export const IdGeneratorProvider: Provider = {
  provide: ID_GENERATOR,
  useFactory: (authConf: AuthConf): IdGenerator => {
    if (authConf.get().database == 'mongodb') {
      return new MongoIdGenerator();
    }
    if (authConf.get().database == 'postgres') {
      return new NanoIdGenerator();
    }
    throw new Error('Invalid database configuration');
  },
  inject: [AuthConf],
};
