import { nanoid } from 'nanoid';

export class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor() {}

  initId(size: number = 16) {
    this.id = nanoid(size);
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
