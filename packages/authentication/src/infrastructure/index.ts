import { NotifyProxy } from './proxy/notifi.proxy';
import { RoleRepository } from './repository/role.repository';
import { UserRepository } from './repository/user.repository';

export const Repositories = [
  // Repositories
  UserRepository,
  RoleRepository,
  // Proxy:
  NotifyProxy,
];
