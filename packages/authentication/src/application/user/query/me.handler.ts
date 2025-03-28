/* eslint-disable @typescript-eslint/no-unused-vars */
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { ACCESS_TOKEN_SECRET_KEY } from '../../../domain/user/const';
import { InvalidAccessTokenError } from '../../../domain/user/errors/invalid-access-token.error';
import { MeQuery } from '../../../domain/user/query/me.query';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@QueryHandler(MeQuery)
export class MeHandler implements IQueryHandler<MeQuery> {
  constructor(
    private readonly repository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(MeHandler.name);

  async execute(query: MeQuery) {
    let userId: string = '';
    try {
      const { uid } = await this.jwtService.verifyAsync(query.accessToken, {
        secret: ACCESS_TOKEN_SECRET_KEY,
      });
      userId = uid;
    } catch (e) {
      throw new InvalidAccessTokenError();
    }

    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }
}
