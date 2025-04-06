import { Types } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IdGenerator {
  generateId(): string;
}

export enum IdStrategy {
  Mongo = 'mongo',
  NanoId = 'nanoid',
}
export class MongoIdGenerator implements IdGenerator {
  generateId(): string {
    return new Types.ObjectId().toHexString();
  }
}

export class NanoIdGenerator implements IdGenerator {
  generateId(): string {
    return nanoid(16);
  }
}
