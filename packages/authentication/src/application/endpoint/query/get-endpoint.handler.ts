import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { GetEndpointQuery } from '../../../domain/endpoint/query/get-endpoint.query';

@QueryHandler(GetEndpointQuery)
export class GetEndpointQueryHandler
  implements IQueryHandler<GetEndpointQuery>
{
  @Inject(ENDPOINT_REPOSITORY_PROVIDER)
  private readonly repository: IEndpointRepository;

  async execute(query: GetEndpointQuery): Promise<EndpointEntity | null> {
    return this.repository.getEndpoint(query.path, query.method);
  }
}
