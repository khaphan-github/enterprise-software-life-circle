/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { extractTokenFromHeader } from '../../shared/utils/token.util';
import { ACCESS_TOKEN_SECRET_KEY } from '../../domain/user/const';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    // Iif request to path not in config - this is in publci routes dont check token
    // if rquest is in priviate route then check current role of user match with role can access routes.
    // If match then continute
    // Else throw error
    const token = extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      // Verify JWT token manually
      const decoded = this.jwtService.verify(token, {
        secret: ACCESS_TOKEN_SECRET_KEY,
      });
      request['user'] = decoded;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
