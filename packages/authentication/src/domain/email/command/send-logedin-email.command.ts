import { ICommand } from '@nestjs/cqrs';

export class SendLogedInEmailCommand implements ICommand {
  constructor(public readonly email: string) {}
}
