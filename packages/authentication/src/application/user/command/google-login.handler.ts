/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OAuth2Client } from 'google-auth-library';
import { GoogleLoginCommand } from '../../../domain/user/command/google-login.command';
import { Inject } from '@nestjs/common';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { CreateUserCommand } from '../../../domain/user/command/create-user.command';
import { InvalidGoogleClientIdError } from '../../../domain/user/errors/invalid-google-client-id.error';
import { Mfa, MfaMethod, UserType } from '../../../domain/user/user-entity';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { UserLogedinEvent } from '../../../domain/user/events/user-logedin.event';
import { USER_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { nanoid } from 'nanoid';
import { EventHub } from '../../../domain/event-hub/event.hub';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';

@CommandHandler(GoogleLoginCommand)
export class GoogleLoginHandler implements ICommandHandler<GoogleLoginCommand> {
  @Inject() authenticationConfig: AuthConf;
  @Inject() private readonly commandBus: CommandBus;
  @Inject(USER_REPOSITORY_PROVIDER)
  private readonly repository: IUserRepository;

  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;
  private static googleClient: OAuth2Client;

  private getGoogleClient(): OAuth2Client {
    if (!GoogleLoginHandler.googleClient) {
      const { authGoogleClientId, authGoogleClientSecret } =
        this.authenticationConfig.getRbacConf();
      GoogleLoginHandler.googleClient = new OAuth2Client(
        authGoogleClientId,
        authGoogleClientSecret,
      );
    }
    return GoogleLoginHandler.googleClient;
  }

  async execute(command: GoogleLoginCommand): Promise<any> {
    const googleClient = this.getGoogleClient();

    const { authGoogleClientId } = this.authenticationConfig.getRbacConf();
    const ticket = await googleClient.verifyIdToken({
      idToken: command.token,
      audience: authGoogleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new InvalidGoogleClientIdError();
    }

    let user: any = await this.repository.getUserByUsername(payload.sub);
    if (!user) {
      // By default when user login by google they dont need verify email again
      const _mfa: Mfa = {
        enable: false,
        method: MfaMethod.EMAIL,
        receiveMfaCodeAddress: payload.email,
        verified: false,
      };
      user = await this.commandBus.execute(
        new CreateUserCommand(
          payload.sub,
          nanoid(16),
          _mfa,
          UserType.GOOGLE,
          payload,
        ),
      );
    }
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new CreateTokenCommand(user.id),
    );

    this.eventHub.publish(new UserLogedinEvent(user));

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
