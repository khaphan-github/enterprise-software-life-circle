import { ICommand } from '@nestjs/cqrs';

export class SendWellcomeEmailCommand implements ICommand {
  constructor(public readonly email: string) {}
}
