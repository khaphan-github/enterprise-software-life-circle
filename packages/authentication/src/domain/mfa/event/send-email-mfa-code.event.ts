import { IEvent } from '@nestjs/cqrs';

export class SendEmailCodeEvent implements IEvent {
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {}
}
