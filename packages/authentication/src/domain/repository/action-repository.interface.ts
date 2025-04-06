import { ActionEntity } from '../action/action-entity';

export interface IActionRepository {
  createActions(actions: ActionEntity[]): Promise<ActionEntity[]>;
  updateActions(actions: ActionEntity[]): Promise<ActionEntity[]>;
  deleteActions(actionIds: string[]): Promise<void>;
  findActionById(id: string): Promise<ActionEntity | null>;
  getActionsByCursor(cursor: string, limit: number): Promise<ActionEntity[]>;
  assignActionsToRoles(actionIds: string[], roleIds: string[]): Promise<void>;
}
