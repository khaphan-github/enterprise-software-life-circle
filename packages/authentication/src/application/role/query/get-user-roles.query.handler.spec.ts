/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetUserRolesQueryHandler } from './get-user-roles.query.handler';
import { RoleRepository } from '../../../infrastructure/repository/role.repository';
import { GetUserRolesQuery } from '../../../domain/role/query/get-user-roles.query';

describe('GetUserRolesQueryHandler', () => {
  let handler: GetUserRolesQueryHandler;
  let repository: RoleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserRolesQueryHandler,
        {
          provide: RoleRepository,
          useValue: {
            getUserRoles: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetUserRolesQueryHandler>(GetUserRolesQueryHandler);
    repository = module.get<RoleRepository>(RoleRepository);
  });

  it('should return roles for a given user', async () => {
    const roles: any = [{ id: 'role1' }, { id: 'role2' }];
    jest.spyOn(repository, 'getUserRoles').mockResolvedValue(roles);

    const query = new GetUserRolesQuery('user1');
    const result = await handler.execute(query);

    expect(result).toEqual(roles);
    expect(repository.getUserRoles).toHaveBeenCalledWith('user1');
  });
});
