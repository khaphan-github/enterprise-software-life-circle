import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ActionRepositoryProvider } from '../../../infrastructure/providers/repository/repository-providers';
import { IActionRepository } from '../../../domain/repository/action-repository.interface';
import { FindActionByIdQuery } from '../../../domain/action/queries/find-action-by-id.query';
import { ActionEntity } from '../../../domain/action/action-entity';

@QueryHandler(FindActionByIdQuery)
export class FindActionByIdHandler
  implements IQueryHandler<FindActionByIdQuery>
{
  @Inject(ActionRepositoryProvider)
  private readonly repository: IActionRepository;

  async execute(query: FindActionByIdQuery): Promise<ActionEntity | null> {
    return this.repository.findActionById(query.id);
  }
}
