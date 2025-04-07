import { Test, TestingModule } from '@nestjs/testing';
import { CanExecRouteQueryHandler } from './can-exec-route.query.handler';
import { CanExecRouteQuery } from '../../../domain/role/query/can-exec-route.query';
import { QueryBus } from '@nestjs/cqrs';
import { RoleEntity } from '../../../domain/role/role-entity';

describe('CanExecRouteQueryHandler', () => {
  let handler: CanExecRouteQueryHandler;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanExecRouteQueryHandler,
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CanExecRouteQueryHandler>(CanExecRouteQueryHandler);
    queryBus = module.get(QueryBus);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return true when user has matching role for route', async () => {
      // Arrange
      const userId = 'user1';
      const route = '/test/route';
      const method = 'GET';
      const userRoles = ['role1', 'role2'];
      const query = new CanExecRouteQuery(userId, route, method, userRoles);

      const mockRoles = [
        createTestRole('role1', 'Admin Role'),
        createTestRole('role2', 'User Role'),
      ];

      queryBus.execute.mockResolvedValue(mockRoles);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(true);
      expect(queryBus.execute).toHaveBeenCalled();
    });

    it('should return false when user has no matching role for route', async () => {
      // Arrange
      const userId = 'user1';
      const route = '/test/route';
      const method = 'GET';
      const userRoles = ['role3', 'role4'];
      const query = new CanExecRouteQuery(userId, route, method, userRoles);

      const mockRoles = [
        createTestRole('role1', 'Admin Role'),
        createTestRole('role2', 'User Role'),
      ];

      queryBus.execute.mockResolvedValue(mockRoles);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(false);
      expect(queryBus.execute).toHaveBeenCalled();
    });

    it('should return false when no roles are found for route', async () => {
      // Arrange
      const userId = 'user1';
      const route = '/test/route';
      const method = 'GET';
      const userRoles = ['role1', 'role2'];
      const query = new CanExecRouteQuery(userId, route, method, userRoles);

      queryBus.execute.mockResolvedValue([]);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(false);
      expect(queryBus.execute).toHaveBeenCalled();
    });

    it('should handle query bus error', async () => {
      // Arrange
      const userId = 'user1';
      const route = '/test/route';
      const method = 'GET';
      const userRoles = ['role1', 'role2'];
      const query = new CanExecRouteQuery(userId, route, method, userRoles);
      const error = new Error('Query bus error');
      queryBus.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow('Query bus error');
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
