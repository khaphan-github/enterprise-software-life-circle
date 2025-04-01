import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../domain/user/command/create-user.command';
import { UserCreatedEvent } from '../../../domain/user/events/user-created.event';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserAlreadyExistError } from '../../../domain/user/errors/user-already-exist.error';
import { UserStatus } from '../../../domain/user/user-status';
import * as argon2 from 'argon2';
import {
  MfaMethod,
  ResetPasswordMethod,
  UserEntity,
} from '../../../domain/user/user-entity';
import { AuthConf } from '../../../configurations/auth-config';
import { Inject } from '@nestjs/common';
import { CreateMfaSessionCommand } from '../../../domain/mfa/command/create-mfa-session.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  @Inject() authenticationConfig: AuthConf;
  @Inject() private readonly commandBus: CommandBus;
  constructor(
    private readonly eventBus: EventBus,
    private readonly repository: UserRepository,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<UserEntity | { sessionId: string }> {
    const user = await this.repository.findUserByUsername(command.username);
    if (user) {
      throw new UserAlreadyExistError();
    }
    const { defaultUserStatus, mfa } = this.authenticationConfig.getRbacConf();
    const entity = new UserEntity();
    entity.initId();
    entity.metadata = command.metadata;
    entity.username = command.username;
    entity.type = command.type;
    entity.mfa = {
      enable: mfa?.enable || false,
      method: command?.mfa?.method || MfaMethod.NONE,
      receiveMfaCodeAddress: command?.mfa?.receiveMfaCodeAddress || '',
      verified: false,
    };
    entity.passwordHash = await argon2.hash(
      command.password,
      this.authenticationConfig.getHashPasswordConf(),
    );
    entity.status = defaultUserStatus ? defaultUserStatus : UserStatus.ACTIVE;

    // Set the reset password method
    let resetPasswordMethod = ResetPasswordMethod.NONE;
    if (mfa?.method == MfaMethod.EMAIL) {
      resetPasswordMethod = ResetPasswordMethod.EMAIL;
    }
    if (mfa?.method == MfaMethod.SMS) {
      resetPasswordMethod = ResetPasswordMethod.SMS;
    }
    entity.resetPassword = {
      method: resetPasswordMethod,
      address: command?.mfa?.receiveMfaCodeAddress,
      token: undefined,
      tokenExpiresAt: undefined,
    };

    entity.setCreateTime();

    await this.repository.createUser(entity);

    if (entity.mfa?.enable) {
      const sessionId = await this.commandBus.execute(
        new CreateMfaSessionCommand(entity),
      );
      return { sessionId };
    }
    this.eventBus.publish(new UserCreatedEvent(entity));
    return Promise.resolve(entity);
  }
}
