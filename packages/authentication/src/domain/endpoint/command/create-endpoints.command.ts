export interface ICreateEndpointCommand {
  path: string;
  method: string;
  metadata?: Record<string, any>;
  status: string;
}
export class CreateEndpointsCommand {
  constructor(public readonly endpoints: ICreateEndpointCommand[]) {}
}
