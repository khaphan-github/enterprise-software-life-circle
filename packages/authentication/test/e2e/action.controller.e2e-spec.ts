import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';

describe('ActionController (e2e)', () => {
  const app: INestApplication<App> = globalThis.__APP__;

  let createdId = '';

  it('/POST actions (create)', async () => {
    const createDto = [
      {
        name: 'Test Action' + Date.now(),
        description: 'Test Description',
        status: 'active',
        metadata: {},
      },
    ];

    const response = await request(app.getHttpServer())
      .post('/actions')
      .send(createDto)
      .expect(201);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: createDto[0].name,
          description: createDto[0].description,
          status: createDto[0].status,
          metadata: createDto[0].metadata,
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    );

    createdId = response.body[0].id;
  });

  it('/PUT actions (update)', async () => {
    const updateDto = [
      {
        id: createdId,
        name: 'Updated Action + ' + Date.now(),
        description: 'Updated Description',
        status: 'active',
        metadata: {},
      },
    ];

    const response = await request(app.getHttpServer())
      .put('/actions')
      .send(updateDto)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: updateDto[0].id,
          name: updateDto[0].name,
          description: updateDto[0].description,
          status: updateDto[0].status,
          metadata: updateDto[0].metadata,
        }),
      ]),
    );
  });

  it('/DELETE actions (delete)', async () => {
    const deleteDto = { ids: [createdId] };

    await request(app.getHttpServer())
      .delete('/actions')
      .send(deleteDto)
      .expect(204);
  });
});
