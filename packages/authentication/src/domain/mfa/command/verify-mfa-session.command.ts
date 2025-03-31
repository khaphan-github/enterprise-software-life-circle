import { ICommand } from '@nestjs/cqrs';

export class VerifyMfaSessionCommand implements ICommand {
  constructor(
    public readonly sessionId: string,
    public readonly otp: string,
  ) {}
}
