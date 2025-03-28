/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { extractTokenFromHeader } from '../../shared/utils/token.util';
import { ACCESS_TOKEN_SECRET_KEY } from '../../domain/user/const';
import { QueryBus } from '@nestjs/cqrs';
import { IsPublicRoutesQuery } from '../../domain/endpoint/query/is-public-route.query';
import { CanExecRouteQuery } from 'src/domain/role/query/can-exec-route.query';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly queryBus: QueryBus,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const currentPath = request.path;
    const currentMethod = request.method;

    /// Is public route
    const isPublicRoutes = await this.queryBus.execute(
      new IsPublicRoutesQuery(currentPath, currentMethod),
    );
    if (isPublicRoutes) {
      return true;
    }

    // Check if the request has an authorization header
    const token = extractTokenFromHeader(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    // Decode the token
    let decoded = {
      uid: '',
      roles: [],
    };
    try {
      // Verify JWT token manually
      decoded = this.jwtService.verify(token, {
        secret: ACCESS_TOKEN_SECRET_KEY,
      });
      request['user'] = decoded;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Can exec route
    const canAccess = await this.queryBus.execute(
      new CanExecRouteQuery(
        decoded['uid'],
        currentPath,
        currentMethod,
        decoded['roles'],
      ),
    );
    if (!canAccess) {
      throw new ForbiddenException(
        'You do not have permission to access this route',
      );
    }

    return true;
  }
}
