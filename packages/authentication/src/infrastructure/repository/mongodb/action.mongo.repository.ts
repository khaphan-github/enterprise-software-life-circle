import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionEntity } from '../../../domain/action/action-entity';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';
import { Action, ActionDocument } from './schema/action.schema';

@Injectable()
export class ActionMongoRepository implements IActionRepository {
  constructor(
    @InjectModel(Action.name)
    private readonly actionModel: Model<ActionDocument>,
  ) {}
  getActionsByCursor(limit: number, cursor: string): Promise<ActionEntity[]> {
    throw new Error('Method not implemented.');
  }
  createActions(action: ActionEntity[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
  updateActions(action: ActionEntity[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
  deleteActions(actionId: string[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
  findActionById(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  assignActionsToRoles(actionIds: string[], roleIds: string[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
