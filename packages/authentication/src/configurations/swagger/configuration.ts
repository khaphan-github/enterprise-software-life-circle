import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

/**
 * setup api docs pages
 * @param documentPath path tới docs
 * @param app nestjs app
 */
export const setupApiDocs = (documentPath: string, app) => {
  const options = new DocumentBuilder()
    .setTitle('Danh sách api')
    .setDescription('Tiến hành "Authorize" trước khi chạy api')
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
      },
      'JWT',
    )
    .addApiKey({
      in: 'header',
      name: 'api-key',
      type: 'apiKey',
    });

  const document = SwaggerModule.createDocument(app, options.build());
  // Buid resport api endpoint
  fs.writeFileSync(
    './endpiont-list.txt',
    Object.keys(document.paths)
      .map((e) => e.replace('/api/', ''))
      .toString()
      .split(',')
      .join('\n'),
  );
  SwaggerModule.setup(documentPath, app, document);
};
