import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { Controller, Get } from "../decorators/controller.decorator";
import { ApiResponseDto } from "../dto/common/api-response.dto";

@Controller()
@injectable()
export class AppController {
  @Get()
  getHello(req: Request, res: Response) {
    return new ApiResponseDto(
      {
        message: "Hello World!",
        version: "1.0.0",
        uptime: process.uptime(),
      },
      "API is running successfully"
    );
  }

  @Get("/health")
  healthCheck(req: Request, res: Response) {
    return new ApiResponseDto(
      {
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      "Health check passed"
    );
  }
}
