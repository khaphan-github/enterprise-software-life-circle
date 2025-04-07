import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ActionEntity,
  ActionStatus,
} from '../../../domain/action/action-entity';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';
import { Action, ActionDocument } from './schema/action.schema';
import { MongoIdGenerator } from '../../../domain/entity/id';

@Injectable()
export class ActionMongoRepository implements IActionRepository {
  private readonly idGenerator: MongoIdGenerator;

  constructor(
    @InjectModel(Action.name)
    private readonly actionModel: Model<ActionDocument>,
  ) {
    this.idGenerator = new MongoIdGenerator();
  }

  private toEntity(doc: ActionDocument | null): ActionEntity | null {
    if (!doc) return null;
    const obj = doc.toObject();
    const entity = new ActionEntity();
    entity.initId(this.idGenerator);
    entity.id = obj._id.toString(); // Override with stored ID
    entity.name = obj.name;
    entity.description = obj.description;
    entity.status = obj.status as ActionStatus;
    entity.metadata = obj.metadata || {};
    entity.roles = obj.roles || [];
    const timestamps = obj as unknown as { createdAt?: Date; updatedAt?: Date };
    if (timestamps.createdAt) entity.setCreateTime();
    if (timestamps.updatedAt) entity.setUpdateTime();
    return entity;
  }

  async getActionsByCursor(
    limit: number,
    cursor: string,
  ): Promise<ActionEntity[]> {
    const query = cursor ? { _id: { $gt: cursor } } : {};
    const actions = await this.actionModel.find(query).limit(limit).exec();
    return actions.map((action) => this.toEntity(action)!);
  }

  async createActions(actions: ActionEntity[]): Promise<ActionEntity[]> {
    const docs = actions.map((action) => ({
      _id: action.id,
      name: action.name,
      description: action.description,
      status: action.status,
      metadata: action.metadata,
      roles: action.roles,
    }));
    const createdActions = await this.actionModel.insertMany(docs);
    return createdActions.map((action) => this.toEntity(action)!);
  }

  async updateActions(actions: ActionEntity[]): Promise<ActionEntity[]> {
    const updatePromises = actions.map(async (action) => {
      const update = {
        name: action.name,
        description: action.description,
        status: action.status,
        metadata: action.metadata,
        roles: action.roles,
      };
      const doc = await this.actionModel
        .findByIdAndUpdate(action.id, update, { new: true })
        .exec();
      return this.toEntity(doc);
    });
    const updatedActions = await Promise.all(updatePromises);
    return updatedActions.filter(
      (action): action is ActionEntity => action !== null,
    );
  }

  async deleteActions(actionIds: string[]): Promise<{ deletedCount: number }> {
    const result = await this.actionModel
      .deleteMany({ _id: { $in: actionIds } })
      .exec();
    return { deletedCount: result.deletedCount || 0 };
  }

  async findActionById(id: string): Promise<ActionEntity | null> {
    const action = await this.actionModel.findById(id).exec();
    return this.toEntity(action);
  }

  async assignActionsToRoles(
    actionIds: string[],
    roleIds: string[],
  ): Promise<{ modifiedCount: number }> {
    const result = await this.actionModel
      .updateMany(
        { _id: { $in: actionIds } },
        { $addToSet: { roles: { $each: roleIds } } },
      )
      .exec();
    return { modifiedCount: result.modifiedCount || 0 };
  }

  async createAction(action: ActionEntity): Promise<ActionEntity> {
    if (!action.id) {
      action.initId(this.idGenerator);
    }
    const doc = await this.actionModel.create({
      _id: action.id,
      name: action.name,
      description: action.description,
      status: action.status,
      metadata: action.metadata,
      roles: action.roles,
    });
    return this.toEntity(doc)!;
  }
}
