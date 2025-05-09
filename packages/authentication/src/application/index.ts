import { CreateEndpointCommandHandler } from './endpoint/command/create-endpoints.handler';
import { DeleteEndpointsCommandHandler } from './endpoint/command/delete-endpoints.handler';
import { GetEndpointQueryHandler } from './endpoint/query/get-endpoint.handler';
import { GetEndpointsWithCursorQueryHandler } from './endpoint/query/get-endpoints-with-cursor.handler';
import { AccessTokenGuard } from '../infrastructure/guard/access-token.guard';
import { AssignDefaultRoleToUserHandler } from './role/command/assign-default-role-to-user.handler';
import { AssignRoleToUserHandler } from './role/command/assign-role-to-user.handler';
import { CreateRoleCommandHandler } from './role/command/create-role.handler';
import { CreateTokenHandler } from './user/command/create-token.handler';
import { CreateUserHandler } from './user/command/create-user.handler';
import { RefreshTokenHandler } from './user/command/refresh-token.handler';
import { LoginHandler } from './user/query/login.handler';
import { MeHandler } from './user/query/me.handler';
import { CreateActionsHandler } from './action/command/create-actions.handler';
import { UpdateActionsHandler } from './action/command/update-actions.handler';
import { DeleteActionsHandler } from './action/command/delete-actions.handler';
import { FindActionByIdHandler } from './action/query/find-action-by-id.handler';
import { GetActionsByCursorHandler } from './action/query/get-actions-by-cursor.handler';
import { CanExecRouteQueryHandler } from './role/query/can-exec-route.query.handler';
import { GetUserRolesQueryHandler } from './role/query/get-user-roles.query.handler';
import { GetRolesByRouteQueryHandler } from './role/query/get-roles-by-route.query.handler';
import { IsPublicRoutesHandler } from './endpoint/query/is-public-routes.handler';
import { UpdateEndpointsCommandHandler } from './endpoint/command/update-endpoints.handler';
import { AssignActionToRoleHandler } from './role/command/assign-action-to-role.handler';
import { AssignEndpointToRoleHandler } from './role/command/assign-endpoint-to-role.handler';
import { GoogleLoginHandler } from './user/command/google-login.handler';
import { CreateMfaSessionHandler } from './mfa/command/create-mfa-session.handler';
import { VerifyfaSessionHandler } from './mfa/command/verify-mfa-session.handler';
import { VerifyLoginfaSessionHandler } from './mfa/command/verify-login-mfa-session.handler';
import { RequestPasswordResetHandler } from './user/command/request-password-reset.handler';
import { ResetPasswordHandler } from './user/command/reset-password.handler';
import { GetUserRolesHandler } from './user-role/query/get-user-roles.handler';

export const Handlers = [
  // User
  CreateUserHandler,
  LoginHandler,
  MeHandler,
  GoogleLoginHandler,
  RequestPasswordResetHandler,
  ResetPasswordHandler,

  // Mfa
  CreateMfaSessionHandler,
  VerifyfaSessionHandler,
  VerifyLoginfaSessionHandler,

  // Role
  CreateRoleCommandHandler,
  AssignRoleToUserHandler,
  AssignDefaultRoleToUserHandler,
  AssignActionToRoleHandler,
  AssignEndpointToRoleHandler,
  CanExecRouteQueryHandler,
  GetUserRolesQueryHandler,
  GetRolesByRouteQueryHandler,
  GetUserRolesHandler,

  // Token
  CreateTokenHandler,
  RefreshTokenHandler,

  // Enpoint
  CreateEndpointCommandHandler,
  DeleteEndpointsCommandHandler,
  UpdateEndpointsCommandHandler,

  GetEndpointsWithCursorQueryHandler,
  GetEndpointQueryHandler,
  IsPublicRoutesHandler,

  // Action
  CreateActionsHandler,
  UpdateActionsHandler,
  DeleteActionsHandler,

  FindActionByIdHandler,
  GetActionsByCursorHandler,

  // Service
  AccessTokenGuard,
];
