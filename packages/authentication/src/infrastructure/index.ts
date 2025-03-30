import { ActionController } from './interface/action.controller';
import { AuthController } from './interface/auth.controller';
import { EndpointController } from './interface/endpoint.controller';
import { RoleController } from './interface/role.controller';
import { NotifyProxy } from './proxy/notifi.proxy';
import { ActionRepository } from './repository/action.repository';
import { EndpointRepository } from './repository/endpoint.repository';
import { RoleRepository } from './repository/role.repository';
import { UserRepository } from './repository/user.repository';

export const Repositories = [
  // Repositories
  UserRepository,
  RoleRepository,
  EndpointRepository,
  ActionRepository,
  // Proxy:
  NotifyProxy,
];

// Controllers
export const Controllers = [
  EndpointController,
  AuthController,
  ActionController,
  RoleController,
];
