import { ICommand } from '@nestjs/cqrs';

export class AssignRoleToUserCommand implements ICommand {
  constructor(
    public readonly roleIds: string[],
    public readonly userIds: string[],
  ) {}
}
