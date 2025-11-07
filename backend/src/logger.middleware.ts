import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, headers } = req;
    const userAgent = req.get('user-agent') || '';

    this.logger.log(
      `[Request] ${method} ${originalUrl} - User-Agent: ${userAgent}`,
    );

    // Log the Authorization header specifically for debugging
    this.logger.debug(`[Headers] Authorization: ${headers.authorization || 'No Authorization header'}`);

    next();
  }
}