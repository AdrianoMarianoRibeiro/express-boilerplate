import { container } from 'tsyringe';
import {
  CONTROLLER_KEY,
  ROUTES_KEY,
  RouteDefinition,
  SWAGGER_API_BODY,
  SWAGGER_API_OPERATION,
  SWAGGER_API_PARAM,
  SWAGGER_API_PROPERTY,
  SWAGGER_API_QUERY,
  SWAGGER_API_RESPONSE,
  SWAGGER_API_TAGS,
} from '../../../decorators';

export class SwaggerGenerator {
  private static registeredSchemas = new Set<string>();

  static generateSpec(controllers: any[]): any {
    const paths: any = {};
    const components = {
      schemas: this.generateSchemas(controllers),
    };

    controllers.forEach((ControllerClass) => {
      const controllerPrefix =
        Reflect.getMetadata(CONTROLLER_KEY, ControllerClass) || '';
      const routes: RouteDefinition[] =
        Reflect.getMetadata(ROUTES_KEY, ControllerClass) || [];
      const tags = Reflect.getMetadata(SWAGGER_API_TAGS, ControllerClass) || [
        ControllerClass.name.replace('Controller', ''),
      ];

      routes.forEach((route) => {
        const fullPath = `${controllerPrefix}${route.path}`.replace(
          /:[^/]+/g,
          (match) => `{${match.slice(1)}}`,
        );

        if (!paths[fullPath]) {
          paths[fullPath] = {};
        }

        const controllerInstance = container.resolve(ControllerClass);
        const operation = this.generateOperation(
          controllerInstance,
          route.methodName,
          tags,
        );

        paths[fullPath][route.requestMethod] = operation;
      });
    });

    const spec = {
      openapi: '3.0.0',
      info: {
        title: process.env.APP_NAME || 'Express API',
        version: process.env.APP_VERSION || '1.0.0',
        description: process.env.APP_DESCRIPTION || 'API documentation',
      },
      servers: [
        {
          url:
            process.env.APP_URL ||
            `http://localhost:${process.env.PORT || 3000}`,
          description: 'Development server',
        },
      ],
      paths,
      components,
    };

    return spec;
  }

  private static generateOperation(
    target: any,
    methodName: string | symbol,
    tags: string[],
  ): any {
    const operation =
      Reflect.getMetadata(SWAGGER_API_OPERATION, target, methodName) || {};
    const responses =
      Reflect.getMetadata(SWAGGER_API_RESPONSE, target, methodName) || [];
    const params =
      Reflect.getMetadata(SWAGGER_API_PARAM, target, methodName) || [];
    const body = Reflect.getMetadata(SWAGGER_API_BODY, target, methodName);
    const queries =
      Reflect.getMetadata(SWAGGER_API_QUERY, target, methodName) || [];

    const swaggerOperation: any = {
      tags,
      summary: operation.summary || `${String(methodName)}`,
      description: operation.description,
      operationId: operation.operationId || `${String(methodName)}`,
      parameters: [],
      responses: {},
    };

    // Add path parameters
    params.forEach((param: any) => {
      swaggerOperation.parameters.push({
        name: param.name,
        in: 'path',
        description: param.description,
        required: param.required !== false,
        schema: {
          type: param.type || 'string',
        },
      });
    });

    // Add query parameters
    queries.forEach((query: any) => {
      swaggerOperation.parameters.push({
        name: query.name,
        in: 'query',
        description: query.description,
        required: query.required || false,
        schema: {
          type: query.type || 'string',
        },
      });
    });

    // Add request body
    if (body) {
      swaggerOperation.requestBody = {
        description: body.description,
        required: body.required !== false,
        content: {
          'application/json': {
            schema: body.type
              ? this.getSchemaRef(body.type.name)
              : { type: 'object' },
          },
        },
      };
    }

    // Add responses
    if (responses.length > 0) {
      responses.forEach((response: any) => {
        swaggerOperation.responses[response.status] = {
          description: response.description,
          content: response.type
            ? {
                'application/json': {
                  schema: response.isArray
                    ? {
                        type: 'array',
                        items: this.getSchemaRef(response.type.name),
                      }
                    : this.getSchemaRef(response.type.name),
                },
              }
            : undefined,
        };
      });
    } else {
      // Default responses
      swaggerOperation.responses['200'] = {
        description: 'Success',
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      };
    }

    return swaggerOperation;
  }

  private static getSchemaRef(typeName: string): any {
    return {
      $ref: `#/components/schemas/${typeName}`,
    };
  }

  private static generateSchemas(controllers: any[]): any {
    const schemas: any = {};

    // Collect all DTO classes used in controllers
    const dtoClasses = new Set<any>();

    controllers.forEach((ControllerClass) => {
      const routes: RouteDefinition[] =
        Reflect.getMetadata(ROUTES_KEY, ControllerClass) || [];
      const controllerInstance = container.resolve(ControllerClass) as any;

      routes.forEach((route) => {
        const body = Reflect.getMetadata(
          SWAGGER_API_BODY,
          controllerInstance,
          route.methodName,
        );
        const responses =
          Reflect.getMetadata(
            SWAGGER_API_RESPONSE,
            controllerInstance,
            route.methodName,
          ) || [];

        if (body && body.type) {
          dtoClasses.add(body.type);
        }

        responses.forEach((response: any) => {
          if (response.type) {
            dtoClasses.add(response.type);
          }
        });
      });
    });

    // Generate schemas for collected DTOs
    dtoClasses.forEach((dtoClass) => {
      if (typeof dtoClass === 'function') {
        const schema = this.generateSchemaFromClass(dtoClass);
        schemas[dtoClass.name] = schema;
      }
    });

    // Add default schemas
    schemas.ErrorResponse = {
      type: 'object',
      properties: {
        code: { type: 'number', example: 400 },
        error: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Bad Request' },
            message: { type: 'string', example: 'Invalid input data' },
          },
        },
      },
    };

    return schemas;
  }

  private static generateSchemaFromClass(dtoClass: any): any {
    const properties =
      Reflect.getMetadata(SWAGGER_API_PROPERTY, dtoClass) || {};
    const schema: any = {
      type: 'object',
      properties: {},
      required: [],
    };

    Object.keys(properties).forEach((propertyKey) => {
      const propertyOptions = properties[propertyKey];

      const propertySchema: any = this.generatePropertySchema(propertyOptions);

      schema.properties[propertyKey] = propertySchema;

      if (propertyOptions.required !== false) {
        schema.required.push(propertyKey);
      }
    });

    return schema;
  }

  private static generatePropertySchema(propertyOptions: any): any {
    const propertySchema: any = {};

    // Handle type
    if (typeof propertyOptions.type === 'function') {
      // Function type - resolve it
      const resolvedType = propertyOptions.type();
      if (resolvedType && resolvedType.name) {
        return { $ref: `#/components/schemas/${resolvedType.name}` };
      }
    } else if (propertyOptions.isArray) {
      propertySchema.type = 'array';
      if (propertyOptions.type && typeof propertyOptions.type === 'function') {
        const itemType = propertyOptions.type();
        propertySchema.items =
          itemType && itemType.name
            ? { $ref: `#/components/schemas/${itemType.name}` }
            : { type: 'object' };
      } else {
        propertySchema.items = { type: propertyOptions.type || 'object' };
      }
    } else {
      propertySchema.type = propertyOptions.type || 'string';
    }

    // Add other properties
    if (propertyOptions.description) {
      propertySchema.description = propertyOptions.description;
    }

    if (propertyOptions.example !== undefined) {
      propertySchema.example = propertyOptions.example;
    }

    if (propertyOptions.format) {
      propertySchema.format = propertyOptions.format;
    }

    // Handle enum - support both array and object enums
    if (propertyOptions.enum) {
      if (Array.isArray(propertyOptions.enum)) {
        propertySchema.enum = propertyOptions.enum;
      } else if (typeof propertyOptions.enum === 'object') {
        propertySchema.enum = Object.values(propertyOptions.enum);
      }
    }

    if (propertyOptions.minimum !== undefined) {
      propertySchema.minimum = propertyOptions.minimum;
    }

    if (propertyOptions.maximum !== undefined) {
      propertySchema.maximum = propertyOptions.maximum;
    }

    if (propertyOptions.minLength !== undefined) {
      propertySchema.minLength = propertyOptions.minLength;
    }

    if (propertyOptions.maxLength !== undefined) {
      propertySchema.maxLength = propertyOptions.maxLength;
    }

    if (propertyOptions.pattern) {
      propertySchema.pattern = propertyOptions.pattern;
    }

    if (propertyOptions.default !== undefined) {
      propertySchema.default = propertyOptions.default;
    }

    return propertySchema;
  }
}
