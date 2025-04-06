import { Inject } from '@nestjs/common';
import { CommandBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoginQuery } from '../../../domain/user/query/login.query';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { PasswordNotMatchError } from '../../../domain/user/errors/password-not-match.error';
import { UserStatus } from '../../../domain/user/user-status';
import { UserDeletedError } from '../../../domain/user/errors/user-deleted.error';
import { UserInactivatedError } from '../../../domain/user/errors/user-inactivated.error';
import { UserLogedinEvent } from '../../../domain/user/events/user-logedin.event';
import { UserLoginFailEvent } from '../../../domain/user/events/user-login-fail.event';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { CreateMfaSessionCommand } from '../../../domain/mfa/command/create-mfa-session.command';
import { USER_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import * as argon2 from 'argon2';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';

@QueryHandler(LoginQuery)
export class LoginHandler implements IQueryHandler<LoginQuery> {
  @Inject() authenticationConfig: AuthConf;
  @Inject(USER_REPOSITORY_PROVIDER)
  private readonly repository: IUserRepository;
  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;
  constructor(private readonly commandBus: CommandBus) {}

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
      this.authenticationConfig.getHashPasswordConf(),
    );

    if (!isMatchPassword) {
      this.eventHub.publish(new UserLoginFailEvent(user));
      throw new PasswordNotMatchError();
    }
    // Check mfa here
    if (user.mfa?.enable) {
      const sessionId = await this.commandBus.execute(
        new CreateMfaSessionCommand(user),
      );
      return { sessionId };
    }

    // Create jwt token here
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new CreateTokenCommand(user.id),
    );
    this.eventHub.publish(new UserLogedinEvent(user));
    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
