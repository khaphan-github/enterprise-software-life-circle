/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CanExecRouteQueryHandler } from './can-exec-route.query.handler';
import { QueryBus } from '@nestjs/cqrs';
import { CanExecRouteQuery } from '../../../domain/role/query/can-exec-route.query';
import { GetRolesByRouteQuery } from '../../../domain/role/query/get-roles-by-route.query';

describe('CanExecRouteQueryHandler', () => {
  let handler: CanExecRouteQueryHandler;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanExecRouteQueryHandler,
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CanExecRouteQueryHandler>(CanExecRouteQueryHandler);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should return true if user roles match route roles', async () => {
    const routeRoles = [{ id: 'role1' }, { id: 'role2' }];
    const userRoles = ['role1', 'role3'];

    jest.spyOn(queryBus, 'execute').mockImplementation((query) => {
      if (query instanceof GetRolesByRouteQuery) {
        return Promise.resolve(routeRoles);
      }
      return Promise.resolve([]);
    });

    const query = new CanExecRouteQuery('user1', '/test-route', userRoles);
    const result = await handler.execute(query);

    expect(result).toBe(true);
    expect(queryBus.execute).toHaveBeenCalledWith(
      new GetRolesByRouteQuery('/test-route'),
    );
  });

  it('should return false if user roles do not match route roles', async () => {
    const routeRoles = [{ id: 'role1' }, { id: 'role2' }];
    const userRoles = ['role3', 'role4'];

    jest.spyOn(queryBus, 'execute').mockImplementation((query) => {
      if (query instanceof GetRolesByRouteQuery) {
        return Promise.resolve(routeRoles);
      }
      return Promise.resolve([]);
    });

    const query = new CanExecRouteQuery('user1', '/test-route', userRoles);
    const result = await handler.execute(query);

    expect(result).toBe(false);
    expect(queryBus.execute).toHaveBeenCalledWith(
      new GetRolesByRouteQuery('/test-route'),
    );
  });
});
