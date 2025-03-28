import { ICommand } from '@nestjs/cqrs';

export class CreateTokenCommand implements ICommand {
  constructor(public readonly userId: string) {}
}
