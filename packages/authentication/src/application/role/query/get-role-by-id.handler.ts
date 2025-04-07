import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetRoleByIdQuery } from '../../../domain/role/query/get-role-by-id.query';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';

@QueryHandler(GetRoleByIdQuery)
export class GetRoleByIdHandler implements IQueryHandler<GetRoleByIdQuery> {
  constructor(
    @Inject(ROLE_REPOSITORY_PROVIDER)
    private readonly repository: IRoleRepository,
  ) {}

  async execute(query: GetRoleByIdQuery) {
    return this.repository.getRoleById(query.id);
  }
}
