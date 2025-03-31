import { IQuery } from '@nestjs/cqrs';
import { UserType } from '../user-entity';

export class LoginQuery implements IQuery {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly type: string = UserType.PASSWORD,
  ) {}
}
