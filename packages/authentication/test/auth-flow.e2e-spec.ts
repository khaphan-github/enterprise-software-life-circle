import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import * as request from 'supertest';
import { CreateTestModule } from './setting/create_module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  beforeEach(async () => {
    app = await CreateTestModule();
  });

  afterAll(async () => {
    await app.close();
  });
  const userPayload = {
    username: `user_${Date.now()}`,
    email: `user_${Date.now()}@example.com`,
    password: 'strongPassword123',
    metadata: {
      age: 30,
      country: 'USA',
    },
  };

  let userToken = '';
  it('should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userPayload)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(userPayload.username);
  });

  it('should log in the registered user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: userPayload.username,
        password: userPayload.password,
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    userToken = response.body.accessToken; // Store token for future authenticated requests
  });

  it('should access a protected route with token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me') // Assuming a "Get My Profile" endpoint exists
      .set('Authorization', `JWT ${userToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('email', userPayload.email);
  });
});
