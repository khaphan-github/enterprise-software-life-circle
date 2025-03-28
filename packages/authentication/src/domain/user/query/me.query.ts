import { IQuery } from '@nestjs/cqrs';

export class MeQuery implements IQuery {
  constructor(public readonly accessToken: string) {}
}
