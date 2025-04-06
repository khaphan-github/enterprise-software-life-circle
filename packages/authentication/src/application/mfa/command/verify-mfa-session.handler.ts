import { Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyMfaSessionCommand } from '../../../domain/mfa/command/verify-mfa-session.command';
import { AuthConf } from '../../../infrastructure/conf/auth-config';
import { VerifyMfaCodeNotMatchError } from '../../../domain/mfa/error/verify-mfa-not-match.error';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found-error';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { USER_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';

@CommandHandler(VerifyMfaSessionCommand)
export class VerifyfaSessionHandler
  implements ICommandHandler<VerifyMfaSessionCommand>
{
  @Inject() authenticationConfig: AuthConf;
  @Inject(CACHE_MANAGER) private cacheManager: Cache;
  @Inject(USER_REPOSITORY_PROVIDER)
  private readonly repository: IUserRepository;

  async execute(command: VerifyMfaSessionCommand): Promise<any> {
    const payload = await this.cacheManager.get<{ otp: string; uid: string }>(
      command.sessionId,
    );
    if (!payload || payload.otp !== command.otp) {
      throw new VerifyMfaCodeNotMatchError();
    }

    const user = await this.repository.findUserById(payload.uid);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.mfa) {
      user.mfa.verified = true;
    }
    user.setUpdateTime();

    await this.repository.updateUser(user);
    await this.cacheManager.del(command.sessionId);

    return Promise.resolve(user);
  }
}
