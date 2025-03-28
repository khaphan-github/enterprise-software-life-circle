import { ActionEntity } from '../action-entity';

export class UpdateActionsCommand {
  constructor(public readonly actions: ActionEntity[]) {}
}
