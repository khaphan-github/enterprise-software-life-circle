import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { CQRSAuthenticationRBAC } from './app.module';
import { setupApiDocs } from './configurations/swagger/configuration';

async function bootstrap() {
  // Tạo một logger mới
  const logger = new Logger('STARTUP');

  const app = await NestFactory.create(CQRSAuthenticationRBAC.register());

  app.setGlobalPrefix('api/v23');

  app.enableCors({
    allowedHeaders: [
      'Content-Type, Authorization, Content-Length, X-Requested-With, app-key',
    ],
  });

  app.useGlobalPipes(new ValidationPipe());

  // Kích hoạt API docs swagger
  setupApiDocs('docs', app);

  await app.listen(process.env.PORT || 3000);
  logger.log('App start running on ' + (await app.getUrl()));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
