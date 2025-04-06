import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RoleRepository } from '../../../infrastructure/repository/postgres/role.repository';
import { GetUserRolesQuery } from '../../../domain/role/query/get-user-roles.query';

@QueryHandler(GetUserRolesQuery)
export class GetUserRolesQueryHandler
  implements IQueryHandler<GetUserRolesQuery>
{
  constructor(private readonly repository: RoleRepository) {}

  async execute(query: GetUserRolesQuery) {
    return this.repository.getUserRoles(query.userId);
  }
}
