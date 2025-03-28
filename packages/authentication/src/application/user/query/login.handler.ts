import {
  CommandBus,
  EventBus,
  IQueryHandler,
  QueryHandler,
} from '@nestjs/cqrs';
import { LoginQuery } from '../../../domain/user/query/login.query';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { PasswordNotMatchError } from '../../../domain/user/errors/password-not-match.error';
import { UserStatus } from '../../../domain/user/user-status';
import { UserDeletedError } from '../../../domain/user/errors/user-deleted.error';
import { UserInactivatedError } from '../../../domain/user/errors/user-inactivated.error';
import { UserLogedinEvent } from '../../../domain/user/events/user-logedin.event';
import { UserLoginFailEvent } from '../../../domain/user/events/user-login-fail.event';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { PASSWORD_HASH_OPTIONS } from '../../../domain/user/const';
import * as argon2 from 'argon2';

@QueryHandler(LoginQuery)
export class LoginHandler implements IQueryHandler<LoginQuery> {
  constructor(
    private readonly repository: UserRepository,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
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

    const { accessToken, refreshToken } = await this.commandBus.execute(
      new CreateTokenCommand(user.id),
    );
    this.eventBus.publish(new UserLogedinEvent(user));
    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
