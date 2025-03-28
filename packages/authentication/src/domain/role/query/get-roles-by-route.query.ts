export class GetRolesByRouteQuery {
  constructor(
    public readonly route: string,
    public readonly method: string,
  ) {}
}
