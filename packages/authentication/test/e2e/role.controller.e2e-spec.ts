import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';

describe('RoleController (e2e)', () => {
  const app: INestApplication<App> = globalThis.__APP__;

  let createdRoleId = '';

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
      .post('/roles/assign')
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
});
