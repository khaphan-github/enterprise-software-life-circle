import { ICommand } from '@nestjs/cqrs';
import { ResetPasswordMethod } from '../user-entity';

export class RequestPasswordResetCommand implements ICommand {
  constructor(
    public readonly address: string,
    public readonly method: ResetPasswordMethod,
  ) {}
}
