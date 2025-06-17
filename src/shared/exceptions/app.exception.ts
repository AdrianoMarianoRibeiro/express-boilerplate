import { HttpStatusCode } from 'axios';

export class AppException extends Error {
  public readonly statusCode: number;
  public readonly message: string;
  public readonly title: string;
  public readonly data?: any;

  constructor(
    data: any,
    statusCode: number = HttpStatusCode.BadRequest,
    message: string = 'Atenção',
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }

  getStatus(): number {
    return this.statusCode;
  }
}
