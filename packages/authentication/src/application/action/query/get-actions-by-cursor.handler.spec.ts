import { Test, TestingModule } from '@nestjs/testing';
import { GetActionsByCursorHandler } from './get-actions-by-cursor.handler';
import { ACTION_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { GetActionsByCursorQuery } from '../../../domain/action/queries/get-actions-by-cursor.query';
import { ActionEntity } from '../../../domain/action/action-entity';

describe('GetActionsByCursorHandler', () => {
  let handler: GetActionsByCursorHandler;
  let repositoryMock: any;

  beforeEach(async () => {
    // Create mock for repository dependency
    repositoryMock = {
      getActionsByCursor: jest.fn(),
    };

    // Create a test module with our handler and mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetActionsByCursorHandler,
        {
          provide: ACTION_REPOSITORY_PROVIDER,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    handler = module.get<GetActionsByCursorHandler>(GetActionsByCursorHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return actions when found with cursor pagination', async () => {
      // Arrange
      const limit = 10;
      const cursor = 'some-cursor-value';

      const mockActions = [
        createMockAction('action-1', 'Action 1'),
        createMockAction('action-2', 'Action 2'),
        createMockAction('action-3', 'Action 3'),
      ];

      repositoryMock.getActionsByCursor.mockResolvedValueOnce(mockActions);

      const query = new GetActionsByCursorQuery(limit, cursor);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(mockActions);
      expect(result).toHaveLength(3);
      expect(repositoryMock.getActionsByCursor).toHaveBeenCalledWith(
        limit,
        cursor,
      );
    });

    it('should return an empty array when no actions found', async () => {
      // Arrange
      const limit = 10;
      const cursor = 'empty-cursor';

      repositoryMock.getActionsByCursor.mockResolvedValueOnce([]);

      const query = new GetActionsByCursorQuery(limit, cursor);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual([]);
      expect(repositoryMock.getActionsByCursor).toHaveBeenCalledWith(
        limit,
        cursor,
      );
    });

    it('should handle undefined cursor value', async () => {
      // Arrange
      const limit = 10;
      const cursor: any = undefined;

      const mockActions = [createMockAction('action-1', 'First Action')];
      repositoryMock.getActionsByCursor.mockResolvedValueOnce(mockActions);

      const query = new GetActionsByCursorQuery(limit, cursor);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(mockActions);
      expect(repositoryMock.getActionsByCursor).toHaveBeenCalledWith(
        limit,
        undefined,
      );
    });

    it('should use default limit when limit is not provided', async () => {
      // Arrange
      const limit: any = undefined;
      const cursor = 'some-cursor';

      const mockActions = [createMockAction('action-1', 'Action 1')];
      repositoryMock.getActionsByCursor.mockResolvedValueOnce(mockActions);

      const query = new GetActionsByCursorQuery(limit, cursor);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(mockActions);
      expect(repositoryMock.getActionsByCursor).toHaveBeenCalledWith(
        undefined,
        cursor,
      );
    });

    it('should propagate error when repository throws', async () => {
      // Arrange
      const limit = 10;
      const cursor = 'error-cursor';
      repositoryMock.getActionsByCursor.mockRejectedValueOnce(
        new Error('Database connection error'),
      );

      const query = new GetActionsByCursorQuery(limit, cursor);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(
        'Database connection error',
      );
      expect(repositoryMock.getActionsByCursor).toHaveBeenCalledWith(
        limit,
        cursor,
      );
    });
  });
});

// Helper function to create mock actions for testing
function createMockAction(id: string, name: string): ActionEntity {
  const action = new ActionEntity();
  action.setId(id);
  action.name = name;
  action.description = `Description for ${name}`;
  action.metadata = { testKey: id };
  return action;
}
