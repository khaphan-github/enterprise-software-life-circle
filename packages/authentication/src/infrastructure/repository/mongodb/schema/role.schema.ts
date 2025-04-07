import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: Object, required: false })
  metadata?: object;

  @Prop({ type: [String], default: [] })
  actions: string[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
