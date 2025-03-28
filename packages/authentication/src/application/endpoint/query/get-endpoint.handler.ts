import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { EndpointRepository } from '../../../infrastructure/repository/endpoint.repository';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { GetEndpointQuery } from '../../../domain/endpoint/query/get-endpoint.query';

// Query handler for getting a single endpoint by path and method
@QueryHandler(GetEndpointQuery)
export class GetEndpointQueryHandler
  implements IQueryHandler<GetEndpointQuery>
{
  constructor(private readonly repository: EndpointRepository) {}

  async execute(query: GetEndpointQuery): Promise<EndpointEntity | null> {
    return this.repository.getEndpoint(query.path, query.method);
  }
}
