import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../../../domain/user/user-entity';
import { RefreshTokenCommand } from '../../../domain/user/command/refresh-token.command';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_SECRET_KEY } from '../../../domain/user/const';
import { InvalidRefreshTOkenError } from '../../../domain/user/errors/invalid-refresh-token.error';
import { Logger } from '@nestjs/common';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly repository: UserRepository,
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
        secret: REFRESH_TOKEN_SECRET_KEY,
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
