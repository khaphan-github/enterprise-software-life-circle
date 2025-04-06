import {
  ACTION_REPOSITORY_PROVIDER,
  USER_REPOSITORY_PROVIDER,
  ROLE_REPOSITORY_PROVIDER,
  ENDPOINT_REPOSITORY_PROVIDER,
} from './repository-providers';
import { Provider } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/postgres/user.repository';
import { ActionRepository } from '../../../infrastructure/repository/postgres/action.repository';
import { RoleRepository } from '../../../infrastructure/repository/postgres/role.repository';
import { EndpointRepository } from '../../../infrastructure/repository/postgres/endpoint.repository';

export const PostgresRepositoryProviders: Provider[] = [
  {
    provide: USER_REPOSITORY_PROVIDER,
    useClass: UserRepository,
  },
  {
    provide: ACTION_REPOSITORY_PROVIDER,
    useClass: ActionRepository,
  },
  {
    provide: ROLE_REPOSITORY_PROVIDER,
    useClass: RoleRepository,
  },
  {
    provide: ENDPOINT_REPOSITORY_PROVIDER,
    useClass: EndpointRepository,
  },
];
