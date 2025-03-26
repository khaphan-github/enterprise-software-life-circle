import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendLogedInEmailCommand } from '../../domain/email/command/send-logedin-email.command';
import { NotifyProxy } from '../../infrastructure/proxy/notifi.proxy';

@CommandHandler(SendLogedInEmailCommand)
export class SendLogedInEmailHanlder
  implements ICommandHandler<SendLogedInEmailCommand>
{
  constructor(private readonly notifyProxy: NotifyProxy) {}
  async execute(command: SendLogedInEmailCommand): Promise<any> {
    //v TODO: IMplement logic call api to other service.
    const subject = 'User just logedin to our system';
    const body = 'User just logedin to our system';
    await this.notifyProxy.sendEmail(command.email, subject, body);
    return Promise.resolve();
  }
}
