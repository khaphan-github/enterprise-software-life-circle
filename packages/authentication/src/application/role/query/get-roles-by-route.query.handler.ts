import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RoleRepository } from '../../../infrastructure/repository/role.repository';
import { GetRolesByRouteQuery } from '../../../domain/role/query/get-roles-by-route.query';

@QueryHandler(GetRolesByRouteQuery)
export class GetRolesByRouteQueryHandler
  implements IQueryHandler<GetRolesByRouteQuery>
{
  constructor(private readonly repository: RoleRepository) {}

  async execute(query: GetRolesByRouteQuery) {
    return this.repository.getRolesByRoute(query.route, query.method);
  }
}
