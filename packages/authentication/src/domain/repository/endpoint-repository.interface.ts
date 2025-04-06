import { EndpointEntity } from '../endpoint/endpoint-entity';

export interface IEndpointRepository {
  createEndpoints(endpoints: EndpointEntity[]): Promise<EndpointEntity[]>;
  getEndpointById(endpointId: string): Promise<EndpointEntity | null>;
  updateEndpoint(endpoint: EndpointEntity): Promise<EndpointEntity | null>;
  deleteEndpoint(endpointId: string): Promise<EndpointEntity | null>;
  getEndpointsByPathAndMethod(
    path: string,
    method: string,
  ): Promise<EndpointEntity[]>;
  getEndpoint(path: string, method: string): Promise<EndpointEntity | null>;
  getEndpointsWithCursor(
    limit: number,
    cursor?: string,
  ): Promise<EndpointEntity[]>;
  updateEndpoints(endpoints: EndpointEntity[]): Promise<EndpointEntity[]>;
  deleteEndpoints(endpointIds: string[]): Promise<EndpointEntity[]>;
  isRouteAndMethodExist(path: string, method: string): Promise<boolean>;
  assignEndpointsToRoles(
    endpointIds: string[],
    roleIds: string[],
  ): Promise<void>;
}
