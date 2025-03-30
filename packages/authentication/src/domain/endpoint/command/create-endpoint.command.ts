import { ICommand } from '@nestjs/cqrs';
import { EndpointStatus } from '../endpoint-entity';

export class CreateEndpointCommand implements ICommand {
  constructor(
    public readonly endpoints: Array<{
      path: string;
      method: string;
      metadata?: Record<string, any>;
      status: EndpointStatus;
    }>,
  ) {}
}
