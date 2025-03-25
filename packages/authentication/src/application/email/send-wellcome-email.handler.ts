import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendWellcomeEmailCommand } from 'src/domain/email/command/send-wellcome-email.command';
import { NotifyProxy } from 'src/infrastructure/proxy/notifi.proxy';

@CommandHandler(SendWellcomeEmailCommand)
export class SendWellcomeEmailHandler
  implements ICommandHandler<SendWellcomeEmailCommand>
{
  constructor(private readonly notifyProxy: NotifyProxy) {}
  async execute(command: SendWellcomeEmailCommand): Promise<any> {
    //v TODO: IMplement logic call api to other service.
    const subject = 'Wellcome to our system';
    const body = 'Wellcome to our system';
    await this.notifyProxy.sendEmail(command.email, subject, body);
    return Promise.resolve();
  }
}
