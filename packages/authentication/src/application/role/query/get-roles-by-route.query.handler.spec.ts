/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { GetRolesByRouteQueryHandler } from './get-roles-by-route.query.handler';
import { RoleRepository } from '../../../infrastructure/repository/role.repository';
import { GetRolesByRouteQuery } from '../../../domain/role/query/get-roles-by-route.query';

describe('GetRolesByRouteQueryHandler', () => {
  let handler: GetRolesByRouteQueryHandler;
  let repository: RoleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRolesByRouteQueryHandler,
        {
          provide: RoleRepository,
          useValue: {
            getRolesByRoute: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetRolesByRouteQueryHandler>(
      GetRolesByRouteQueryHandler,
    );
    repository = module.get<RoleRepository>(RoleRepository);
  });

  it('should return roles for a given route', async () => {
    const roles: any = [{ id: 'role1' }, { id: 'role2' }];
    jest.spyOn(repository, 'getRolesByRoute').mockResolvedValue(roles);

    const query = new GetRolesByRouteQuery('/test-route', 'GET');
    const result = await handler.execute(query);

    expect(result).toEqual(roles);
    expect(repository.getRolesByRoute).toHaveBeenCalledWith(
      '/test-route',
      'GET',
    );
  });
});
