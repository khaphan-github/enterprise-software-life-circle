import { ICommand } from '@nestjs/cqrs';

export class GoogleLoginCommand implements ICommand {
  constructor(public readonly token: string) {}
}
