import { IQuery } from '@nestjs/cqrs';

export class GetRolesByRouteQuery implements IQuery {
  constructor(
    public readonly route: string,
    public readonly method: string,
  ) {}
}
