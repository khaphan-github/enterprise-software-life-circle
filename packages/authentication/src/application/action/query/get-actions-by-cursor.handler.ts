import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ACTION_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';
import { GetActionsByCursorQuery } from '../../../domain/action/queries/get-actions-by-cursor.query';
import { ActionEntity } from '../../../domain/action/action-entity';

@QueryHandler(GetActionsByCursorQuery)
export class GetActionsByCursorHandler
  implements IQueryHandler<GetActionsByCursorQuery>
{
  @Inject(ACTION_REPOSITORY_PROVIDER)
  private readonly repository: IActionRepository;

  async execute(query: GetActionsByCursorQuery): Promise<ActionEntity[]> {
    return this.repository.getActionsByCursor(query.cursor, query.limit);
  }
}
