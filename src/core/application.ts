import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { DataSource } from "typeorm";
import { container } from "tsyringe";
import {
  CONTROLLER_KEY,
  ROUTES_KEY,
  RouteDefinition,
} from "../decorators/controller.decorator";
import { MODULE_KEY, ModuleOptions } from "../decorators/module.decorator";
import { HttpResponseInterceptor } from "./http/response.interceptor";

export class ExpressApplication {
  private app: Express;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
  }

  private setupMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan("combined"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(HttpResponseInterceptor.intercept());
  }

  async bootstrap(AppModule: any, dataSource?: DataSource): Promise<void> {
    if (dataSource) {
      await dataSource.initialize();
      console.log("Database connected successfully");

      // Register DataSource in container
      container.registerInstance(DataSource, dataSource);
    }

    this.loadModule(AppModule);
    this.setupErrorHandling();
  }

  private loadModule(ModuleClass: any): void {
    const moduleMetadata: ModuleOptions = Reflect.getMetadata(
      MODULE_KEY,
      ModuleClass
    );

    if (!moduleMetadata) {
      throw new Error(`${ModuleClass.name} is not a valid module`);
    }

    // Load imported modules first
    if (moduleMetadata.imports) {
      moduleMetadata.imports.forEach((importedModule) => {
        this.loadModule(importedModule);
      });
    }

    // Register providers
    if (moduleMetadata.providers) {
      moduleMetadata.providers.forEach((provider) => {
        container.registerSingleton(provider);
      });
    }

    // Register controllers
    if (moduleMetadata.controllers) {
      moduleMetadata.controllers.forEach((controller) => {
        container.registerSingleton(controller);
        this.registerController(controller);
      });
    }
  }

  private registerController(ControllerClass: any): void {
    const controllerPrefix = Reflect.getMetadata(
      CONTROLLER_KEY,
      ControllerClass
    );
    const routes: RouteDefinition[] =
      Reflect.getMetadata(ROUTES_KEY, ControllerClass) || [];

    const controllerInstance = container.resolve(ControllerClass) as any;

    routes.forEach((route) => {
      const fullPath = `${controllerPrefix}${route.path}`;

      this.app[route.requestMethod](
        fullPath,
        async (req: Request, res: Response) => {
          try {
            const result = await controllerInstance[route.methodName](req, res);
            if (result !== undefined && !res.headersSent) {
              res.json(result);
            }
          } catch (error) {
            console.error("Controller error:", error);
            if (!res.headersSent) {
              res.status(500).json({ error: "Internal server error" });
            }
          }
        }
      );

      console.log(
        `Registered route: ${route.requestMethod.toUpperCase()} ${fullPath}`
      );
    });
  }

  private setupErrorHandling(): void {
    this.app.use((err: any, req: Request, res: Response, next: any) => {
      console.error(err.stack);
      res.status(500).json({ error: "Something went wrong!" });
    });

    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: "Route not found" });
    });
  }

  listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
