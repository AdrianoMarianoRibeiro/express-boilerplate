import { NextFunction, Request, Response } from 'express';
import { AppException } from '../../exceptions';

export class AppExceptionFilter {
  static catch() {
    return (error: Error, req: Request, res: Response, next: NextFunction) => {
      // Se for uma AppException, trata de forma específica
      if (error instanceof AppException) {
        const status = error.getStatus();

        return res.status(status).json({
          code: status,
          error: {
            title: error.title,
            message: error.message,
          },
          data: error.data || null,
        });
      }

      // Para outros tipos de erro, trata de forma genérica
      console.error('Unhandled error:', error);

      return res.status(500).json({
        code: 500,
        error: {
          title: 'Internal Server Error',
          message: 'An unexpected error occurred',
        },
      });
    };
  }
}
