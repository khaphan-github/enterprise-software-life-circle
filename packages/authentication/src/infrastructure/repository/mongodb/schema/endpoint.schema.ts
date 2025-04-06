import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EndpointDocument = HydratedDocument<Endpoint>;

@Schema({ timestamps: true })
export class Endpoint {
  @Prop({ required: true, unique: true })
  path: string;

  @Prop({ required: true })
  method: string;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  @Prop({ required: true })
  status: string;
}

export const EndpointSchema = SchemaFactory.createForClass(Endpoint);
