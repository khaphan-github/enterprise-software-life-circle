import { nanoid } from 'nanoid';

export class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor() {}

  initId() {
    this.id = nanoid(32);
  }

  getId() {
    return this.id;
  }

  setCreateTime() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  setUpdateTime() {
    this.updatedAt = new Date();
  }
}
