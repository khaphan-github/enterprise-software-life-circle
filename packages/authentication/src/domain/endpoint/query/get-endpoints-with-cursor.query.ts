import { IQuery } from '@nestjs/cqrs';

export class GetEndpointsWithCursorQuery implements IQuery {
  constructor(
    public readonly limit: number,
    public readonly cursor?: string,
  ) {}
}
