import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from './swagger.decorator';

export interface SwaggerEndpointConfig {
  summary?: string;
  description?: string;
  responses?: {
    status: number;
    description: string;
    type?: any;
    isArray?: boolean;
  }[];
  params?: {
    name: string;
    description?: string;
    type?: 'string' | 'number' | 'boolean';
    required?: boolean;
  }[];
  queries?: {
    name: string;
    description?: string;
    type?: 'string' | 'number' | 'boolean';
    required?: boolean;
  }[];
  body?: {
    description?: string;
    type?: any;
    required?: boolean;
  };
}

export interface SwaggerModuleConfig {
  tag: string;
  endpoints: {
    [methodName: string]: SwaggerEndpointConfig;
  };
}

export function SwaggerModule(config: SwaggerModuleConfig) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Aplicar tag ao controller
    ApiTags(config.tag)(constructor);

    // Aplicar configurações para cada endpoint
    Object.keys(config.endpoints).forEach((methodName) => {
      const endpointConfig = config.endpoints[methodName];
      const prototype = constructor.prototype;

      // Aplicar ApiOperation
      if (endpointConfig.summary || endpointConfig.description) {
        ApiOperation({
          summary: endpointConfig.summary,
          description: endpointConfig.description,
        })(
          prototype,
          methodName,
          Object.getOwnPropertyDescriptor(prototype, methodName) || {},
        );
      }

      // Aplicar ApiResponse
      if (endpointConfig.responses) {
        endpointConfig.responses.forEach((response) => {
          ApiResponse({
            status: response.status,
            description: response.description,
            type: response.type,
            isArray: response.isArray,
          })(
            prototype,
            methodName,
            Object.getOwnPropertyDescriptor(prototype, methodName) || {},
          );
        });
      }

      // Aplicar ApiParam
      if (endpointConfig.params) {
        endpointConfig.params.forEach((param) => {
          ApiParam({
            name: param.name,
            description: param.description,
            type: param.type,
            required: param.required,
          })(
            prototype,
            methodName,
            Object.getOwnPropertyDescriptor(prototype, methodName) || {},
          );
        });
      }

      // Aplicar ApiQuery
      if (endpointConfig.queries) {
        endpointConfig.queries.forEach((query) => {
          ApiQuery({
            name: query.name,
            description: query.description,
            type: query.type,
            required: query.required,
          })(
            prototype,
            methodName,
            Object.getOwnPropertyDescriptor(prototype, methodName) || {},
          );
        });
      }

      // Aplicar ApiBody
      if (endpointConfig.body) {
        ApiBody({
          description: endpointConfig.body.description,
          type: endpointConfig.body.type,
          required: endpointConfig.body.required,
        })(
          prototype,
          methodName,
          Object.getOwnPropertyDescriptor(prototype, methodName) || {},
        );
      }
    });

    return constructor;
  };
}
