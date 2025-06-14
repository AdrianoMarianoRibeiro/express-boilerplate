import { NextFunction, Request, Response } from "express";
import { ResponseDto } from "./dtos/response.dto";

export class HttpResponseInterceptor {
  static intercept() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip metrics endpoint
      if (req.path.endsWith("/metrics")) {
        return next();
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method
      res.json = function <T>(data: T): Response {
        const responseDto: ResponseDto<T> = {
          data,
          code: res.statusCode,
        };

        return originalJson.call(this, responseDto);
      };

      next();
    };
  }
}
