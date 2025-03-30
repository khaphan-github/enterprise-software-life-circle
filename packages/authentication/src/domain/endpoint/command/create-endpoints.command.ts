import { ICommand } from '@nestjs/cqrs';
import { EndpointStatus } from '../endpoint-entity';

export interface ICreateEndpointCommand {
  path: string;
  method: string;
  metadata?: Record<string, any>;
  status: EndpointStatus;
}
export class CreateEndpointsCommand implements ICommand {
  constructor(public readonly endpoints: ICreateEndpointCommand[]) {}
}
