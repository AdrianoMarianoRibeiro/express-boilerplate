import 'reflect-metadata';

export const SWAGGER_API_OPERATION = Symbol('swagger:api-operation');
export const SWAGGER_API_RESPONSE = Symbol('swagger:api-response');
export const SWAGGER_API_PARAM = Symbol('swagger:api-param');
export const SWAGGER_API_BODY = Symbol('swagger:api-body');
export const SWAGGER_API_QUERY = Symbol('swagger:api-query');
export const SWAGGER_API_TAGS = Symbol('swagger:api-tags');
export const SWAGGER_API_PROPERTY = Symbol('swagger:api-property');

export interface ApiOperationOptions {
  summary?: string;
  description?: string;
  operationId?: string;
}

export interface ApiResponseOptions {
  status: number;
  description: string;
  type?: any;
  isArray?: boolean;
}

export interface ApiParamOptions {
  name: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean';
  required?: boolean;
}

export interface ApiBodyOptions {
  description?: string;
  type?: any;
  required?: boolean;
}

export interface ApiQueryOptions {
  name: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean';
  required?: boolean;
}

export interface ApiPropertyOptions {
  description?: string;
  type?:
    | 'string'
    | 'number'
    | 'boolean'
    | 'array'
    | 'object'
    | (() => any)
    | any;
  format?: string;
  example?: any;
  required?: boolean;
  enum?: any[] | Record<string, any> | any;
  items?: any;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: any;
  isArray?: boolean;
}

export function ApiOperation(options: ApiOperationOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    Reflect.defineMetadata(SWAGGER_API_OPERATION, options, target, propertyKey);
  };
}

export function ApiResponse(options: ApiResponseOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const existingResponses =
      Reflect.getMetadata(SWAGGER_API_RESPONSE, target, propertyKey) || [];
    existingResponses.push(options);
    Reflect.defineMetadata(
      SWAGGER_API_RESPONSE,
      existingResponses,
      target,
      propertyKey,
    );
  };
}

export function ApiParam(options: ApiParamOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const existingParams =
      Reflect.getMetadata(SWAGGER_API_PARAM, target, propertyKey) || [];
    existingParams.push(options);
    Reflect.defineMetadata(
      SWAGGER_API_PARAM,
      existingParams,
      target,
      propertyKey,
    );
  };
}

export function ApiBody(options: ApiBodyOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    Reflect.defineMetadata(SWAGGER_API_BODY, options, target, propertyKey);
  };
}

export function ApiQuery(options: ApiQueryOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const existingQueries =
      Reflect.getMetadata(SWAGGER_API_QUERY, target, propertyKey) || [];
    existingQueries.push(options);
    Reflect.defineMetadata(
      SWAGGER_API_QUERY,
      existingQueries,
      target,
      propertyKey,
    );
  };
}

export function ApiTags(...tags: string[]) {
  return function (target: Function) {
    Reflect.defineMetadata(SWAGGER_API_TAGS, tags, target);
  };
}

export function ApiProperty(options: ApiPropertyOptions = {}) {
  return function (target: any, propertyKey: string) {
    const existingProperties =
      Reflect.getMetadata(SWAGGER_API_PROPERTY, target.constructor) || {};
    existingProperties[propertyKey] = options;
    Reflect.defineMetadata(
      SWAGGER_API_PROPERTY,
      existingProperties,
      target.constructor,
    );
  };
}
