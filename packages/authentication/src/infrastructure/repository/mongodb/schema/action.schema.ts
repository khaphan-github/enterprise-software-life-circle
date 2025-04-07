import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ActionStatus } from '../../../../domain/action/action-entity';

export type ActionDocument = HydratedDocument<Action>;

@Schema({ timestamps: true })
export class Action {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object, required: false, default: {} })
  metadata: Record<string, any>;

  @Prop({ required: true, enum: Object.values(ActionStatus), index: true })
  status: string;

  @Prop({ type: [String], default: [], index: true })
  roles: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const ActionSchema = SchemaFactory.createForClass(Action);

// Create compound indexes
ActionSchema.index({ name: 1, status: 1 });
