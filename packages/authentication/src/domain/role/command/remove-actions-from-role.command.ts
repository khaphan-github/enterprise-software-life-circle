export class RemoveActionsFromRoleCommand {
  constructor(
    public readonly actionIds: string[],
    public readonly roleIds: string[],
  ) {}
}
