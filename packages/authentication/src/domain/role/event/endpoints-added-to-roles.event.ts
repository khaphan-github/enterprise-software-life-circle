import { IEvent } from '@nestjs/cqrs';

export class EndpointsAddedToRolesEvent implements IEvent {
  constructor(
    public readonly endpointIds: string[],
    public readonly roleIds: string[],
  ) {}
}
