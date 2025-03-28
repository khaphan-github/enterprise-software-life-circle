import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET_KEY,
} from '../../../domain/user/const';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { RoleRepository } from '../../../infrastructure/repository/role.repository';
import { TokenCreatedEvent } from '../../../domain/user/events/token-created.event';

@CommandHandler(CreateTokenCommand)
export class CreateTokenHandler implements ICommandHandler<CreateTokenCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly roleRepository: RoleRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: CreateTokenCommand) {
    const userRoles = await this.roleRepository.getRolesByUserId(
      command.userId,
    );
    const userRoleIds = userRoles.map((role) => role?.id);

    // Build jwt token here
    const metadata = {};
    const accessToken = this.jwtService.sign(
      {
        uid: command.userId,
        roles: userRoleIds,
      },
      {
        ...metadata,
        secret: ACCESS_TOKEN_SECRET_KEY,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    );
    const refreshToken = this.jwtService.sign(
      { uid: command.userId },
      {
        ...metadata,
        secret: REFRESH_TOKEN_SECRET_KEY,
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    this.eventBus.publish(new TokenCreatedEvent(refreshToken, accessToken));
    return Promise.resolve({
      accessToken,
      refreshToken,
    });
  }
}
