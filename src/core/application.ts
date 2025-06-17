import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { container } from 'tsyringe';
import { DataSource } from 'typeorm';
import {
  CONTROLLER_KEY,
  ROUTES_KEY,
  RouteDefinition,
  extractParameters,
} from '../decorators/controller.decorator';
import { MODULE_KEY, ModuleOptions } from '../decorators/module.decorator';
import { SwaggerGenerator } from '../shared/common/swagger/swagger.generator';
import { AppExceptionFilter } from '../shared/filters/http-exception/app-http-exception.filter';
import { HttpResponseInterceptor } from './http/response.interceptor';
import { AppException } from '../shared/exceptions';

export class ExpressApplication {
  private app: Express;
  private controllers: any[] = [];

  constructor() {
    this.app = express();
    this.setupMiddlewares();
  }

  private setupMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan('combined'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(HttpResponseInterceptor.intercept());
  }

  async bootstrap(AppModule: any, dataSource?: DataSource): Promise<void> {
    if (dataSource) {
      await dataSource.initialize();
      console.log('Database connected successfully');

      // Register DataSource in container
      container.registerInstance(DataSource, dataSource);
    }

    this.loadModule(AppModule);
    this.addDebugEndpoints(); // Adicione este endpoint de debug temporário
    this.setupSwagger(); // Chama o swagger primeiro
    this.setupErrorHandling(); // Depois o error handling
  }

  private addDebugEndpoints(): void {
    // Endpoint para listar todas as rotas registradas
    this.app.get('/debug/routes', (req, res) => {
      const routes: any[] = [];

      this.app._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods),
            stack: middleware.route.stack.length,
          });
        } else if (middleware.name === 'router') {
          middleware.handle.stack?.forEach((handler: any) => {
            if (handler.route) {
              routes.push({
                path: handler.route.path,
                methods: Object.keys(handler.route.methods),
                stack: handler.route.stack.length,
              });
            }
          });
        }
      });

      res.json({
        message: 'Registered routes',
        routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
        totalRoutes: routes.length,
      });
    });

    console.log('🔍 Debug endpoint available at: /debug/routes');
  }

  private loadModule(ModuleClass: any): void {
    const moduleMetadata: ModuleOptions = Reflect.getMetadata(
      MODULE_KEY,
      ModuleClass,
    );

    if (!moduleMetadata) {
      throw new AppException(`${ModuleClass.name} is not a valid module`);
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
        this.controllers.push(controller); // Adiciona à lista de controllers
        this.registerController(controller);
      });
    }
  }

  private setupSwagger(): void {
    const swaggerSpec = SwaggerGenerator.generateSpec(this.controllers);

    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: process.env.APP_NAME || 'Express API Documentation',
      }),
    );

    // Endpoint para obter a spec em JSON
    this.app.get('/api-docs.json', (req, res) => {
      res.json(swaggerSpec);
    });

    console.log('📚 Swagger documentation available at: /api-docs');
  }

  private registerController(ControllerClass: any): void {
    const controllerPrefix = Reflect.getMetadata(
      CONTROLLER_KEY,
      ControllerClass,
    );
    const routes: RouteDefinition[] =
      Reflect.getMetadata(ROUTES_KEY, ControllerClass) || [];

    const controllerInstance = container.resolve(ControllerClass) as any;

    // Padronizar o prefixo do controller
    const normalizedPrefix = this.normalizePath(controllerPrefix || '');

    // Ordenar rotas: rotas mais específicas primeiro
    const sortedRoutes = routes.sort((a, b) => {
      const aParams = (a.path.match(/:/g) || []).length;
      const bParams = (b.path.match(/:/g) || []).length;

      const aSpecificSegments = a.path
        .split('/')
        .filter((segment) => segment && !segment.startsWith(':')).length;
      const bSpecificSegments = b.path
        .split('/')
        .filter((segment) => segment && !segment.startsWith(':')).length;

      if (aSpecificSegments !== bSpecificSegments) {
        return bSpecificSegments - aSpecificSegments;
      }

      if (aParams !== bParams) {
        return aParams - bParams;
      }

      return b.path.length - a.path.length;
    });

    sortedRoutes.forEach((route) => {
      // Padronizar o path da rota
      const normalizedRoutePath = this.normalizePath(route.path);

      // Construir o path completo
      const fullPath = this.buildFullPath(
        normalizedPrefix,
        normalizedRoutePath,
      );

      console.log(
        `Registering: ${route.requestMethod.toUpperCase()} ${fullPath}`,
      );

      this.app[route.requestMethod](
        fullPath,
        async (req: Request, res: Response, next) => {
          console.log(`Route hit: ${req.method} ${req.path}`);
          try {
            const args = extractParameters(
              controllerInstance,
              route.methodName,
              req,
              res,
            );

            const result = await controllerInstance[route.methodName](...args);
            if (result !== undefined && !res.headersSent) {
              res.json(result);
            }
          } catch (error) {
            console.error('Error in route handler:', error);
            next(error);
          }
        },
      );

      console.log(
        `✅ Registered route: ${route.requestMethod.toUpperCase()} ${fullPath}`,
      );
    });
  }

  // Métodos auxiliares para normalizar paths
  private normalizePath(path: string): string {
    if (!path) return '';

    // Remove barras duplas e garante que comece com /
    let normalized = path.replace(/\/+/g, '/');

    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }

    // Remove barra final se não for apenas '/'
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }

  private buildFullPath(prefix: string, routePath: string): string {
    if (!routePath || routePath === '/') {
      return prefix || '/';
    }

    if (!prefix || prefix === '/') {
      return routePath;
    }

    return prefix + routePath;
  }

  private setupErrorHandling(): void {
    // Middleware de tratamento de AppException
    this.app.use(AppExceptionFilter.catch());

    // Middleware para rotas não encontradas
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        code: 404,
        error: {
          title: 'Not Found',
          message: 'Route not found',
        },
      });
    });
  }

  listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
