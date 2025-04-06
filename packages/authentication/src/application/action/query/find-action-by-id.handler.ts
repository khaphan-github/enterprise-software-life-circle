import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindActionByIdQuery } from '../../../domain/action/queries/find-action-by-id.query';
import { ActionEntity } from '../../../domain/action/action-entity';
import { ActionRepository } from '../../../infrastructure/repository/postgres/action.repository';

@QueryHandler(FindActionByIdQuery)
export class FindActionByIdHandler
  implements IQueryHandler<FindActionByIdQuery>
{
  constructor(private readonly repository: ActionRepository) {}

  async execute(query: FindActionByIdQuery): Promise<ActionEntity | null> {
    return this.repository.findActionById(query.id);
  }
}
