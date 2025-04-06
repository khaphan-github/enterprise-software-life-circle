/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { AssignActionToRoleHandler } from './assign-action-to-role.handler';
import { AssignActionToRoleCommand } from '../../../domain/role/command/assign-action-to-role.command';
import { ActionRepository } from '../../../infrastructure/repository/postgres/action.repository';
import { ActionsAssignedToRolesEvent } from '../../../domain/role/event/actions-assigned-to-roles.event';

describe('AssignActionToRoleHandler', () => {
  let handler: AssignActionToRoleHandler;
  let repository: ActionRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignActionToRoleHandler,
        {
          provide: ActionRepository,
          useValue: {
            assignActionsToRoles: jest.fn(),
          },
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<AssignActionToRoleHandler>(AssignActionToRoleHandler);
    repository = module.get<ActionRepository>(ActionRepository);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should assign actions to roles and publish an event', async () => {
    const command = new AssignActionToRoleCommand(['action1'], ['role1']);
    await handler.execute(command);

    expect(repository.assignActionsToRoles).toHaveBeenCalledWith(
      ['action1'],
      ['role1'],
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      new ActionsAssignedToRolesEvent(['action1'], ['role1']),
    );
  });
});
