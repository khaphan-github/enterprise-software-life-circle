import { IEvent } from '@nestjs/cqrs';
import { EndpointEntity } from '../endpoint-entity';

export class EndpointEntityDeletedEvent implements IEvent {
  constructor(public readonly endpoints: EndpointEntity[]) {}
}
