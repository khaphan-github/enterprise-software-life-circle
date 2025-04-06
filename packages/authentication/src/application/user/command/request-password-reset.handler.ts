import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RequestPasswordResetCommand } from '../../../domain/user/command/request-password-reset.command';
import { ResetPassword } from '../../../domain/user/user-entity';
import { PasswordResetRequestedEvent } from '../../../domain/user/events/password-reset-requested.event';
import { randomBytes } from 'crypto';
import { Inject } from '@nestjs/common';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { UserRepositoryProvider } from '../../../infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler
  implements ICommandHandler<RequestPasswordResetCommand>
{
  @Inject(UserRepositoryProvider) private readonly repository: IUserRepository;

  constructor(private readonly eventBus: EventBus) {}

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

    await this.eventBus.publish(
      new PasswordResetRequestedEvent(
        user.id,
        user.username,
        user.resetPassword,
      ),
    );
  }
}
