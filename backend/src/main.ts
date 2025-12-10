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

  const isProduction = process.env.NODE_ENV === 'production';
  let corsOrigin = isProduction
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_LOCAL;

  // Para desarrollo local, permitir múltiples orígenes si FRONTEND_URL_LOCAL contiene una lista separada por comas
  if (!isProduction && corsOrigin) {
    const origins = corsOrigin.split(',').map(origin => origin.trim());
    // Si hay múltiples orígenes, usar la función para verificar origen
    if (origins.length > 1) {
      app.enableCors({
        origin: (origin, callback) => {
          if (origins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
      });
    } else {
      app.enableCors({
        origin: origins[0], // Tomar el primer origen si solo hay uno
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
      });
    }
  } else {
    // En producción, usar solo un origen
    app.enableCors({
      origin: corsOrigin || 'http://localhost:3000', // Valor por defecto
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }

  app.use(loggerMiddleware);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
