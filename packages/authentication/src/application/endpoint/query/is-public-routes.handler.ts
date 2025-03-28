import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { IsPublicRoutesQuery } from '../../../domain/endpoint/query/is-public-route.query';

// Query to check if a route and method exist

@QueryHandler(IsPublicRoutesQuery)
export class IsPublicRoutesHandler
  implements IQueryHandler<IsPublicRoutesQuery>
{
  constructor(private readonly endpointRepository: EndpointRepository) {}

  async execute(query: IsPublicRoutesQuery): Promise<boolean> {
    const result = await this.endpointRepository.isRouteAndMethodExist(
      query.path,
      query.method,
    );
    return !result;
  }
}
