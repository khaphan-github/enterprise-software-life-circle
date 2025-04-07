export class RemoveRolesFromUserCommand {
  constructor(
    public readonly userId: string,
    public readonly roleIds: string[],
  ) {}
}
