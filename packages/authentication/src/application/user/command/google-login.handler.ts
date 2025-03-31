/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { OAuth2Client } from 'google-auth-library';
import { GoogleLoginCommand } from '../../../domain/user/command/google-login.command';
import { Inject } from '@nestjs/common';
import { AuthConf } from '../../../configurations/auth-config';
import { CreateUserCommand } from '../../../domain/user/command/create-user.command';
import { InvalidGoogleClientIdError } from '../../../domain/user/errors/invalid-google-client-id.error';
import { UserType } from '../../../domain/user/user-entity';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { UserLogedinEvent } from '../../../domain/user/events/user-logedin.event';
import { nanoid } from 'nanoid';

@CommandHandler(GoogleLoginCommand)
export class GoogleLoginHandler implements ICommandHandler<GoogleLoginCommand> {
  @Inject() authenticationConfig: AuthConf;
  @Inject() private readonly commandBus: CommandBus;
  @Inject() private readonly repository: UserRepository;
  @Inject() private readonly eventBus: EventBus;

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
      user = await this.commandBus.execute(
        new CreateUserCommand(
          payload.sub,
          nanoid(16),
          UserType.GOOGLE,
          payload,
        ),
      );
    }
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new CreateTokenCommand(user.id),
    );

    this.eventBus.publish(new UserLogedinEvent(user));

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
