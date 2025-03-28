import { IEvent } from '@nestjs/cqrs';
import { EndpointEntity } from '../endpoint-entity';

export class EndpointEntityCreatedEvent implements IEvent {
  constructor(public readonly endpoints: EndpointEntity[]) {}
}
