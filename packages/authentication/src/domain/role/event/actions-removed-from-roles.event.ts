export class ActionsRemovedFromRolesEvent {
  constructor(
    public readonly actionIds: string[],
    public readonly roleIds: string[],
  ) {}
}
