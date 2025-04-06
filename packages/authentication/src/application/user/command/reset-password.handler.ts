import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../../../domain/user/command/reset-password.command';
import { PasswordResetCompletedEvent } from '../../../domain/user/events/password-reset-completed.event';
import * as argon2 from 'argon2';
import { Inject } from '@nestjs/common';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { ResetPassword } from '../../../domain/user/user-entity';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { USER_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';

import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { EventHub } from '../../../domain/event-hub/event.hub';
@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  @Inject(USER_REPOSITORY_PROVIDER)
  private readonly repository: IUserRepository;
  @Inject() private readonly authConfig: AuthConf;

  @Inject(EVENT_HUB_PROVIDER)
  private readonly eventHub: EventHub;

  async execute(command: ResetPasswordCommand): Promise<void> {
    const user = await this.repository.findUserByResetToken(command.token);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (
      !user.resetPassword?.tokenExpiresAt ||
      user.resetPassword.tokenExpiresAt < new Date()
    ) {
      throw new Error('Reset token has expired');
    }

    if (user.resetPassword.token !== command.token) {
      throw new Error('Invalid reset token');
    }

    user.passwordHash = await argon2.hash(
      command.newPassword,
      this.authConfig.getHashPasswordConf(),
    );

    // Clear reset password data
    user.resetPassword = {} as ResetPassword;
    await this.repository.updateUser(user);

    await this.eventHub.publish(new PasswordResetCompletedEvent(user.id));
  }
}
