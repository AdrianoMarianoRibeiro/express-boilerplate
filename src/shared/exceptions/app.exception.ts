import { HttpStatusCode } from "axios";

export class AppException extends Error {
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: string;

  constructor(
    message: string,
    statusCode: number = HttpStatusCode.BadRequest,
    data?: string
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.name = this.constructor.name;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}
