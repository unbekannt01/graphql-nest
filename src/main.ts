/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
// import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 1 }));

  // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  //   prefix: '/uploads/',
  // });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
