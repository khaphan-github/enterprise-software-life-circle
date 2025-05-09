/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { extractTokenFromHeader } from '../../shared/utils/token.util';
import { QueryBus } from '@nestjs/cqrs';
import { IsPublicRoutesQuery } from '../../domain/endpoint/query/is-public-route.query';
import { CanExecRouteQuery } from '../../domain/role/query/can-exec-route.query';
import { AuthConf } from '../conf/auth-config';
import { isTestMode } from '../../shared/utils/dev-mode.utils';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  @Inject() authenticationConfig: AuthConf;

  private readonly logger = new Logger(AccessTokenGuard.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly queryBus: QueryBus,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isTestMode()) {
      this.logger.debug('Test mode, skipping access token validation');
      return true;
    }
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
    const token = extractTokenFromHeader(
      request.headers.authorization,
      this.authenticationConfig.getRbacConf().authTokenType,
    );
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
        secret:
          this.authenticationConfig.getRbacConf().authAccessTokenSecretKey,
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
