import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { EndpointRepository } from '../../../infrastructure/repository/postgres/endpoint.repository';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { GetEndpointsWithCursorQuery } from '../../../domain/endpoint/query/get-endpoints-with-cursor.query';

// Query handler for getting a list of endpoints with cursor pagination
@QueryHandler(GetEndpointsWithCursorQuery)
export class GetEndpointsWithCursorQueryHandler
  implements IQueryHandler<GetEndpointsWithCursorQuery>
{
  constructor(private readonly repository: EndpointRepository) {}

  async execute(query: GetEndpointsWithCursorQuery): Promise<EndpointEntity[]> {
    return this.repository.getEndpointsWithCursor(query.limit, query.cursor);
  }
}
