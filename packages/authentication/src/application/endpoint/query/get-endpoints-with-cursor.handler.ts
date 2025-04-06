import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { GetEndpointsWithCursorQuery } from '../../../domain/endpoint/query/get-endpoints-with-cursor.query';

@QueryHandler(GetEndpointsWithCursorQuery)
export class GetEndpointsWithCursorQueryHandler
  implements IQueryHandler<GetEndpointsWithCursorQuery>
{
  @Inject(ENDPOINT_REPOSITORY_PROVIDER)
  private readonly repository: IEndpointRepository;

  async execute(query: GetEndpointsWithCursorQuery): Promise<EndpointEntity[]> {
    return this.repository.getEndpointsWithCursor(query.limit, query.cursor);
  }
}
