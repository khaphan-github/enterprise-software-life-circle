import { nanoid } from 'nanoid';
import { IdGenerator } from './id';

export class BaseEntity {
  // This id can be string / objectid or other id we want.
  id: any;
  createdAt: Date;
  updatedAt: Date;

  constructor() {}

  initId(generator?: IdGenerator) {
    if (!generator) {
      this.id = nanoid(16);
    } else {
      this.id = generator.generateId();
    }
  }

  getId() {
    return this.id;
  }

  setId(id: string) {
    this.id = id;
  }

  setCreateTime() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  setUpdateTime() {
    this.updatedAt = new Date();
  }
}
