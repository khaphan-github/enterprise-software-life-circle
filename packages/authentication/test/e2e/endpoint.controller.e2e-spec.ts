import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';

describe('EndpointController (e2e)', () => {
  const app: INestApplication<App> = globalThis.__APP__;

  let createdId = '';

  it('/POST endpoints (create)', async () => {
    const createDto = [
      {
        path: 'Test Endpoint ' + Date.now(),
        method: 'GET',
        metadata: { key: 'value' },
        status: 'active',
      },
    ];

    const response = await request(app.getHttpServer())
      .post('/endpoints')
      .send(createDto)
      .expect(201);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: createDto[0].path,
          method: createDto[0].method,
          metadata: createDto[0].metadata,
          status: createDto[0].status,
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    );

    createdId = response.body[0].id;
  });

  it('/PUT endpoints (update)', async () => {
    const updateDto = [
      {
        id: createdId,
        path: 'Updated Endpoint',
        method: 'POST',
        metadata: { key: 'updatedValue' },
        status: 'inactive',
      },
    ];

    const response = await request(app.getHttpServer())
      .put('/endpoints')
      .send(updateDto)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: updateDto[0].id,
          path: updateDto[0].path,
          method: updateDto[0].method,
          metadata: updateDto[0].metadata,
          status: updateDto[0].status,
        }),
      ]),
    );
  });

  it('/DELETE endpoints (delete)', async () => {
    const deleteDto = { ids: [createdId] };

    await request(app.getHttpServer())
      .delete('/endpoints')
      .send(deleteDto)
      .expect(204);
  });
});
