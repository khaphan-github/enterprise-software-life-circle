import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRoleController } from '../../src/infrastructure/controller/user-role.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RoleEntity } from '../../src/domain/role/role-entity';

describe('UserRoleController (e2e)', () => {
  let app: INestApplication;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserRoleController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    commandBus = moduleFixture.get<CommandBus>(CommandBus);
    queryBus = moduleFixture.get<QueryBus>(QueryBus);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /user-roles/:userId/roles', () => {
    it('should return user roles', async () => {
      const userId = 'test-user-id';
      const roles = [
        Object.assign(new RoleEntity(), {
          id: 'role1',
          name: 'Role 1',
          description: 'Description 1',
        }),
        Object.assign(new RoleEntity(), {
          id: 'role2',
          name: 'Role 2',
          description: 'Description 2',
        }),
      ];

      (queryBus.execute as jest.Mock).mockResolvedValue(roles);

      const response = await request(app.getHttpServer())
        .get(`/user-roles/${userId}/roles`)
        .expect(200);

      expect(response.body).toEqual(roles);
      expect(queryBus.execute).toHaveBeenCalled();
    });

    it('should return 404 if no roles found', async () => {
      const userId = 'test-user-id';

      (queryBus.execute as jest.Mock).mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/user-roles/${userId}/roles`)
        .expect(404);
    });
  });

  describe('POST /user-roles/:userId/roles', () => {
    it('should assign roles to user', async () => {
      const userId = 'test-user-id';
      const roleIds = ['role1', 'role2'];

      await request(app.getHttpServer())
        .post(`/user-roles/${userId}/roles`)
        .send({ roleIds })
        .expect(201);

      expect(commandBus.execute).toHaveBeenCalled();
    });
  });

  describe('DELETE /user-roles/:userId/roles', () => {
    it('should remove roles from user', async () => {
      const userId = 'test-user-id';
      const roleIds = ['role1', 'role2'];

      await request(app.getHttpServer())
        .delete(`/user-roles/${userId}/roles`)
        .send({ roleIds })
        .expect(200);

      expect(commandBus.execute).toHaveBeenCalled();
    });
  });

  describe('POST /user-roles/bulk', () => {
    it('should bulk assign roles to users', async () => {
      const assignments = [
        { userId: 'user1', roleIds: ['role1', 'role2'] },
        { userId: 'user2', roleIds: ['role3'] },
      ];

      await request(app.getHttpServer())
        .post('/user-roles/bulk')
        .send({ assignments })
        .expect(201);

      expect(commandBus.execute).toHaveBeenCalled();
    });
  });
});
