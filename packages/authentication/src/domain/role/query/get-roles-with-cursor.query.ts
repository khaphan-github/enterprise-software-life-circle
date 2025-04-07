export class GetRolesWithCursorQuery {
  constructor(
    public readonly limit: number,
    public readonly cursor?: string,
  ) {}
}
