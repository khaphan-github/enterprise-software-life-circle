export class GetActionsByCursorQuery {
  constructor(
    public readonly cursor: string,
    public readonly limit: number,
  ) {}
}
