export class GetActionsByCursorQuery {
  constructor(
    public readonly limit: number,
    public readonly cursor: string,
  ) {}
}
