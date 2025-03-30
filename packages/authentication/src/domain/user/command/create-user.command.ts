import { ICommand } from '@nestjs/cqrs';

export class CreateUserCommand implements ICommand {
  public readonly username: string;
  public readonly password: string;
  public readonly metadata?: object;
  constructor(username: string, password: string, metadata?: object) {
    this.username = username;
    this.password = password;
    this.metadata = metadata;
  }
}
