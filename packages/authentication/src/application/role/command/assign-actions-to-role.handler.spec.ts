import { Test, TestingModule } from '@nestjs/testing';
import { AssignActionsToRoleHandler } from './assign-actions-to-role.handler';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { EventHub } from '../../../domain/event-hub/event.hub';

describe('AssignActionsToRoleHandler', () => {
  let handler: AssignActionsToRoleHandler;
  let repository: jest.Mocked<IRoleRepository>;
  let eventHub: jest.Mocked<EventHub>;

  beforeEach(async () => {
    repository = {
      assignActionsToRoles: jest.fn(),
    } as any;

    eventHub = {
      publish: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignActionsToRoleHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: repository,
        },
        {
          provide: EVENT_HUB_PROVIDER,
          useValue: eventHub,
        },
      ],
    }).compile();

    handler = module.get<AssignActionsToRoleHandler>(
      AssignActionsToRoleHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });
});
