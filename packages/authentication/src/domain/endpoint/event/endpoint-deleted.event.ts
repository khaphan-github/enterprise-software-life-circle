import { IEvent } from '@nestjs/cqrs';

export class EndpointEntityDeletedEvent implements IEvent {
  constructor(public readonly endpointIds: string[]) {}
}
