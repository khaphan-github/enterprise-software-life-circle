export class AssignRolesToUserCommand {
  constructor(
    public readonly userId: string,
    public readonly roleIds: string[],
  ) {}
}
