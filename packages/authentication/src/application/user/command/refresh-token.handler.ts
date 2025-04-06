import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../../../domain/user/user-entity';
import { RefreshTokenCommand } from '../../../domain/user/command/refresh-token.command';
import { JwtService } from '@nestjs/jwt';
import { InvalidRefreshTOkenError } from '../../../domain/user/errors/invalid-refresh-token.error';
import { Inject, Logger } from '@nestjs/common';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { UserRepositoryProvider } from '../../../infrastructure/providers/repository/repository-providers';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  @Inject() authenticationConfig: AuthConf;
  @Inject(UserRepositoryProvider) private readonly repository: IUserRepository;

  constructor(
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
  ) {}

  private readonly logger = new Logger(RefreshTokenHandler.name);
  async execute(command: RefreshTokenCommand): Promise<UserEntity> {
    const { refreshToken } = command;

    // Check refresth toekn
    let userId: string = '';
    try {
      const { uid } = await this.jwtService.verifyAsync(refreshToken, {
        secret:
          this.authenticationConfig.getRbacConf().authRefreshTokenSecretKey,
      });
      userId = uid;
    } catch (error) {
      this.logger.error('Error verifying refresh token', error);
      throw new InvalidRefreshTOkenError();
    }

    const isExist = await this.repository.isExistUserById(userId);
    if (!isExist) {
      throw new UserNotFoundError();
    }

    return this.commandBus.execute(new CreateTokenCommand(userId));
  }
}
