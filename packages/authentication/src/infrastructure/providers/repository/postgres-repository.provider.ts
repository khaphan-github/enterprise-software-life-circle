import {
  ActionRepositoryProvider,
  UserRepositoryProvider,
  RoleRepositoryProvider,
  EndpointRepositoryProvider,
} from './repository-providers';
import { Provider } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/postgres/user.repository';
import { ActionRepository } from '../../../infrastructure/repository/postgres/action.repository';
import { RoleRepository } from '../../../infrastructure/repository/postgres/role.repository';
import { EndpointRepository } from '../../../infrastructure/repository/postgres/endpoint.repository';

export const PostgresRepositoryProviders: Provider[] = [
  {
    provide: UserRepositoryProvider,
    useClass: UserRepository,
  },
  {
    provide: ActionRepositoryProvider,
    useClass: ActionRepository,
  },
  {
    provide: RoleRepositoryProvider,
    useClass: RoleRepository,
  },
  {
    provide: EndpointRepositoryProvider,
    useClass: EndpointRepository,
  },
];
