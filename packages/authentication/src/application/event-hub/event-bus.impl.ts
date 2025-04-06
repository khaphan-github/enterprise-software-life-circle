import { Inject, Injectable } from '@nestjs/common';
import { EventBus, IEvent } from '@nestjs/cqrs';
import { EventHub } from 'src/domain/event-hub/event.hub';

@Injectable()
export class EventBusImpl implements EventHub {
  @Inject() private readonly eventBus: EventBus;
  async publish(event: IEvent): Promise<void> {
    this.eventBus.publish(event);
    return Promise.resolve();
  }
}
