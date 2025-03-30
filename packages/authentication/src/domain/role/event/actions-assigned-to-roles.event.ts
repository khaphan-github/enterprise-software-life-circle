export class ActionsAssignedToRolesEvent {
  constructor(
    public readonly actionIds: string[],
    public readonly roleIds: string[],
  ) {}
}
