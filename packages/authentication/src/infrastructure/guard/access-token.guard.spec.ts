/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { AccessTokenGuard } from './access-token.guard';
import { JwtService } from '@nestjs/jwt';
import { QueryBus } from '@nestjs/cqrs';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces';
import { AuthConf } from '../../configurations/auth-config';

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;
  let jwtService: JwtService;
  let queryBus: QueryBus;
  let authConfig: AuthConf;

  beforeEach(() => {
    jwtService = new JwtService({});
    const mockModuleRef = {} as any; // Mock ModuleRef
    queryBus = new QueryBus(mockModuleRef);
    authConfig = {
      getRbacConf: jest.fn().mockReturnValue({
        authAccessTokenSecretKey: 'test-secret',
        authTokenType: 'Bearer',
      }),
    } as unknown as AuthConf;

    guard = new AccessTokenGuard(jwtService, queryBus);
    guard.authenticationConfig = authConfig;
  });

  it('should allow access to public routes', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(true);

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          path: '/public-route',
          method: 'GET',
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(false);

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          path: '/protected-route',
          method: 'GET',
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(false);
    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          path: '/protected-route',
          method: 'GET',
          headers: {
            authorization: 'Bearer invalid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw ForbiddenException if user lacks permissions', async () => {
    jest
      .spyOn(queryBus, 'execute')
      .mockResolvedValueOnce(false) // Not a public route
      .mockResolvedValueOnce(false); // Cannot execute route

    jest.spyOn(jwtService, 'verify').mockReturnValue({
      uid: 'user-id',
      roles: ['user'],
    });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          path: '/protected-route',
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow access if user has permissions', async () => {
    jest
      .spyOn(queryBus, 'execute')
      .mockResolvedValueOnce(false) // Not a public route
      .mockResolvedValueOnce(true); // Can execute route

    jest.spyOn(jwtService, 'verify').mockReturnValue({
      uid: 'user-id',
      roles: ['admin'],
    });

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          path: '/protected-route',
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token',
          },
          user: {},
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});
