import { Test, TestingModule } from '@nestjs/testing';
import { GetRolesWithCursorHandler } from './get-roles-with-cursor.handler';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';
import { IRoleRepository } from '../../../domain/repository/role-repository.interface';

describe('GetRolesWithCursorHandler', () => {
  let handler: GetRolesWithCursorHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    roleRepository = {
      getRolesWithCursor: jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ items: [], nextCursor: null }),
        ),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRolesWithCursorHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: roleRepository,
        },
      ],
    }).compile();

    handler = module.get<GetRolesWithCursorHandler>(GetRolesWithCursorHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });
});
