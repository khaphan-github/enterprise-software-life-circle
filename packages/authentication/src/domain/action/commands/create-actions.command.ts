import { ICommand } from '@nestjs/cqrs';
import { ActionStatus } from '../action-entity';

export interface ICreateActionsCommand {
  name: string;
  description: string;
  status: ActionStatus;
  metadata: Record<string, any>;
}

export class CreateActionsCommand implements ICommand {
  constructor(public readonly actions: ICreateActionsCommand[]) {}
}
