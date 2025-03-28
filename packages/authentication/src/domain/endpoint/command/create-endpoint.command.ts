import { ICommand } from '@nestjs/cqrs';

export class CreateEndpointCommand implements ICommand {
  constructor(
    public readonly endpoints: Array<{
      path: string;
      method: string;
      metadata?: Record<string, any>;
    }>,
  ) {}
}
