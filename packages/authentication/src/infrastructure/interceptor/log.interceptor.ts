import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const { method, url, body, headers } = req;
    const startTime = Date.now();

    this.logger.log(`📥 [Request] ${method} ${url}`, {
      body,
      headers,
    });

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        this.logger.log(
          `📤 [Response] ${method} ${url} (${endTime - startTime}ms)`,
          {
            statusCode: res.statusCode,
            responseBody: data,
          },
        );
      }),
    );
  }
}
