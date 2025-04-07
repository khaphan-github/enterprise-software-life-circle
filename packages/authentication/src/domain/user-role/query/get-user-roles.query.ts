import { IQuery } from '@nestjs/cqrs';

export class GetUserRolesQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
