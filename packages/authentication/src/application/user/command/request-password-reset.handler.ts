import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestPasswordResetCommand } from '../../../domain/user/command/request-password-reset.command';
import { ResetPassword } from '../../../domain/user/user-entity';
import { PasswordResetRequestedEvent } from '../../../domain/user/events/password-reset-requested.event';
import { randomBytes } from 'crypto';
import { Inject } from '@nestjs/common';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { USER_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';

import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler
  implements ICommandHandler<RequestPasswordResetCommand>
{
  @Inject(USER_REPOSITORY_PROVIDER)
  private readonly repository: IUserRepository;

  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;

  async execute(command: RequestPasswordResetCommand): Promise<void> {
    const user = await this.repository.findUserByResetPasswordAddress(
      command.address,
    );
    if (!user) {
      throw new UserNotFoundError();
    }

    if (!user.resetPassword) {
      user.resetPassword = {} as ResetPassword;
    }
    user.resetPassword.token = randomBytes(32).toString('hex');
    user.resetPassword.tokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ); // 24 hours

    await this.repository.updateUser(user);

    await this.eventHub.publish(
      new PasswordResetRequestedEvent(
        user.id,
        user.username,
        user.resetPassword,
      ),
    );
  }
}
