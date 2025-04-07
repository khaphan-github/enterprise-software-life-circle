import { Test, TestingModule } from '@nestjs/testing';
import { GetRoleByIdHandler } from './get-role-by-id.handler';
import { GetRoleByIdQuery } from '../../../domain/role/query/get-role-by-id.query';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { RoleEntity } from '../../../domain/role/role-entity';

describe('GetRoleByIdHandler', () => {
  let handler: GetRoleByIdHandler;
  let repository: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRoleByIdHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: {
            getRoleById: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetRoleByIdHandler>(GetRoleByIdHandler);
    repository = module.get(ROLE_REPOSITORY_PROVIDER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully get a role by ID', async () => {
      // Arrange
      const query = new GetRoleByIdQuery('role-id');
      const mockRole = new RoleEntity();
      mockRole.setId('role-id');
      mockRole.name = 'Test Role';
      mockRole.description = 'Test Description';
      mockRole.status = 'active';
      repository.getRoleById.mockResolvedValue(mockRole);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(mockRole);
      expect(repository.getRoleById).toHaveBeenCalledWith('role-id');
    });

    it('should return null when role is not found', async () => {
      // Arrange
      const query = new GetRoleByIdQuery('non-existent-id');
      repository.getRoleById.mockResolvedValue(null);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeNull();
      expect(repository.getRoleById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle repository error', async () => {
      // Arrange
      const query = new GetRoleByIdQuery('role-id');
      const error = new Error('Repository error');
      repository.getRoleById.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow('Repository error');
    });
  });
});
