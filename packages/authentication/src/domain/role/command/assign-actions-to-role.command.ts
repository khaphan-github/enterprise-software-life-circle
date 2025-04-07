export class AssignActionsToRoleCommand {
  constructor(
    public readonly actionIds: string[],
    public readonly roleIds: string[],
  ) {}
}
