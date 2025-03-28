import { IEvent } from '@nestjs/cqrs';
import { EndpointEntity } from '../endpoint-entity';

export class EndpointEntityUpdatedEvent implements IEvent {
  constructor(public readonly endpoints: EndpointEntity[]) {}
}
