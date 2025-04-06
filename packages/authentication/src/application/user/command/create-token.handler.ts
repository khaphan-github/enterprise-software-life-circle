import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { RoleRepository } from '../../../infrastructure/repository/postgres/role.repository';
import { TokenCreatedEvent } from '../../../domain/user/events/token-created.event';
import { AuthConf } from '../../../configurations/auth-config';

@CommandHandler(CreateTokenCommand)
export class CreateTokenHandler implements ICommandHandler<CreateTokenCommand> {
  @Inject() authenticationConfig: AuthConf;
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
    const {
      authAccessTokenExpiresIn,
      authRefreshTokenExpiresIn,
      authAccessTokenSecretKey,
      authRefreshTokenSecretKey,
    } = this.authenticationConfig.getRbacConf();
    const accessToken = this.jwtService.sign(
      {
        uid: command.userId,
        roles: userRoleIds,
      },
      {
        ...metadata,
        secret: authAccessTokenSecretKey,
        expiresIn: authAccessTokenExpiresIn,
      },
    );
    const refreshToken = this.jwtService.sign(
      { uid: command.userId },
      {
        ...metadata,
        secret: authRefreshTokenSecretKey,
        expiresIn: authRefreshTokenExpiresIn,
      },
    );

    this.eventBus.publish(new TokenCreatedEvent(refreshToken, accessToken));
    return Promise.resolve({
      accessToken,
      refreshToken,
    });
  }
}
