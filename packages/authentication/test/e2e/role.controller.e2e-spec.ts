import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';

describe('RoleController (e2e)', () => {
  const app: INestApplication<App> = globalThis.__APP__;

  let createdRoleId = '';
  let createdActionId = '';
  let createdEndpointId = '';

  it('/POST roles (create)', async () => {
    const createRoleDto = {
      name: 'Test Role ' + Date.now(),
      description: 'Test Role Description',
      status: 'active',
      metadata: { key: 'value' },
    };

    const response = await request(app.getHttpServer())
      .post('/roles')
      .send(createRoleDto)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        name: createRoleDto.name,
        description: createRoleDto.description,
        status: createRoleDto.status,
        metadata: createRoleDto.metadata,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );

    createdRoleId = response.body.id;
  });

  let userId = '';

  it('should register a new user', async () => {
    const userPayload = {
      username: `user_${Date.now()}`,
      email: `user_${Date.now()}@example.com`,
      password: 'strongPassword123',
      metadata: {
        age: 30,
        country: 'USA',
      },
    };
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userPayload)
      .expect(201);
    userId = response.body.id; // Store user ID for role assignment
  });

  it('/POST roles/assign (assign role to user)', async () => {
    const assignRoleDto = {
      roleIds: [createdRoleId],
      userIds: [userId],
    };

    const response = await request(app.getHttpServer())
      .post('/roles/assign-user')
      .send(assignRoleDto)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          roleId: assignRoleDto.roleIds[0],
          userId: assignRoleDto.userIds[0],
          status: 'active',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    );
  });

  it('/POST actions (create)', async () => {
    const createActionDto = [
      {
        name: 'Test Action ' + Date.now(),
        description: 'Test Action Description',
        status: 'active',
        metadata: {},
      },
    ];

    const response = await request(app.getHttpServer())
      .post('/actions')
      .send(createActionDto)
      .expect(201);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: createActionDto[0].name,
          description: createActionDto[0].description,
          status: createActionDto[0].status,
          metadata: createActionDto[0].metadata,
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    );

    createdActionId = response.body[0].id;
  });

  it('/POST endpoints (create)', async () => {
    const createEndpointDto = [
      {
        path: 'Test Endpoint ' + Date.now(),
        method: 'GET',
        metadata: { key: 'value' },
        status: 'active',
      },
    ];

    const response = await request(app.getHttpServer())
      .post('/endpoints')
      .send(createEndpointDto)
      .expect(201);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: createEndpointDto[0].path,
          method: createEndpointDto[0].method,
          metadata: createEndpointDto[0].metadata,
          status: createEndpointDto[0].status,
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    );

    createdEndpointId = response.body[0].id;
  });

  it('/POST roles/assign-actions (assign actions to role)', async () => {
    const assignActionsDto = {
      actionIds: [createdActionId],
      roleIds: [createdRoleId],
    };

    const response = await request(app.getHttpServer())
      .post('/roles/assign-actions')
      .send(assignActionsDto)
      .expect(201);

    expect(response.body).toEqual({});
  });

  it('/POST roles/assign-endpoints (assign endpoints to role)', async () => {
    const assignEndpointsDto = {
      endpointIds: [createdEndpointId],
      roleIds: [createdRoleId],
    };

    const response = await request(app.getHttpServer())
      .post('/roles/assign-endpoints')
      .send(assignEndpointsDto)
      .expect(201);

    expect(response.body).toEqual({});
  });
});
