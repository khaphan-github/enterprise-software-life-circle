import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../domain/user/command/create-user.command';
import { UserCreatedEvent } from '../../../domain/user/events/user-created.event';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserAlreadyExistError } from '../../../domain/user/errors/user-already-exist.error';
import { PASSWORD_HASH_OPTIONS } from '../../../domain/user/const';
import { UserStatus } from '../../../domain/user/user-status';
import { UserEmailAlreadyExistError } from '../../../domain/user/errors/user-email-already-exist.error';
import { nanoid } from 'nanoid';
import * as argon2 from 'argon2';
import { UserEntity } from '../../../domain/user/user-entity';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly repository: UserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserEntity> {
    const user = await this.repository.findUserByUsername(command.username);
    if (user) {
      throw new UserAlreadyExistError();
    }
    const userByEmail = await this.repository.findUserByEmail(command.email);
    if (userByEmail) {
      throw new UserEmailAlreadyExistError();
    }

    const entity = new UserEntity();
    entity.id = nanoid(32);
    entity.metadata = command.metadata;
    entity.username = command.username;
    entity.email = command.email;
    entity.passwordHash = await argon2.hash(
      command.password,
      PASSWORD_HASH_OPTIONS,
    );
    entity.status = UserStatus.ACTIVE;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    await this.repository.createUser(entity);
    this.eventBus.publish(new UserCreatedEvent(entity));
    return Promise.resolve(entity);
  }
}
