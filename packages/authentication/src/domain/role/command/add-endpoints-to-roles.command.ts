export class AddEndpointsToRolesCommand {
  constructor(
    public readonly endpointIds: string[],
    public readonly roleIds: string[],
  ) {}
}
