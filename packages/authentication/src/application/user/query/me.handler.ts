/* eslint-disable @typescript-eslint/no-unused-vars */
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { InvalidAccessTokenError } from '../../../domain/user/errors/invalid-access-token.error';
import { MeQuery } from '../../../domain/user/query/me.query';
import { JwtService } from '@nestjs/jwt';
import { Inject, Logger } from '@nestjs/common';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { USER_REPOSITORY_PROVIDER } from 'src/infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';

@QueryHandler(MeQuery)
export class MeHandler implements IQueryHandler<MeQuery> {
  @Inject() authenticationConfig: AuthConf;
  constructor(
    @Inject(USER_REPOSITORY_PROVIDER)
    private readonly repository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(MeHandler.name);

  async execute(query: MeQuery) {
    let userId: string = '';
    try {
      const { uid } = await this.jwtService.verifyAsync(query.accessToken, {
        secret:
          this.authenticationConfig.getRbacConf().authAccessTokenSecretKey,
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
