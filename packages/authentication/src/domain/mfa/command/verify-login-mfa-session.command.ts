import { ICommand } from '@nestjs/cqrs';

export class VerifyLoginMfaSessionCommand implements ICommand {
  constructor(
    public readonly sessionId: string,
    public readonly otp: string,
  ) {}
}
