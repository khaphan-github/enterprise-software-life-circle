import { IQuery } from '@nestjs/cqrs';

export class GetEndpointsQuery implements IQuery {
  constructor(public readonly filter?: string) {}
}
