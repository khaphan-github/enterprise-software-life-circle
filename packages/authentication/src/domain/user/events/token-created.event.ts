import { IEvent } from '@nestjs/cqrs';

export class TokenCreatedEvent implements IEvent {
  constructor(
    public readonly refreshToken: string,
    public readonly accessToken: string,
  ) {}
}
