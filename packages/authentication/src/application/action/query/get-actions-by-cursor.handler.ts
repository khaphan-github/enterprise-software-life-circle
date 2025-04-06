import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActionsByCursorQuery } from '../../../domain/action/queries/get-actions-by-cursor.query';
import { ActionEntity } from '../../../domain/action/action-entity';
import { ActionRepository } from '../../../infrastructure/repository/postgres/action.repository';

@QueryHandler(GetActionsByCursorQuery)
export class GetActionsByCursorHandler
  implements IQueryHandler<GetActionsByCursorQuery>
{
  constructor(private readonly repository: ActionRepository) {}

  async execute(query: GetActionsByCursorQuery): Promise<ActionEntity[]> {
    return this.repository.getActionsByCursor(query.cursor, query.limit);
  }
}
