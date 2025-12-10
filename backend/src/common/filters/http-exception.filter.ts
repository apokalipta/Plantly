// Filtre d'exceptions HTTP: uniformise les réponses d'erreur (validation incluse).
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
// Intention: Normaliser les réponses d’erreur HTTP, y compris la validation
// Objectif: Retourner un format stable pour le frontend et journaliser les erreurs inattendues
// Logique: Détection des erreurs de validation, extraction des détails et fallback 500

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Contexte HTTP (Express)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Cas des exceptions HTTP connues (throw new HttpException / Nest errors)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      // Branches de validation (format personnalisé)
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

      // Réponses génériques pour autres erreurs HTTP
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

    // Erreurs inattendues: log et réponse 500
    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Unexpected error',
    });
  }
}
