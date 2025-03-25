import { IQuery } from '@nestjs/cqrs';

export class LoginQuery implements IQuery {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {}
}
