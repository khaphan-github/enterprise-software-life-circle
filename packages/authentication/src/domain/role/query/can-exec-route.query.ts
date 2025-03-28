import { IQuery } from '@nestjs/cqrs';

export class CanExecRouteQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly route: string,
    public readonly method: string,
    public readonly userRoles: string[],
  ) {}
}
