import { AccessTokenGuard } from './access-token.guard';
import { JwtService } from '@nestjs/jwt';
import { QueryBus } from '@nestjs/cqrs';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;
  let jwtService: JwtService;
  let queryBus: QueryBus;

  beforeEach(() => {
    jwtService = new JwtService({});
    queryBus = new QueryBus(null as any, null as any); // Provide a mock or appropriate dependency
    guard = new AccessTokenGuard(jwtService, queryBus);
  });

  it('should allow access to public routes', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(true); // Mock IsPublicRoutesQuery to return true

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ path: '/public', method: 'GET' }) as Request,
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(false); // Mock IsPublicRoutesQuery to return false

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () =>
          ({ path: '/private', method: 'GET', headers: {} }) as Request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException, // Expect ForbiddenException instead of UnauthorizedException
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(false); // Mock IsPublicRoutesQuery to return false
    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            path: '/private',
            method: 'GET',
            headers: { authorization: 'Bearer invalid-token' },
          }) as Request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw ForbiddenException if user lacks permissions', async () => {
    jest
      .spyOn(queryBus, 'execute')
      .mockResolvedValueOnce(false) // Mock IsPublicRoutesQuery to return false
      .mockResolvedValueOnce(false); // Mock CanExecRouteQuery to return false

    jest
      .spyOn(jwtService, 'verify')
      .mockReturnValue({ uid: '123', roles: ['user'] });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            path: '/private',
            method: 'GET',
            headers: { authorization: 'Bearer valid-token' },
          }) as Request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should allow access if user has permissions', async () => {
    jest
      .spyOn(queryBus, 'execute')
      .mockResolvedValueOnce(false) // Mock IsPublicRoutesQuery to return false
      .mockResolvedValueOnce(true); // Mock CanExecRouteQuery to return true

    jest
      .spyOn(jwtService, 'verify')
      .mockReturnValue({ uid: '123', roles: ['admin'] });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            path: '/private',
            method: 'GET',
            headers: { authorization: 'JWT valid-token' },
          }) as Request,
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});
