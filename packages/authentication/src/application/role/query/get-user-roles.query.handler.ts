import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { GetUserRolesQuery } from '../../../domain/role/query/get-user-roles.query';

@QueryHandler(GetUserRolesQuery)
export class GetUserRolesQueryHandler
  implements IQueryHandler<GetUserRolesQuery>
{
  @Inject(ROLE_REPOSITORY_PROVIDER)
  private readonly repository: IRoleRepository;

  async execute(query: GetUserRolesQuery) {
    return this.repository.getUserRoles(query.userId);
  }
}
