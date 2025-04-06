import { EndpointEntity } from '../endpoint/endpoint-entity';

export interface IEndpointRepository {
  createEndpoints(endpoint: EndpointEntity[]): Promise<any>;
  updateEndpoint(endpoint: EndpointEntity): Promise<any>;
  deleteEndpoint(endpointId: string): Promise<any>;
  deleteEndpoints(endpointIds: string[]): Promise<any>;
  updateEndpoints(endpoint: EndpointEntity[]): Promise<any>;
  getEndpoint(path: string, method: string): Promise<EndpointEntity | null>;
  assignEndpointsToRoles(
    endpointIds: string[],
    roleIds: string[],
  ): Promise<void>;
  getEndpointsWithCursor(
    limit: number,
    cursor?: string,
  ): Promise<EndpointEntity[]>;
  isRouteAndMethodExist(path: string, method: string): Promise<boolean>;
}
