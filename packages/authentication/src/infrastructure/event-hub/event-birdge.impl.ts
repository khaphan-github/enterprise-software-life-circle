import { Injectable, Logger } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';
import { EventHub } from 'src/domain/event-hub/event.hub';

@Injectable()
export class EventBridgeImpl implements EventHub {
  private readonly Logger = new Logger(EventBridgeImpl.name);
  constructor() {}
  publish(event: IEvent) {
    // TODO implement event publishing to external service
    this.Logger.log('Event published to EventBridge', event);
  }
}
