import { ICommand } from '@nestjs/cqrs';
import { UserType } from '../user-entity';

export class CreateUserCommand implements ICommand {
  public readonly username: string;
  public readonly password: string;
  public readonly type: UserType;
  public readonly metadata?: object;
  constructor(
    username: string,
    password: string,
    userType: UserType = UserType.PASSWORD,
    metadata?: object,
  ) {
    this.username = username;
    this.password = password;
    this.type = userType;
    this.metadata = metadata;
  }
}
