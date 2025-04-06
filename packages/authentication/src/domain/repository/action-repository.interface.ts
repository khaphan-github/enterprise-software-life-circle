import { ActionEntity } from '../action/action-entity';

export interface IActionRepository {
  createActions(action: ActionEntity[]): Promise<any>;
  updateActions(action: ActionEntity[]): Promise<any>;
  deleteActions(actionId: string[]): Promise<any>;
  findActionById(id: string): Promise<any>;
  assignActionsToRoles(actionIds: string[], roleIds: string[]): Promise<any>;
  getActionsByCursor(limit: number, cursor: string): Promise<ActionEntity[]>;
}
