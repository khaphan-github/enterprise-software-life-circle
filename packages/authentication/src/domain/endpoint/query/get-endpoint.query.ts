import { IQuery } from '@nestjs/cqrs';

export class GetEndpointQuery implements IQuery {
  constructor(
    public readonly path: string,
    public readonly method: string,
  ) {}
}
