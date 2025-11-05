import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const logger = new Logger('HTTP');
  const { method, originalUrl, body } = req;
  const userAgent = req.get('user-agent') || '';

  res.on('finish', () => {
    const { statusCode } = res;
    const contentLength = res.get('content-length');
    logger.log(
      `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent}`,
    );
    if (body && Object.keys(body).length > 0) {
      logger.debug('Body:', JSON.stringify(body, null, 2));
    }
  });

  next();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.enableCors({
    origin: 'http://localhost:3000', // O el origen de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(loggerMiddleware);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.BACKEND_PORT ?? 3001;
  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
