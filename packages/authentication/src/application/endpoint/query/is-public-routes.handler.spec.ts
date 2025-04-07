import { Test, TestingModule } from '@nestjs/testing';
import { IsPublicRoutesHandler } from './is-public-routes.handler';
import { IsPublicRoutesQuery } from '../../../domain/endpoint/query/is-public-route.query';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { ENDPOINT_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';

describe('IsPublicRoutesHandler', () => {
  let handler: IsPublicRoutesHandler;
  let repository: jest.Mocked<IEndpointRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsPublicRoutesHandler,
        {
          provide: ENDPOINT_REPOSITORY_PROVIDER,
          useValue: {
            isRouteAndMethodExist: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<IsPublicRoutesHandler>(IsPublicRoutesHandler);
    repository = module.get(ENDPOINT_REPOSITORY_PROVIDER);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return true when route does not exist (public route)', async () => {
      // Arrange
      const query = new IsPublicRoutesQuery('/api/public', 'GET');
      repository.isRouteAndMethodExist.mockResolvedValue(false);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(true);
      expect(repository.isRouteAndMethodExist).toHaveBeenCalledWith(
        '/api/public',
        'GET',
      );
    });

    it('should return false when route exists (private route)', async () => {
      // Arrange
      const query = new IsPublicRoutesQuery('/api/private', 'POST');
      repository.isRouteAndMethodExist.mockResolvedValue(true);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(false);
      expect(repository.isRouteAndMethodExist).toHaveBeenCalledWith(
        '/api/private',
        'POST',
      );
    });

    it('should handle repository error', async () => {
      // Arrange
      const query = new IsPublicRoutesQuery('/api/test', 'GET');
      const error = new Error('Repository error');
      repository.isRouteAndMethodExist.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow('Repository error');
    });

    it('should handle different HTTP methods', async () => {
      // Arrange
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      repository.isRouteAndMethodExist.mockResolvedValue(false);

      // Act & Assert
      for (const method of methods) {
        const query = new IsPublicRoutesQuery('/api/test', method);
        const result = await handler.execute(query);
        expect(result).toBe(true);
        expect(repository.isRouteAndMethodExist).toHaveBeenCalledWith(
          '/api/test',
          method,
        );
      }
    });

    it('should handle different path formats', async () => {
      // Arrange
      const paths = ['/api/test', '/api/v1/users', '/api/v2/products/123'];
      repository.isRouteAndMethodExist.mockResolvedValue(false);

      // Act & Assert
      for (const path of paths) {
        const query = new IsPublicRoutesQuery(path, 'GET');
        const result = await handler.execute(query);
        expect(result).toBe(true);
        expect(repository.isRouteAndMethodExist).toHaveBeenCalledWith(
          path,
          'GET',
        );
      }
    });
  });
});
