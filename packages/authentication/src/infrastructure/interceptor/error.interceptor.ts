import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request: Request = context.switchToHttp().getRequest();
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;
        const message =
          error instanceof HttpException
            ? error.getResponse()
            : 'Internal Server Error';

        const errorResponse = {
          success: false,
          statusCode,
          path: request.url,
          method: request.method,
          message,
          timestamp: new Date().toISOString(),
        };

        this.logger.error(`❌ [Error] ${request.method} ${request.url}`);
        this.logger.error(
          error.stack, // Log the error stack
        );

        return throwError(
          () => new InternalServerErrorException(errorResponse),
        );
      }),
    );
  }
}
