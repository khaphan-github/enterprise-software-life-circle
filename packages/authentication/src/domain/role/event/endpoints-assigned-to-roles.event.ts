export class EndpointsAssignedToRolesEvent {
  constructor(
    public readonly endpointIds: string[],
    public readonly roleIds: string[],
  ) {}
}
