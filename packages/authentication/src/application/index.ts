import { SendLogedInEmailHanlder } from './email/send-logedin-email.handler';
import { SendWellcomeEmailHandler } from './email/send-wellcome-email.handler';
import { AssignDefaultRoleToUserHandler } from './role/command/assign-default-role-to-user.handler';
import { AssignRoleToUserHandler } from './role/command/assign-role-to-user.handler';
import { CreateRoleCommandHandler } from './role/command/create-role.handler';
import { AuthenticationSaga } from './saga/authentication.saga';
import { CreateTokenHandler } from './user/command/create-token.handler';
import { CreateUserHandler } from './user/command/create-user.handler';
import { RefreshTokenHandler } from './user/command/refresh-token.handler';
import { LoginHandler } from './user/query/login.handler';

export const Handlers = [
  // Commands
  CreateUserHandler,
  SendWellcomeEmailHandler,
  SendLogedInEmailHanlder,

  CreateRoleCommandHandler,
  AssignRoleToUserHandler,
  AssignDefaultRoleToUserHandler,

  // TOKEn
  CreateTokenHandler,
  RefreshTokenHandler,

  // Quwry
  LoginHandler,

  // Saga
  AuthenticationSaga,
];
