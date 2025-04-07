export class RolesRemovedFromUserEvent {
  constructor(
    public readonly userId: string,
    public readonly roleIds: string[],
  ) {}
}
