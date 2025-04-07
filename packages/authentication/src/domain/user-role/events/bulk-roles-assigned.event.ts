export class BulkRolesAssignedEvent {
  constructor(
    public readonly assignments: { userId: string; roleIds: string[] }[],
  ) {}
}
