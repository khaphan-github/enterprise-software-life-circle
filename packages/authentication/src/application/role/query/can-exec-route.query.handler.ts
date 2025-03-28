import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { CanExecRouteQuery } from '../../../domain/role/query/can-exec-route.query';
import { GetRolesByRouteQuery } from '../../../domain/role/query/get-roles-by-route.query';

@QueryHandler(CanExecRouteQuery)
export class CanExecRouteQueryHandler
  implements IQueryHandler<CanExecRouteQuery>
{
  constructor(private readonly queryBus: QueryBus) {}

  /**
   * Current role of user can exec role of route
   * - if role of user matches all roles of route then return true else return false
   * @param query
   */
  async execute(query: CanExecRouteQuery): Promise<boolean> {
    // Fetch roles associated with the route
    const roles = await this.queryBus.execute(
      new GetRolesByRouteQuery(query.route),
    );
    // Filter roles that match
    const matchingRoles = query.userRoles.filter((userRole) =>
      roles.some((routeRole) => routeRole.id == userRole),
    );

    return matchingRoles.length > 0;
  }
}
