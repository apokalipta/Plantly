import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const isValidation = typeof res === 'object' && (res as any)?.type === 'VALIDATION_ERROR';

      if (isValidation) {
        const details = (res as any)?.errors ?? [];
        response.status(status).json({
          statusCode: status,
          error: HttpStatus[status] || 'Bad Request',
          message: 'Validation failed',
          details,
        });
        return;
      }

      const bodyObj = typeof res === 'object' ? (res as any) : undefined;
      const message = typeof res === 'string' ? res : bodyObj?.message ?? HttpStatus[status] ?? 'Error';
      const errorName = bodyObj?.error ?? HttpStatus[status] ?? 'Error';
      const details = bodyObj?.details;

      response.status(status).json({
        statusCode: status,
        error: errorName,
        message,
        ...(details !== undefined ? { details } : {}),
      });
      return;
    }

    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Unexpected error',
    });
  }
}

