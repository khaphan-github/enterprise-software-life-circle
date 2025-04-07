export class BulkAssignRolesCommand {
  constructor(
    public readonly assignments: { userId: string; roleIds: string[] }[],
  ) {}
}
