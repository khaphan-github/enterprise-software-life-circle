import { Test, TestingModule } from '@nestjs/testing';
import { GetUserRolesHandler } from '../../../application/user-role/command/get-user-roles.handler';
import { GetUserRolesCommand } from './get-user-roles.command';
import { IRoleRepository } from '../../repository/role-repository.interface';
import { RoleEntity } from '../../role/role-entity';
import { ROLE_REPOSITORY_PROVIDER } from '../../../infrastructure/providers/repository/repository-providers';

describe('GetUserRolesHandler', () => {
  let handler: GetUserRolesHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    roleRepository = {
      getRolesByUserId: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserRolesHandler,
        {
          provide: ROLE_REPOSITORY_PROVIDER,
          useValue: roleRepository,
        },
      ],
    }).compile();

    handler = module.get<GetUserRolesHandler>(GetUserRolesHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should get roles for user', async () => {
    const userId = 'test-user-id';
    const roles = [new RoleEntity(), new RoleEntity()];

    roleRepository.getRolesByUserId.mockResolvedValue(roles);

    const result = await handler.execute(new GetUserRolesCommand(userId));

    expect(result).toEqual(roles);
    expect(roleRepository.getRolesByUserId).toHaveBeenCalledWith(userId);
  });

  it('should return null when no roles found', async () => {
    const userId = 'test-user-id';

    roleRepository.getRolesByUserId.mockResolvedValue(null);

    const result = await handler.execute(new GetUserRolesCommand(userId));

    expect(result).toBeNull();
    expect(roleRepository.getRolesByUserId).toHaveBeenCalledWith(userId);
  });
});
