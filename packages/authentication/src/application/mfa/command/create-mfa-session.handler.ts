import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateMfaSessionCommand } from '../../../domain/mfa/command/create-mfa-session.command';
import { EventBus } from '@nestjs/cqrs';
import { generateRandomNumber } from '../../../shared/utils/random-numer.util';
import { Inject } from '@nestjs/common';
import { AuthConf } from '../../../configurations/auth-config';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { nanoid } from 'nanoid';
import { SendEmailCodeEvent } from '../../../domain/mfa/event/send-email-mfa-code.event';
import { MfaMethod } from '../../../domain/user/user-entity';
import { SendSMSCodeEvent } from '../../../domain/mfa/event/send-sms-mfa-code.event';

@CommandHandler(CreateMfaSessionCommand)
export class CreateMfaSessionHandler
  implements ICommandHandler<CreateMfaSessionCommand>
{
  @Inject() private readonly eventBus: EventBus;
  @Inject() authenticationConfig: AuthConf;
  @Inject(CACHE_MANAGER) private cacheManager: Cache;

  async execute(command: CreateMfaSessionCommand): Promise<any> {
    // Generate OTP
    const { mfa } = this.authenticationConfig.getRbacConf();
    const otp = generateRandomNumber(mfa?.otpLength || 6);
    const sessionId = nanoid(32);
    const payload = {
      otp: otp,
      uid: command.entity.id,
    };
    await this.cacheManager.set(sessionId, payload, 1000 * 60 * 5); // 5 minutes TTL
    if (command.entity.mfa?.method == MfaMethod.EMAIL) {
      this.eventBus.publish(
        new SendEmailCodeEvent(command.entity.mfa.receiveMfaCodeAddress, otp),
      );
    }

    if (command.entity.mfa?.method == MfaMethod.SMS) {
      this.eventBus.publish(
        new SendSMSCodeEvent(command.entity.mfa.receiveMfaCodeAddress, otp),
      );
    }
    return sessionId;
  }
}
