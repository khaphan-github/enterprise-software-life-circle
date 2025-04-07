import { Test, TestingModule } from '@nestjs/testing';
import { GetUserRolesQueryHandler } from './get-user-roles.query.handler';
import { GetUserRolesQuery } from '../../../domain/role/query/get-user-roles.query';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { RoleEntity } from '../../../domain/role/role-entity';

describe('GetUserRolesQueryHandler', () => {
  let handler: GetUserRolesQueryHandler;
  let repository: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserRolesQueryHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: {
            getUserRoles: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetUserRolesQueryHandler>(GetUserRolesQueryHandler);
    repository = module.get(ROLE_REPOSITORY_PROVIDER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully get user roles', async () => {
      // Arrange
      const userId = 'test-user-id';
      const query = new GetUserRolesQuery(userId);

      const mockRoles = [
        createTestRole('role1', 'Admin Role'),
        createTestRole('role2', 'User Role'),
      ];

      repository.getUserRoles.mockResolvedValue(mockRoles);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(mockRoles);
      expect(repository.getUserRoles).toHaveBeenCalledWith(userId);
    });

    it('should return null when no roles found', async () => {
      // Arrange
      const userId = 'test-user-id';
      const query = new GetUserRolesQuery(userId);
      repository.getUserRoles.mockResolvedValue(null);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeNull();
      expect(repository.getUserRoles).toHaveBeenCalledWith(userId);
    });

    it('should handle repository error', async () => {
      // Arrange
      const userId = 'test-user-id';
      const query = new GetUserRolesQuery(userId);
      const error = new Error('Repository error');
      repository.getUserRoles.mockRejectedValue(error);

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
