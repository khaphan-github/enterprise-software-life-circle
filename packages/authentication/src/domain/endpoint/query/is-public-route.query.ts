import { IQuery } from '@nestjs/cqrs';

export class IsPublicRoutesQuery implements IQuery {
  constructor(
    public readonly path: string,
    public readonly method: string,
  ) {}
}
