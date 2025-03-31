import { IEvent } from '@nestjs/cqrs';

export class SendSMSCodeEvent implements IEvent {
  constructor(
    public readonly phone: string,
    public readonly code: string,
  ) {}
}
