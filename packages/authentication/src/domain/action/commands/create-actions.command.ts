import { ActionEntity } from '../action-entity';

export class CreateActionsCommand {
  constructor(public readonly actions: ActionEntity[]) {}
}
