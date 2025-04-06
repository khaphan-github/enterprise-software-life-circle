import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../../../domain/user/command/reset-password.command';
import { UserRepository } from '../../../infrastructure/repository/postgres/user.repository';
import { PasswordResetCompletedEvent } from '../../../domain/user/events/password-reset-completed.event';
import * as argon2 from 'argon2';
import { Inject } from '@nestjs/common';
import { AuthConf } from '../../../configurations/auth-config';
import { ResetPassword } from '../../../domain/user/user-entity';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  @Inject() private readonly authConfig: AuthConf;

  constructor(
    private readonly eventBus: EventBus,
    private readonly repository: UserRepository,
  ) {}

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

    await this.eventBus.publish(new PasswordResetCompletedEvent(user.id));
  }
}
