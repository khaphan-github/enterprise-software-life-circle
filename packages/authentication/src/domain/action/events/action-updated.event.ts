import { ActionEntity } from '../action-entity';

export class ActionUpdatedEvent {
  constructor(public readonly actions: ActionEntity[]) {}
}
