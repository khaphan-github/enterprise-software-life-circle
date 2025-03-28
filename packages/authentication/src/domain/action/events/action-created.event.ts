import { ActionEntity } from '../action-entity';

export class ActionCreatedEvent {
  constructor(public readonly actions: ActionEntity[]) {}
}
