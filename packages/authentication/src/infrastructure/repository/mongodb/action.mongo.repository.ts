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

  async getActionsByCursor(
    limit: number,
    cursor: string,
  ): Promise<ActionEntity[]> {
    const query = cursor ? { _id: { $gt: cursor } } : {};
    const actions = await this.actionModel.find(query).limit(limit).exec();
    return actions.map((action) => action.toObject() as any);
  }

  async createActions(actions: ActionEntity[]): Promise<any> {
    const createdActions = await this.actionModel.insertMany(actions);
    return createdActions.map((action) => action.toObject());
  }

  async updateActions(actions: ActionEntity[]): Promise<any> {
    const updatePromises = actions.map((action) =>
      this.actionModel.updateOne({ _id: action.id }, action).exec(),
    );
    await Promise.all(updatePromises);
    return { success: true };
  }

  async deleteActions(actionIds: string[]): Promise<any> {
    const result = await this.actionModel
      .deleteMany({ _id: { $in: actionIds } })
      .exec();
    return { deletedCount: result.deletedCount };
  }

  async findActionById(id: string): Promise<ActionEntity | null> {
    const action = await this.actionModel.findById(id).exec();
    return action ? (action.toObject() as any) : null;
  }

  async assignActionsToRoles(
    actionIds: string[],
    roleIds: string[],
  ): Promise<any> {
    const result = await this.actionModel
      .updateMany(
        { _id: { $in: actionIds } },
        { $addToSet: { roles: { $each: roleIds } } },
      )
      .exec();
    return { modifiedCount: result.modifiedCount };
  }
}
