import { Injectable } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';
import { EventHub } from '../../domain/event-hub/event.hub';

@Injectable()
export class EventKafkaImpl implements EventHub {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async publish(event: IEvent): Promise<void> {
    // TODO implement event publishing to Kafka
    return Promise.resolve();
  }
}
