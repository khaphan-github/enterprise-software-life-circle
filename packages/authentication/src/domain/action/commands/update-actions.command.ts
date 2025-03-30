import { ActionStatus } from '../action-entity';

export class IUpdateActionsCommand {
  id: string;
  name: string;
  description: string;
  status: ActionStatus;
  metadata: Record<string, any>;
}
export class UpdateActionsCommand {
  constructor(public readonly actions: IUpdateActionsCommand[]) {}
}
