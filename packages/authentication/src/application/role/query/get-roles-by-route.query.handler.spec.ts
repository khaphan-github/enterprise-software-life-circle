import { Test, TestingModule } from '@nestjs/testing';
import { GetRolesByRouteQueryHandler } from './get-roles-by-route.query.handler';
import { GetRolesByRouteQuery } from '../../../domain/role/query/get-roles-by-route.query';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { RoleEntity } from '../../../domain/role/role-entity';

describe('GetRolesByRouteQueryHandler', () => {
  let handler: GetRolesByRouteQueryHandler;
  let repository: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRolesByRouteQueryHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: {
            getRolesByRoute: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetRolesByRouteQueryHandler>(
      GetRolesByRouteQueryHandler,
    );
    repository = module.get(ROLE_REPOSITORY_PROVIDER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully get roles by route', async () => {
      // Arrange
      const route = '/test/route';
      const method = 'GET';
      const query = new GetRolesByRouteQuery(route, method);

      const mockRoles = [
        createTestRole('role1', 'Admin Role'),
        createTestRole('role2', 'User Role'),
      ];

      repository.getRolesByRoute.mockResolvedValue(mockRoles);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(mockRoles);
      expect(repository.getRolesByRoute).toHaveBeenCalledWith(route, method);
    });

    it('should return empty array when no roles found for route', async () => {
      // Arrange
      const route = '/test/route';
      const method = 'GET';
      const query = new GetRolesByRouteQuery(route, method);
      repository.getRolesByRoute.mockResolvedValue([]);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual([]);
      expect(repository.getRolesByRoute).toHaveBeenCalledWith(route, method);
    });

    it('should handle repository error', async () => {
      // Arrange
      const route = '/test/route';
      const method = 'GET';
      const query = new GetRolesByRouteQuery(route, method);
      const error = new Error('Repository error');
      repository.getRolesByRoute.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow('Repository error');
    });
  });
});

function createTestRole(id: string, name: string): RoleEntity {
  const role = new RoleEntity();
  role.setId(id);
  role.name = name;
  role.description = `Description for ${name}`;
  role.status = 'ACTIVE';
  role.metadata = {};
  return role;
}
