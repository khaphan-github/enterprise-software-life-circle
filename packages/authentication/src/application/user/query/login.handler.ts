import { EventBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoginQuery } from '../../../domain/user/query/login.query';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { PasswordNotMatchError } from '../../../domain/user/errors/password-not-match.error';
import * as argon2 from 'argon2';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET_KEY,
  PASSWORD_HASH_OPTIONS,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET_KEY,
} from '../../../domain/user/const';
import { UserStatus } from '../../../domain/user/user-status';
import { UserDeletedError } from '../../../domain/user/errors/user-deleted.error';
import { UserInactivatedError } from '../../../domain/user/errors/user-inactivated.error';
import { UserLogedinEvent } from '../../../domain/user/events/user-logedin.event';
import { UserLoginFailEvent } from '../../../domain/user/events/user-login-fail.event';
import { JwtService } from '@nestjs/jwt';
import { RoleRepository } from '../../../infrastructure/repository/role.repository';

@QueryHandler(LoginQuery)
export class LoginHandler implements IQueryHandler<LoginQuery> {
  constructor(
    private readonly repository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly eventBus: EventBus,
    private readonly jwtService: JwtService,
  ) {}

  async execute(query: LoginQuery): Promise<any> {
    const user = await this.repository.findUserByUsername(query.username);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.status == UserStatus.DELETED) {
      throw new UserDeletedError();
    }
    if (user.status == UserStatus.INACTIVE) {
      throw new UserInactivatedError();
    }

    const isMatchPassword = await argon2.verify(
      user.passwordHash,
      query.password,
      PASSWORD_HASH_OPTIONS,
    );

    if (!isMatchPassword) {
      this.eventBus.publish(new UserLoginFailEvent(user));
      throw new PasswordNotMatchError();
    }

    // Create jwt token here
    const userRoles = await this.roleRepository.getRolesByUserId(user.id);
    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        role: userRoles.map((role) => role?.id),
      },
      {
        algorithm: 'HS256',
        secret: ACCESS_TOKEN_SECRET_KEY,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    );
    const refreshToken = this.jwtService.sign(
      { id: user.id },
      {
        algorithm: 'HS256',
        secret: REFRESH_TOKEN_SECRET_KEY,
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    this.eventBus.publish(new UserLogedinEvent(user));
    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
