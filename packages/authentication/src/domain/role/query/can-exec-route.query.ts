export class CanExecRouteQuery {
  constructor(
    public readonly userId: string,
    public readonly route: string,
    public readonly userRoles: string[],
  ) {}
}
