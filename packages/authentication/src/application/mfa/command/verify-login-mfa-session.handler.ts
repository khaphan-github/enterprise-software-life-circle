import { Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { VerifyLoginMfaSessionCommand } from '../../../domain/mfa/command/verify-login-mfa-session.command';
import { VerifyMfaSessionCommand } from '../../../domain/mfa/command/verify-mfa-session.command';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { UserLogedinEvent } from '../../../domain/user/events/user-logedin.event';
import { UserEntity } from '../../../domain/user/user-entity';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';

@CommandHandler(VerifyLoginMfaSessionCommand)
export class VerifyLoginfaSessionHandler
  implements ICommandHandler<VerifyLoginMfaSessionCommand>
{
  @Inject() authenticationConfig: AuthConf;
  @Inject() private readonly commandBus: CommandBus;
  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;
  async execute(command: VerifyLoginMfaSessionCommand): Promise<any> {
    const user: UserEntity = await this.commandBus.execute(
      new VerifyMfaSessionCommand(command.sessionId, command.otp),
    );

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
