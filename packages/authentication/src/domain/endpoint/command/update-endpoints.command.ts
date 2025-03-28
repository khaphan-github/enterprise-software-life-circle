import { EndpointEntity } from '../endpoint-entity';

export class UpdateEndpointsCommand {
  constructor(public readonly endpoints: EndpointEntity[]) {}
}
