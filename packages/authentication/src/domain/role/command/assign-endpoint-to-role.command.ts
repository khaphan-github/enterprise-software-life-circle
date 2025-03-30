import { ICommand } from '@nestjs/cqrs';

export class AssignEndpointToRoleCommand implements ICommand {
  constructor(
    public readonly endpointIds: string[],
    public readonly roleIds: string[],
  ) {}
}
