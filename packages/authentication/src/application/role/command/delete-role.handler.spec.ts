import { Test, TestingModule } from '@nestjs/testing';
import { DeleteRoleHandler } from './delete-role.handler';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { EVENT_HUB_PROVIDER } from '../../../infrastructure/providers/event-hub.provider';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';
import { EventHub } from '../../../domain/event-hub/event.hub';

describe('DeleteRoleHandler', () => {
  let handler: DeleteRoleHandler;
  let repository: jest.Mocked<IRoleRepository>;
  let eventHub: jest.Mocked<EventHub>;

  beforeEach(async () => {
    repository = {
      deleteRole: jest.fn(),
    } as any;

    eventHub = {
      publish: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRoleHandler,
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

    handler = module.get<DeleteRoleHandler>(DeleteRoleHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });
});
