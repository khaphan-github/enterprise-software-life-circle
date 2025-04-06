import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EndpointRepositoryProvider } from '../../../infrastructure/providers/repository/repository-providers';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { IsPublicRoutesQuery } from '../../../domain/endpoint/query/is-public-route.query';

@QueryHandler(IsPublicRoutesQuery)
export class IsPublicRoutesHandler
  implements IQueryHandler<IsPublicRoutesQuery>
{
  @Inject(EndpointRepositoryProvider)
  private readonly repository: IEndpointRepository;

  async execute(query: IsPublicRoutesQuery): Promise<boolean> {
    const result = await this.repository.isRouteAndMethodExist(
      query.path,
      query.method,
    );
    return !result;
  }
}
