import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetRolesWithCursorQuery } from '../../../domain/role/query/get-roles-with-cursor.query';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';

@QueryHandler(GetRolesWithCursorQuery)
export class GetRolesWithCursorHandler
  implements IQueryHandler<GetRolesWithCursorQuery>
{
  constructor(
    @Inject(ROLE_REPOSITORY_PROVIDER)
    private readonly repository: IRoleRepository,
  ) {}

  async execute(query: GetRolesWithCursorQuery) {
    return this.repository.getRolesWithCursor(query.limit, query.cursor || '');
  }
}
