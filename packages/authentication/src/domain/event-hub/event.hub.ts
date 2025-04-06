import { IEvent } from '@nestjs/cqrs';

export interface EventHub {
  /**
   * TODO implemnt public event to external service
   * @param event
   */
  publish(event: IEvent): any;
}
