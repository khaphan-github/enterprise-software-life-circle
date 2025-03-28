import { NotifyProxy } from './proxy/notifi.proxy';
import { EndpointRepository } from './repository/endpoint.repository';
import { RoleRepository } from './repository/role.repository';
import { UserRepository } from './repository/user.repository';

export const Repositories = [
  // Repositories
  UserRepository,
  RoleRepository,
  EndpointRepository,
  // Proxy:
  NotifyProxy,
];
