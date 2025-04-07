export class RolesAssignedToUserEvent {
  constructor(
    public readonly userId: string,
    public readonly roleIds: string[],
  ) {}
}
