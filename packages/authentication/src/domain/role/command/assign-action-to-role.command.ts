import { ICommand } from '@nestjs/cqrs';

export class AssignActionToRoleCommand implements ICommand {
  constructor(
    public readonly actionIds: string[],
    public readonly roleIds: string[],
  ) {}
}
