import { Test, TestingModule } from '@nestjs/testing';
import { FindActionByIdHandler } from './find-action-by-id.handler';
import { ACTION_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { FindActionByIdQuery } from '../../../domain/action/queries/find-action-by-id.query';
import { ActionEntity } from '../../../domain/action/action-entity';

describe('FindActionByIdHandler', () => {
  let handler: FindActionByIdHandler;
  let repositoryMock: any;

  beforeEach(async () => {
    // Create mock for repository dependency
    repositoryMock = {
      findActionById: jest.fn(),
    };

    // Create a test module with our handler and mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindActionByIdHandler,
        {
          provide: ACTION_REPOSITORY_PROVIDER,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    handler = module.get<FindActionByIdHandler>(FindActionByIdHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return action when found by id', async () => {
      // Arrange
      const actionId = 'existing-action-id';
      const mockAction = new ActionEntity();
      mockAction.setId(actionId);
      mockAction.name = 'Test Action';
      mockAction.description = 'Test Description';
      mockAction.metadata = { key: 'value' };

      repositoryMock.findActionById.mockResolvedValueOnce(mockAction);

      const query = new FindActionByIdQuery(actionId);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(mockAction);
      expect(repositoryMock.findActionById).toHaveBeenCalledWith(actionId);
    });

    it('should return null when action is not found', async () => {
      // Arrange
      const actionId = 'non-existing-action-id';
      repositoryMock.findActionById.mockResolvedValueOnce(null);

      const query = new FindActionByIdQuery(actionId);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeNull();
      expect(repositoryMock.findActionById).toHaveBeenCalledWith(actionId);
    });

    it('should propagate error when repository throws', async () => {
      // Arrange
      const actionId = 'error-action-id';
      repositoryMock.findActionById.mockRejectedValueOnce(
        new Error('Database connection error'),
      );

      const query = new FindActionByIdQuery(actionId);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(
        'Database connection error',
      );
      expect(repositoryMock.findActionById).toHaveBeenCalledWith(actionId);
    });

    it('should handle empty or undefined ID', async () => {
      // Arrange
      const emptyId = '';
      repositoryMock.findActionById.mockResolvedValueOnce(null);

      const query = new FindActionByIdQuery(emptyId);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeNull();
      expect(repositoryMock.findActionById).toHaveBeenCalledWith(emptyId);
    });
  });
});
