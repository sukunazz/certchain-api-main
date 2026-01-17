import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Observable, catchError, map, throwError } from 'rxjs';
import { BadRequestException } from 'src/lib/exceptions/bad-request.exception';
import { ValidationException } from 'src/lib/exceptions/validation.exception';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Interceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((res) => this.responseHandler(res, context)),
      catchError((err: HttpException) =>
        throwError(() => this.errorHandler(err, context)),
      ),
    );
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    return {
      statusCode: response?.statusCode,
      success: response?.statusCode < 400,
      data: res?.data ?? null,
      path: request?.url,
      message: res?.message ?? 'Success',
      meta: res?.meta ?? {},
    };
  }

  errorHandler(
    exception: HttpException | BadRequestException,
    context: ExecutionContext,
  ) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errors =
      exception instanceof ValidationException
        ? exception.validationErrors
        : exception instanceof BadRequestException
          ? exception.errors
          : null;

    if (exception instanceof PrismaClientKnownRequestError) {
      this.logger.error(exception);
      if (exception.code === 'P2002') {
        const status = HttpStatus.CONFLICT;
        const message = exception.message.replace(/\n/g, '');
        response.status(status).json({
          success: false,
          statusCode: status,
          data: null,
          errors,
          path: request.url,
          message: message,
          ...(process.env.NODE_ENV === 'development' && {
            result: exception,
          }),
        });
        return false;
      }
    }
    this.logger.error(exception.message);
    return response.status(status).json({
      success: false,
      statusCode: status,
      data: null,
      errors,
      path: request.url,
      message: exception.message,
      ...(process.env.NODE_ENV === 'development' && {
        result: exception,
      }),
      stackTrace: exception.stack,
    });
  }
}
