import { EndpointStatus } from '../endpoint-entity';

export interface IUpdateEndpointCommand {
  id: string;
  path: string;
  method: string;
  metadata?: Record<string, any>;
  status: EndpointStatus;
}

export class UpdateEndpointsCommand {
  constructor(public readonly endpoints: IUpdateEndpointCommand[]) {}
}
