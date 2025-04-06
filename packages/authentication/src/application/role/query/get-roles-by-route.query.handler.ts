import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RoleRepositoryProvider } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { GetRolesByRouteQuery } from '../../../domain/role/query/get-roles-by-route.query';

@QueryHandler(GetRolesByRouteQuery)
export class GetRolesByRouteQueryHandler
  implements IQueryHandler<GetRolesByRouteQuery>
{
  @Inject(RoleRepositoryProvider) private readonly repository: IRoleRepository;

  async execute(query: GetRolesByRouteQuery) {
    return this.repository.getRolesByRoute(query.route, query.method);
  }
}
