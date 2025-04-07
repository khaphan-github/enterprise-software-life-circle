import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserRolesQuery } from '../../../domain/user-role/query/get-user-roles.query';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { Inject } from '@nestjs/common';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { RoleEntity } from '../../../domain/role/role-entity';

@QueryHandler(GetUserRolesQuery)
export class GetUserRolesHandler implements IQueryHandler<GetUserRolesQuery> {
  constructor(
    @Inject(ROLE_REPOSITORY_PROVIDER)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(query: GetUserRolesQuery): Promise<RoleEntity[] | null> {
    return this.roleRepository.getUserRoles(query.userId);
  }
}
