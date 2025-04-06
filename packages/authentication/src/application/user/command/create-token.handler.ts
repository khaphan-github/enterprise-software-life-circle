import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { CreateTokenCommand } from '../../../domain/user/command/create-token.command';
import { TokenCreatedEvent } from '../../../domain/user/events/token-created.event';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';

@CommandHandler(CreateTokenCommand)
export class CreateTokenHandler implements ICommandHandler<CreateTokenCommand> {
  @Inject() authenticationConfig: AuthConf;
  @Inject(ROLE_REPOSITORY_PROVIDER)
  private readonly roleRepository: IRoleRepository;
  constructor(
    private readonly eventBus: EventBus,
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
